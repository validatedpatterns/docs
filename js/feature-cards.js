/**
 * Feature Cards Hover Effects
 * Handles the hover functionality for the Features & Benefits section
 */

document.addEventListener('DOMContentLoaded', function() {
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach(card => {
        const featureDetails = card.querySelector('.feature-details');

        if (featureDetails) {
            // Set initial state
            featureDetails.style.maxHeight = '0';
            featureDetails.style.opacity = '0';
            featureDetails.style.transition = 'max-height 0.5s ease-in-out, opacity 0.3s ease-in-out';

            card.addEventListener('mouseenter', function() {
                // Show feature details on hover
                featureDetails.style.maxHeight = featureDetails.scrollHeight + 'px';
                featureDetails.style.opacity = '1';
            });

            card.addEventListener('mouseleave', function() {
                // Hide feature details when not hovering
                featureDetails.style.maxHeight = '0';
                featureDetails.style.opacity = '0';
            });
        }
    });
});