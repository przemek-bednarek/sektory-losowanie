# Losowanie sektorów

Prosta aplikacja webowa do losowego przydzielania uczestników zawodów wędkarskich do sektorów łowiska, z wyrównaniem liczebności sektorów.

## Jak to działa

1. Wgrywasz listę uczestników jako plik `.xlsx`, `.xls` lub `.csv` (kolumny: numer startowy, imię i nazwisko, opcjonalnie klub).
2. Ustawiasz liczbę sektorów.
3. Klikasz **Losuj** — aplikacja losowo dzieli uczestników na sektory tak, aby liczebności różniły się maksymalnie o 1 osobę.
4. Wynik można wydrukować lub zapisać jako PDF.

Cała praca odbywa się lokalnie w przeglądarce — plik uczestników nigdy nie jest nigdzie wysyłany ani zapisywany.

## Przykładowy plik

`przykladowa-lista-uczestnikow.csv` to przykładowa lista 42 uczestników — można jej użyć do wypróbowania aplikacji przed wgraniem prawdziwej listy z zawodów.

## Struktura projektu

- `index.html` — struktura strony
- `styles.css` — wygląd
- `core.js` — logika: parsowanie pliku uczestników i losowanie z wyrównaniem sektorów (bez zależności od przeglądarki — da się to testować niezależnie, np. w Node.js)
- `app.js` — warstwa interfejsu: obsługa pliku, przycisków i renderowanie wyniku

## Technologia

Zwykły HTML/CSS/JavaScript, bez frameworków i bez backendu. Jedyna zewnętrzna zależność to [SheetJS](https://sheetjs.com/) (biblioteka do czytania plików Excel/CSV), wczytywana z CDN.

Strona jest hostowana przez GitHub Pages.

## Stan projektu

Wersja 1 — pojedyncze losowanie na raz, bez kont i bez zapisywania historii. Zbudowana jako projekt edukacyjny do nauki Gita/GitHuba.
