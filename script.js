/*
 * Tia-Jane Fowler
 * 03/22/26
 * Adds functionality to my professional personal website, including sticky navigation,
 * active nav link highlighting, paper preview behavior, and footer year insertion.
 */

"use strict";
(function() {
  const THEME_KEY = "theme-preference";
  const DARK_QUERY = "(prefers-color-scheme: dark)";

  window.addEventListener("load", init);
  window.addEventListener("scroll", handleScroll);

  function init() {
    setUpThemePreference();
    setUpPaperPanel();
    setCurrentYear();
    addExternalLinkIcons();
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  function setUpThemePreference() {
    let toggle = id("theme-toggle");
    let mediaQuery = window.matchMedia(DARK_QUERY);
    let storedPreference = localStorage.getItem(THEME_KEY);

    applyThemePreference(storedPreference || "system");

    if (toggle) {
      toggle.addEventListener("click", function() {
        let currentTheme = document.documentElement.getAttribute("data-theme") || "light";
        let nextPreference = currentTheme === "dark" ? "light" : "dark";
        localStorage.setItem(THEME_KEY, nextPreference);
        applyThemePreference(nextPreference);
      });
    }

    mediaQuery.addEventListener("change", function() {
      if (!localStorage.getItem(THEME_KEY)) {
        applyThemePreference("system");
      }
    });
  }

  function applyThemePreference(preference) {
    let resolvedTheme = preference === "system"
      ? (window.matchMedia(DARK_QUERY).matches ? "dark" : "light")
      : preference;
    let toggle = id("theme-toggle");

    document.documentElement.setAttribute("data-theme", resolvedTheme);
    document.documentElement.setAttribute("data-theme-preference", preference);

    if (toggle) {
      toggle.setAttribute("aria-pressed", String(resolvedTheme === "dark"));
      toggle.setAttribute(
        "aria-label",
        resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }

    updateThemeLogos(resolvedTheme);
  }

  function updateThemeLogos(theme) {
    let cseLogo = id("cse-logo");
    let amazonLogo = id("amazon-logo");

    if (!cseLogo || !amazonLogo) {
      return;
    }

    if (theme === "dark") {
      cseLogo.src = "images/cse-dark.png";
      amazonLogo.src = "images/amazon-dark.png";
    } else {
      cseLogo.src = "images/cse-light.jpg";
      amazonLogo.src = "images/amazon-light.webp";
    }
  }

  function addExternalLinkIcons() {
    let externalLinks = qsa('a[target="_blank"]');

    for (let i = 0; i < externalLinks.length; i++) {
      if (externalLinks[i].querySelector(".external-link-icon")) {
        continue;
      }

      let icon = gen("span");
      icon.classList.add("external-link-icon");
      icon.setAttribute("data-lucide", "external-link");
      icon.setAttribute("aria-hidden", "true");
      externalLinks[i].appendChild(icon);
    }
  }

  function setUpPaperPanel() {
    let openButton = id("paper-title-link");
    let closeButton = id("close-paper-panel");
    let panel = id("paper-side-panel");
    let backdrop = id("modal-backdrop");
    let notch = qs(".paper-panel-notch");
    let animationDurationMs = 400;
    let dragStartY = 0;
    let isDragging = false;
    let dragThreshold = 100;
    let dragInitiateZone = 50; // pixels from top of panel to initiate drag

    if (!openButton || !closeButton || !panel || !backdrop) {
      return;
    }

    openButton.addEventListener("click", function(evt) {
      evt.preventDefault();
      backdrop.classList.remove("hidden");
      panel.classList.remove("hidden");
      requestAnimationFrame(function() {
        panel.classList.add("is-open");
        backdrop.classList.add("is-open");
      });
      document.body.style.overflow = "hidden";
      openButton.setAttribute("aria-expanded", "true");
    });

    closeButton.addEventListener("click", function() {
      closeModal();
    });

    backdrop.addEventListener("click", function() {
      closeModal();
    });

    // Prevent panel clicks from closing the modal (except minimize icon)
    panel.addEventListener("click", function(evt) {
      // Check if minimize icon or its parent was clicked
      if (evt.target.closest(".paper-panel-minimize-icon") || evt.target.closest(".paper-panel-minimize-area")) {
        // Stop any active drag and clear inline drag styles that can block class-based transitions.
        isDragging = false;
        panel.style.transform = "";
        panel.style.transition = "";
        backdrop.style.opacity = "";
        backdrop.style.transition = "";

        // Defer close to next frame so the browser commits style reset first.
        requestAnimationFrame(function() {
          closeModal();
        });
        return;
      }
      evt.stopPropagation();
    });

    // Drag to close on mobile
    if (panel) {
      panel.addEventListener("touchstart", function(evt) {
        // Only allow drag if starting from top portion of panel
        let touch = evt.touches[0];
        let panelRect = panel.getBoundingClientRect();
        let touchY = touch.clientY - panelRect.top;

        if (touchY < dragInitiateZone) {
          isDragging = true;
          dragStartY = touch.clientY;
          panel.style.transition = "none";
        }
      });

      document.addEventListener("touchmove", function(evt) {
        if (!isDragging || !panel.classList.contains("is-open")) return;

        let currentY = evt.touches[0].clientY;
        let dragDistance = currentY - dragStartY;

        if (dragDistance > 0) {
          let progress = dragDistance / window.innerHeight;
          panel.style.transform = "translateY(" + dragDistance + "px)";
          backdrop.style.opacity = Math.max(0, 1 - progress);
        }
      });

      document.addEventListener("touchend", function(evt) {
        if (!isDragging) return;
        isDragging = false;

        let endY = evt.changedTouches[0].clientY;
        let dragDistance = endY - dragStartY;

        panel.style.transition = "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease";
        backdrop.style.transition = "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)";

        if (dragDistance > dragThreshold) {
          closeModal();
        } else {
          panel.style.transform = "translateY(0)";
          backdrop.style.opacity = "1";
        }
      });
    }

    function closeModal() {
      panel.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      // Wait for animation to complete before hiding
      setTimeout(function() {
        panel.classList.add("hidden");
        backdrop.classList.add("hidden");
        panel.style.transition = "";
        panel.style.transform = "";
        backdrop.style.transition = "";
        backdrop.style.opacity = "";
      }, animationDurationMs);
      document.body.style.overflow = "auto";
      openButton.setAttribute("aria-expanded", "false");
    }
  }

  function handleScroll() {
    return;
  }

  function setCurrentYear() {
    id("current-year").textContent = new Date().getFullYear();
  }

  function id(id) {
    return document.getElementById(id);
  }

  function qs(selector) {
    return document.querySelector(selector);
  }

  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  function gen(tagName) {
    return document.createElement(tagName);
  }
})();