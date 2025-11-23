// ========================================
// ADVERTISEMENT-STYLE LOGIN ANIMATIONS
// Auto-runs when page loads
// ========================================

// Feature Carousel Auto-Rotation
function initFeatureCarousel() {
    const features = document.querySelectorAll('.feature-item');
    if (features.length === 0) return;

    let currentIndex = 0;

    setInterval(() => {
        // Remove active class from current
        features[currentIndex].classList.remove('active');

        // Move to next feature
        currentIndex = (currentIndex + 1) % features.length;

        // Add active class to new feature
        features[currentIndex].classList.add('active');
    }, 3000); // Change every 3 seconds
}

// Stats Counter Animation
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');

    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                stat.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                stat.textContent = target;
            }
        };

        updateCounter();
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Start feature carousel
    initFeatureCarousel();

    // Animate stats after 500ms delay
    setTimeout(animateStats, 500);
});
