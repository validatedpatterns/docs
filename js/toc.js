document.addEventListener('DOMContentLoaded', function () {
  var mobileNav = document.querySelector('.otp-mobile');
  var desktopNav = document.querySelector('.otp-desktop');

  if (!mobileNav && !desktopNav) return;

  var toggle = mobileNav ? mobileNav.querySelector('.otp-mobile__toggle') : null;
  var currentLabel = mobileNav ? mobileNav.querySelector('.otp-mobile__current') : null;

  // Mobile toggle
  if (toggle) {
    toggle.addEventListener('click', function () {
      var expanded = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', expanded);
    });
  }

  // Close mobile dropdown when a link is clicked
  if (mobileNav) {
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('.otp-link')) {
        mobileNav.classList.remove('is-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Close mobile dropdown on outside click
  document.addEventListener('click', function (e) {
    if (mobileNav && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close mobile dropdown on resize to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024 && mobileNav) {
      mobileNav.classList.remove('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // ScrollSpy active-state mirroring and current-section label
  setupScrollSpy();

  function setupScrollSpy() {
    var headingIds = [];
    var allLinks = document.querySelectorAll('.otp-link');

    allLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        headingIds.push(href.substring(1));
      }
    });

    if (headingIds.length === 0) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0
    });

    headingIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    if (headingIds.length > 0) {
      setActive(headingIds[0]);
    }
  }

  function setActive(id) {
    var allLinks = document.querySelectorAll('.otp-link');
    allLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === '#' + id) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    if (currentLabel) {
      var activeLink = document.querySelector('.otp-mobile .otp-link.active');
      if (activeLink) {
        currentLabel.textContent = activeLink.textContent;
      }
    }
  }
});
