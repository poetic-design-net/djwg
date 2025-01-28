# Dynamische Sections in Sanity & SvelteKit

Diese Anleitung erklärt Schritt für Schritt, wie man bestehende Komponenten in dynamische Sections für den PageBuilder umwandelt.

## Schritt-für-Schritt Anleitung

### 1. Schema für die Section erstellen
Erstelle ein neues Schema in `studio/schemas/objects/[sectionName].ts`. Das Schema definiert die Struktur und Validierung der Section-Daten.

Beispiel für eine Hero Section:
```typescript
import type { SchemaTypeDefinition, Rule } from 'sanity'

const heroSection: SchemaTypeDefinition = {
  name: 'heroSection', // Eindeutiger Name für das Schema
  title: 'Hero Section', // Anzeigename im Studio
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'subtitle',
      title: 'Untertitel',
      type: 'text',
      rows: 2,
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'backgroundImages',
      title: 'Hintergrundbilder',
      type: 'array',
      of: [{ type: 'optimizedImage' }],
      validation: (rule: Rule) => rule.min(1).max(3)
    }
  ]
}

export default heroSection
```

### 2. Schema registrieren
Füge das Schema in `studio/schemas/index.ts` hinzu:

```typescript
import heroSection from './objects/heroSection'

export const schemaTypes = [
  // ... andere Schemas
  heroSection
]
```

### 3. Section im Page Schema verfügbar machen
In `studio/schemas/documents/page.ts`:

1. Füge die Section zur Liste der verfügbaren Section-Typen hinzu:
```typescript
options: {
  list: [
    { title: 'Hero Section', value: 'hero' }, // Neuer Eintrag
    // ... andere Section-Typen
  ]
}
```

2. Füge das Section-Feld zu den Component-Fields hinzu:
```typescript
defineField({
  name: 'heroSection', // Muss dem Schema-Namen entsprechen
  title: 'Hero Section Settings',
  type: 'heroSection', // Muss dem Schema-Namen entsprechen
  hidden: ({ parent }) => parent?.type !== 'hero' // Nur anzeigen wenn dieser Typ gewählt ist
})
```

### 4. TypeScript Types definieren
In `app/src/lib/types/menu.ts`:

1. Füge den Section-Typ zur ComponentSectionType hinzu:
```typescript
export type ComponentSectionType = 
  | 'hero' // Neuer Section-Typ
  | 'intro'
  | 'aboutUs'
  // ... andere Typen
```

2. Definiere den Type für die Section-Props:
```typescript
export type HeroSection = {
  title: string
  subtitle: string
  backgroundImages?: {
    asset: Image
    alt?: string
  }[]
  transitionInterval?: number
}
```

3. Füge die Section zu ComponentSection hinzu:
```typescript
export type ComponentSection = {
  _type: 'componentSection'
  type: ComponentSectionType
  id: string
  heroSection?: HeroSection // Neue Section
  // ... andere Sections
}
```

### 5. GROQ Query aktualisieren
In `app/src/routes/[slug]/+page.server.ts`, erweitere die Query um die neuen Felder:

```typescript
const query = `*[_type == "page" && slug.current == $slug][0] {
  sections[] {
    _type == 'componentSection' => {
      _type,
      type,
      id,
      heroSection {
        title,
        subtitle,
        backgroundImages[] {
          asset->,
          alt
        },
        transitionInterval
      },
      // ... andere Sections
    }
  }
}`
```

### 6. Section im Page Renderer registrieren
In `app/src/routes/[slug]/+page.svelte`:

1. Importiere die Komponente:
```typescript
import Hero from '$lib/components/hero/start.svelte';
```

2. Füge sie zur componentMap hinzu:
```typescript
const componentMap: Partial<Record<ComponentSectionType, any>> = {
  hero: Hero,
  // ... andere Komponenten
};
```

3. Füge den case zur renderSection Funktion hinzu:
```typescript
case 'hero':
  if (section.heroSection) {
    additionalProps = {
      ...section.heroSection
    };
  }
  break;
```

### 7. Studio neu starten
Starte das Sanity Studio neu, damit die Änderungen wirksam werden:
```bash
cd studio
npm run dev
```

## Checkliste für neue Sections

1. [ ] Schema erstellt in `studio/schemas/objects/[sectionName].ts`
2. [ ] Schema registriert in `studio/schemas/index.ts`
3. [ ] Section-Typ und -Feld zum Page Schema hinzugefügt
4. [ ] TypeScript Types definiert:
   - [ ] ComponentSectionType erweitert
   - [ ] Section Props Type erstellt
   - [ ] ComponentSection Type erweitert
5. [ ] GROQ Query um neue Felder erweitert
6. [ ] Komponente im Page Renderer registriert:
   - [ ] Import hinzugefügt
   - [ ] Zur componentMap hinzugefügt
   - [ ] Case in renderSection hinzugefügt
7. [ ] Studio neu gestartet und getestet

## Verfügbare Sections

### Hero Section mit Features (Intro)
Eine fullwidth Hero-Section mit:
- Großem Titel (Portable Text)
- Beschreibungstext
- Optionalem Hero-Bild
- Feature-Items mit Icons
- Responsive Layout (Bild rechts, Text links)

### Split Content Section mit CTA (About Us)
Eine zweispaltige Section mit:
- Tagline als Eyecatcher
- Großer Überschrift
- Mehreren Textabsätzen
- Call-to-Action Button
- Großem Bild in der rechten Spalte
- Responsive Layout (50/50 Split auf Desktop)

## 1. Schema für die Section erstellen

Erstelle ein neues Schema in `studio/schemas/objects/[sectionName].ts`:

```typescript
import type { SchemaTypeDefinition, Rule } from 'sanity'

const sectionName: SchemaTypeDefinition = {
  name: 'sectionName',
  title: 'Section Name',
  type: 'object',
  fields: [
    // Definiere hier die Felder der Section
    {
      name: 'title',
      title: 'Titel',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (rule: Rule) => rule.required()
    },
    // Beispiel für ein Bild mit dem optimierten Image-Typ
    {
      name: 'image',
      title: 'Bild',
      type: 'optimizedImage'
    }
  ],
  preview: {
    select: {
      title: 'title'
    },
    prepare({ title }) {
      return {
        title: 'Section Name',
        subtitle: title?.[0]?.children?.[0]?.text || 'Keine Überschrift'
      }
    }
  }
}

export default sectionName
```

## 2. Schema registrieren

Füge das Schema in `studio/schemas/index.ts` hinzu:

```typescript
import sectionName from './objects/sectionName'

export const schemaTypes = [
  // ... andere Schemas
  sectionName,
]
```

## 3. TypeScript Types definieren

Erweitere die Types in `app/src/lib/types/menu.ts`:

```typescript
export type ComponentSectionType = 
  | 'intro'
  | 'aboutUs'
  | 'sectionName' // Füge den neuen Section-Typ hinzu

export type SectionNameSection = {
  title: PortableTextBlock[] | string
  image?: {
    asset: Image
    alt?: string
  }
}

export type ComponentSection = {
  _type: 'componentSection'
  type: ComponentSectionType
  id: string
  sectionName?: SectionNameSection // Füge die Section-Props hinzu
}
```

## 4. Komponente anpassen

Passe die bestehende Komponente in `app/src/lib/components/[SectionName].svelte` an:

```svelte
<script lang="ts">
  import type { SectionNameSection } from '$lib/types/menu';
  import { enhancedUrlFor } from '$lib/sanity/image';

  export let title: SectionNameSection['title'] = "Default Title";
  export let image: SectionNameSection['image'] = undefined;

  $: imageUrls = image?.asset ? enhancedUrlFor(image, {
    maxWidth: 1200,
    sizes: [400, 800, 1200]
  }) : null;
</script>

<!-- Template Code -->
```

## 5. Section in PageBuilder einbinden

Aktualisiere die Komponenten-Map in `app/src/routes/[slug]/+page.svelte`:

```typescript
const componentMap: Partial<Record<ComponentSectionType, any>> = {
  // ... andere Komponenten
  sectionName: SectionNameComponent,
}

// In der renderSection Funktion
case 'sectionName':
  if (section.sectionName) {
    additionalProps = {
      title: section.sectionName.title,
      image: section.sectionName.image
    };
  }
  break;
```

## 6. GROQ Query aktualisieren

Erweitere die Query in `app/src/routes/[slug]/+page.server.ts`:

```typescript
const query = `*[_type == "page" && slug.current == $slug][0] {
  // ... andere Felder
  sections[] {
    _type == 'componentSection' => {
      _type,
      type,
      id,
      sectionName {
        title[] {
          ...,
          children[] {
            ...
          }
        },
        image {
          asset->,
          alt
        }
      }
    }
  }
}`
```

## Beispiel: Intro Section Implementierung

### Schema (studio/schemas/objects/introSection.ts)
```typescript
const introSection: SchemaTypeDefinition = {
  name: 'introSection',
  title: 'Intro Section',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'image',
      title: 'Bild',
      type: 'optimizedImage'
    },
    {
      name: 'items',
      title: 'Feature Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: {
                list: [
                  { title: 'Mixer', value: 'mixer' },
                  { title: 'Kopfhörer', value: 'headphones' }
                ]
              }
            },
            {
              name: 'title',
              title: 'Titel',
              type: 'string'
            },
            {
              name: 'description',
              title: 'Beschreibung',
              type: 'text'
            }
          ]
        }
      ]
    }
  ]
}
```

### Komponente (app/src/lib/components/Intro.svelte)
```svelte
<script lang="ts">
  import type { IntroSectionItem } from '$lib/types/menu';
  import { enhancedUrlFor } from '$lib/sanity/image';

  export let title: PortableTextBlock[] | string = "Default";
  export let description: string = "";
  export let image: SanityImage | undefined = undefined;
  export let items: IntroSectionItem[] | null = null;

  $: imageUrls = image?.asset ? enhancedUrlFor(image, {
    maxWidth: 1200,
    sizes: [400, 800, 1200]
  }) : null;
</script>

<div class="container">
  <!-- Template Code -->
</div>
```

## Best Practices

1. **Wiederverwendbarkeit**:
   - Sections sollten unabhängig voneinander funktionieren
   - Default-Werte für alle Props definieren
   - Typen sorgfältig definieren

2. **Performance**:
   - Optimierte Bilder verwenden (optimizedImage Typ)
   - Lazy Loading für Bilder
   - Responsive Design beachten

3. **Wartbarkeit**:
   - Klare Namenskonventionen
   - Gute Dokumentation
   - Konsistente Struktur über alle Sections

4. **Validierung**:
   - Pflichtfelder definieren
   - Sinnvolle Validierungsregeln
   - Hilfreiche Fehlermeldungen

5. **SEO & Accessibility**:
   - Alt-Texte für Bilder
   - Semantische HTML-Struktur
   - Meta-Informationen wenn nötig

## Beispiel: Hero Section Implementierung

### Schema (studio/schemas/objects/heroSection.ts)
```typescript
const heroSection: SchemaTypeDefinition = {
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'subtitle',
      title: 'Untertitel',
      type: 'text',
      rows: 2,
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'backgroundImages',
      title: 'Hintergrundbilder',
      type: 'array',
      of: [{ type: 'optimizedImage' }],
      validation: (rule: Rule) => rule.min(1).max(3)
    },
    {
      name: 'transitionInterval',
      title: 'Übergangsintervall (in Sekunden)',
      type: 'number',
      initialValue: 7.5,
      validation: (rule: Rule) => rule.min(3).max(15)
    }
  ]
}
```

### Komponente (app/src/lib/components/hero/start.svelte)
```svelte
<script lang="ts">
  import { enhancedUrlFor } from '$lib/sanity/image';
  import type { Image } from '@sanity/types';

  export let title: string = "Der ultimative DJ Workshop";
  export let subtitle: string = "DJWORKSHOPGERMANY bietet professionelle DJ-Kurse für Anfänger und Fortgeschrittene in ganz Deutschland an.";
  export let backgroundImages: Image[] = [];
  export let transitionInterval: number = 7.5;
</script>

<div class="relative pt-14 pb-16">
  <!-- Template Code -->
</div>
```

### Einbindung in Page Schema

In `studio/schemas/objects/section.ts` muss das Hero-Section-Feld zur Section hinzugefügt werden:

```typescript
{
  name: 'heroSection',
  title: 'Hero Section Content',
  type: 'heroSection',
  hidden: ({ parent }) => parent?.type !== 'hero'
}
```

### TypeScript Types

In `app/src/lib/types/menu.ts`:

```typescript
export type HeroSection = {
  title: string
  subtitle: string
  backgroundImages?: {
    asset: Image
    alt?: string
  }[]
  transitionInterval?: number
}

export type ComponentSection = {
  _type: 'componentSection'
  type: ComponentSectionType
  id: string
  heroSection?: HeroSection
  // ... andere Section Types
}
```

### GROQ Query

In `app/src/routes/[slug]/+page.server.ts`:

```typescript
const query = `*[_type == "page" && slug.current == $slug][0] {
  // ... andere Felder
  sections[] {
    _type == 'componentSection' => {
      _type,
      type,
      id,
      heroSection {
        title,
        subtitle,
        backgroundImages[] {
          asset->,
          alt
        },
        transitionInterval
      },
      // ... andere Sections
    }
  }
}`
```

## Beispiel: FAQ Section Implementierung

### Schema (studio/schemas/objects/faqSection.ts)
```typescript
const faqSection: SchemaTypeDefinition = {
 name: 'faqSection',
 title: 'FAQ Section',
 type: 'object',
 fields: [
   {
     name: 'title',
     title: 'Titel',
     type: 'array',
     of: [{ type: 'block' }],
     validation: (rule: Rule) => rule.required()
   },
   {
     name: 'description',
     title: 'Beschreibung',
     type: 'text'
   },
   {
     name: 'selectedFaqs',
     title: 'Ausgewählte FAQs',
     description: 'Wählen Sie die FAQs aus, die in dieser Section angezeigt werden sollen',
     type: 'array',
     of: [
       {
         type: 'reference',
         to: [{ type: 'faq' }]
       }
     ],
     validation: (rule: Rule) => rule.required().min(1)
   },
   {
     name: 'showCategories',
     title: 'Kategorien anzeigen',
     type: 'boolean',
     initialValue: true
   }
 ]
}
```

### Einbindung in Page Schema

In `studio/schemas/documents/page.ts` muss das FAQ-Section-Feld zur componentSection hinzugefügt werden:

```typescript
defineField({
 name: 'faqSection',
 title: 'FAQ Section Settings',
 type: 'faqSection',
 hidden: ({ parent }) => parent?.type !== 'faq'
})
```
