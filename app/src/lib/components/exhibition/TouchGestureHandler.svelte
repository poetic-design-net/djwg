<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { canvasScale, canvasPosition } from '$lib/stores/exhibition'

  export let element: HTMLElement | null = null

  let initialDistance = 0
  let initialScale = 1
  let initialPosition = { x: 0, y: 0 }
  let lastTouchPosition = { x: 0, y: 0 }
  let isTouching = false
  let touchCount = 0

  onMount(() => {
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })
    element.addEventListener('gesturestart', handleGestureStart, { passive: false })
    element.addEventListener('gesturechange', handleGestureChange, { passive: false })
    element.addEventListener('gestureend', handleGestureEnd, { passive: false })
  })

  onDestroy(() => {
    if (!element) return

    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchmove', handleTouchMove)
    element.removeEventListener('touchend', handleTouchEnd)
    element.removeEventListener('gesturestart', handleGestureStart)
    element.removeEventListener('gesturechange', handleGestureChange)
    element.removeEventListener('gestureend', handleGestureEnd)
  })

  function getDistance(touches: TouchList): number {
    if (touches.length < 2) return 0
    
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  function getCenter(touches: TouchList): { x: number, y: number } {
    if (touches.length === 1) {
      return { x: touches[0].clientX, y: touches[0].clientY }
    }
    
    let sumX = 0
    let sumY = 0
    
    for (let i = 0; i < touches.length; i++) {
      sumX += touches[i].clientX
      sumY += touches[i].clientY
    }
    
    return {
      x: sumX / touches.length,
      y: sumY / touches.length,
    }
  }

  function handleTouchStart(e: TouchEvent) {
    e.preventDefault()
    
    touchCount = e.touches.length
    isTouching = true
    
    if (e.touches.length === 1) {
      // Single touch - pan
      lastTouchPosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    } else if (e.touches.length === 2) {
      // Two touches - pinch to zoom
      initialDistance = getDistance(e.touches)
      initialScale = $canvasScale
      initialPosition = { ...$canvasPosition }
    }
  }

  function handleTouchMove(e: TouchEvent) {
    e.preventDefault()
    
    if (!isTouching) return
    
    if (e.touches.length === 1 && touchCount === 1) {
      // Single touch - pan
      const dx = e.touches[0].clientX - lastTouchPosition.x
      const dy = e.touches[0].clientY - lastTouchPosition.y
      
      canvasPosition.update(p => ({
        x: p.x + dx,
        y: p.y + dy,
      }))
      
      lastTouchPosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    } else if (e.touches.length === 2) {
      // Two touches - pinch to zoom
      const currentDistance = getDistance(e.touches)
      const center = getCenter(e.touches)
      
      if (initialDistance > 0) {
        const scale = (currentDistance / initialDistance) * initialScale
        const limitedScale = Math.max(0.1, Math.min(5, scale))
        
        // Calculate the zoom point relative to the canvas
        const rect = element?.getBoundingClientRect()
        if (rect) {
          const zoomPointX = center.x - rect.left
          const zoomPointY = center.y - rect.top
          
          // Adjust position to zoom towards the pinch center
          const scaleDiff = limitedScale - $canvasScale
          const newX = $canvasPosition.x - zoomPointX * scaleDiff
          const newY = $canvasPosition.y - zoomPointY * scaleDiff
          
          canvasScale.set(limitedScale)
          canvasPosition.set({ x: newX, y: newY })
        } else {
          canvasScale.set(limitedScale)
        }
      }
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if (e.touches.length === 0) {
      isTouching = false
      touchCount = 0
    } else {
      touchCount = e.touches.length
      
      if (e.touches.length === 1) {
        // Reset for single touch after pinch
        lastTouchPosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
      }
    }
  }

  // iOS Safari gesture events (alternative to touch events for pinch)
  function handleGestureStart(e: any) {
    e.preventDefault()
    initialScale = $canvasScale
  }

  function handleGestureChange(e: any) {
    e.preventDefault()
    
    const newScale = initialScale * e.scale
    const limitedScale = Math.max(0.1, Math.min(5, newScale))
    
    canvasScale.set(limitedScale)
  }

  function handleGestureEnd(e: any) {
    e.preventDefault()
  }
</script>