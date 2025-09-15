/** Dispatch event on click outside of node */
export function clickOutside(node: HTMLElement | null | undefined) {
  // Guard against null/undefined nodes
  if (!node) {
    return {
      destroy() {
        // No-op for null nodes
      }
    };
  }

  const handleClick = (event: MouseEvent) => {
    // Additional null check in case node is removed during event handling
    if (
      node &&
      node.parentNode && // Check if node is still in DOM
      !node.contains(event.target as Node) &&
      !event.defaultPrevented
    ) {
      node.dispatchEvent(
        new CustomEvent('click_outside', {
          detail: event
        })
      );
    }
  };

  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    }
  };
}
