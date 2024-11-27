# Project Instructions



## Project Structure
- `app/`: SvelteKit frontend application
  - `src/lib/templates/`: Page section components
  - `src/lib/components/`: Reusable components
  - `src/lib/sanity/`: Sanity CMS integration
  - `src/routes/`: SvelteKit routes
- `studio/`: Sanity Studio configuration
  - `schemas/`: Sanity content schemas
    - `objects/sections/`: Section schemas

## Key Patterns

### Section Components
1. Each section follows a specific pattern:
   - Schema in `studio/schemas/objects/sections/`
   - Component in `app/src/lib/templates/`
   - Type definition in `app/src/lib/types/`
   - Props transformation in `app/src/lib/utils/sections.ts`

2. Sections are rendered through:
   - `[landingPage]/+page.svelte` using SectionRenderer
   - `app/src/lib/components/sections/SectionRenderer.svelte`

### Sanity Integration
1. Schemas must include:
   - Appropriate icon (lucide-react or sanity icons)
   - TypeScript definitions if it's a .ts file
   - defineField on every field
   - defineType throughout the whole type
   - Description for every field explaining its purpose

2. Schema Example:
```typescript
import {defineField, defineType} from 'sanity'

export default defineType({
  type: 'object',
  name: 'custom-object',
  fields: [
    defineField({
      type: 'array',
      name: 'arrayField',
      title: 'Things',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'type-name-in-array',
          fields: [defineField({type: 'string', name: 'title', title: 'Title'})],
        }),
      ],
    }),
  ],
})
```

### Image Handling
1. Use SanityImage component for all Sanity images:
```typescript
<SanityImage
  value={imageData}
  customClass="your-tailwind-classes"
/>
```

2. Image data structure:
```typescript
interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
  };
  hotspot?: {
    x: number;
    y: number;
  };
  alt?: string;
}
```

### GROQ Queries
1. Landing page query structure:
```typescript
export const landingPageQuery = groq`*[_type == "landingPage" && slug.current == $slug][0] {
  title,
  slug,
  description,
  seo {
    metaTitle,
    metaDescription,
    openGraphImage {
      asset->,
      alt
    }
  },
  sections[] {
    _type,
    enabled,
    _key,
    ...,
    // Expand nested image references
    "image": image {
      asset->,
      alt,
      hotspot,
      crop
    }
  }
}`;
```

2. Always expand image assets using `asset->`
3. Include hotspot and crop data for images
4. Use proper type definitions for query results

### Common Field Patterns
1. Eyebrow:
```typescript
{
  name: 'eyebrow',
  title: 'Eyebrow',
  description: 'The smaller text that sits above the title to provide context',
  type: 'string',
}
```

2. Title:
```typescript
{
  name: 'title',
  title: 'Title',
  description: 'The large text that is the primary focus of the block',
  type: 'string',
}
```

3. Rich Text:
```typescript
{
  name: 'richText',
  title: 'Rich Text',
  description: 'Large body of text that has links, ordered/unordered lists and headings.',
  type: 'richText',
}
```

4. Image:
```typescript
{
  name: 'image',
  title: 'Image',
  type: 'image',
  fields: [
    {
      name: 'alt',
      type: 'string',
      description: 'Remember to use alt text for people to be able to read what is happening in the image if they are using a screen reader, it\'s also important for SEO',
      title: 'Alt Text',
    },
  ],
}
```

### Frontend Rules
Please ensure that nothing already working is removed or altered during updates or adjustments. Use Tailwind CSS utilities efficiently to maintain a clean and scalable design. When suggesting changes to the code, prioritize compatibility with SvelteKit and ensure it aligns with Sanity CMS’s schema and data structure. Always provide clear comments in the code explaining any changes, and suggest performance optimizations if applicable. Avoid introducing breaking changes or unnecessary complexity. Make sure all solutions are accessible, responsive, and aligned with modern best practices. Please pay attention to the type check which you improve from the beginning and make sure that we do not work with zero values.  please check always the current file to ensure we preserve all existing functionality while adding the new code.

```

### Type Handling
1. Sanity to Frontend Type Flow:
   - Sanity Schema → TypeScript Interface → Component Props
   - Always include proper type definitions for all data structures
   - Use type guards for section type checking

2. Common Type Patterns:
```typescript
// Base section type
interface BaseSection {
  _type: string;
  _key: string;
  enabled: boolean;
}

// Section-specific type
interface YourSection extends BaseSection {
  _type: 'yourSectionType';
  // Add section-specific fields
}

// Type guard
function isYourSection(section: Section): section is YourSection {
  return section._type === 'yourSectionType';
}
```




### Common Issues and Solutions
1. 500 Error with Sanity Data:
   - Check GROQ query structure
   - Verify image asset expansion
   - Add console logs to trace data flow
   - Verify type definitions match actual data

2. Type Mismatches:
   - Check if types are properly imported
   - Verify data transformation in sections.ts
   - Ensure proper null checks and defaults
   - Use type guards for type narrowing

3. Image Loading Issues:
   - Verify image asset references
   - Check SanityImage component props
   - Ensure proper image URL generation
   - Add fallback images where needed

### Development Process
1. When creating new sections:
   - Start with Sanity schema
   - Create TypeScript types
   - Create component
   - Update SectionRenderer
   - Add to sections utility functions

2. When debugging:
   - Check browser console for data structure
   - Verify GROQ queries in Sanity Vision
   - Check type definitions match actual data
   - Use React DevTools for component inspection

3. Testing and Validation:
   - Test with various data scenarios
   - Verify responsive behavior
   - Check accessibility
   - Test error handling

4. Always preserve existing functionality when making updates

### Performance Considerations
1. Image Optimization:
   - Use appropriate image sizes
   - Implement lazy loading
   - Use proper image formats

2. Component Optimization:
   - Avoid unnecessary re-renders
   - Use proper memoization
   - Implement code splitting where needed

3. Data Loading:
   - Implement proper loading states
   - Handle errors gracefully
   - Use appropriate caching strategies
