# Navigation mit Sections Implementierung

## Überblick
Die Navigation soll erweitert werden, um Pages mit spezifischen Sections zu unterstützen.

## Verfügbare Komponenten als Sections
Basierend auf den existierenden Komponenten haben wir:
- AboutUsSection
- ArtistsGrid/Slider
- Events
- FAQ
- Founder
- Intro
- LegalPage
- Newsletter
- Pricing
- Team
- Testimonials
- Welcome

## Implementierungsplan

### 1. Section Schema (section.ts)
```typescript
{
  name: 'section',
  type: 'object',
  fields: [
    {
      name: 'type',
      type: 'string',
      options: {
        list: [
          { title: 'About Us', value: 'aboutUs' },
          { title: 'Artists Grid', value: 'artistsGrid' },
          { title: 'Artists Slider', value: 'artistsSlider' },
          { title: 'Events', value: 'events' },
          { title: 'FAQ', value: 'faq' },
          { title: 'Founder', value: 'founder' },
          { title: 'Intro', value: 'intro' },
          { title: 'Newsletter', value: 'newsletter' },
          { title: 'Pricing', value: 'pricing' },
          { title: 'Team', value: 'team' },
          { title: 'Testimonials', value: 'testimonials' },
          { title: 'Welcome', value: 'welcome' }
        ]
      }
    },
    {
      name: 'id',
      type: 'string',
      description: 'Unique identifier for section linking'
    }
  ]
}
```

### 2. Navigation Schema Erweiterung
Das bestehende Navigation Schema wird um eine Page-Referenz und Section-ID erweitert:
```typescript
{
  fields: [
    // ... bestehende Felder ...
    {
      name: 'pageLink',
      type: 'reference',
      to: [{ type: 'page' }],
      hidden: ({ document }) => document?.type !== 'direct'
    },
    {
      name: 'sectionId',
      type: 'string',
      description: 'Optional: ID der anzusteuernden Section',
      hidden: ({ document }) => document?.type !== 'direct'
    }
  ]
}
```

### 3. Page Schema Erweiterung
Das Page Schema wird um Sections erweitert:
```typescript
{
  fields: [
    // ... bestehende Felder ...
    {
      name: 'sections',
      type: 'array',
      of: [{ type: 'section' }]
    }
  ]
}
```

### 4. Frontend Anpassungen

#### TypeScript Types
```typescript
type Section = {
  type: 'aboutUs' | 'artistsGrid' | /* ... andere Typen ... */;
  id: string;
}

type Page = {
  // ... bestehende Felder ...
  sections: Section[];
}

type MenuItem = {
  type: 'megamenu' | 'direct';
  pageLink?: Reference;
  sectionId?: string;
  // ... bestehende Felder ...
}
```

#### Navigation Handler
```typescript
function handleNavigation(item: MenuItem) {
  if (item.type === 'direct' && item.pageLink) {
    const url = item.sectionId 
      ? `/${item.pageLink.slug}#${item.sectionId}`
      : `/${item.pageLink.slug}`;
    goto(url);
  }
}
```

## Implementierungsreihenfolge
1. Section Schema erstellen
2. Navigation Schema aktualisieren
3. Page Schema erweitern
4. TypeScript Types aktualisieren
5. Frontend Komponenten anpassen