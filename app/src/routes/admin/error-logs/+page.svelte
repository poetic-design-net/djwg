<script lang="ts">
    import { page } from '$app/stores';
    import { format } from 'date-fns/format';
    import { de } from 'date-fns/locale/de';
    import type { ErrorLog, ErrorLogEventType } from '$lib/types/error-log';
    import { goto } from '$app/navigation';

    export let data;

    $: logs = data.logs as ErrorLog[];
    $: eventTypes = data.eventTypes as ErrorLogEventType[];
    $: selectedEventType = $page.url.searchParams.get('eventType');

    function formatDate(dateStr: string): string {
        return format(new Date(dateStr), 'PPpp', { locale: de });
    }

    function handleFilterChange(eventType: ErrorLogEventType | 'all') {
        const url = new URL(window.location.href);
        if (eventType === 'all') {
            url.searchParams.delete('eventType');
        } else {
            url.searchParams.set('eventType', eventType);
        }
        goto(url.toString());
    }

    function getEventTypeLabel(type: string): string {
        const labels: Record<string, string> = {
            newsletter_sync: 'Newsletter-Synchronisation',
            system: 'System',
            user_action: 'Benutzeraktion'
        };
        return labels[type] || type;
    }

    function getBadgeColor(type: string): string {
        const colors: Record<string, string> = {
            newsletter_sync: 'bg-blue-100 text-blue-800',
            system: 'bg-gray-100 text-gray-800',
            user_action: 'bg-green-100 text-green-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    }
</script>

<div class="p-4">
    <div class="mb-6">
        <h1 class="text-2xl font-bold mb-4">Error-Logs</h1>
        
        <div class="flex gap-2 mb-6">
            <button
                class="px-3 py-1 rounded-full text-sm font-medium {!selectedEventType ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}"
                on:click={() => handleFilterChange('all')}
            >
                Alle
            </button>
            {#each eventTypes as eventType}
                <button
                    class="px-3 py-1 rounded-full text-sm font-medium {selectedEventType === eventType ? 'bg-indigo-100 text-indigo-800' : getBadgeColor(eventType)}"
                    on:click={() => handleFilterChange(eventType)}
                >
                    {getEventTypeLabel(eventType)}
                </button>
            {/each}
        </div>
    </div>

    {#if logs.length === 0}
        <div class="text-center py-12 text-gray-500">
            Keine Logs gefunden
        </div>
    {:else}
        <div class="space-y-4">
            {#each logs as log}
                <div class="bg-white shadow rounded-lg p-4">
                    <div class="flex items-start justify-between">
                        <div>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getBadgeColor(log.event_type)}">
                                {getEventTypeLabel(log.event_type)}
                            </span>
                            <p class="mt-1 text-sm text-gray-900">{log.message}</p>
                        </div>
                        <time class="text-xs text-gray-500" datetime={log.created_at}>
                            {formatDate(log.created_at)}
                        </time>
                    </div>
                    
                    {#if log.details}
                        <div class="mt-2 pt-2 border-t border-gray-100">
                            <pre class="text-xs text-gray-600 overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                            </pre>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>