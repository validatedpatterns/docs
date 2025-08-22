/**
 * Parallax Background Effect
 * Creates a subtle parallax effect on hero section background that moves
 * in the opposite direction of mouse movement
 */
(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    heroSelector: '#hero-section',
    parallaxIntensity: 30,
    transitionDuration: 100, // milliseconds
    throttleDelay: 16, // ~60fps
  };

  // State
  let heroSection = null;
  let rafId = null;
  let lastUpdateTime = 0;
  let isInitialized = false;

  /**
   * Throttled mouse move handler for better performance
   */
  function handleMouseMove(event) {
    const now = performance.now();

    // Throttle updates to maintain 60fps
    if (now - lastUpdateTime < CONFIG.throttleDelay) {
      return;
    }

    lastUpdateTime = now;

    // Cancel any pending animation frame
    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => updateBackgroundPosition(event));
  }

  /**
   * Update background position based on mouse coordinates
   */
  function updateBackgroundPosition(event) {
    if (!heroSection) return;

    // Get viewport dimensions
    const { innerWidth: viewportWidth, innerHeight: viewportHeight } = window;

    // Calculate mouse position as percentage from center (-0.5 to 0.5)
    const mouseX = (event.clientX - viewportWidth * 0.5) / viewportWidth;
    const mouseY = (event.clientY - viewportHeight * 0.5) / viewportHeight;

    // Calculate parallax offset (opposite direction)
    const offsetX = -mouseX * CONFIG.parallaxIntensity;
    const offsetY = -mouseY * CONFIG.parallaxIntensity;

    // Apply background position with hardware acceleration hint
    heroSection.style.backgroundPosition = `calc(50% + ${offsetX}px) calc(50% + ${offsetY}px)`;
  }

  /**
   * Reset background position when mouse leaves viewport
   */
  function handleMouseLeave() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    if (heroSection) {
      heroSection.style.backgroundPosition = 'center center';
    }
  }

  /**
   * Initialize the parallax effect
   */
  function init() {
    // Find hero section
    heroSection = document.querySelector(CONFIG.heroSelector);

    if (!heroSection) {
      console.warn('Parallax: Hero section not found');
      return;
    }

    // Add CSS transition if not already present
    const currentStyle = heroSection.style.transition;
    if (!currentStyle.includes('background-position')) {
      const newTransition = currentStyle
        ? `${currentStyle}, background-position ${CONFIG.transitionDuration}ms ease-out`
        : `background-position ${CONFIG.transitionDuration}ms ease-out`;
      heroSection.style.transition = newTransition;
    }

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    isInitialized = true;
  }

  /**
   * Cleanup function
   */
  function destroy() {
    if (!isInitialized) return;

    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseleave', handleMouseLeave);

    // Cancel any pending animation
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    // Reset background position
    if (heroSection) {
      heroSection.style.backgroundPosition = '';
    }

    isInitialized = false;
  }

  /**
   * Handle page visibility changes for better performance
   */
  function handleVisibilityChange() {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Handle page visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Cleanup on page unload
  window.addEventListener('beforeunload', destroy);

  // Expose API for potential customization
  window.ParallaxEffect = {
    destroy,
    init,
    updateConfig: function(newConfig) {
      Object.assign(CONFIG, newConfig);
    }
  };

})();
