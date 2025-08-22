// Mobile Navigation Handler - Updated for separate main nav and sidebar controls
document.addEventListener('DOMContentLoaded', function() {
    const mainNavToggle = document.getElementById('main-nav-toggle');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const headerTools = document.querySelector('.pf-c-page__header-tools');
    const sidebar = document.querySelector('.pf-c-page__sidebar');
    let sidebarOverlay;

    // Create sidebar overlay for mobile
    function createSidebarOverlay() {
        if (!sidebarOverlay) {
            sidebarOverlay = document.createElement('div');
            sidebarOverlay.className = 'sidebar-overlay';
            document.body.appendChild(sidebarOverlay);
            
            sidebarOverlay.addEventListener('click', function() {
                closeSidebar();
            });
        }
    }

    // Main navigation toggle (chevron in header)
    if (mainNavToggle && headerTools) {
        mainNavToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Close sidebar if it's open
            if (sidebar && sidebar.classList.contains('active')) {
                closeSidebar();
            }
            
            // Toggle main navigation
            headerTools.classList.toggle('active');
            mainNavToggle.classList.toggle('active');
        });

        // Close main nav when clicking outside
        document.addEventListener('click', function(event) {
            if (!headerTools.contains(event.target) && !mainNavToggle.contains(event.target)) {
                headerTools.classList.remove('active');
                mainNavToggle.classList.remove('active');
            }
        });
    }

    // Sidebar navigation toggle (hamburger in content area)
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Close main navigation if it's open
            if (headerTools && headerTools.classList.contains('active')) {
                headerTools.classList.remove('active');
                if (mainNavToggle) mainNavToggle.classList.remove('active');
            }
            
            // Toggle sidebar
            createSidebarOverlay();
            sidebar.classList.toggle('active');
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('active');
            }
            document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
        });
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('active');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function closeMainNav() {
        if (headerTools) headerTools.classList.remove('active');
        if (mainNavToggle) mainNavToggle.classList.remove('active');
    }

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1199) {
            closeSidebar();
            closeMainNav();
        }
    });

    // Close navigation when clicking on main nav links (mobile)
    const mainNavLinks = document.querySelectorAll('.mobile-nav .pf-c-nav__link');
    mainNavLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            closeMainNav();
        });
    });

    // Close sidebar when clicking on sidebar nav links (mobile)
    const sidebarNavLinks = document.querySelectorAll('.pf-c-page__sidebar .pf-c-nav__link');
    sidebarNavLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            closeSidebar();
        });
    });
});