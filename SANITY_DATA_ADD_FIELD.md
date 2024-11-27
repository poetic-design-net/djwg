Checkliste: Neues Feld in Sanity-Projekt hinzufügen

Sanity Schema (z.B. studio/schemas/blocks/featuresSection.ts)

[ ] Feld mit defineField definieren
[ ] Namen, Titel und Typ festlegen
[ ] Beschreibung für Content-Editoren hinzufügen
[ ] Ggf. Validierungen oder Optionen konfigurieren
TypeScript Interfaces (app/src/lib/types/...)

[ ] Feld zum entsprechenden Interface hinzufügen
[ ] Korrekte Typisierung festlegen
[ ] Bei optionalen Feldern "?" hinzufügen
GROQ Query (app/src/lib/sanity/queries/pages.ts)

[ ] Feld in der entsprechenden Query hinzufügen
[ ] Bei verschachtelten Objekten korrekte Position beachten
[ ] Bei Arrays sicherstellen, dass das Feld in der Array-Projektion enthalten ist
Transformer (app/src/lib/utils/sections/transformers/...)

[ ] Feld im entsprechenden Transformer hinzufügen
[ ] Standardwert für leere Felder definieren (z.B. || '')
[ ] Bei Arrays: Feld in der map-Funktion berücksichtigen
Frontend Komponente (app/src/lib/templates/...)

[ ] Feld in der Komponente verwenden
[ ] Typsicherheit durch TypeScript Interface gewährleisten
[ ] Ggf. Fallback-Werte oder Null-Checks implementieren
Testing

[ ] Feld im Sanity Studio anlegen und testen
[ ] Frontend überprüfen, ob das Feld korrekt angezeigt wird
[ ] Verhalten bei leeren/undefined Werten testen
Diese Checkliste stellt sicher, dass das neue Feld durchgängig von Sanity bis zum Frontend korrekt implementiert wird.