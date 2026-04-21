# Cline-Regeln – Dorf-Buchhaltung

## Arbeitsweise
- Ich bin kein Profi.
- Bitte nur kleine, sichere Schritte.
- Keine großen Umbauten.
- Bestehende Struktur respektieren.
- Nach jedem Schritt stoppen.

## Code-Änderungen
- Nur exakte Ersetzungen oder klar begrenzte Einfügungen.
- Keine vagen Formulierungen wie "unter dem Feld" oder "irgendwo darunter".
- Immer genau angeben:
  - welche Datei
  - welcher Block ersetzt wird
  - was exakt eingefügt wird

## Projektkontext
- Projekt: Dorf-Buchhaltung
- Arbeitet aktuell lokal/offline
- Daten liegen in JSON-Dateien / lokaler Struktur
- Keine SQL-Datenbank verwenden, solange nicht ausdrücklich gesagt
- Keine Supabase-Migrationen anlegen

## Fachliche Regeln
- Bank-Zuordnung ist kritisch
- Mitglieder-/Beitragslogik vorsichtig behandeln
- Export darf keine falschen Daten erzeugen
- Bei Änderungen an Bank, Beiträgen, Export und Korrektur besonders vorsichtig sein

## Wichtige Regeln
- Keine unnötigen neuen Dateien
- Keine unnötigen Refactorings
- Keine versteckten Logikänderungen
- Vor riskanten Änderungen auf Backup/Git-Commit hinweisen

## Antwortstil
- Kurz, klar, exakt
- Nur ein Schritt pro Antwort
- Danach stoppen und auf Test warten
