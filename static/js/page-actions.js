(function () {
  "use strict";

  function initPageActions() {
    document.querySelectorAll(".page-actions").forEach(function (container) {
      var toggle = container.querySelector(".page-actions__toggle");
      var menu = container.querySelector(".page-actions__menu");
      var mainBtn = container.querySelector(".page-actions__button");
      var permalink = container.dataset.permalink || window.location.href;

      if (!toggle || !menu) return;

      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        toggleMenu(!expanded);
      });

      mainBtn &&
        mainBtn.addEventListener("click", function () {
          copyPageContent(mainBtn);
        });

      menu.querySelectorAll("[data-action]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var action = btn.dataset.action;
          if (action === "copy-page") copyPageContent(btn);
          else if (action === "copy-link") copyToClipboard(permalink, btn);
          toggleMenu(false);
        });
      });

      function toggleMenu(show) {
        menu.classList.toggle("is-open", show);
        toggle.setAttribute("aria-expanded", String(show));
      }

      document.addEventListener("click", function (e) {
        if (!container.contains(e.target)) toggleMenu(false);
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") toggleMenu(false);
      });
    });
  }

  function initBreadcrumbTruncation() {
    document.querySelectorAll(".pf-c-breadcrumb").forEach(function (nav) {
      var list = nav.querySelector(".pf-c-breadcrumb__list");
      var expandBtn = nav.querySelector(".pf-c-breadcrumb__expand-btn");
      var manualExpand = false;
      var fullWidth = 0;

      if (!list || !expandBtn) return;

      nav.classList.remove("is-truncated");

      requestAnimationFrame(function () {
        var items = list.querySelectorAll(
          ".pf-c-breadcrumb__item:not(.pf-c-breadcrumb__item--ellipsis)"
        );
        items.forEach(function (item) {
          fullWidth += item.offsetWidth;
        });

        checkOverflow();

        var resizeTimer;
        window.addEventListener("resize", function () {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(checkOverflow, 80);
        });
      });

      function checkOverflow() {
        if (manualExpand) return;
        var wrapper = nav.closest(".page-toolbar__breadcrumbs");
        if (!wrapper) return;
        nav.classList.toggle("is-truncated", fullWidth > wrapper.clientWidth);
      }

      expandBtn.addEventListener("click", function () {
        nav.classList.remove("is-truncated");
        manualExpand = true;
      });
    });
  }

  function copyPageContent(triggerEl) {
    var content = document.querySelector(".pf-c-content");
    if (!content) return;

    var text = content.innerText || content.textContent;
    copyToClipboard(text, triggerEl);
  }

  function copyToClipboard(text, triggerEl) {
    if (!navigator.clipboard) {
      fallbackCopy(text);
      showFeedback(triggerEl);
      return;
    }

    navigator.clipboard.writeText(text).then(function () {
      showFeedback(triggerEl);
    });
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (_) {
      /* noop */
    }
    document.body.removeChild(ta);
  }

  function showFeedback(el) {
    if (!el) return;

    var label = el.querySelector(".page-actions__label") || el;
    var original = label.innerHTML;

    label.innerHTML = "Copied!";
    el.classList.add("is-copied");

    setTimeout(function () {
      label.innerHTML = original;
      el.classList.remove("is-copied");
    }, 1500);
  }

  function init() {
    initPageActions();
    initBreadcrumbTruncation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
