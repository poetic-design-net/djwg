// Defensive script to prevent null element access errors
// This script runs early to ensure DOM queries are safe

(function() {
  'use strict';
  
  // Store the original querySelector methods
  const originalQuerySelector = document.querySelector;
  const originalQuerySelectorAll = document.querySelectorAll;
  
  // Override querySelector with null-safe version
  document.querySelector = function(selector) {
    try {
      const element = originalQuerySelector.call(this, selector);
      
      // If the selector is looking for a search button that doesn't exist,
      // return a mock object to prevent errors
      if (!element && selector && selector.includes('search')) {
        console.warn(`Element not found: ${selector}`);
        // Return a mock element with safe methods
        return {
          addEventListener: function() {
            console.warn(`Attempted to add event listener to non-existent element: ${selector}`);
          },
          removeEventListener: function() {},
          click: function() {},
          focus: function() {},
          blur: function() {},
          style: {},
          classList: {
            add: function() {},
            remove: function() {},
            toggle: function() {},
            contains: function() { return false; }
          },
          setAttribute: function() {},
          getAttribute: function() { return null; },
          appendChild: function() {},
          removeChild: function() {},
          innerHTML: '',
          textContent: ''
        };
      }
      
      return element;
    } catch (e) {
      console.error('Error in querySelector:', e);
      return null;
    }
  };
  
  // Override querySelectorAll with error handling
  document.querySelectorAll = function(selector) {
    try {
      return originalQuerySelectorAll.call(this, selector);
    } catch (e) {
      console.error('Error in querySelectorAll:', e);
      return [];
    }
  };
  
  // Add global error handler for uncaught errors
  window.addEventListener('error', function(event) {
    // Check if it's the specific error we're trying to catch
    if (event.message && event.message.includes('null is not an object') && 
        event.message.includes('querySelector') && 
        event.message.includes('addEventListener')) {
      console.warn('Caught and prevented querySelector null error');
      event.preventDefault();
      return true;
    }
  });
  
  // Ensure DOM is ready before any script tries to access elements
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Additional safety check for search buttons after DOM is loaded
      const searchSelectors = [
        'button[aria-label*="search"]',
        'button[aria-label*="Search"]',
        '.search-button',
        '#search-button',
        '[role="search"] button'
      ];
      
      searchSelectors.forEach(selector => {
        try {
          const element = originalQuerySelector.call(document, selector);
          if (!element) {
            console.info(`Search element not found on this page: ${selector}`);
          }
        } catch (e) {
          // Silent catch - element doesn't exist
        }
      });
    });
  }
})();