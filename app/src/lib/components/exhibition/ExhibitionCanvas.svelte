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
    selectedHall,
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
  import {
    generateShapePoints,
    pointsToFlatArray,
    getPolygonCenter,
  } from '$lib/utils/exhibitionShapes'

  const builder = imageUrlBuilder(client)

  export let stands: ExhibitionStand[] = []
  export let hall: ExhibitionHall | null = null

  let stageWidth = 800
  let stageHeight = 600
  let stageContainer: HTMLDivElement
  let isDragging = false
  let lastPointerPosition = { x: 0, y: 0 }
  
  // Dynamically import Konva components only in browser
  let Stage: any
  let Layer: any
  let Rect: any
  let Text: any
  let KonvaImage: any
  let Group: any
  let Line: any
  let konvaLoaded = false

  $: hallStands = $filteredStands.filter(
    stand => hall && stand.hall?._id === hall._id
  )
  
  // Re-center when hall changes
  $: if (hall && konvaLoaded) {
    centerView()
  }

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
      Stage = konvaModule.Stage
      Layer = konvaModule.Layer
      Rect = konvaModule.Rect
      Text = konvaModule.Text
      KonvaImage = konvaModule.Image
      Group = konvaModule.Group
      Line = konvaModule.Line
      konvaLoaded = true
      
      handleResize()
      window.addEventListener('resize', handleResize)
      window.addEventListener('wheel', handleWheel, { passive: false })
      
      // Center the view on mount
      if (hall) {
        setTimeout(() => centerView(), 100)
      }
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
    
    // Limit scale - min 0.5 (50%), max 3 (300%)
    const limitedScale = Math.max(0.5, Math.min(3, newScale))
    
    canvasScale.set(limitedScale)
    canvasPosition.set({
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale,
    })
  }

  function handleStageMouseDown(e: any) {
    if (!e.target) return
    const stage = e.target.getStage && e.target.getStage()
    if (!stage) return
    const pos = stage.getPointerPosition()
    if (!pos) return
    lastPointerPosition = { x: pos.x, y: pos.y }
    isDragging = true
  }

  function handleStageMouseMove(e: any) {
    if (!isDragging || !e.target) return
    const stage = e.target.getStage && e.target.getStage()
    if (!stage) return
    const pos = stage.getPointerPosition()
    if (!pos) return
    
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

  function handleStandClick(stand: ExhibitionStand, e?: any) {
    // Don't select stand if we're dragging
    if (isDragging) return
    
    selectedStand.set(stand)
    centerOnStand(stand)
  }
  
  export function centerOnStand(stand: ExhibitionStand) {
    if (!stand || !hall) return
    
    const targetScale = 1.5
    const centerX = stageWidth / 2
    const centerY = stageHeight / 2
    
    canvasScale.set(targetScale)
    canvasPosition.set({
      x: centerX - (stand.position.x + stand.size.width / 2) * targetScale,
      y: centerY - (stand.position.y + stand.size.height / 2) * targetScale,
    })
  }
  
  export function centerView() {
    if (!hall) return
    
    const padding = 50
    const scaleX = (stageWidth - padding * 2) / hall.dimensions.width
    const scaleY = (stageHeight - padding * 2) / hall.dimensions.height
    const scale = Math.min(scaleX, scaleY, 1)
    
    canvasScale.set(scale)
    canvasPosition.set({
      x: (stageWidth - hall.dimensions.width * scale) / 2,
      y: (stageHeight - hall.dimensions.height * scale) / 2,
    })
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
    // Custom color takes priority
    if (stand.customColor?.useCustom && stand.customColor?.hex) {
      return stand.customColor.hex
    }
    // Selected stand gets blue
    if ($selectedStand?._id === stand._id) {
      return '#3b82f6'
    }
    // Otherwise use status color
    return STATUS_COLORS[stand.status] || '#e5e7eb'
  }

  function getStandOpacity(stand: ExhibitionStand): number {
    // Use custom opacity if defined
    if (stand.customColor?.useCustom && stand.customColor?.opacity !== undefined) {
      // Increase opacity slightly when hovered/selected
      if ($hoveredStand?._id === stand._id || $selectedStand?._id === stand._id) {
        return Math.min(1, stand.customColor.opacity + 0.2)
      }
      return stand.customColor.opacity
    }
    // Default opacity behavior
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

  function getStandShape(stand: ExhibitionStand) {
    const shapeType = stand.shape?.type || 'rectangle'
    
    // Debug logging for polygon issues (uncomment if needed)
    // if (shapeType === 'polygon') {
    //   console.log(`🔍 Polygon Debug for ${stand.standNumber}:`, {
    //     standPosition: stand.position,
    //     standSize: stand.size,
    //     hasCustomPoints: !!stand.shape?.points?.length,
    //     customPoints: stand.shape?.points,
    //     shapeType: shapeType
    //   })
    // }
    
    // For custom polygon points
    if (shapeType === 'polygon' && stand.shape?.points && stand.shape.points.length >= 3) {
      // IMPORTANT: Points should be relative to (0,0) of the Group
      // If points are stored as absolute coordinates, we need to offset them
      const points = stand.shape.points.map(p => ({
        x: p.x || 0,
        y: p.y || 0
      }))
      
      // console.log(`📍 Using custom points for ${stand.standNumber}:`, points)
      return points
    }
    
    // Generate points based on shape type
    // All generated points are relative to (0,0) since Group handles absolute positioning
    const generatedPoints = generateShapePoints(
      shapeType,
      stand.size.width,
      stand.size.height,
      0,  // Always start at 0,0 within the Group
      0
    )
    
    // if (shapeType === 'polygon') {
    //   console.log(`📐 Generated polygon points for ${stand.standNumber}:`, generatedPoints)
    // }
    
    return generatedPoints
  }

  function getTextPosition(stand: ExhibitionStand) {
    const points = getStandShape(stand)
    const center = getPolygonCenter(points)
    return center
  }
</script>

<div bind:this={stageContainer} class="absolute inset-0 touch-none">
  <TouchGestureHandler element={stageContainer} />
  {#if hall && browser && konvaLoaded}
    <svelte:component this={Stage}
      config={{
        width: stageWidth,
        height: stageHeight,
        draggable: true,  // Enable dragging on the entire stage
      }}
      on:dragstart={() => {
        isDragging = true
      }}
      on:dragend={() => {
        isDragging = false
      }}
      on:dragmove={(e) => {
        const stage = e.target
        if (stage) {
          canvasPosition.set({
            x: stage.x(),
            y: stage.y()
          })
        }
      }}
    >
      <svelte:component this={Layer}
        config={{
          x: $canvasPosition.x,
          y: $canvasPosition.y,
          scaleX: $canvasScale,
          scaleY: $canvasScale,
        }}
      >
        <!-- Hall background -->
        <svelte:component this={Rect}
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
          <svelte:component this={KonvaImage}
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
        {#each visibleStands as stand}
          <svelte:component this={Group}
            config={{
              x: stand.position.x,
              y: stand.position.y,
              draggable: false,  // Disable dragging on the stand itself
            }}
            on:click={(e) => handleStandClick(stand, e)}
            on:mouseenter={() => handleStandMouseEnter(stand)}
            on:mouseleave={handleStandMouseLeave}
            on:mousedown={(e) => {
              // Allow drag to start even when clicking on stands
              handleStageMouseDown(e)
              e.cancelBubble = false  // Allow event to bubble for dragging
            }}
          >
            <!-- Debug: Bounding Box for polygons - Set DEBUG_POLYGON to true -->
            {@const DEBUG_POLYGON = false}
            {#if stand.shape?.type === 'polygon' && DEBUG_POLYGON}
              <svelte:component this={Rect}
                config={{
                  x: 0,
                  y: 0,
                  width: stand.size.width,
                  height: stand.size.height,
                  fill: 'transparent',
                  stroke: '#ff00ff',
                  strokeWidth: 1,
                  opacity: 0.5,
                  dash: [5, 5],
                }}
              />
            {/if}
            
            <!-- Stand shape (polygon or rectangle) -->
            {#if stand.shape?.type && stand.shape.type !== 'rectangle'}
              {@const shapePoints = getStandShape(stand)}
              {@const flatPoints = pointsToFlatArray(shapePoints)}
              {#if shapePoints.length >= 3}
                <svelte:component this={Line}
                  config={{
                    points: flatPoints,
                    fill: getStandColor(stand),
                    stroke: $selectedStand?._id === stand._id ? '#1e40af' : '#9ca3af',
                    strokeWidth: $selectedStand?._id === stand._id ? 3 : 1,
                    opacity: getStandOpacity(stand),
                    closed: true,
                    shadowColor: stand.exhibitor?.isPremium ? '#fbbf24' : '#000000',
                    shadowBlur: stand.exhibitor?.isPremium ? 20 : 5,
                    shadowOpacity: stand.exhibitor?.isPremium ? 0.5 : 0.1,
                  }}
                />
              {:else}
                <!-- Fallback to rectangle if polygon has insufficient points -->
                <svelte:component this={Rect}
                  config={{
                    x: 0,
                    y: 0,
                    width: stand.size.width,
                    height: stand.size.height,
                    fill: getStandColor(stand),
                    stroke: '#ff0000',
                    strokeWidth: 2,
                    opacity: 0.5,
                  }}
                />
              {/if}
            {:else}
              <!-- Traditional rectangle for backward compatibility -->
              <svelte:component this={Rect}
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
            {/if}

            <!-- Stand number -->
            <svelte:component this={Text}
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
              {@const textPos = getTextPosition(stand)}
              <svelte:component this={Text}
                config={{
                  x: textPos.x,
                  y: textPos.y,
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
              <svelte:component this={Text}
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
    <div 
      class="absolute bottom-4 right-4 w-48 h-36 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden cursor-pointer"
      on:click={centerView}
      title="Klicken zum Zentrieren">
      <svelte:component this={Stage}
        config={{
          width: 192,
          height: 144,
        }}
      >
        <svelte:component this={Layer}>
          <!-- Minimap hall -->
          <svelte:component this={Rect}
            config={{
              x: 0,
              y: 0,
              width: 192,
              height: 144,
              fill: '#f9fafb',
            }}
          />

          <!-- Minimap stands with polygon support -->
          {#each visibleStands as stand}
            {#if stand.shape?.type && stand.shape.type !== 'rectangle'}
              {@const shapePoints = getStandShape(stand)}
              {@const scaledPoints = shapePoints.map(p => [
                ((stand.position.x + p.x) / hall.dimensions.width) * 192,
                ((stand.position.y + p.y) / hall.dimensions.height) * 144
              ]).flat()}
              {#if shapePoints.length >= 3}
                <svelte:component this={Line}
                  config={{
                    points: scaledPoints,
                    fill: getStandColor(stand),
                    closed: true,
                    opacity: 0.6,
                  }}
                />
              {/if}
            {:else}
              <svelte:component this={Rect}
                config={{
                  x: (stand.position.x / hall.dimensions.width) * 192,
                  y: (stand.position.y / hall.dimensions.height) * 144,
                  width: (stand.size.width / hall.dimensions.width) * 192,
                  height: (stand.size.height / hall.dimensions.height) * 144,
                  fill: getStandColor(stand),
                  opacity: 0.6,
                }}
              />
            {/if}
          {/each}

          <!-- Viewport indicator -->
          <svelte:component this={Rect}
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
        on:click={() => canvasScale.update(s => Math.min(3, s * 1.2))}
        class="bg-white rounded-lg p-2 shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Zoom in"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      <button
        on:click={() => canvasScale.update(s => Math.max(0.5, s / 1.2))}
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
  {:else}
    <div class="flex items-center justify-center h-full">
      <p class="text-gray-500">Bitte wählen Sie eine Halle aus</p>
    </div>
  {/if}
</div>