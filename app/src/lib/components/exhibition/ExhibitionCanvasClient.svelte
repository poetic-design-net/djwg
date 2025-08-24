<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { browser } from '$app/environment'
  import type { ExhibitionStand, ExhibitionHall } from '$lib/types/exhibition'
  import { STATUS_COLORS } from '$lib/types/exhibition'
  import {
    canvasScale,
    canvasPosition,
    selectedStand,
    hoveredStand,
    filteredStands,
  } from '$lib/stores/exhibition'
  import TouchGestureHandler from './TouchGestureHandler.svelte'
  import imageUrlBuilder from '@sanity/image-url'
  import { client } from '$lib/sanity/client'
  import { 
    getVisibleStands, 
    shouldRenderDetails, 
    getOptimizedFontSize,
    shouldRenderFloorPlan 
  } from '$lib/utils/virtualization'

  const builder = imageUrlBuilder(client)

  export let stands: ExhibitionStand[] = []
  export let hall: ExhibitionHall | null = null

  let stageWidth = 800
  let stageHeight = 600
  let stageContainer: HTMLDivElement
  let isDragging = false
  let lastPointerPosition = { x: 0, y: 0 }
  let konvaComponents: any = {}
  let konvaLoaded = false

  $: hallStands = $filteredStands.filter(
    stand => hall && stand.hall._id === hall._id
  )

  $: visibleStands = getVisibleStands(
    hallStands,
    {
      x: $canvasPosition.x,
      y: $canvasPosition.y,
      width: stageWidth,
      height: stageHeight,
      scale: $canvasScale,
    }
  )

  onMount(async () => {
    if (browser) {
      // Dynamically import svelte-konva components
      const konvaModule = await import('svelte-konva')
      konvaComponents = {
        Stage: konvaModule.Stage,
        Layer: konvaModule.Layer,
        Rect: konvaModule.Rect,
        Text: konvaModule.Text,
        Image: konvaModule.Image,
        Group: konvaModule.Group,
      }
      konvaLoaded = true
      
      handleResize()
      window.addEventListener('resize', handleResize)
      window.addEventListener('wheel', handleWheel, { passive: false })
    }
  })

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('wheel', handleWheel)
    }
  })

  function handleResize() {
    if (stageContainer) {
      stageWidth = stageContainer.clientWidth
      stageHeight = stageContainer.clientHeight
    }
  }

  function handleWheel(e: WheelEvent) {
    if (!stageContainer?.contains(e.target as Node)) return
    
    e.preventDefault()
    
    const scaleBy = 1.1
    const stage = { x: $canvasPosition.x, y: $canvasPosition.y }
    const oldScale = $canvasScale
    const pointer = {
      x: e.clientX - stageContainer.getBoundingClientRect().left,
      y: e.clientY - stageContainer.getBoundingClientRect().top,
    }

    const mousePointTo = {
      x: (pointer.x - stage.x) / oldScale,
      y: (pointer.y - stage.y) / oldScale,
    }

    const newScale = e.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
    
    // Limit scale
    const limitedScale = Math.max(0.1, Math.min(5, newScale))
    
    canvasScale.set(limitedScale)
    canvasPosition.set({
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale,
    })
  }

  function handleStageMouseDown(e: any) {
    const pos = e.target.getStage().getPointerPosition()
    lastPointerPosition = { x: pos.x, y: pos.y }
    isDragging = true
  }

  function handleStageMouseMove(e: any) {
    if (!isDragging) return
    
    const pos = e.target.getStage().getPointerPosition()
    const dx = pos.x - lastPointerPosition.x
    const dy = pos.y - lastPointerPosition.y
    
    canvasPosition.update(p => ({
      x: p.x + dx,
      y: p.y + dy,
    }))
    
    lastPointerPosition = { x: pos.x, y: pos.y }
  }

  function handleStageMouseUp() {
    isDragging = false
  }

  function handleStandClick(stand: ExhibitionStand) {
    selectedStand.set(stand)
  }

  function handleStandMouseEnter(stand: ExhibitionStand) {
    hoveredStand.set(stand)
    document.body.style.cursor = 'pointer'
  }

  function handleStandMouseLeave() {
    hoveredStand.set(null)
    document.body.style.cursor = 'default'
  }

  function getStandColor(stand: ExhibitionStand): string {
    if ($selectedStand?._id === stand._id) {
      return '#3b82f6' // blue for selected
    }
    return STATUS_COLORS[stand.status] || '#e5e7eb'
  }

  function getStandOpacity(stand: ExhibitionStand): number {
    if ($hoveredStand?._id === stand._id || $selectedStand?._id === stand._id) {
      return 0.9
    }
    return 0.7
  }

  function shouldShowLabel(stand: ExhibitionStand): boolean {
    return shouldRenderDetails(
      stand,
      $canvasScale,
      $hoveredStand?._id === stand._id,
      $selectedStand?._id === stand._id
    )
  }

  function getStandFontSize(baseSize: number): number {
    return getOptimizedFontSize(baseSize, $canvasScale)
  }

  function getFloorPlanUrl(): string | null {
    if (!hall?.floorPlan?.asset?._ref) return null
    return builder.image(hall.floorPlan).url()
  }
</script>

<div bind:this={stageContainer} class="w-full h-full relative touch-none">
  <TouchGestureHandler element={stageContainer} />
  
  {#if hall && browser && konvaLoaded}
    <svelte:component 
      this={konvaComponents.Stage}
      config={{
        width: stageWidth,
        height: stageHeight,
      }}
      on:mousedown={handleStageMouseDown}
      on:mousemove={handleStageMouseMove}
      on:mouseup={handleStageMouseUp}
      on:mouseleave={handleStageMouseUp}
    >
      <svelte:component 
        this={konvaComponents.Layer}
        config={{
          x: $canvasPosition.x,
          y: $canvasPosition.y,
          scaleX: $canvasScale,
          scaleY: $canvasScale,
        }}
      >
        <!-- Hall background -->
        <svelte:component 
          this={konvaComponents.Rect}
          config={{
            x: 0,
            y: 0,
            width: hall.dimensions.width,
            height: hall.dimensions.height,
            fill: '#f3f4f6',
            stroke: '#d1d5db',
            strokeWidth: 2,
          }}
        />

        <!-- Hall floor plan image if available -->
        {#if getFloorPlanUrl() && shouldRenderFloorPlan($canvasScale)}
          <svelte:component 
            this={konvaComponents.Image}
            config={{
              x: 0,
              y: 0,
              width: hall.dimensions.width,
              height: hall.dimensions.height,
              image: (() => {
                const img = new window.Image()
                img.src = getFloorPlanUrl() || ''
                return img
              })(),
              opacity: 0.3,
            }}
          />
        {/if}

        <!-- Exhibition stands -->
        {#each visibleStands as stand (stand._id)}
          <svelte:component 
            this={konvaComponents.Group}
            config={{
              x: stand.position.x,
              y: stand.position.y,
            }}
            on:click={() => handleStandClick(stand)}
            on:mouseenter={() => handleStandMouseEnter(stand)}
            on:mouseleave={handleStandMouseLeave}
          >
            <!-- Stand rectangle -->
            <svelte:component 
              this={konvaComponents.Rect}
              config={{
                x: 0,
                y: 0,
                width: stand.size.width,
                height: stand.size.height,
                fill: getStandColor(stand),
                stroke: $selectedStand?._id === stand._id ? '#1e40af' : '#9ca3af',
                strokeWidth: $selectedStand?._id === stand._id ? 3 : 1,
                opacity: getStandOpacity(stand),
                cornerRadius: 4,
                shadowColor: stand.exhibitor?.isPremium ? '#fbbf24' : '#000000',
                shadowBlur: stand.exhibitor?.isPremium ? 20 : 5,
                shadowOpacity: stand.exhibitor?.isPremium ? 0.5 : 0.1,
              }}
            />

            <!-- Stand number -->
            <svelte:component 
              this={konvaComponents.Text}
              config={{
                x: 4,
                y: 4,
                text: stand.standNumber,
                fontSize: getStandFontSize(12),
                fontFamily: 'system-ui',
                fill: '#1f2937',
                fontStyle: 'bold',
              }}
            />

            <!-- Company name (if space allows) -->
            {#if shouldShowLabel(stand) && stand.exhibitor}
              <svelte:component 
                this={konvaComponents.Text}
                config={{
                  x: stand.size.width / 2,
                  y: stand.size.height / 2,
                  text: stand.exhibitor.company,
                  fontSize: getStandFontSize(14),
                  fontFamily: 'system-ui',
                  fill: '#1f2937',
                  align: 'center',
                  verticalAlign: 'middle',
                  width: stand.size.width - 8,
                  offsetX: (stand.size.width - 8) / 2,
                  offsetY: getStandFontSize(14) / 2,
                  wrap: 'word',
                }}
              />
            {/if}

            <!-- Premium badge -->
            {#if stand.exhibitor?.isPremium}
              <svelte:component 
                this={konvaComponents.Text}
                config={{
                  x: stand.size.width - 20,
                  y: 4,
                  text: '⭐',
                  fontSize: 16,
                }}
              />
            {/if}
          </svelte:component>
        {/each}
      </svelte:component>
    </svelte:component>

    <!-- Minimap -->
    <div class="absolute bottom-4 right-4 w-48 h-36 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <svelte:component 
        this={konvaComponents.Stage}
        config={{
          width: 192,
          height: 144,
        }}
      >
        <svelte:component this={konvaComponents.Layer}>
          <!-- Minimap hall -->
          <svelte:component 
            this={konvaComponents.Rect}
            config={{
              x: 0,
              y: 0,
              width: 192,
              height: 144,
              fill: '#f9fafb',
            }}
          />

          <!-- Minimap stands -->
          {#each visibleStands as stand (stand._id)}
            <svelte:component 
              this={konvaComponents.Rect}
              config={{
                x: (stand.position.x / hall.dimensions.width) * 192,
                y: (stand.position.y / hall.dimensions.height) * 144,
                width: (stand.size.width / hall.dimensions.width) * 192,
                height: (stand.size.height / hall.dimensions.height) * 144,
                fill: STATUS_COLORS[stand.status] || '#e5e7eb',
                opacity: 0.6,
              }}
            />
          {/each}

          <!-- Viewport indicator -->
          <svelte:component 
            this={konvaComponents.Rect}
            config={{
              x: (-$canvasPosition.x / $canvasScale / hall.dimensions.width) * 192,
              y: (-$canvasPosition.y / $canvasScale / hall.dimensions.height) * 144,
              width: (stageWidth / $canvasScale / hall.dimensions.width) * 192,
              height: (stageHeight / $canvasScale / hall.dimensions.height) * 144,
              stroke: '#3b82f6',
              strokeWidth: 2,
              fill: 'transparent',
            }}
          />
        </svelte:component>
      </svelte:component>
    </div>

    <!-- Zoom controls -->
    <div class="absolute bottom-4 left-4 flex flex-col gap-2">
      <button
        on:click={() => canvasScale.update(s => Math.min(5, s * 1.2))}
        class="bg-white rounded-lg p-2 shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Zoom in"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      <button
        on:click={() => canvasScale.update(s => Math.max(0.1, s / 1.2))}
        class="bg-white rounded-lg p-2 shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Zoom out"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>
      <button
        on:click={() => {
          canvasScale.set(1)
          canvasPosition.set({ x: 0, y: 0 })
        }}
        class="bg-white rounded-lg p-2 shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Reset zoom"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  {:else if !browser}
    <div class="flex items-center justify-center h-full">
      <p class="text-gray-500">Canvas wird geladen...</p>
    </div>
  {:else}
    <div class="flex items-center justify-center h-full">
      <p class="text-gray-500">Bitte wählen Sie eine Halle aus</p>
    </div>
  {/if}
</div>