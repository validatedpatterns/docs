/**
 * Pattern Carousel JavaScript
 * Handles multiple tier-based carousels with navigation and touch gestures
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all pattern carousels
    const carouselData = [
        { tier: 'maintained', prevId: 'maintainedPrev', nextId: 'maintainedNext', carouselId: 'maintainedCarousel' },
        { tier: 'tested', prevId: 'testedPrev', nextId: 'testedNext', carouselId: 'testedCarousel' },
        { tier: 'sandbox', prevId: 'sandboxPrev', nextId: 'sandboxNext', carouselId: 'sandboxCarousel' }
    ];

    carouselData.forEach(data => {
        initializeCarousel(data);
    });

    function initializeCarousel({ tier, prevId, nextId, carouselId }) {
        const carousel = document.getElementById(carouselId);
        const prevBtn = document.getElementById(prevId);
        const nextBtn = document.getElementById(nextId);
        
        if (!carousel || !prevBtn || !nextBtn) {
            return; // Exit if elements don't exist
        }

        const cards = carousel.querySelectorAll('.pattern-card');
        let currentIndex = 0;
        
        // Get current card width including gap
        function getCardWidth() {
            if (cards.length === 0) return 0;
            const cardRect = cards[0].getBoundingClientRect();
            const gap = parseFloat(getComputedStyle(carousel).gap) || 24;
            return cardRect.width + gap;
        }
        
        // Calculate how many cards are visible at once
        function getVisibleCards() {
            const containerWidth = carousel.offsetWidth;
            const cardWidth = getCardWidth();
            if (cardWidth === 0) return 1;
            return Math.max(1, Math.floor(containerWidth / cardWidth));
        }
        
        // Calculate maximum scroll index
        function getMaxIndex() {
            const visibleCards = getVisibleCards();
            return Math.max(0, cards.length - visibleCards);
        }
        
        // Update button states
        function updateButtons() {
            const maxIndex = getMaxIndex();
            prevBtn.disabled = currentIndex <= 0;
            nextBtn.disabled = currentIndex >= maxIndex;
        }
        
        // Scroll to specific index
        function scrollToIndex(index) {
            const maxIndex = getMaxIndex();
            currentIndex = Math.max(0, Math.min(index, maxIndex));
            
            const cardWidth = getCardWidth();
            const scrollAmount = currentIndex * cardWidth;
            carousel.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
            
            updateButtons();
        }
        
        // Previous button click
        prevBtn.addEventListener('click', function() {
            const visibleCards = getVisibleCards();
            scrollToIndex(currentIndex - Math.max(1, visibleCards - 1));
        });
        
        // Next button click
        nextBtn.addEventListener('click', function() {
            const visibleCards = getVisibleCards();
            scrollToIndex(currentIndex + Math.max(1, visibleCards - 1));
        });
        
        // Handle scroll events to sync button states
        let scrollTimeout;
        carousel.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                const scrollLeft = carousel.scrollLeft;
                const cardWidth = getCardWidth();
                if (cardWidth > 0) {
                    currentIndex = Math.round(scrollLeft / cardWidth);
                }
                updateButtons();
            }, 100);
        });
        
        // Touch/swipe support for mobile and desktop
        let startX = 0;
        let scrollLeft = 0;
        let isDragging = false;
        let isMobile = 'ontouchstart' in window;
        
        // Mouse events for desktop
        if (!isMobile) {
            carousel.addEventListener('mousedown', function(e) {
                isDragging = true;
                startX = e.pageX;
                scrollLeft = carousel.scrollLeft;
                carousel.style.cursor = 'grabbing';
                carousel.style.userSelect = 'none';
            });
            
            document.addEventListener('mousemove', function(e) {
                if (!isDragging) return;
                e.preventDefault();
                const x = e.pageX;
                const walk = (x - startX) * 1.5;
                carousel.scrollLeft = scrollLeft - walk;
            });
            
            document.addEventListener('mouseup', function() {
                if (isDragging) {
                    isDragging = false;
                    carousel.style.cursor = 'grab';
                    carousel.style.userSelect = '';
                }
            });
            
            carousel.addEventListener('mouseleave', function() {
                if (isDragging) {
                    isDragging = false;
                    carousel.style.cursor = 'grab';
                    carousel.style.userSelect = '';
                }
            });
        }
        
        // Touch events for mobile
        let touchStartX = 0;
        let touchScrollLeft = 0;
        
        carousel.addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
            touchScrollLeft = carousel.scrollLeft;
        }, { passive: true });
        
        carousel.addEventListener('touchmove', function(e) {
            if (!touchStartX) return;
            const x = e.touches[0].clientX;
            const walk = (touchStartX - x) * 1.2;
            carousel.scrollLeft = touchScrollLeft + walk;
        }, { passive: true });
        
        carousel.addEventListener('touchend', function() {
            touchStartX = 0;
            touchScrollLeft = 0;
        }, { passive: true });
        
        // Prevent click events during scroll
        let isScrolling = false;
        carousel.addEventListener('scroll', function() {
            isScrolling = true;
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                isScrolling = false;
            }, 150);
        });
        
        // Prevent clicks on cards during scroll
        carousel.addEventListener('click', function(e) {
            if (isScrolling) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
        
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                // Recalculate current position after resize
                const cardWidth = getCardWidth();
                if (cardWidth > 0) {
                    const newScrollLeft = currentIndex * cardWidth;
                    carousel.scrollTo({ left: newScrollLeft, behavior: 'auto' });
                }
                updateButtons();
            }, 250);
        });
        
        // Initialize
        updateButtons();
    }

    // Keyboard navigation for all carousels
    document.addEventListener('keydown', function(e) {
        // Find which carousel is in the viewport
        carouselData.forEach(({ carouselId, prevId, nextId }) => {
            const carousel = document.getElementById(carouselId);
            const prevBtn = document.getElementById(prevId);
            const nextBtn = document.getElementById(nextId);
            
            if (!carousel || !prevBtn || !nextBtn) return;
            
            const rect = carousel.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (!isVisible) return;
            
            if (e.key === 'ArrowLeft' && !prevBtn.disabled) {
                e.preventDefault();
                prevBtn.click();
            } else if (e.key === 'ArrowRight' && !nextBtn.disabled) {
                e.preventDefault();
                nextBtn.click();
            }
        });
    });
});