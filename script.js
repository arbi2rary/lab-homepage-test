const navigationToggle = document.querySelector(".nav-toggle");
const siteNavigation = document.getElementById("site-menu");
const menu = document.getElementById("menu");
const submenuToggles = [...document.querySelectorAll(".submenu-toggle")];
const languageOptions = [...document.querySelectorAll(".language-option")];

function setMobileMenuState(isOpen) {
  siteNavigation.classList.toggle("open", isOpen);
  navigationToggle.setAttribute("aria-expanded", String(isOpen));

  if (!isOpen) {
    closeAllSubmenus();
  }
}

function closeAllSubmenus(exceptItem = null) {
  document.querySelectorAll(".menu-item.open").forEach((item) => {
    if (item === exceptItem) {
      return;
    }

    item.classList.remove("open");
    const button = item.querySelector(":scope > .submenu-toggle");
    if (button) {
      button.setAttribute("aria-expanded", "false");
    }
  });
}

function toggleSubmenu(button) {
  const menuItem = button.closest(".menu-item");
  const willOpen = !menuItem.classList.contains("open");

  closeAllSubmenus(menuItem);
  menuItem.classList.toggle("open", willOpen);
  button.setAttribute("aria-expanded", String(willOpen));
}

function initializeNavigation() {
  navigationToggle.addEventListener("click", () => {
    const willOpen = !siteNavigation.classList.contains("open");
    setMobileMenuState(willOpen);
  });

  submenuToggles.forEach((button) => {
    button.addEventListener("click", () => {
      toggleSubmenu(button);
    });
  });

  menu.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) {
      return;
    }

    if (link.classList.contains("is-placeholder")) {
      event.preventDefault();
      return;
    }

    if (window.matchMedia("(max-width: 1060px)").matches) {
      setMobileMenuState(false);
    } else {
      closeAllSubmenus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav")) {
      closeAllSubmenus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    closeAllSubmenus();
    setMobileMenuState(false);
    navigationToggle.focus();
  });

  window.addEventListener("resize", () => {
    if (!window.matchMedia("(max-width: 1060px)").matches) {
      siteNavigation.classList.remove("open");
      navigationToggle.setAttribute("aria-expanded", "false");
    }
  });
}

function setLanguage(language) {
  const selectedLanguage = language === "en" ? "en" : "kr";

  document.documentElement.lang = selectedLanguage === "kr" ? "ko" : "en";

  document.querySelectorAll("[data-kr][data-en]").forEach((element) => {
    element.textContent = element.dataset[selectedLanguage];
  });

  document.querySelectorAll("[data-aria-kr][data-aria-en]").forEach((element) => {
    element.setAttribute("aria-label", element.dataset["aria" + selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)]);
  });

  languageOptions.forEach((button) => {
    const isActive = button.dataset.lang === selectedLanguage;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  localStorage.setItem("soclab-language", selectedLanguage);
}

function initializeLanguageSwitcher() {
  const savedLanguage = localStorage.getItem("soclab-language");
  setLanguage(savedLanguage === "en" ? "en" : "kr");

  languageOptions.forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.lang);
    });
  });
}

function initializeSectionHighlighting() {
  const sectionLinks = [...menu.querySelectorAll('a[href^="#"]:not([href="#"])')];
  const sections = [...document.querySelectorAll("section[id]")];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        sectionLinks.forEach((link) => {
          link.removeAttribute("aria-current");
        });

        submenuToggles.forEach((button) => {
          button.removeAttribute("aria-current");
        });

        const activeLink = sectionLinks.find(
          (link) => link.getAttribute("href") === "#" + entry.target.id
        );

        if (!activeLink) {
          return;
        }

        activeLink.setAttribute("aria-current", "page");
        const parentToggle = activeLink
          .closest(".menu-item")
          ?.querySelector(":scope > .submenu-toggle");

        if (parentToggle) {
          parentToggle.setAttribute("aria-current", "true");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach((section) => {
    observer.observe(section);
  });
}

function initializeFloorplanInteraction() {
  document.querySelectorAll(".die .blkg").forEach((block) => {
    const card = document.getElementById(block.dataset.area);

    block.addEventListener("mouseenter", () => {
      if (card) {
        card.classList.add("on");
      }
    });

    block.addEventListener("mouseleave", () => {
      if (card) {
        card.classList.remove("on");
      }
    });

    block.addEventListener("click", () => {
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });
}

function activateMemberPanel(panelId) {
  const selectedTab = document.querySelector(
    '.tab[aria-controls="' + panelId + '"]'
  );
  const selectedPanel = document.getElementById(panelId);

  if (!selectedTab || !selectedPanel) {
    return;
  }

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.setAttribute("aria-selected", "false");
  });

  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.remove("on");
  });

  selectedTab.setAttribute("aria-selected", "true");
  selectedPanel.classList.add("on");
}

function initializeMemberTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      activateMemberPanel(tab.getAttribute("aria-controls"));
    });
  });
}

function initializeExpandableNavigation() {
  document.querySelectorAll('a[href="#alumni"]').forEach((link) => {
    link.addEventListener("click", () => {
      const alumniPanel = document.getElementById("alumni");
      if (alumniPanel) {
        alumniPanel.open = true;
      }
    });
  });
}

function initializeNewsFilters() {
  document.querySelectorAll(".filters button").forEach((filterButton) => {
    filterButton.addEventListener("click", () => {
      document.querySelectorAll(".filters button").forEach((button) => {
        button.setAttribute("aria-pressed", "false");
      });

      filterButton.setAttribute("aria-pressed", "true");
      const selectedCategory = filterButton.dataset.filter;

      document.querySelectorAll(".news li").forEach((item) => {
        item.hidden =
          selectedCategory !== "all" &&
          item.dataset.cat !== selectedCategory;
      });
    });
  });
}

function initializePage() {
  initializeNavigation();
  initializeLanguageSwitcher();
  initializeSectionHighlighting();
  initializeFloorplanInteraction();
  initializeMemberTabs();
  initializeExpandableNavigation();
  initializeNewsFilters();
}

document.addEventListener("DOMContentLoaded", initializePage);
