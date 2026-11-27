/**
 * PureWebTools - Core Client-Side Interactions
 * Pure Vanilla JavaScript (Zero Dependencies)
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initToolDirectoryFilter();
    initFaqAccordion();
    initBackToTop();
  });

  /**
   * 1. Mobile Navigation Drawer Toggle
   */
  function initMobileMenu() {
    var toggleBtn = document.querySelector(".nav-toggle");
    var mainNav = document.querySelector(".main-nav");

    if (!toggleBtn || !mainNav) return;

    function closeMenu() {
      mainNav.classList.remove("is-open");
      toggleBtn.setAttribute("aria-expanded", "false");
    }

    toggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
      toggleBtn.setAttribute("aria-expanded", String(!isExpanded));
      mainNav.classList.toggle("is-open", !isExpanded);
    });

    // Close menu when clicking a navigation link
    mainNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        closeMenu();
      }
    });

    // Close menu on outside click or Escape key
    document.addEventListener("click", function (e) {
      if (
        mainNav.classList.contains("is-open") &&
        !mainNav.contains(e.target) &&
        !toggleBtn.contains(e.target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mainNav.classList.contains("is-open")) {
        closeMenu();
        toggleBtn.focus();
      }
    });
  }

  /**
   * 2. Homepage Live Search & Category Pill Filtering
   */
  function initToolDirectoryFilter() {
    var searchInput = document.getElementById("toolSearchInput") || document.querySelector(".search-input");
    var searchForm = document.querySelector(".search-wrapper form") || document.querySelector(".search-bar");
    var clearSearchBtn = document.querySelector(".search-clear-btn");
    var categoryPills = Array.prototype.slice.call(document.querySelectorAll(".category-pill"));
    var toolCards = Array.prototype.slice.call(document.querySelectorAll(".tool-card"));
    var noResultsBox = document.querySelector(".no-results");
    var resetFilterBtn = document.querySelector("[data-reset-filters]");
    var countLabel = document.querySelector(".tools-count");

    if (!toolCards.length) return;

    var activeCategory = "all";
    var searchQuery = "";

    function normalize(str) {
      return (str || "").toString().trim().toLowerCase();
    }

    function applyFilters() {
      var visibleCount = 0;
      var query = normalize(searchQuery);

      toolCards.forEach(function (card) {
        var cardCategory = normalize(card.getAttribute("data-category"));
        var cardKeywords = normalize(card.getAttribute("data-keywords"));
        var titleEl = card.querySelector(".tool-title");
        var descEl = card.querySelector(".tool-desc");
        var catTagEl = card.querySelector(".tool-category");

        var titleText = normalize(titleEl ? titleEl.textContent : "");
        var descText = normalize(descEl ? descEl.textContent : "");
        var catTagText = normalize(catTagEl ? catTagEl.textContent : "");

        var matchesCategory = activeCategory === "all" || cardCategory === activeCategory;
        var matchesQuery =
          !query ||
          titleText.indexOf(query) !== -1 ||
          descText.indexOf(query) !== -1 ||
          cardKeywords.indexOf(query) !== -1 ||
          cardCategory.indexOf(query) !== -1 ||
          catTagText.indexOf(query) !== -1;

        if (matchesCategory && matchesQuery) {
          card.classList.remove("is-hidden");
          visibleCount++;
        } else {
          card.classList.add("is-hidden");
        }
      });

      // Toggle empty state message
      if (noResultsBox) {
        noResultsBox.classList.toggle("visible", visibleCount === 0);
      }

      // Update visible tool counter badge if present
      if (countLabel) {
        countLabel.textContent =
          visibleCount + (visibleCount === 1 ? " Tool Available" : " Tools Available");
      }

      // Toggle search clear button visibility
      if (clearSearchBtn) {
        clearSearchBtn.classList.toggle("visible", query.length > 0);
      }
    }

    function setActiveCategory(category) {
      activeCategory = normalize(category) || "all";

      categoryPills.forEach(function (pill) {
        var pillCategory = normalize(pill.getAttribute("data-category") || "all");
        var isActive = pillCategory === activeCategory;
        pill.classList.toggle("active", isActive);
        pill.setAttribute("aria-pressed", String(isActive));
      });

      applyFilters();
    }

    // Bind live search input
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        searchQuery = searchInput.value;
        applyFilters();
      });
    }

    // Prevent form reload when clicking blue search arrow button or pressing Enter
    if (searchForm) {
      searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (searchInput) {
          searchQuery = searchInput.value;
          applyFilters();
          var toolsSection = document.getElementById("tools-directory") || document.querySelector(".tools-section");
          if (toolsSection && searchQuery.trim().length > 0) {
            toolsSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      });
    }

    // Clear search input button
    if (clearSearchBtn && searchInput) {
      clearSearchBtn.addEventListener("click", function () {
        searchInput.value = "";
        searchQuery = "";
        applyFilters();
        searchInput.focus();
      });
    }

    // Bind category pill clicks
    categoryPills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        var targetCategory = pill.getAttribute("data-category") || "all";
        setActiveCategory(targetCategory);
      });
    });

    // Optional reset button inside empty state
    if (resetFilterBtn) {
      resetFilterBtn.addEventListener("click", function () {
        if (searchInput) searchInput.value = "";
        searchQuery = "";
        setActiveCategory("all");
      });
    }

    // Support deep-linking via URL parameters (e.g., ?category=pdf-utilities&q=compress)
    if (window.URLSearchParams) {
      var params = new URLSearchParams(window.location.search);
      var initialCat = params.get("category");
      var initialQuery = params.get("q");

      if (initialQuery && searchInput) {
        searchInput.value = initialQuery;
        searchQuery = initialQuery;
      }
      if (initialCat) {
        setActiveCategory(initialCat);
      } else {
        applyFilters();
      }
    } else {
      applyFilters();
    }
  }

  /**
   * 3. FAQ Accordion Toggle Functionality
   */
  function initFaqAccordion() {
    var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));
    if (!faqItems.length) return;

    faqItems.forEach(function (item) {
      var trigger = item.querySelector(".faq-question");
      var answer = item.querySelector(".faq-answer");
      if (!trigger || !answer) return;

      // Ensure initial ARIA state matches markup
      var isInitiallyOpen = item.classList.contains("is-open");
      trigger.setAttribute("aria-expanded", String(isInitiallyOpen));
      if (isInitiallyOpen) {
        answer.style.maxHeight = answer.scrollHeight + "px";
      }

      trigger.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");

        if (isOpen) {
          item.classList.remove("is-open");
          trigger.setAttribute("aria-expanded", "false");
          answer.style.maxHeight = null;
        } else {
          item.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    });

    // Recalculate open FAQ height on viewport resize
    window.addEventListener("resize", function () {
      faqItems.forEach(function (item) {
        if (item.classList.contains("is-open")) {
          var answer = item.querySelector(".faq-answer");
          if (answer) {
            answer.style.maxHeight = answer.scrollHeight + "px";
          }
        }
      });
    });
  }

  /**
   * 4. Smooth "Back to Top" Button
   */
  function initBackToTop() {
    var backToTopButtons = Array.prototype.slice.call(
      document.querySelectorAll(".back-to-top, #backToTop")
    );

    if (!backToTopButtons.length) return;

    backToTopButtons.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
    });
  }
})();