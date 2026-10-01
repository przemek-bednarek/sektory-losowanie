// Losowanie sektorów — warstwa UI (DOM, obsługa pliku, renderowanie wyniku).
// Logika parsowania i losowania jest w core.js (SectorDraw) — tam samo da się
// to przetestować w Node, bez przeglądarki.
// Cała praca odbywa się lokalnie w przeglądarce, plik uczestników nigdy
// nie opuszcza urządzenia.

(() => {
  "use strict";

  const fileInput = document.getElementById("file-input");
  const sectorCountInput = document.getElementById("sector-count");
  const drawBtn = document.getElementById("draw-btn");
  const redrawBtn = document.getElementById("redraw-btn");
  const printBtn = document.getElementById("print-btn");
  const statusEl = document.getElementById("status");
  const resultsPanel = document.getElementById("results-panel");
  const resultsGrid = document.getElementById("results-grid");
  const resultsMeta = document.getElementById("results-meta");

  /** @type {Array<{nr: string, name: string, club: string}>} */
  let participants = [];

  function parseFile(file) {
    const isCsv = /\.csv$/i.test(file.name);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Nie udało się odczytać pliku."));
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          // CSV: dekodujemy tekst sami (z wykryciem kodowania), żeby poprawnie
          // obsłużyć polskie znaki także w plikach bez UTF-8 (typowe dla
          // CSV eksportowanego z polskiego Excela). XLSX/XLS to format
          // binarny z kodowaniem obsłużonym już przez samą bibliotekę.
          const workbook = isCsv
            ? XLSX.read(window.SectorDraw.decodeCsvBytes(data), { type: "string" })
            : XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
          resolve(window.SectorDraw.rowsToParticipants(rows));
        } catch (err) {
          reject(new Error("Nie udało się odczytać zawartości pliku. Sprawdź, czy to poprawny plik .xlsx/.xls/.csv."));
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  function setStatus(message, kind) {
    statusEl.textContent = message;
    statusEl.className = "status" + (kind ? " " + kind : "");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderResults(sectors) {
    resultsGrid.innerHTML = "";
    sectors.forEach((sector, i) => {
      const card = document.createElement("div");
      card.className = "sector-card";

      const title = document.createElement("h3");
      title.textContent = `Sektor ${window.SectorDraw.sectorLabel(i)} (${sector.length})`;
      card.appendChild(title);

      const list = document.createElement("ol");
      sector.forEach((p) => {
        const li = document.createElement("li");
        li.innerHTML = escapeHtml(p.name) +
          (p.club ? ` <span class="participant-club">(${escapeHtml(p.club)})</span>` : "");
        list.appendChild(li);
      });
      card.appendChild(list);
      resultsGrid.appendChild(card);
    });

    const counts = sectors.map((s) => s.length);
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    const spread = max === min ? `po ${min} osób w każdym sektorze` : `${min}–${max} osób w sektorze`;
    resultsMeta.textContent = `${sectors.flat().length} uczestników, ${sectors.length} sektorów, ${spread}.`;

    resultsPanel.hidden = false;
    redrawBtn.hidden = false;
  }

  function runDraw() {
    const sectorCount = parseInt(sectorCountInput.value, 10);
    if (!sectorCount || sectorCount < 1) {
      setStatus("Podaj poprawną liczbę sektorów.", "error");
      return;
    }
    if (participants.length === 0) {
      setStatus("Najpierw wgraj plik z listą uczestników.", "error");
      return;
    }
    if (sectorCount > participants.length) {
      setStatus("Liczba sektorów nie może być większa niż liczba uczestników.", "error");
      return;
    }
    const sectors = window.SectorDraw.drawSectors(participants, sectorCount);
    renderResults(sectors);
    setStatus(`Wylosowano przydział dla ${participants.length} uczestników.`, "ok");
  }

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;
    setStatus("Wczytywanie pliku…");
    drawBtn.disabled = true;
    try {
      participants = await parseFile(file);
      if (participants.length === 0) {
        setStatus("Nie znaleziono żadnych uczestników w pliku. Sprawdź jego zawartość.", "error");
        return;
      }
      setStatus(`Wczytano ${participants.length} uczestników.`, "ok");
      drawBtn.disabled = false;
    } catch (err) {
      setStatus(err.message || "Nie udało się wczytać pliku.", "error");
    }
  });

  drawBtn.addEventListener("click", runDraw);
  redrawBtn.addEventListener("click", runDraw);
  printBtn.addEventListener("click", () => window.print());
})();
