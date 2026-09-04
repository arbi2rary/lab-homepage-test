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
  if (!navigationToggle || !siteNavigation || !menu) {
    return;
  }

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

  document.querySelectorAll("[data-alt-kr][data-alt-en]").forEach((element) => {
    element.setAttribute("alt", element.dataset["alt" + selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)]);
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
  if (!menu) {
    return;
  }

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

function getMemberDisplayNames(member) {
  const englishName = String(member.name_en || "").trim();
  const koreanName = String(member.name_kr || "").trim();

  return {
    kr: koreanName ? koreanName + " (" + englishName + ")" : englishName,
    en: englishName || koreanName,
  };
}

function getMemberInitials(member) {
  const sourceName = String(member.name_en || member.name_kr || "?").trim();
  const words = sourceName.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function getMemberCategoryLabels(category) {
  const labels = {
    "박사후연구원": { kr: "박사후연구원", en: "Postdoctoral Researcher" },
    "박사/통합과정": { kr: "박사/통합과정", en: "Ph.D. / Integrated Program" },
    "석사과정": { kr: "석사과정", en: "M.S. Program" },
    "인턴": { kr: "학부인턴", en: "Undergraduate Intern" },
    "박사": { kr: "박사", en: "Ph.D." },
    "석사": { kr: "석사", en: "M.S." },
  };

  return labels[category] || { kr: category, en: category };
}

function createMemberPhoto(member, className) {
  const names = getMemberDisplayNames(member);
  const frame = document.createElement("figure");
  frame.className = className + " member-photo-frame";

  const placeholder = document.createElement("span");
  placeholder.className = "member-photo-placeholder";
  placeholder.textContent = getMemberInitials(member);
  placeholder.setAttribute("aria-hidden", "true");
  frame.append(placeholder);

  const photoPath = String(member.photo_new || "").trim();
  if (!photoPath) {
    frame.classList.add("is-missing");
    return frame;
  }

  const image = document.createElement("img");
  image.src = photoPath;
  image.loading = "lazy";
  image.decoding = "async";
  image.dataset.altKr = names.kr + " 사진";
  image.dataset.altEn = "Photo of " + names.en;
  image.alt = localStorage.getItem("soclab-language") === "en"
    ? image.dataset.altEn
    : image.dataset.altKr;

  const showImage = () => frame.classList.remove("is-missing");
  const showPlaceholder = () => frame.classList.add("is-missing");
  image.addEventListener("load", showImage);
  image.addEventListener("error", showPlaceholder);
  frame.prepend(image);
  return frame;
}

function createProfileField(
  labelKr,
  labelEn,
  value,
  linkPrefix = "",
  localizedValueEn = ""
) {
  const normalizedValue = String(value || "").trim();
  if (!normalizedValue) {
    return null;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "member-profile-field";
  const term = document.createElement("dt");
  setLocalizedContent(term, labelKr, labelEn);
  const description = document.createElement("dd");

  if (linkPrefix) {
    const link = document.createElement("a");
    link.href = linkPrefix + normalizedValue;
    link.textContent = normalizedValue;
    description.append(link);
  } else if (localizedValueEn) {
    setLocalizedContent(description, normalizedValue, localizedValueEn);
  } else {
    description.textContent = normalizedValue;
  }

  wrapper.append(term, description);
  return wrapper;
}

function createCurrentMemberDetail(member, detailId) {
  const names = getMemberDisplayNames(member);
  const category = getMemberCategoryLabels(member.category);
  const detail = document.createElement("section");
  detail.className = "member-detail-panel";
  detail.id = detailId;
  detail.hidden = true;

  const photo = createMemberPhoto(member, "member-detail-photo");
  const content = document.createElement("div");
  content.className = "member-detail-content";
  const name = document.createElement("h4");
  setLocalizedContent(name, names.kr, names.en);
  const fields = document.createElement("dl");
  fields.className = "member-profile-fields";

  [
    createProfileField("과정", "Program", category.kr, "", category.en),
    createProfileField("연구분야", "Research Area", member.research_interests),
    createProfileField("메일", "Email", member.email, "mailto:"),
    createProfileField("취미", "Hobby", member.hobby),
  ].filter(Boolean).forEach((field) => fields.append(field));

  content.append(name, fields);
  detail.append(photo, content);
  return detail;
}

function closeCurrentMemberDetails(exceptButton = null) {
  document.querySelectorAll(".member-photo-button[aria-expanded=\"true\"]").forEach((button) => {
    if (button === exceptButton) {
      return;
    }

    button.setAttribute("aria-expanded", "false");
    const detail = document.getElementById(button.getAttribute("aria-controls"));
    if (detail) {
      detail.hidden = true;
    }
  });
}

function createCurrentMemberElements(member, index) {
  const names = getMemberDisplayNames(member);
  const detailId = "member-detail-" + String(member.post_id || index);
  const card = document.createElement("article");
  card.className = "person member-card";
  const photoButton = document.createElement("button");
  photoButton.className = "member-photo-button";
  photoButton.type = "button";
  photoButton.setAttribute("aria-expanded", "false");
  photoButton.setAttribute("aria-controls", detailId);
  photoButton.dataset.ariaKr = names.kr + " 상세정보 보기";
  photoButton.dataset.ariaEn = "View profile for " + names.en;
  photoButton.setAttribute(
    "aria-label",
    localStorage.getItem("soclab-language") === "en"
      ? photoButton.dataset.ariaEn
      : photoButton.dataset.ariaKr
  );
  photoButton.append(createMemberPhoto(member, "member-card-photo"));

  const name = document.createElement("h4");
  name.className = "member-card-name";
  setLocalizedContent(name, names.kr, names.en);
  const research = document.createElement("p");
  research.className = "member-card-research";
  research.textContent = String(member.research_interests || "").trim();
  card.append(photoButton, name);
  if (research.textContent) {
    card.append(research);
  }

  const detail = createCurrentMemberDetail(member, detailId);
  photoButton.addEventListener("click", () => {
    const willOpen = detail.hidden;
    closeCurrentMemberDetails(photoButton);
    detail.hidden = !willOpen;
    photoButton.setAttribute("aria-expanded", String(willOpen));
  });

  return { card, detail };
}

function renderCurrentMembers(members) {
  document.querySelectorAll("[data-member-category]").forEach((container) => {
    const category = container.dataset.memberCategory;
    const categoryMembers = members.filter(
      (member) =>
        member &&
        member.category === category &&
        !["faculty", "staff", "alumni"].includes(member.group)
    );
    const fragment = document.createDocumentFragment();

    if (categoryMembers.length === 0) {
      const empty = document.createElement("p");
      empty.className = "member-empty";
      setLocalizedContent(
        empty,
        "현재 해당 과정의 구성원이 없습니다.",
        "There are currently no members in this group."
      );
      fragment.append(empty);
    } else {
      categoryMembers.forEach((member, index) => {
        const elements = createCurrentMemberElements(member, index);
        fragment.append(elements.card, elements.detail);
      });
    }

    container.replaceChildren(fragment);
  });
}

function getGraduationYear(graduation) {
  const match = String(graduation || "").match(/(?:19|20)\d{2}/);
  return match ? match[0] : "";
}

function createAlumniEntry(member, index) {
  const names = getMemberDisplayNames(member);
  const category = getMemberCategoryLabels(member.category);
  const graduationYear = getGraduationYear(member.graduation);
  const entry = document.createElement("details");
  entry.className = "alumni-entry";
  entry.dataset.alumniDegree = member.category === "박사" ? "phd" : "ms";

  const summary = document.createElement("summary");
  const name = document.createElement("strong");
  setLocalizedContent(name, names.kr, names.en);
  const degree = document.createElement("span");
  degree.className = "alumni-degree-meta";
  setLocalizedContent(
    degree,
    [category.kr, graduationYear].filter(Boolean).join(" · "),
    [category.en, graduationYear].filter(Boolean).join(" · ")
  );
  summary.append(name, degree);

  const affiliationValue = String(member.work || "").trim();
  if (affiliationValue) {
    const affiliation = document.createElement("span");
    affiliation.className = "alumni-affiliation";
    affiliation.textContent = affiliationValue;
    summary.append(affiliation);
  }

  const profile = document.createElement("div");
  profile.className = "alumni-profile";
  profile.append(createMemberPhoto(member, "alumni-profile-photo"));
  const information = document.createElement("div");
  information.className = "alumni-profile-content";
  const heading = document.createElement("h3");
  setLocalizedContent(heading, names.kr, names.en);
  const fields = document.createElement("dl");
  fields.className = "member-profile-fields";

  [
    createProfileField("이메일", "Email", member.email, "mailto:"),
    createProfileField("학위논문", "Thesis", member.thesis),
    createProfileField("취미", "Hobby", member.hobby),
  ].filter(Boolean).forEach((field) => fields.append(field));

  information.append(heading, fields);
  profile.append(information);
  entry.append(summary, profile);
  entry.dataset.memberIndex = String(index);
  return entry;
}

function createAlumniDegreeSection(category, alumni) {
  const labels = getMemberCategoryLabels(category);
  const section = document.createElement("section");
  section.className = "alumni-degree-section";
  const heading = document.createElement("div");
  heading.className = "alumni-degree-heading";
  const title = document.createElement("h2");
  setLocalizedContent(title, labels.kr, labels.en);
  const count = document.createElement("span");
  count.className = "publication-count";
  setLocalizedContent(count, alumni.length + "명", alumni.length + " alumni");
  heading.append(title, count);

  const entries = document.createElement("div");
  entries.className = "alumni-entry-list";
  alumni.forEach((member, index) => {
    entries.append(createAlumniEntry(member, index));
  });
  section.append(heading, entries);
  return section;
}

function renderAlumni(members) {
  const container = document.getElementById("alumni-list");
  const total = document.getElementById("alumni-total");

  if (!container || !total) {
    return;
  }

  const alumni = members.filter(
    (member) =>
      member &&
      member.group === "alumni" &&
      ["박사", "석사"].includes(member.category)
  );
  setLocalizedContent(total, "총 " + alumni.length + "명", alumni.length + " alumni");
  container.replaceChildren(
    createAlumniDegreeSection(
      "박사",
      alumni.filter((member) => member.category === "박사")
    ),
    createAlumniDegreeSection(
      "석사",
      alumni.filter((member) => member.category === "석사")
    )
  );
}

function setLabStatistic(name, value) {
  const statistic = document.querySelector('[data-lab-stat="' + name + '"]');

  if (statistic) {
    statistic.textContent = String(value);
  }
}

function updateLabStatisticsFromMembers(members) {
  const statisticsText = document.querySelector("[data-lab-stats]");

  if (!statisticsText) {
    return;
  }

  const foundedYear = Number(statisticsText.dataset.foundedYear);
  const currentYear = new Date().getFullYear();

  if (Number.isFinite(foundedYear) && foundedYear <= currentYear) {
    setLabStatistic("years", currentYear - foundedYear);
  }

  setLabStatistic(
    "phd-alumni",
    members.filter((member) => member.group === "alumni" && member.category === "박사").length
  );
  setLabStatistic(
    "ms-alumni",
    members.filter((member) => member.group === "alumni" && member.category === "석사").length
  );
  setLabStatistic(
    "doctoral-members",
    members.filter((member) => member.group === "student" && member.category === "박사/통합과정").length
  );
  setLabStatistic(
    "masters-members",
    members.filter((member) => member.group === "student" && member.category === "석사과정").length
  );

  statisticsText.dataset.countStatus = "live";
}

function renderMemberLoadError() {
  document.querySelectorAll("[data-member-category]").forEach((container) => {
    const message = document.createElement("p");
    message.className = "member-error";
    setLocalizedContent(
      message,
      "구성원 정보를 불러오지 못했습니다.",
      "The member list could not be loaded."
    );
    container.replaceChildren(message);
  });

  const alumniContainer = document.getElementById("alumni-list");
  if (alumniContainer) {
    const message = document.createElement("p");
    message.className = "member-error";
    setLocalizedContent(
      message,
      "동문 정보를 불러오지 못했습니다.",
      "The alumni list could not be loaded."
    );
    alumniContainer.replaceChildren(message);
  }
}

async function initializeMembers() {
  const sourceElement = document.querySelector("[data-members-source]");
  if (!sourceElement) {
    return;
  }

  try {
    const response = await fetch(sourceElement.dataset.membersSource, {
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error("Member data request failed: " + response.status);
    }

    const members = await response.json();
    if (!Array.isArray(members)) {
      throw new TypeError("Member data must be an array.");
    }

    renderCurrentMembers(members);
    renderAlumni(members);
    updateLabStatisticsFromMembers(members);
  } catch (error) {
    renderMemberLoadError();
    console.error(error);
  }
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

function createPublicationYear(yearLabelText, publications, shouldOpen, units) {
  const panel = document.createElement("details");
  panel.className = "publication-year";
  panel.open = shouldOpen;

  const summary = document.createElement("summary");
  const yearLabel = document.createElement("span");
  yearLabel.className = "publication-year-label";
  yearLabel.textContent = yearLabelText;

  const count = document.createElement("span");
  count.className = "publication-count";
  setLocalizedContent(
    count,
    publications.length + units.kr,
    publications.length + " " + units.en
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

function getPublicationYearGroup(year) {
  if (year >= 2020) {
    return { key: String(year), label: String(year), sortValue: year };
  }

  if (year >= 2010) {
    return { key: "2010-2019", label: "2010–2019", sortValue: 2019 };
  }

  if (year >= 2000) {
    return { key: "2000-2009", label: "2000–2009", sortValue: 2009 };
  }

  if (year >= 1989) {
    return { key: "1989-1999", label: "1989–1999", sortValue: 1999 };
  }

  return { key: "before-1989", label: "~1988", sortValue: 1988 };
}

function groupPublicationsByYear(publications) {
  return publications.reduce((groups, publication) => {
    const year = Number(publication.year);

    if (!Number.isInteger(year)) {
      return groups;
    }

    const groupDefinition = getPublicationYearGroup(year);

    if (!groups.has(groupDefinition.key)) {
      groups.set(groupDefinition.key, {
        label: groupDefinition.label,
        sortValue: groupDefinition.sortValue,
        publications: [],
      });
    }

    groups.get(groupDefinition.key).publications.push(publication);
    return groups;
  }, new Map());
}

function renderPublications(publications) {
  const container = document.getElementById("publication-years");
  const total = document.getElementById("publication-total");

  if (!container || !total) {
    return;
  }

  const category = container.dataset.category || "international-journal";
  const units = {
    kr: container.dataset.unitKr || "편",
    en: container.dataset.unitEn || "papers",
  };
  const categoryEntries = publications
    .filter(
      (publication) =>
        publication && publication.type === category
    )
    .sort((first, second) => Number(second.id) - Number(first.id));

  setLocalizedContent(
    total,
    "총 " + categoryEntries.length + units.kr,
    categoryEntries.length + " " + units.en
  );

  container.replaceChildren();

  const groupedPublications = groupPublicationsByYear(categoryEntries);
  const yearGroups = [...groupedPublications.values()].sort(
    (first, second) => second.sortValue - first.sortValue
  );

  if (yearGroups.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "publication-empty";
    setLocalizedContent(
      emptyMessage,
      container.dataset.emptyKr || "표시할 자료가 없습니다.",
      container.dataset.emptyEn || "No records are available."
    );
    container.append(emptyMessage);
    return;
  }

  const latestYearPublicationCount = yearGroups[0].publications.length;

  yearGroups.forEach((yearGroup, index) => {
    const shouldOpen =
      index === 0 || (index === 1 && latestYearPublicationCount <= 3);
    container.append(
      createPublicationYear(
        yearGroup.label,
        yearGroup.publications,
        shouldOpen,
        units
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
  initializeMembers();
  initializeNewsFilters();
  initializePublications();
}

document.addEventListener("DOMContentLoaded", initializePage);
