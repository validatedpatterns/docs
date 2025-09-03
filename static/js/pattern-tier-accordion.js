/**
 * Pattern Tier Accordion JavaScript
 * Handles PatternFly accordion functionality for pattern tiers
 */

document.addEventListener('DOMContentLoaded', function() {
    const accordion = document.getElementById('pattern-tiers-accordion');
    
    if (!accordion) {
        return; // Exit if no accordion exists
    }
    
    const accordionItems = accordion.querySelectorAll('.pf-c-accordion__item');
    const toggleButtons = accordion.querySelectorAll('.pf-c-accordion__toggle');
    
    // Function to close all accordion items
    function closeAllItems() {
        accordionItems.forEach(item => {
            const toggle = item.querySelector('.pf-c-accordion__toggle');
            const content = item.querySelector('.pf-c-accordion__expanded-content');
            const icon = item.querySelector('.pf-c-accordion__toggle-icon i');
            
            toggle.setAttribute('aria-expanded', 'false');
            content.classList.add('pf-m-hidden');
            content.style.display = 'none';
            
            if (icon) {
                icon.style.transform = 'rotate(0deg)';
            }
        });
    }
    
    // Function to open an accordion item
    function openItem(item) {
        const toggle = item.querySelector('.pf-c-accordion__toggle');
        const content = item.querySelector('.pf-c-accordion__expanded-content');
        const icon = item.querySelector('.pf-c-accordion__toggle-icon i');
        
        toggle.setAttribute('aria-expanded', 'true');
        content.classList.remove('pf-m-hidden');
        content.style.display = 'block';
        
        if (icon) {
            icon.style.transform = 'rotate(90deg)';
        }
        
        // Reinitialize carousels after accordion state change
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 300);
    }
    
    // Initialize accordion - ensure only first item (Sandbox) is open
    closeAllItems();
    if (accordionItems.length > 0) {
        openItem(accordionItems[0]); // Open first item (Sandbox)
    }
    
    // Add click event listeners to toggle buttons
    toggleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const item = this.closest('.pf-c-accordion__item');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Always close all items first
            closeAllItems();
            
            // Open clicked item if it wasn't already expanded
            if (!isExpanded) {
                openItem(item);
            }
        });
        
        // Add keyboard support
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Arrow key navigation between accordion toggles
    document.addEventListener('keydown', function(e) {
        const focusedElement = document.activeElement;
        const isAccordionToggle = focusedElement.classList.contains('pf-c-accordion__toggle');
        
        if (!isAccordionToggle) return;
        
        const currentIndex = Array.from(toggleButtons).indexOf(focusedElement);
        let nextIndex;
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                nextIndex = (currentIndex + 1) % toggleButtons.length;
                toggleButtons[nextIndex].focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                nextIndex = currentIndex === 0 ? toggleButtons.length - 1 : currentIndex - 1;
                toggleButtons[nextIndex].focus();
                break;
            case 'Home':
                e.preventDefault();
                toggleButtons[0].focus();
                break;
            case 'End':
                e.preventDefault();
                toggleButtons[toggleButtons.length - 1].focus();
                break;
        }
    });
    
    console.log('Pattern tier accordion initialized with', toggleButtons.length, 'toggles');
});
