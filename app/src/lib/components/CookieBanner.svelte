<script lang="ts">
    import { fade } from 'svelte/transition';
    import { cookieInfo, type CookieSettings, defaultSettings, saveCookieSettings, applyCookieSettings, hasAcceptedCookies } from '$lib/utils/cookie-service';
    import { onMount } from 'svelte';

    let showDetails = false;
    let showAdvancedSettings = false;
    let settings: CookieSettings = { ...defaultSettings };
    let accepted = false;
    let isVisible = false;

    onMount(() => {
        accepted = hasAcceptedCookies();
        if (!accepted) {
            setTimeout(() => {
                isVisible = true;
            }, 500); // 500ms Verzögerung vor dem Einblenden
        }
    });

    function acceptAll() {
        settings = {
            necessary: true,
            functional: true,
            analytics: true,
            marketing: true
        };
        saveSettings();
    }

    function acceptSelected() {
        saveSettings();
    }

    function saveSettings() {
        saveCookieSettings(settings);
        applyCookieSettings(settings);
        accepted = true;
        isVisible = false;
    }
</script>

{#if !accepted && isVisible}
    <div
        transition:fade={{ duration: 300 }}
        class="cookie-banner fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4"
    >
        <div class="max-w-7xl mx-auto">
            {#if !showAdvancedSettings}
                <!-- Kompakte Ansicht -->
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div class="text-sm text-gray-600 flex-1">
                        <p>
                            Diese Website verwendet Cookies. Mit der Nutzung stimmen Sie der Verwendung von Cookies gemäß unserer 
                            <a href="/datenschutz" class="text-purple-600 hover:underline">Datenschutzerklärung</a> zu.
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <button
                            on:click={() => showAdvancedSettings = true}
                            class="text-sm text-gray-600 hover:text-gray-900 underline"
                        >
                            Einstellungen
                        </button>
                        <button
                            on:click={acceptAll}
                            class="bg-green-400 hover:bg-green-500 text-black px-6 py-2 rounded-full text-sm font-medium transition-colors"
                        >
                            Akzeptieren
                        </button>
                    </div>
                </div>
            {:else}
                <!-- Erweiterte Ansicht -->
                <div class="space-y-4">
                    <div class="text-sm text-gray-600">
                        <p class="mb-2">
                            Diese Website verwendet Cookies und ähnliche Technologien, um Ihnen die bestmögliche Erfahrung zu bieten.
                            Bitte wählen Sie aus, welche Cookies Sie akzeptieren möchten.
                        </p>
                        <p>
                            Weitere Informationen finden Sie in unserer 
                            <a href="/datenschutz" class="text-purple-600 hover:underline">Datenschutzerklärung</a>.
                        </p>
                    </div>

                    <div class="space-y-2">
                        <!-- Notwendige Cookies -->
                        <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                                <label class="font-medium">Notwendige Cookies</label>
                                <p class="text-sm text-gray-500">Technisch erforderlich für die Grundfunktionen der Website</p>
                            </div>
                            <input type="checkbox" checked disabled class="h-4 w-4 text-green-400 rounded">
                        </div>

                        <!-- Funktionale Cookies -->
                        <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                                <label class="font-medium">Funktionale Cookies</label>
                                <p class="text-sm text-gray-500">Verbesserte Funktionalität und Personalisierung</p>
                            </div>
                            <input
                                type="checkbox"
                                bind:checked={settings.functional}
                                class="h-4 w-4 text-green-400 rounded cursor-pointer"
                            >
                        </div>

                        <!-- Analytics Cookies -->
                        <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                                <label class="font-medium">Analytics Cookies</label>
                                <p class="text-sm text-gray-500">Helfen uns zu verstehen, wie die Website genutzt wird</p>
                            </div>
                            <input
                                type="checkbox"
                                bind:checked={settings.analytics}
                                class="h-4 w-4 text-green-400 rounded cursor-pointer"
                            >
                        </div>

                        <!-- Marketing Cookies -->
                        <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                                <label class="font-medium">Marketing Cookies</label>
                                <p class="text-sm text-gray-500">Ermöglichen personalisierte Werbung</p>
                            </div>
                            <input
                                type="checkbox"
                                bind:checked={settings.marketing}
                                class="h-4 w-4 text-green-400 rounded cursor-pointer"
                            >
                        </div>
                    </div>

                    <button
                        on:click={() => showDetails = !showDetails}
                        class="text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                        {showDetails ? 'Details ausblenden' : 'Details anzeigen'}
                    </button>

                    {#if showDetails}
                        <div class="mt-4 border rounded p-4 bg-gray-50">
                            <h3 class="font-medium mb-2">Verwendete Cookies</h3>
                            <div class="space-y-2">
                                {#each cookieInfo as cookie}
                                    <div class="text-sm">
                                        <p class="font-medium">{cookie.name}</p>
                                        <p class="text-gray-600">Zweck: {cookie.purpose}</p>
                                        <p class="text-gray-600">Dauer: {cookie.duration}</p>
                                        <p class="text-gray-600">Kategorie: {cookie.type}</p>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <div class="flex flex-col sm:flex-row justify-end gap-2">
                        <button
                            on:click={() => showAdvancedSettings = false}
                            class="text-sm text-gray-600 hover:text-gray-900 underline"
                        >
                            Zurück
                        </button>
                        <button
                            on:click={acceptSelected}
                            class="bg-gray-200 hover:bg-gray-300 text-black px-6 py-2 rounded-full text-sm font-medium transition-colors"
                        >
                            Auswahl bestätigen
                        </button>
                        <button
                            on:click={acceptAll}
                            class="bg-green-400 hover:bg-green-500 text-black px-6 py-2 rounded-full text-sm font-medium transition-colors"
                        >
                            Alle akzeptieren
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    </div>
{/if}