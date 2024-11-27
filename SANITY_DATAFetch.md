Checkliste: Sanity Section Data Integration

TypeScript Interface Setup:

Definiere Section Interface in types.ts
Stelle sicher, dass alle Felder aus dem Sanity Schema abgedeckt sind
Beachte besonders:
Asset-Typen für Bilder (SanityImageSource)
Optionale Felder mit '?'
Korrekte Typen für Arrays und Objekte
Strikte Typen für Enums (z.B. 'orange' | 'primary' | 'secondary')
Sanity Schema Checks:

Schema muss defineField für jedes Feld haben
Schema braucht defineType für den Gesamttyp
Jedes Feld benötigt:
name
title
type
description (für Content-Editor)
Bei Bildern:
Hotspot-Option wenn nötig
Alt-Text Feld
Komponenten-Integration:

Props Interface definieren
data prop vom Typ der Section
SanityImage Komponente für Bilder verwenden
Null-Checks für optionale Felder
Default Values für fehlende Daten
Data Transformation:

Type Guard für Section-Typ erstellen
Props Transformer implementieren:
Defaultwerte setzen
Datenstruktur transformieren
Asset-URLs für Bilder generieren
Typsicherheit gewährleisten
SectionRenderer Updates:

Type Guard importieren
Props Transformer importieren
Komponente mit transformierten Props rendern
Enabled-Check implementieren
Fehlerbehandlung:

Check auf undefined/null Werte
Fallback-Werte definieren
Asset-URL Generation absichern
Type Safety gewährleisten
Performance:

Lazy Loading für Bilder
Optimierte Asset-Queries
Minimale Re-Renders
Best Practices:

Keine inline styles
Tailwind für Styling
RTL/LTR agnostische Klassen
Accessibility beachten
Responsive Design