# Losowanie sektorów

Prosta aplikacja webowa do losowego przydzielania uczestników zawodów wędkarskich do sektorów łowiska — z gwarancją, że sektory różnią się liczebnością maksymalnie o jedną osobę.

**Demo:** https://TWOJ-LOGIN.github.io/NAZWA-REPOZYTORIUM/

<!-- Dodaj screenshot: wrzuć plik do docs/screenshot.png i odkomentuj linię poniżej -->
<!-- ![Wynik losowania](docs/screenshot.png) -->

## Problem

Sędzia zawodów wędkarskich musi przed startem przydzielić od 40 do 100 uczestników do 5–9 sektorów. Robi to ręcznie albo w arkuszu kalkulacyjnym: wolno, z ryzykiem błędu i bez możliwości szybkiego powtórzenia losowania, gdy ktoś się wycofa. Potrzebne jest narzędzie, które w kilka sekund wylosuje sprawiedliwy przydział i da gotowy do wydruku wynik.

## Rozwiązanie

1. Wgrywasz listę uczestników (`.xlsx`, `.xls` lub `.csv`) — wystarczy nazwisko i imię, w jednej kolumnie albo w dwóch osobnych.
2. Ustawiasz liczbę sektorów.
3. Klikasz **Losuj** — uczestnicy są losowo rozdzielani, a liczebności sektorów różnią się najwyżej o 1 osobę.
4. Drukujesz wynik lub zapisujesz go jako PDF.

Całość działa lokalnie w przeglądarce. Plik z uczestnikami nigdy nie opuszcza urządzenia, więc dane osobowe nie są nigdzie wysyłane.

## Wypróbuj

W repozytorium jest plik `przykladowa-lista-uczestnikow.csv` (42 osoby) — wgraj go na stronie demo, żeby zobaczyć, jak działa aplikacja.

## Decyzje produktowe i techniczne

Najważniejsze, w skrócie (szczegóły w [`docs/DECISIONS.md`](docs/DECISIONS.md)):

- **Statyczna strona bez backendu** — brak kont, bazy i kosztów utrzymania; hosting na GitHub Pages.
- **Samo imię i nazwisko** — numer startowy i klub zostały świadomie wycięte z zakresu, bo sędzia ich nie potrzebuje.
- **Wyrównane sektory** — rozdział „po kolei" po losowym przetasowaniu (Fisher-Yates) gwarantuje różnicę liczebności ≤ 1.
- **Obsługa polskiego Excela** — wykrywanie kodowania CSV (UTF-8, z fallbackiem na windows-1250), żeby polskie znaki nie rozsypywały się po eksporcie z Excela.

## Dokumentacja

- [`docs/PRD.md`](docs/PRD.md) — wymagania produktowe (cel, użytkownicy, zakres v1, poza zakresem)
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — dziennik decyzji z uzasadnieniem

## Struktura projektu

- `index.html` — struktura strony
- `styles.css` — wygląd (w tym style wydruku)
- `core.js` — logika: parsowanie pliku i losowanie z wyrównaniem sektorów; bez zależności od przeglądarki, więc da się ją testować w Node.js
- `app.js` — warstwa interfejsu: obsługa pliku, przycisków i renderowanie wyniku
- `docs/` — PRD i decyzje

## Technologia

Zwykły HTML, CSS i JavaScript, bez frameworków i backendu. Jedyna zewnętrzna zależność to [SheetJS](https://sheetjs.com/) (odczyt Excela i CSV), wczytywana z CDN. Hosting: GitHub Pages.

## Status

**v1.0** — pojedyncze losowanie na raz, bez kont i bez historii. Pierwsze użycie na żywo: zawody 17.10.2026.

## Plan rozwoju (pomysły)

- Zapis wyniku do pliku (Excel/CSV) obok druku
- Możliwość „zablokowania" wybranych osób w sektorze
- Historia losowań dla jednego sędziego

## Licencja

[MIT](LICENSE)

## Autorka

Patrycja — Product Manager. Projekt zbudowany we współpracy z Claude jako praktyczna nauka profesjonalnego workflow w Git/GitHub.
