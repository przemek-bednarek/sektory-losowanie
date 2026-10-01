// Czysta logika: parsowanie wierszy arkusza + losowanie z wyrównaniem sektorów.
// Bez zależności od przeglądarki (DOM) — dzięki temu da się to testować w Node
// i mieć pewność, że dokładnie ten sam kod działa w aplikacji co w testach.

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SectorDraw = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const HEADER_ALIASES = {
    nr: ["nr", "numer", "numer startowy", "nr startowy", "start", "id"],
    fullName: ["imię i nazwisko", "imie i nazwisko", "nazwisko i imię", "nazwisko i imie", "zawodnik", "uczestnik", "name"],
    firstName: ["imię", "imie", "first name", "firstname"],
    surname: ["nazwisko", "last name", "lastname", "surname"],
    club: ["klub", "club", "drużyna", "druzyna"],
  };

  function normalizeHeader(value) {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function matchColumn(headerRow, aliases) {
    for (let i = 0; i < headerRow.length; i++) {
      const normalized = normalizeHeader(headerRow[i]);
      if (aliases.includes(normalized)) return i;
    }
    return -1;
  }

  function looksLikeHeaderRow(row) {
    const all = [
      ...HEADER_ALIASES.nr,
      ...HEADER_ALIASES.fullName,
      ...HEADER_ALIASES.firstName,
      ...HEADER_ALIASES.surname,
      ...HEADER_ALIASES.club,
    ];
    return row.some((cell) => all.includes(normalizeHeader(cell)));
  }

  function combineName(row, fullNameIdx, firstNameIdx, surnameIdx) {
    if (fullNameIdx >= 0) return String(row[fullNameIdx] ?? "").trim();
    const first = firstNameIdx >= 0 ? String(row[firstNameIdx] ?? "").trim() : "";
    const last = surnameIdx >= 0 ? String(row[surnameIdx] ?? "").trim() : "";
    return [first, last].filter(Boolean).join(" ");
  }

  /**
   * Zamienia surowe wiersze arkusza na listę uczestników.
   * Rozpoznaje nagłówki niezależnie od tego, czy imię i nazwisko są w jednej
   * kolumnie ("Imię i nazwisko" / "Nazwisko i imię" / "Zawodnik"...), czy
   * w dwóch osobnych ("Nazwisko", "Imię" — w dowolnej kolejności).
   * Numer startowy i klub są opcjonalne — jeśli ich nie ma, numer jest
   * nadawany automatycznie (kolejność w pliku), a klub zostaje pusty.
   * Bez rozpoznawalnego nagłówka zakłada: 1 kolumna = imię i nazwisko razem;
   * 2 kolumny = numer+nazwa (gdy pierwsza kolumna wygląda na liczbę) albo
   * nazwisko+imię (w przeciwnym razie); 3+ kolumn = numer, nazwa, klub.
   */
  function rowsToParticipants(rows) {
    const cleanRows = rows
      .map((r) => (Array.isArray(r) ? r : []))
      .filter((r) => r.some((cell) => String(cell ?? "").trim() !== ""));

    if (cleanRows.length === 0) return [];

    let dataRows = cleanRows;
    let nrIdx = -1;
    let fullNameIdx = -1;
    let firstNameIdx = -1;
    let surnameIdx = -1;
    let clubIdx = -1;

    if (looksLikeHeaderRow(cleanRows[0])) {
      const header = cleanRows[0];
      nrIdx = matchColumn(header, HEADER_ALIASES.nr);
      fullNameIdx = matchColumn(header, HEADER_ALIASES.fullName);
      firstNameIdx = matchColumn(header, HEADER_ALIASES.firstName);
      surnameIdx = matchColumn(header, HEADER_ALIASES.surname);
      clubIdx = matchColumn(header, HEADER_ALIASES.club);
      dataRows = cleanRows.slice(1);
    } else {
      const cols = cleanRows[0].length;
      if (cols <= 1) {
        fullNameIdx = 0;
      } else if (cols === 2) {
        const firstCellIsNumeric = /^\d+$/.test(String(cleanRows[0][0] ?? "").trim());
        if (firstCellIsNumeric) {
          nrIdx = 0;
          fullNameIdx = 1;
        } else {
          surnameIdx = 0;
          firstNameIdx = 1;
        }
      } else {
        nrIdx = 0;
        fullNameIdx = 1;
        clubIdx = 2;
      }
    }

    return dataRows
      .map((row, i) => {
        const nr = nrIdx >= 0 ? String(row[nrIdx] ?? "").trim() : String(i + 1);
        const name = combineName(row, fullNameIdx, firstNameIdx, surnameIdx);
        const club = clubIdx >= 0 ? String(row[clubIdx] ?? "").trim() : "";
        return { nr: nr || String(i + 1), name, club };
      })
      .filter((p) => p.name !== "");
  }

  /**
   * Dekoduje bajty pliku CSV do tekstu, próbując UTF-8, a w razie błędu
   * cofając się do windows-1250 (typowe kodowanie CSV eksportowanego
   * z polskiego Excela). Pliki .xlsx/.xls nie przechodzą przez tę
   * funkcję — ich kodowanie jest już poprawnie obsłużone przez SheetJS.
   */
  function decodeCsvBytes(bytes) {
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch (e) {
      return new TextDecoder("windows-1250").decode(bytes);
    }
  }

  function shuffle(array, rng = Math.random) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Dzieli uczestników na `sectorCount` sektorów tak, aby liczebności
   * różniły się maksymalnie o 1 osobę. Przydział do sektora jest losowy;
   * kolejność w obrębie sektora jest sortowana alfabetycznie po imieniu
   * i nazwisku wyłącznie dla czytelności wydruku.
   */
  function drawSectors(participantsList, sectorCount, rng = Math.random) {
    if (sectorCount < 1) throw new Error("sectorCount must be >= 1");
    const shuffled = shuffle(participantsList, rng);
    const sectors = Array.from({ length: sectorCount }, () => []);

    shuffled.forEach((participant, i) => {
      sectors[i % sectorCount].push(participant);
    });

    return sectors.map((sector) =>
      sector.slice().sort((a, b) => a.name.localeCompare(b.name, "pl"))
    );
  }

  return { rowsToParticipants, drawSectors, shuffle, normalizeHeader, decodeCsvBytes };
});
