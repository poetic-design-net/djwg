import imageUrlBuilder from '@sanity/image-url';
import type { Image } from '@sanity/types';
import { client } from './client';

export type SanityImage = Image;
export type SanityImageSource = Image;

const builder = imageUrlBuilder(client);

/**
 * Basic image URL builder
 */
export function urlFor(source: Image) {
  return builder.image(source);
}

/**
 * Enhanced image URL builder with WebP support and responsive sizes
 */
export function enhancedUrlFor(source: Image, options: {
  maxWidth?: number;
  sizes?: number[];
} = {}) {
  const baseImage = builder.image(source);
  const { maxWidth = 1200, sizes = [400, 800, 1200] } = options;
  
  // Generiere URLs für verschiedene Bildgrößen
  const responsiveUrls = sizes.map(size => ({
    width: size,
    webp: baseImage
      .width(Math.min(size, maxWidth))
      .format('webp')
      .quality(85)
      .auto('format')
      .url(),
    fallback: baseImage
      .width(Math.min(size, maxWidth))
      .format('jpg')
      .quality(85)
      .auto('format')
      .url()
  }));

  // Erstelle srcset Strings
  const webpSrcset = responsiveUrls
    .map(u => `${u.webp} ${u.width}w`)
    .join(', ');
  const fallbackSrcset = responsiveUrls
    .map(u => `${u.fallback} ${u.width}w`)
    .join(', ');

  // Verwende die kleinste Größe als Fallback
  const smallestSize = responsiveUrls[0];

  return {
    webp: webpSrcset,
    fallback: fallbackSrcset,
    placeholder: baseImage
      .width(400)
      .blur(10)
      .format('jpg')
      .quality(60)
      .url(),
    // Einzelne URLs für direkte Verwendung
    urls: responsiveUrls
  };
}

/**
 * Helper to generate a picture element with WebP support
 */
export function generateImageHTML(
  source: Image, 
  alt: string, 
  className?: string,
  options?: {
    maxWidth?: number;
    sizes?: string;
  }
) {
  const imageUrls = enhancedUrlFor(source, {
    maxWidth: options?.maxWidth
  });

  return `
    <picture>
      <source 
        srcset="${imageUrls.webp}"
        type="image/webp"
        sizes="${options?.sizes || '(max-width: 768px) 100vw, 50vw'}"
      >
      <img 
        srcset="${imageUrls.fallback}"
        src="${imageUrls.placeholder}"
        alt="${alt}"
        ${className ? `class="${className}"` : ''}
        loading="lazy"
        decoding="async"
      >
    </picture>
  `.trim();
}
