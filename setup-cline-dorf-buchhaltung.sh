cat << 'EOT' > cline-rules.md
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
EOT

cat << 'EOT' > cline-start-prompt.txt
Ich bin kein Profi.

Bitte arbeite in diesem Projekt so:
- nur kleine, sichere Schritte
- keine großen Umbauten
- nur exakte Ersetzungen oder klar begrenzte Einfügungen
- keine vagen Beschreibungen

Wichtig:
- keine SQL-Datenbank verwenden
- keine Supabase-Migrationen anlegen
- JSON/lokale Struktur beachten
- Bank, Mitglieder, Beiträge und Export sehr vorsichtig behandeln
- nur ein Schritt pro Antwort

Zeig mir immer:
- genaue Datei
- exakten Codeblock zum Ersetzen oder Einfügen

Dann stoppen.
EOT

echo "✅ Cline-Setup für Dorf-Buchhaltung erstellt"
