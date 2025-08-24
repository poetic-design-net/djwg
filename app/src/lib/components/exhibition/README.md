# Interaktiver Messeplan

## Features

- **Interaktive Canvas-Ansicht** mit Konva.js
- **Zoom & Pan** mit Mausrad und Touch-Gesten
- **Live-Suche** mit Fuse.js (Fuzzy-Search)
- **Filter-System** für Kategorien, Status und Größen
- **Stand-Details** in Sidebar mit Kontaktinformationen
- **Minimap** für bessere Orientierung
- **Export** als PNG-Bild
- **Responsive** für Desktop, Tablet und Mobile
- **Performance-optimiert** mit Virtualisierung (500+ Stände)
- **Admin-Features** für geheime Stände

## Verwendung

```svelte
<script>
  import ExhibitionPlan from '$lib/components/exhibition/ExhibitionPlan.svelte'
  
  // Daten aus Sanity laden
  export let data
</script>

<ExhibitionPlan
  exhibitionHalls={data.halls}
  exhibitionStands={data.stands}
  exhibitionExhibitors={data.exhibitors}
  isAdmin={data.isAdmin}
/>
```

## Sanity CMS Pflege

### 1. Messehallen anlegen
- Name und Hallen-ID eingeben
- Abmessungen (Breite × Höhe in Pixel)
- Optional: Hallenplan als Hintergrundbild
- Geheim-Flag für Admin-only Hallen

### 2. Aussteller anlegen
- Firmenname und Logo
- Kategorie auswählen
- Kontaktdaten eingeben
- Premium-Status für Hervorhebung
- Produkte/Dienstleistungen

### 3. Messestände anlegen
- Standnummer (z.B. "A1-B04")
- Halle zuordnen
- Position (X/Y-Koordinaten)
- Größe (Breite × Höhe)
- Status: Verfügbar, Gebucht, Reserviert, Gesperrt
- Optional: Aussteller zuordnen

## Performance

- **Virtualisierung**: Nur sichtbare Stände werden gerendert
- **Debounced Search**: 300ms Verzögerung für flüssige Suche
- **Dynamische Font-Größen**: Anpassung basierend auf Zoom-Level
- **Lazy Loading**: Stand-Details werden nur bei Bedarf geladen
- **Optimierte Render-Zyklen**: Batch-Updates für bessere Performance

## Touch-Gesten (Mobile)

- **Pinch-to-Zoom**: Mit zwei Fingern zoomen
- **Pan**: Mit einem Finger verschieben
- **Tap**: Stand auswählen

## Tastatur-Shortcuts

- `+` / `-`: Zoom ein/aus
- `0`: Zoom zurücksetzen
- `ESC`: Stand-Details schließen

## Farbcodierung

- 🟢 **Grün**: Verfügbar
- 🔴 **Rot**: Gebucht
- 🟡 **Gelb**: Reserviert
- ⚫ **Grau**: Gesperrt
- ⭐ **Glow-Effekt**: Premium-Stand

## Admin-Features

Admins können:
- Geheime Stände ein-/ausblenden
- Interne Notizen zu Ständen sehen
- Alle Hallen und Stände verwalten

## Technische Details

- **Framework**: SvelteKit mit TypeScript
- **Canvas**: Konva.js über svelte-konva
- **Suche**: Fuse.js für Fuzzy-Search
- **State**: Svelte Stores
- **Export**: html-to-image für PNG-Export
- **Styling**: Tailwind CSS

## Optimierungs-Tipps

1. **Hallenplan-Bilder**: Max. 2000×2000px, optimiert als WebP
2. **Stand-Anzahl**: Optimal bis 500 Stände pro Halle
3. **Mobile**: Touch-Events sind für 60 FPS optimiert
4. **Caching**: Stand-Daten werden im Store gecacht