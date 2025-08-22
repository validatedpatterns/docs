/**
 * Simple Accordion JavaScript
 * Handles basic vertical accordion functionality for pattern tiers
 */

document.addEventListener('DOMContentLoaded', function() {
    const accordionHeaders = document.querySelectorAll('.pattern-accordion-header');
    const accordionTabs = document.querySelectorAll('.pattern-accordion-tab');
    
    if (accordionHeaders.length === 0) {
        console.log('No accordion headers found');
        return; // Exit if no accordion exists
    }

    // Function to close all tabs
    function closeAllTabs() {
        accordionTabs.forEach(tab => {
            const header = tab.querySelector('.pattern-accordion-header');
            const chevron = tab.querySelector('.accordion-chevron i');
            
            tab.classList.remove('active');
            header.setAttribute('aria-expanded', 'false');
            
            if (chevron) {
                chevron.className = 'fas fa-chevron-right';
            }
        });
    }

    // Function to open a tab
    function openTab(tab) {
        const header = tab.querySelector('.pattern-accordion-header');
        const chevron = tab.querySelector('.accordion-chevron i');
        
        tab.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
        
        if (chevron) {
            chevron.className = 'fas fa-chevron-down';
        }
        
        // Reinitialize carousels after accordion state change
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 300);
    }

    // Initialize accordion - ensure only first tab is open
    closeAllTabs();
    if (accordionTabs.length > 0) {
        openTab(accordionTabs[0]); // Open first tab (Sandbox)
    }

    // Add click event listeners
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function(e) {
            e.preventDefault();
            
            const tab = this.closest('.pattern-accordion-tab');
            const isActive = tab.classList.contains('active');
            
            // Always close all tabs first
            closeAllTabs();
            
            // Open clicked tab if it wasn't already active
            if (!isActive) {
                openTab(tab);
            }
        });

        // Add keyboard support
        header.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // Arrow key navigation between accordion headers
    document.addEventListener('keydown', function(e) {
        const focusedElement = document.activeElement;
        const isAccordionHeader = focusedElement.classList.contains('pattern-accordion-header');
        
        if (!isAccordionHeader) return;
        
        const currentIndex = Array.from(accordionHeaders).indexOf(focusedElement);
        let nextIndex;
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                nextIndex = (currentIndex + 1) % accordionHeaders.length;
                accordionHeaders[nextIndex].focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                nextIndex = currentIndex === 0 ? accordionHeaders.length - 1 : currentIndex - 1;
                accordionHeaders[nextIndex].focus();
                break;
            case 'Home':
                e.preventDefault();
                accordionHeaders[0].focus();
                break;
            case 'End':
                e.preventDefault();
                accordionHeaders[accordionHeaders.length - 1].focus();
                break;
        }
    });

    console.log('Accordion initialized with', accordionHeaders.length, 'headers');
});
