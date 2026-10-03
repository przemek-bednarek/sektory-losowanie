# Dziennik decyzji

Każdy wpis: co postanowiono, dlaczego i jakie były alternatywy.

## 1. Statyczna strona zamiast aplikacji z backendem
**Decyzja:** czysty HTML/CSS/JS hostowany na GitHub Pages.
**Dlaczego:** aplikacja ma jedno zadanie i jednego użytkownika naraz; backend, baza i konta tylko dodałyby koszt i ryzyko. Dane osobowe uczestników zostają w przeglądarce.
**Alternatywy:** aplikacja z serwerem (odrzucona — zbędna złożoność), arkusz z formułami (odrzucony — trudny do druku i powtarzania).

## 2. Wyrównane sektory (różnica ≤ 1)
**Decyzja:** po przetasowaniu listy uczestnicy trafiają do sektorów kolejno, po kolei.
**Dlaczego:** wymaganie użytkowniczki — „wszędzie po tyle samo, ewentualnie pojedyncze różnice". Metoda jest prosta i matematycznie gwarantuje różnicę ≤ 1.
**Alternatywa:** niezależne losowanie sektora dla każdej osoby (odrzucone — dawałoby nierówne sektory).

## 3. Import z pliku Excel/CSV
**Decyzja:** wczytywanie `.xlsx`, `.xls`, `.csv` przez SheetJS.
**Dlaczego:** sędzia zwykle ma listę w Excelu; ręczne przepisywanie 60–100 nazwisk jest wolne i podatne na błędy.

## 3a. Wykrywanie kodowania CSV
**Decyzja:** próba UTF-8, a w razie błędu windows-1250.
**Dlaczego:** CSV eksportowany z polskiego Excela często nie jest w UTF-8; bez tego polskie znaki („ń", „ł") zamieniały się w nieczytelne symbole. Błąd znaleziony podczas testów, zanim trafił do użytkowniczki.

## 4. Lista tylko z nazwiskiem i imieniem
**Decyzja:** numer startowy i klub nie są wymagane ani wyświetlane; wynik pokazuje tylko kolejność w sektorze.
**Dlaczego:** na prośbę użytkowniczki — upraszcza przygotowanie pliku i wydruk. Starszy format z numerem i klubem nadal się wczytuje (zgodność wsteczna).

## 5. Logika w osobnym pliku (`core.js`)
**Decyzja:** parsowanie i losowanie bez zależności od przeglądarki, interfejs w `app.js`.
**Dlaczego:** pozwala testować dokładnie ten kod, który działa w aplikacji, w Node.js — bez ręcznego klikania.

## 6. Publiczne repozytorium
**Decyzja:** repozytorium publiczne.
**Dlaczego:** darmowy GitHub Pages wymaga publicznego repozytorium. W repozytorium nie ma żadnych danych osobowych ani kluczy — tylko kod i przykładowa, zmyślona lista.

## 7. Sektory oznaczone literami
**Decyzja:** sektory nazywają się A, B, C… zamiast 1, 2, 3…
**Dlaczego:** na prośbę użytkowniczki; litery nie mylą się z numerami uczestników na liście (numerowanej 1, 2, 3…) i zgodnie z praktyką zawodów oznaczają łowisko. Limit w formularzu: 26 sektorów (A–Z), przy skali 5–9 w zupełności wystarcza.
