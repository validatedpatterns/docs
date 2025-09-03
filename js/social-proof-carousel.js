document.addEventListener('DOMContentLoaded', function() {
    const track = document.getElementById('carousel-track');
    const wrapper = document.getElementById('carousel-wrapper');
    
    // Check if elements exist (for pages that don't have the social proof section)
    if (!track || !wrapper) {
        return;
    }
    
    // Get existing partner cards from HTML
    const originalCards = track.querySelectorAll('.partner-card');
    const cardCount = originalCards.length;
    if (cardCount === 0) return;

    // Create a triple-set of cards for a seamless loop by cloning existing cards
    const allCards = [...originalCards, ...originalCards, ...originalCards];
    
    // Clear the track and add the triple set
    track.innerHTML = '';
    allCards.forEach((card, index) => {
        const clonedCard = card.cloneNode(true);
        // Remove the partner-card class from clones to avoid selection issues
        clonedCard.classList.remove('partner-card');
        track.appendChild(clonedCard);
    });

    let currentIndex = cardCount; // Start at the first "real" card
    let autoRotateInterval = null;
    
    // Function to get current card dimensions based on screen size
    function getCardDimensions() {
        const screenWidth = window.innerWidth;
        if (screenWidth <= 480) {
            return { width: 240, margin: 20 };
        } else if (screenWidth <= 768) {
            return { width: 280, margin: 30 };
        } else {
            return { width: 320, margin: 40 };
        }
    }
    
    function getTotalCardWidth() {
        const dims = getCardDimensions();
        return dims.width + dims.margin;
    }
    
    // Touch/drag variables
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let dragDistance = 0;
    let dragThreshold = 50; // Minimum distance to trigger card change

    function updateCarousel(animate = true) {
        track.style.transition = animate ? 'transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none';
        
        // Get current card width based on screen size
        const totalCardWidth = getTotalCardWidth();
        
        // This is the correct, simplified calculation.
        // It calculates the position of the left edge of the current card,
        // then subtracts half the wrapper width and adds half a card width to center it.
        const offset = -currentIndex * totalCardWidth + (wrapper.offsetWidth / 2) - (totalCardWidth / 2);
        track.style.transform = `translateX(${offset}px)`;

        const allCards = track.querySelectorAll('.pf-c-card');
        allCards.forEach((card, index) => {
            card.classList.toggle('is-center', index === currentIndex);
        });
    }

    function cycle() {
        currentIndex++;
        updateCarousel();

        if (currentIndex >= cardCount * 2) {
            setTimeout(() => {
                currentIndex = cardCount;
                updateCarousel(false);
            }, 800);
        }
    }

    function startAutoRotate() {
        if (autoRotateInterval) clearInterval(autoRotateInterval);
        autoRotateInterval = setInterval(cycle, 3000);
    }

    function stopAutoRotate() {
        clearInterval(autoRotateInterval);
        autoRotateInterval = null;
    }

    // Navigation functions
    function goToNext() {
        currentIndex++;
        updateCarousel();
        if (currentIndex >= cardCount * 2) {
            setTimeout(() => {
                currentIndex = cardCount;
                updateCarousel(false);
            }, 800);
        }
    }

    function goToPrevious() {
        currentIndex--;
        updateCarousel();
        if (currentIndex < cardCount) {
            setTimeout(() => {
                currentIndex = cardCount * 2 - 1;
                updateCarousel(false);
            }, 800);
        }
    }

    // Touch event handlers
    function handleTouchStart(e) {
        isDragging = true;
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        currentX = startX;
        dragDistance = 0;
        stopAutoRotate();
        
        // Prevent default to avoid scrolling
        if (e.touches) {
            e.preventDefault();
        }
    }

    function handleTouchMove(e) {
        if (!isDragging) return;
        
        const touchX = e.touches ? e.touches[0].clientX : e.clientX;
        const touchY = e.touches ? e.touches[0].clientY : e.clientY;
        
        // Check if this is more of a vertical scroll than horizontal drag
        const deltaX = Math.abs(touchX - startX);
        const deltaY = Math.abs(touchY - startY);
        
        if (deltaY > deltaX && deltaY > 10) {
            // This is a vertical scroll, cancel drag
            isDragging = false;
            return;
        }
        
        currentX = touchX;
        dragDistance = currentX - startX;
        
        // Provide visual feedback during drag
        const totalCardWidth = getTotalCardWidth();
        const currentOffset = -currentIndex * totalCardWidth + (wrapper.offsetWidth / 2) - (totalCardWidth / 2);
        const dragOffset = currentOffset + dragDistance;
        track.style.transition = 'none';
        track.style.transform = `translateX(${dragOffset}px)`;
        
        // Prevent default to avoid scrolling
        if (e.touches && deltaX > 10) {
            e.preventDefault();
        }
    }

    function handleTouchEnd(e) {
        if (!isDragging) return;
        
        isDragging = false;
        
        // Determine if drag distance meets threshold
        if (Math.abs(dragDistance) > dragThreshold) {
            if (dragDistance > 0) {
                // Dragged right, go to previous
                goToPrevious();
            } else {
                // Dragged left, go to next
                goToNext();
            }
        } else {
            // Snap back to current position
            updateCarousel();
        }
        
        // Restart auto-rotation after a delay
        setTimeout(() => {
            if (!isDragging) {
                startAutoRotate();
            }
        }, 2000);
    }

    // Add event listeners
    wrapper.addEventListener('mouseenter', stopAutoRotate);
    wrapper.addEventListener('mouseleave', startAutoRotate);
    window.addEventListener('resize', () => updateCarousel(false));

    // Touch event listeners
    wrapper.addEventListener('touchstart', handleTouchStart, { passive: false });
    wrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
    wrapper.addEventListener('touchend', handleTouchEnd);
    
    // Mouse drag event listeners (for desktop)
    wrapper.addEventListener('mousedown', handleTouchStart);
    wrapper.addEventListener('mousemove', handleTouchMove);
    wrapper.addEventListener('mouseup', handleTouchEnd);
    wrapper.addEventListener('mouseleave', handleTouchEnd);

    // Initial setup
    updateCarousel(false);
    startAutoRotate();
});