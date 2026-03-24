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

    if (!openButton || !closeButton || !panel || !backdrop) {
      return;
    }

    openButton.addEventListener("click", function(evt) {
      evt.preventDefault();
      backdrop.classList.remove("hidden");
      panel.classList.remove("hidden");
      // Trigger animation with inline style
      requestAnimationFrame(function() {
        panel.style.transform = "translateX(0)";
        backdrop.style.opacity = "1";
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

    // Prevent panel clicks from closing the modal
    panel.addEventListener("click", function(evt) {
      evt.stopPropagation();
    });

    function closeModal() {
      panel.style.transform = "translateX(100%)";
      backdrop.style.opacity = "0";
      // Wait for animation to complete before hiding
      setTimeout(function() {
        panel.classList.add("hidden");
        backdrop.classList.add("hidden");
      }, 400);
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