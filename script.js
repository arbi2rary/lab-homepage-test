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

function initializeImageSlots() {
  document.querySelectorAll("[data-image-slot]").forEach((slot) => {
    const image = slot.querySelector("img");

    if (!image) {
      return;
    }

    const showImage = () => {
      slot.classList.remove("is-missing");
    };

    const showPlaceholder = () => {
      slot.classList.add("is-missing");
    };

    image.addEventListener("load", showImage);
    image.addEventListener("error", showPlaceholder);

    if (image.complete) {
      if (image.naturalWidth > 0) {
        showImage();
      } else {
        showPlaceholder();
      }
    }
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

function isPlaceholderEntry(element) {
  return (
    element.classList.contains("person-empty") ||
    element.hasAttribute("data-placeholder") ||
    element.textContent.includes("[[")
  );
}

function countRealEntries(selector) {
  return [...document.querySelectorAll(selector)].filter(
    (entry) => !isPlaceholderEntry(entry)
  ).length;
}

function getAlumniDegree(entry) {
  if (entry.dataset.alumniDegree) {
    return entry.dataset.alumniDegree;
  }

  const description = entry.querySelector("span")?.textContent || "";

  if (description.includes("박사")) {
    return "phd";
  }

  if (description.includes("석사")) {
    return "ms";
  }

  return "";
}

function setLabStatistic(name, value) {
  const statistic = document.querySelector('[data-lab-stat="' + name + '"]');

  if (statistic) {
    statistic.textContent = String(value);
  }
}

function updateLabStatistics() {
  const statisticsText = document.querySelector("[data-lab-stats]");

  if (!statisticsText) {
    return;
  }

  const foundedYear = Number(statisticsText.dataset.foundedYear);
  const currentYear = new Date().getFullYear();

  if (Number.isFinite(foundedYear) && foundedYear <= currentYear) {
    setLabStatistic("years", currentYear - foundedYear);
  }

  const membersSection = document.getElementById("members");

  if (!membersSection) {
    return;
  }

  const countableEntries = [
    ...membersSection.querySelectorAll(
      "#doctoral .person, #masters .person, #alumni .alumni li"
    )
  ];
  const hasUnresolvedPlaceholders = countableEntries.some(isPlaceholderEntry);

  if (hasUnresolvedPlaceholders) {
    statisticsText.dataset.countStatus = "fallback";
    return;
  }

  const alumniEntries = [
    ...membersSection.querySelectorAll("#alumni .alumni li")
  ];
  const doctoralAlumni = alumniEntries.filter(
    (entry) => getAlumniDegree(entry) === "phd"
  ).length;
  const mastersAlumni = alumniEntries.filter(
    (entry) => getAlumniDegree(entry) === "ms"
  ).length;

  setLabStatistic("phd-alumni", doctoralAlumni);
  setLabStatistic("ms-alumni", mastersAlumni);
  setLabStatistic(
    "doctoral-members",
    countRealEntries("#doctoral .person")
  );
  setLabStatistic(
    "masters-members",
    countRealEntries("#masters .person")
  );

  statisticsText.dataset.countStatus = "live";
}

function initializeLabStatistics() {
  updateLabStatistics();

  const membersSection = document.getElementById("members");

  if (!membersSection) {
    return;
  }

  const statisticsObserver = new MutationObserver(updateLabStatistics);
  statisticsObserver.observe(membersSection, {
    childList: true,
    subtree: true
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
  initializeImageSlots();
  initializeMemberTabs();
  initializeExpandableNavigation();
  initializeLabStatistics();
  initializeNewsFilters();
}

document.addEventListener("DOMContentLoaded", initializePage);
