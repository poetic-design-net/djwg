<script lang="ts">
	import { isPreviewing, VisualEditing } from '@sanity/visual-editing/svelte';
	import { page } from '$app/stores';
	import { setContext, onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
	import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
	import { initBento, identifyBentoUser } from '$lib/bento/init';
	import { toasts } from '$lib/stores/toast';
	import { authState } from '$lib/stores/auth';
	import LiveMode from '$lib/components/LiveMode.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import "../app.pcss";
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	// Create and set Supabase client in context using environment variables
	const supabase = createSupabaseLoadClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event: { fetch },
		serverSession: data.session
	});
	setContext('supabase', supabase);

	// Watch for auth state changes
	$: if (data.user?.aud === 'authenticated') {
		authState.updateAuthState(true);
	} else {
		authState.updateAuthState(false);
	}

	// Show toasts based on auth state changes
	$: if ($authState.previousAuthState !== null && $authState.currentAuthState !== $authState.previousAuthState) {
		if ($authState.currentAuthState) {
			toasts.success('Erfolgreich angemeldet');
		} else {
			toasts.error('Erfolgreich abgemeldet');
		}
	}

	// Custom scroll animation function
	function smoothScrollTo(targetPosition: number, duration: number = 300) {
		const startPosition = window.pageYOffset;
		const distance = targetPosition - startPosition;
		let startTime: number | null = null;

		function animation(currentTime: number) {
			if (startTime === null) startTime = currentTime;
			const timeElapsed = currentTime - startTime;
			const progress = Math.min(timeElapsed / duration, 1);

			// Easing function for smoother animation
			const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
			
			window.scrollTo(0, startPosition + distance * easeInOutQuad(progress));

			if (timeElapsed < duration) {
				requestAnimationFrame(animation);
			}
		}

		requestAnimationFrame(animation);
	}

	// Function to setup scroll handlers
	function setupScrollHandlers() {
		document.querySelectorAll('a[href^="#"]').forEach((anchor: Element) => {
			// Remove existing listener if any
			const oldListener = (anchor as any)._scrollListener;
			if (oldListener) {
				anchor.removeEventListener('click', oldListener);
			}

			// Create and store new listener
			const newListener = (e: Event) => {
				e.preventDefault();
				const href = (anchor as HTMLAnchorElement).getAttribute('href') || '';
				if (!href || href === '#') return;
				
				const targetElement = document.querySelector(href);
				if (targetElement) {
					const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
					smoothScrollTo(targetPosition, 300); // 300ms duration for medium speed
					// Update URL without triggering scroll
					history.pushState(null, '', href);
				}
			};

			// Store listener reference for future cleanup
			(anchor as any)._scrollListener = newListener;
			anchor.addEventListener('click', newListener);
		});
	}

	// Handle initial mount
	onMount(() => {
		// Initialize Bento
		initBento();

		// Check if data.user exists before accessing properties
		if (data.user && data.user.email) {
			identifyBentoUser(
				data.user.email,
				data.user.user_metadata?.firstname ?? '' // Fallback to empty string if undefined
			);
		}

		setupScrollHandlers();

		// Handle initial hash in URL
		if (window.location.hash) {
			const targetElement = document.querySelector(window.location.hash);
			if (targetElement) {
				setTimeout(() => {
					const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
					smoothScrollTo(targetPosition, 300);
				}, 0);
			}
		}
	});

	// Handle after navigation
	afterNavigate(() => {
		setupScrollHandlers();
	});
</script>

{#if $isPreviewing}
	<div class="preview-toggle-container">
		<a href={`/preview/disable?redirect=${$page.url.pathname}`} class="preview-toggle">
			<span>Preview Enabled</span>
			<span>Disable Preview</span>
		</a>
		<a href={`/preview/enable?redirect=${$page.url.pathname}`} class="preview-toggle" class:hidden={$isPreviewing}>
			<span>Preview Disabled</span>
			<span>Enable Preview</span>
		</a>
	</div>
{/if}

<Toast />

<main>
	<Header {data} />
	<slot />
</main>
<footer>
	<section class="bg-gray-50 overflow-hidden">
		<Footer />
	</section>
</footer>

{#if $isPreviewing}
	<VisualEditing />
	<LiveMode />
{/if}

<style>
	:global(html) {
		scroll-padding-top: 2rem; /* Adjust based on your header height */
	}

	.preview-toggle-container {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		z-index: 50;
		display: flex;
		gap: 0.5rem;
	}

	.preview-toggle {
		backdrop-filter: blur(12px);
		border-radius: 0.25rem;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
		color: #1f2937;
		display: block;
		font-size: 0.75rem;
		font-weight: 500;
		line-height: 1rem;
		padding: 0.5rem 0.75rem;
		text-align: center;
		text-decoration: none;
	}

	.preview-toggle:hover {
		background-color: #ef4444;
		color: #ffffff;
	}

	.preview-toggle span:first-child {
		display: block;
	}
	.preview-toggle:hover span:first-child {
		display: none;
	}

	.preview-toggle span:last-child {
		display: none;
	}
	.preview-toggle:hover span:last-child {
		display: block;
	}

	.hidden {
		display: none;
	}
</style>
