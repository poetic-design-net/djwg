<script lang="ts">
    import { toasts, type Toast } from '$lib/stores/toast';
    import { fly } from 'svelte/transition';

    let toastList: Toast[];
    toasts.subscribe(value => {
        toastList = value;
    });

    const getToastClasses = (type: Toast['type']): string => {
        const baseClasses = 'rounded-lg p-4 mb-3 flex items-center justify-between shadow-lg';
        switch (type) {
            case 'success':
                return `${baseClasses} bg-green-500 text-black`;
            case 'error':
                return `${baseClasses} bg-red-500 text-white`;
            default:
                return `${baseClasses} bg-blue-500 text-white`;
        }
    };
</script>

<div class="fixed top-4 right-4 z-[10000] w-72">
    {#each toastList as toast (toast.id)}
        <div
            transition:fly={{ x: 100, duration: 300 }}
            class={getToastClasses(toast.type)}
            role="alert"
        >
            <span>{toast.message}</span>
            <button
                class="ml-4  hover:opacity-75"
                on:click={() => toasts.remove(toast.id)}
                aria-label="Close notification"
            >
                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    {/each}
</div>
