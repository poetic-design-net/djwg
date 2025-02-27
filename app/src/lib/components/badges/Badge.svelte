<script lang="ts">
    export let name: string;
    export let description: string | undefined = undefined;
    export let iconUrl: string | undefined = undefined;
    export let isUnlocked: boolean = false;
    export let style: {
        customColor?: string;
        borderStyle?: 'solid' | 'dashed' | 'double';
        variant?: 'gold' | 'silver' | 'bronze' | 'custom';
    } = {};
</script>

<div
    class="relative group flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105"
    class:opacity-50={!isUnlocked}
    class:hover:opacity-100={!isUnlocked}
    style:border-color={style.customColor || '#E5E7EB'}
    style:border-style={style.borderStyle || 'solid'}
>
    {#if iconUrl}
        <img
            src={iconUrl}
            alt={name}
            class="w-16 h-16 object-contain mb-2 {isUnlocked ? '' : 'filter blur-sm group-hover:blur-none transition-all duration-300'}"
        />
    {:else}
        <div 
            class="w-16 h-16 rounded-full mb-2 flex items-center justify-center text-2xl font-bold"
            style:background-color={style.customColor || '#E5E7EB'}
        >
            {name[0]}
        </div>
    {/if}

    <h3 class="text-lg font-semibold mb-1">{name}</h3>
    
    {#if description}
        <p class="text-sm text-gray-600 text-center">{description}</p>
    {/if}

    {#if !isUnlocked}
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="bg-black bg-opacity-80 p-4 rounded-lg text-white text-sm max-w-[200px] text-center">
                <p class="font-semibold mb-2">So schaltest du diesen Badge frei:</p>
                <p class="mb-2">{description}</p>
            </div>
        </div>
    {/if}

    {#if style.variant}
        <div 
            class="absolute -top-1 -right-1 w-6 h-6 rounded-full border-2"
            class:bg-yellow-500={style.variant === 'gold'}
            class:bg-gray-300={style.variant === 'silver'}
            class:bg-amber-700={style.variant === 'bronze'}
            style:background-color={style.variant === 'custom' ? style.customColor : undefined}
        />
    {/if}
</div>