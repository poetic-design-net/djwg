import { writable } from 'svelte/store';

export const tooltipPortal = writable<HTMLElement | null>(null);