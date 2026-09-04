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

const publicationMonthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

function setLocalizedContent(element, koreanText, englishText) {
  element.dataset.kr = koreanText;
  element.dataset.en = englishText;
  element.textContent =
    document.documentElement.lang === "en" ? englishText : koreanText;
}

function getPublicationUrl(publication) {
  if (typeof publication.url !== "string" || publication.url.trim() === "") {
    return "";
  }

  try {
    const url = new URL(publication.url);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : "";
  } catch (error) {
    return "";
  }
}

function formatPublicationDate(publication) {
  const year = Number(publication.year);
  const month = Number(publication.month);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return "";
  }

  return publicationMonthNames[month - 1] + " " + year;
}

function createPublicationMeta(publication, publicationUrl) {
  const meta = document.createElement("div");
  meta.className = "publication-meta";

  const journal = document.createElement("em");
  journal.className = "publication-journal";
  journal.textContent = publication.journal || "Journal information pending";
  meta.append(journal);

  if (publication.status === "accepted") {
    const status = document.createElement("span");
    status.className = "publication-status";
    status.textContent = "· To be Published";
    meta.append(status);
  } else {
    const bibliographicParts = [];

    if (publication.volume) {
      bibliographicParts.push("vol. " + publication.volume);
    }

    if (publication.issue) {
      bibliographicParts.push("no. " + publication.issue);
    }

    if (publication.pages) {
      bibliographicParts.push("pp. " + publication.pages);
    }

    if (bibliographicParts.length > 0) {
      const bibliographicInfo = document.createElement("span");
      bibliographicInfo.textContent = "· " + bibliographicParts.join(", ");
      meta.append(bibliographicInfo);
    }

    const publicationDate = formatPublicationDate(publication);

    if (publicationDate) {
      const date = document.createElement("span");
      date.textContent = "· " + publicationDate;
      meta.append(date);
    }
  }

  if (publicationUrl) {
    const link = document.createElement("a");
    link.className = "publication-link";
    link.href = publicationUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View Paper ↗";
    meta.append(link);
  }

  return meta;
}

function normalizePublicationAuthorName(authorName) {
  return String(authorName)
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/\s+/g, " ");
}

function isHighlightedPublicationAuthor(authorName, authorIndex) {
  return (
    authorIndex === 0 ||
    normalizePublicationAuthorName(authorName) === "sungho kang"
  );
}

function appendPublicationAuthors(container, authorNames) {
  authorNames.forEach((authorName, authorIndex) => {
    if (authorIndex > 0) {
      container.append(document.createTextNode(", "));
    }

    if (isHighlightedPublicationAuthor(authorName, authorIndex)) {
      const highlightedAuthor = document.createElement("strong");
      highlightedAuthor.textContent = authorName;
      container.append(highlightedAuthor);
      return;
    }

    container.append(document.createTextNode(authorName));
  });
}

function createPublicationItem(publication) {
  const item = document.createElement("li");
  item.className = "publication-item";

  const number = document.createElement("span");
  number.className = "publication-number";
  number.textContent = publication.id + ".";

  const content = document.createElement("article");
  const title = document.createElement("h4");
  title.className = "publication-title";
  const publicationUrl = getPublicationUrl(publication);

  if (publicationUrl) {
    const titleLink = document.createElement("a");
    titleLink.href = publicationUrl;
    titleLink.target = "_blank";
    titleLink.rel = "noopener noreferrer";
    titleLink.textContent = publication.title;
    title.append(titleLink);
  } else {
    title.textContent = publication.title;
  }

  const authors = document.createElement("p");
  authors.className = "publication-authors";
  if (Array.isArray(publication.authors)) {
    appendPublicationAuthors(authors, publication.authors);
  }

  content.append(
    title,
    authors,
    createPublicationMeta(publication, publicationUrl)
  );
  item.append(number, content);

  return item;
}

function createPublicationYear(year, publications, shouldOpen) {
  const panel = document.createElement("details");
  panel.className = "publication-year";
  panel.open = shouldOpen;

  const summary = document.createElement("summary");
  const yearLabel = document.createElement("span");
  yearLabel.className = "publication-year-label";
  yearLabel.textContent = String(year);

  const count = document.createElement("span");
  count.className = "publication-count";
  setLocalizedContent(
    count,
    publications.length + "편",
    publications.length + " papers"
  );

  const chevron = document.createElement("span");
  chevron.className = "publication-chevron";
  chevron.setAttribute("aria-hidden", "true");
  summary.append(yearLabel, count, chevron);

  const list = document.createElement("ol");
  list.className = "publication-list";
  publications.forEach((publication) => {
    list.append(createPublicationItem(publication));
  });

  panel.append(summary, list);
  return panel;
}

function groupPublicationsByYear(publications) {
  return publications.reduce((groups, publication) => {
    const year = Number(publication.year);

    if (!Number.isInteger(year)) {
      return groups;
    }

    if (!groups.has(year)) {
      groups.set(year, []);
    }

    groups.get(year).push(publication);
    return groups;
  }, new Map());
}

function renderPublications(publications) {
  const container = document.getElementById("publication-years");
  const total = document.getElementById("publication-total");

  if (!container || !total) {
    return;
  }

  const internationalJournals = publications
    .filter(
      (publication) =>
        publication && publication.type === "international-journal"
    )
    .sort((first, second) => Number(second.id) - Number(first.id));

  setLocalizedContent(
    total,
    "총 " + internationalJournals.length + "편",
    internationalJournals.length + " papers"
  );

  container.replaceChildren();

  const groupedPublications = groupPublicationsByYear(internationalJournals);
  const years = [...groupedPublications.keys()].sort(
    (first, second) => second - first
  );

  if (years.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "publication-empty";
    setLocalizedContent(
      emptyMessage,
      "표시할 국제 논문이 없습니다.",
      "No international journal papers are available."
    );
    container.append(emptyMessage);
    return;
  }

  const latestYearPublicationCount = groupedPublications.get(years[0]).length;

  years.forEach((year, index) => {
    const shouldOpen =
      index === 0 || (index === 1 && latestYearPublicationCount <= 3);
    container.append(
      createPublicationYear(
        year,
        groupedPublications.get(year),
        shouldOpen
      )
    );
  });
}

async function initializePublications() {
  const container = document.getElementById("publication-years");

  if (!container) {
    return;
  }

  try {
    const response = await fetch(container.dataset.source, { cache: "no-cache" });

    if (!response.ok) {
      throw new Error("Publication data request failed: " + response.status);
    }

    const publications = await response.json();

    if (!Array.isArray(publications)) {
      throw new TypeError("Publication data must be an array.");
    }

    renderPublications(publications);
  } catch (error) {
    const errorMessage = document.createElement("p");
    errorMessage.className = "publication-error";
    setLocalizedContent(
      errorMessage,
      "논문 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      "The publication list could not be loaded. Please try again later."
    );
    container.replaceChildren(errorMessage);
    console.error(error);
  }
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
  initializePublications();
}

document.addEventListener("DOMContentLoaded", initializePage);
