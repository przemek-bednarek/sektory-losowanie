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
    name: ["imię i nazwisko", "imie i nazwisko", "zawodnik", "uczestnik", "imię", "imie", "nazwisko", "name"],
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
    const all = [...HEADER_ALIASES.nr, ...HEADER_ALIASES.name, ...HEADER_ALIASES.club];
    return row.some((cell) => all.includes(normalizeHeader(cell)));
  }

  /**
   * Zamienia surowe wiersze arkusza na listę uczestników.
   * Jeśli nie znajdzie rozpoznawalnych nagłówków, zakłada:
   * kolumna 1 = numer, kolumna 2 = imię i nazwisko, kolumna 3 (opcjonalnie) = klub.
   * Przy jednej kolumnie: traktuje ją jako imię i nazwisko, numer nadaje automatycznie.
   */
  function rowsToParticipants(rows) {
    const cleanRows = rows
      .map((r) => (Array.isArray(r) ? r : []))
      .filter((r) => r.some((cell) => String(cell ?? "").trim() !== ""));

    if (cleanRows.length === 0) return [];

    let dataRows = cleanRows;
    let nrIdx = 0;
    let nameIdx = 1;
    let clubIdx = 2;

    if (looksLikeHeaderRow(cleanRows[0])) {
      const header = cleanRows[0];
      const foundNr = matchColumn(header, HEADER_ALIASES.nr);
      const foundName = matchColumn(header, HEADER_ALIASES.name);
      const foundClub = matchColumn(header, HEADER_ALIASES.club);
      nrIdx = foundNr >= 0 ? foundNr : 0;
      nameIdx = foundName >= 0 ? foundName : 1;
      clubIdx = foundClub >= 0 ? foundClub : -1;
      dataRows = cleanRows.slice(1);
    } else if (cleanRows[0].length < 2) {
      nameIdx = 0;
      nrIdx = -1;
      clubIdx = -1;
    } else {
      clubIdx = cleanRows[0].length > 2 ? 2 : -1;
    }

    return dataRows
      .map((row, i) => {
        const nr = nrIdx >= 0 ? String(row[nrIdx] ?? "").trim() : String(i + 1);
        const name = String(row[nameIdx] ?? "").trim();
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
   * kolejność w obrębie sektora jest sortowana po numerze startowym
   * wyłącznie dla czytelności wydruku.
   */
  function drawSectors(participantsList, sectorCount, rng = Math.random) {
    if (sectorCount < 1) throw new Error("sectorCount must be >= 1");
    const shuffled = shuffle(participantsList, rng);
    const sectors = Array.from({ length: sectorCount }, () => []);

    shuffled.forEach((participant, i) => {
      sectors[i % sectorCount].push(participant);
    });

    return sectors.map((sector) =>
      sector.slice().sort((a, b) => {
        const na = Number(a.nr);
        const nb = Number(b.nr);
        if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
        return a.nr.localeCompare(b.nr, "pl");
      })
    );
  }

  return { rowsToParticipants, drawSectors, shuffle, normalizeHeader, decodeCsvBytes };
});
