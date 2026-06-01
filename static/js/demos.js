(function () {
  'use strict';

  var embedQuery = '[data-arcade-embed]';
  var embedBase =
    'https://demo.arcade.software/{id}?embed&embed_mobile=tab&embed_desktop=inline&squared=true&show_copy_link=true';

  function markLoaded(iframe) {
    var wrap = iframe.closest(embedQuery);
    if (wrap) wrap.classList.add('arcade-embed--loaded');
  }

  function bindIframe(iframe, onLoad) {
    iframe.addEventListener(
      'load',
      function () {
        markLoaded(iframe);
        if (onLoad) onLoad();
      },
      { once: true }
    );
  }

  function initSidebarScroll() {
    var hero = document.querySelector('[data-demos-hero]');
    var player = document.querySelector('[data-demos-player]');
    var scrollEl = document.querySelector('[data-demos-sidebar-scroll]');
    var desktop = window.matchMedia('(min-width: 993px)');

    if (!hero || !player || !scrollEl) return;

    function syncHeight() {
      if (!desktop.matches) {
        scrollEl.style.maxHeight = '';
        return;
      }
      var embed = player.querySelector('[data-arcade-embed]');
      if (!embed) return;
      scrollEl.style.maxHeight = embed.offsetHeight + 'px';
    }

    syncHeight();

    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(syncHeight);
      var embed = player.querySelector('[data-arcade-embed]');
      if (embed) ro.observe(embed);
    } else {
      window.addEventListener('resize', syncHeight);
    }

    desktop.addEventListener('change', syncHeight);
  }

  var mobileLayout = window.matchMedia('(max-width: 992px)');

  function scrollToPlayer(player, instant) {
    if (!mobileLayout.matches || !player) return;
    player.scrollIntoView({
      behavior: instant ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  function scrollToPlayerAfterLayout(player) {
    if (!mobileLayout.matches || !player) return;
    scrollToPlayer(player, true);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        scrollToPlayer(player, true);
      });
    });
  }

  function initPlayer() {
    var page = document.querySelector('.demos-page');
    var hero = document.querySelector('[data-demos-hero]');
    if (!page || !hero) return;

    var player = page.querySelector('[data-demos-player]');
    var mainEmbed = player && player.querySelector(embedQuery);
    var mainIframe = player && player.querySelector('iframe');
    var mainTitle = hero.querySelector('[data-demos-main-title]');
    var mainDesc = hero.querySelector('[data-demos-main-desc]');
    var mainPattern = hero.querySelector('[data-demos-main-pattern]');
    var selects = page.querySelectorAll('[data-demo-select]');

    if (!mainIframe || !selects.length) return;

    var currentId = mainIframe.src.match(/demo\.arcade\.software\/([^?]+)/);
    currentId = currentId ? currentId[1] : null;

    function setNowPlaying(demoId) {
      selects.forEach(function (el) {
        var match = el.getAttribute('data-demo-id') === demoId;
        el.classList.toggle('demos-select--active', match);
        var badge = el.querySelector('[data-demo-now-playing]');
        if (badge) badge.hidden = !match;
      });
    }

    function playDemo(el) {
      var id = el.getAttribute('data-demo-id');
      if (!id) return;

      var alreadyPlaying = id === currentId && mainIframe.src.indexOf(id) !== -1;
      if (alreadyPlaying) {
        scrollToPlayer(player, false);
        return;
      }

      /* Scroll before iframe reload so the first tap reaches the player on mobile */
      scrollToPlayerAfterLayout(player);

      if (mainEmbed) mainEmbed.classList.remove('arcade-embed--loaded');

      mainIframe.title = el.getAttribute('data-demo-title') || 'Interactive demo';
      mainIframe.src = embedBase.replace('{id}', id);
      bindIframe(mainIframe, function () {
        scrollToPlayer(player, true);
      });
      currentId = id;

      if (mainTitle) mainTitle.textContent = el.getAttribute('data-demo-title') || '';
      if (mainDesc) mainDesc.textContent = el.getAttribute('data-demo-desc') || '';

      if (mainPattern) {
        var link = el.getAttribute('data-demo-pattern-link');
        var label = el.getAttribute('data-demo-pattern-label');
        if (link && label) {
          mainPattern.innerHTML =
            'For more information, see: <a href="' + link + '">' + label + '</a>';
          mainPattern.hidden = false;
        } else {
          mainPattern.hidden = true;
          mainPattern.innerHTML = '';
        }
      }

      setNowPlaying(id);
    }

    selects.forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        playDemo(el);
      });

      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          playDemo(el);
        }
      });
    });

    if (currentId) {
      setNowPlaying(currentId);
    }

    bindIframe(mainIframe);
  }

  function init() {
    initPlayer();
    initSidebarScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
