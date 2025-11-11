import React from 'react';
import ReactDOM from 'react-dom/client';
import BuyNowButton from './components/BuyNowButton';
import './styles/global.css';

// MFE Module
const createBuyNowMFE = () => {
  const instances = new Map();

  const init = (options = {}) => {
    const {
      containerId,
      config = {},
      onBuyNow,
      onInit
    } = options;

    if (!containerId) {
      throw new Error('containerId is required');
    }

    // React and ReactDOM are bundled, so we use React 18's createRoot API directly

    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }

    // Clear container
    container.innerHTML = '';

    // Default config
    const defaultConfig = {
      color: '#FF3B30',
      size: 'medium',
      label: 'Buy Now',
      enabled: true,
      borderRadius: '12px',
      showPrice: true,
      productId: '',
      productName: '',
      productPrice: 0,
      productCurrency: 'USD',
      // Shadow DOM configuration
      // useShadowDOM: false - Button uses host application CSS (component CSS via style-loader, host can override)
      // useShadowDOM: true - Button is isolated, only uses injectCSS() and applyStyles() (host CSS won't affect it)
      useShadowDOM: false,
      shadowDOMMode: 'open' // 'open' or 'closed' - only used when useShadowDOM is true
    };

    const mergedConfig = { ...defaultConfig, ...config };

    // Create instance ID
    const instanceId = `buy-now-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Setup Shadow DOM if enabled
    let shadowRoot = null;
    let renderTarget = container;
    let shadowWrapper = null;
    
    if (mergedConfig.useShadowDOM && container.attachShadow) {
      // Shadow DOM mode: Isolated from host CSS, only uses injected/applied CSS
      // Host CSS will NOT affect the button
      // Component CSS must be injected via injectCSS() or applyStyles()
      shadowRoot = container.attachShadow({ 
        mode: mergedConfig.shadowDOMMode || 'open' 
      });
      
      // Create a wrapper div inside shadow root for React to render to
      // React 18's createRoot cannot render directly to ShadowRoot
      shadowWrapper = document.createElement('div');
      shadowWrapper.id = `buy-now-wrapper-${instanceId}`;
      shadowRoot.appendChild(shadowWrapper);
      renderTarget = shadowWrapper;
      
      // Note: Component CSS is NOT automatically injected in Shadow DOM mode
      // Use injectCSS() or applyStyles() to style the button
    } else {
      // Regular DOM mode: Uses host application CSS (can be styled by host page CSS)
      // Component CSS is injected via style-loader into document head
      // Host page CSS can override component styles
    }

    // Render component using JSX (Babel will transform to React.createElement)
    // Since React is bundled, we use React 18's createRoot API directly
    try {
      const root = ReactDOM.createRoot(renderTarget);
      root.render(
        <BuyNowButton 
          config={mergedConfig} 
          onBuyNow={onBuyNow} 
          onInit={onInit} 
        />
      );
      
      instances.set(instanceId, {
        containerId,
        config: mergedConfig,
        root,
        container,
        shadowRoot,
        shadowWrapper
      });

      return instanceId;
    } catch (error) {
      console.error('Error rendering Buy Now MFE:', error);
      container.innerHTML = `<div style="color: red; padding: 10px;">Error: ${error.message}</div>`;
      throw error;
    }
  };

  const destroy = (instanceId) => {
    const instance = instances.get(instanceId);
    if (instance) {
      if (instance.root && instance.root.unmount) {
        instance.root.unmount();
      }
      const container = document.getElementById(instance.containerId);
      if (container) {
        container.innerHTML = '';
      }
      instances.delete(instanceId);
    }
  };

  /**
   * Inject CSS into Shadow DOM or regular DOM
   * @param {string} cssText - CSS text to inject
   * @param {string} instanceId - Instance ID (optional, uses first instance if not provided)
   * @returns {boolean} Success status
   */
  const injectCSS = (cssText, instanceId = null) => {
    let targetInstance = null;

    if (instanceId) {
      targetInstance = instances.get(instanceId);
    } else {
      targetInstance = instances.values().next().value;
    }

    if (!targetInstance) {
      console.warn('No instance found for CSS injection');
      return false;
    }

    // If using Shadow DOM, inject into shadow root
    // Otherwise, inject into document head (for regular DOM mode)
    let target = null;
    if (targetInstance.shadowRoot) {
      // Shadow DOM mode: inject into shadow root (isolated from host CSS)
      target = targetInstance.shadowRoot;
    } else {
      // Regular DOM mode: inject into document head (can be overridden by host CSS)
      target = document.head;
    }
    
    if (!target) {
      console.warn('No valid target for CSS injection');
      return false;
    }

    // Create or update style element
    let styleElement = null;
    if (targetInstance.shadowRoot) {
      // Shadow DOM: query from shadow root
      styleElement = targetInstance.shadowRoot.querySelector('style[data-mfe-custom]');
    } else {
      // Regular DOM: query from document head
      styleElement = document.head.querySelector('style[data-mfe-custom]');
    }
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.setAttribute('data-mfe-custom', 'true');
      target.appendChild(styleElement);
    }
    
    styleElement.textContent += '\n' + cssText;
    
    return true;
  };

  return {
    init,
    destroy,
    injectCSS
  };
};

// Create global instance
const buyNowMFE = createBuyNowMFE();

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = buyNowMFE;
}

// Export for ES6 modules
export default buyNowMFE;

// Set global window object
if (typeof window !== 'undefined') {
  window.BuyNowMFE = buyNowMFE;
  
  // Also try to set it after a delay in case webpack wraps it
  setTimeout(() => {
    if (typeof window.BuyNowMFE === 'undefined' || typeof window.BuyNowMFE.init !== 'function') {
      window.BuyNowMFE = buyNowMFE;
      console.log('BuyNowMFE: Set global instance');
    }
  }, 0);
}

