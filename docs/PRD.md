# PRD — Losowanie sektorów na zawody wędkarskie

**Wersja:** 1.0 · **Status:** w użyciu · **Autorka:** Przemek Bednarek

## Cel i kontekst

Sędzia zawodów wędkarskich przydziela przed startem uczestników do sektorów łowiska. Dziś robi to ręcznie lub w arkuszu, co jest wolne i podatne na błędy. Cel: aplikacja, która w kilka sekund losuje sprawiedliwy przydział i generuje wynik gotowy do wydruku.

**Mierniki sukcesu (v1):**
- losowanie dla ~60 osób zajmuje sędziemu poniżej minuty (od wgrania pliku do wydruku),
- różnica liczebności między sektorami nigdy nie przekracza 1,
- aplikacja użyta na żywo na zawodach 17.10.2026 bez konieczności ręcznych poprawek.

## Użytkownicy

Główny użytkownik: sędzia zawodów, który wielokrotnie, w różnych terminach, losuje sektory dla różnych zawodów. Nie jest osobą techniczną; pracuje zwykle na laptopie, wynik drukuje lub zapisuje do PDF.

Skala: 5–9 sektorów, 40–100 uczestników.

## Zakres funkcjonalny (v1)

1. Import listy uczestników z pliku `.xlsx`, `.xls` lub `.csv`.
2. Ustawienie liczby sektorów.
3. Losowy, wyrównany przydział uczestników do sektorów.
4. Wynik na ekranie, z możliwością wylosowania ponownie.
5. Wydruk / zapis do PDF.

## Dane wejściowe

Plik zawiera wyłącznie **nazwisko i imię** każdego uczestnika. Obsługiwane układy:

- jedna kolumna („Nazwisko i imię", „Imię i nazwisko", „Zawodnik" itp.),
- dwie osobne kolumny („Nazwisko" i „Imię", w dowolnej kolejności),
- plik bez nagłówka (1 kolumna = nazwisko i imię razem; 2 kolumny tekstowe = nazwisko, imię).

Numer startowy i klub nie są wymagane (pominięte w zakresie na prośbę użytkowniczki). Starsze pliki z tymi kolumnami nadal się wczytują.

CSV z polskiego Excela bywa zapisany w kodowaniu windows-1250 — aplikacja wykrywa je automatycznie.

## Logika losowania

1. Lista uczestników jest losowo przetasowana (algorytm Fisher-Yates).
2. Uczestnicy są rozdzielani do sektorów „po kolei" (kolejno do sektora 1, 2, …, N, i od nowa).
3. Gwarancja: różnica między najmniej a najbardziej licznym sektorem wynosi co najwyżej 1.
4. W obrębie sektora nazwiska są sortowane alfabetycznie wyłącznie dla czytelności wydruku — kolejność nie wpływa na losowość przydziału.

## Wynik i eksport

Karty sektorów na ekranie (nagłówek „Sektor A (liczba osób)" — sektory oznaczone literami A, B, C… (maks. 26), numerowana lista nazwisk), podsumowanie liczebności oraz przycisk „Drukuj / zapisz jako PDF" z osobnym układem wydruku (2 kolumny, bez elementów interfejsu).

## Stack technologiczny i hosting

Statyczna strona (HTML, CSS, JavaScript) bez backendu i bazy danych. Odczyt Excela/CSV przez bibliotekę SheetJS. Hosting: GitHub Pages (darmowy, wymaga publicznego repozytorium). Przetwarzanie wyłącznie w przeglądarce — dane uczestników nie są nigdzie wysyłane.

## Poza zakresem (v1)

- Konta użytkowników i logowanie
- Zapisywanie historii losowań
- Obsługa wielu zawodów jednocześnie
- Ręczne przenoszenie osób między sektorami po losowaniu
- Eksport wyniku do Excela

## Harmonogram

| Data | Kamień milowy |
|---|---|
| 10.10.2026 | Wersja gotowa do testów wewnętrznych |
| 17.10.2026 | Użycie na żywo na zawodach |
| po 17.10.2026 | Zebranie opinii i poprawki |
