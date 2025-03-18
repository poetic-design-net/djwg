// translationHelper.ts
type Browser = 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown';

export interface TranslationTip {
  show: () => void;
  hide: () => void;
}

function detectBrowser(): Browser {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) return 'chrome';
  if (/firefox/i.test(userAgent)) return 'firefox';
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return 'safari';
  if (/edg/i.test(userAgent)) return 'edge';
  
  return 'unknown';
}

function createTranslationTip(browser: Browser): string {
  switch(browser) {
    case 'chrome':
      return 'Click the translate icon in your address bar to translate this page to English';
    case 'firefox':
      return 'Click the translate icon in your address bar (you might need to enable the translation feature in Firefox settings first)';
    case 'safari':
      return 'Click the "aA" button in the address bar and select "Translate to English"';
    case 'edge':
      return 'Click the translate icon in your address bar to translate this page to English';
    default:
      return 'Use your browser\'s built-in translation feature in the address bar';
  }
}

export function setupBrowserTranslation(): TranslationTip {
  const browser = detectBrowser();
  let tipElement: HTMLDivElement | null = null;
  
  function show() {
    if (tipElement) return; // Don't show if already visible
    
    tipElement = document.createElement('div');
    tipElement.className = 'translation-tip';
    tipElement.textContent = createTranslationTip(browser);
    tipElement.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: #f8f9fa;
      padding: 15px 40px 15px 15px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
      font-size: 14px;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;

    // Close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      border: none;
      background: none;
      font-size: 20px;
      cursor: pointer;
      padding: 0 6px;
      color: #666;
    `;
    closeButton.onclick = hide;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    tipElement.appendChild(closeButton);
    document.body.appendChild(tipElement);
  }

  function hide() {
    if (tipElement) {
      tipElement.remove();
      tipElement = null;
    }
  }
  
  return {
    show,
    hide
  };
}