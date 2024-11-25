import imageUrlBuilder from '@sanity/image-url';
import type { Image } from '@sanity/types';
import { client } from './client';

const builder = imageUrlBuilder(client);

/**
 * Basic image URL builder
 */
export function urlFor(source: Image) {
	return builder.image(source);
}

/**
 * Enhanced image URL builder with WebP support
 * Returns an object with URLs for WebP and fallback formats
 */
export function enhancedUrlFor(source: Image) {
	const baseImage = builder.image(source);
	
	return {
		// WebP version (good compression, wide support)
		webp: baseImage.format('webp').quality(85).auto('format').url(),
		// Original format as fallback (maximum compatibility)
		fallback: baseImage.format('jpg').quality(85).auto('format').url()
	};
}

/**
 * Helper to generate a picture element with WebP support
 * @param source - Sanity image reference
 * @param alt - Alt text for the image
 * @param className - Optional CSS classes
 * @param width - Optional width constraint
 * @param height - Optional height constraint
 */
export function generateImageHTML(
	source: Image, 
	alt: string, 
	className?: string,
	width?: number,
	height?: number
) {
	const baseImage = builder.image(source)
		.auto('format')
		.fit('max')
		.quality(85);
	
	if (width) {
		baseImage.width(width);
	}
	if (height) {
		baseImage.height(height);
	}

	const urls = {
		webp: baseImage.format('webp').url(),
		fallback: baseImage.format('jpg').url()
	};

	return `
		<picture>
			<source srcset="${urls.webp}" type="image/webp">
			<img 
				src="${urls.fallback}" 
				alt="${alt}"
				${className ? `class="${className}"` : ''}
				loading="lazy"
				decoding="async"
			>
		</picture>
	`.trim();
}
