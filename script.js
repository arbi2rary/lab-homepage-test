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
    kr: koreanName && englishName
      ? koreanName + " (" + englishName + ")"
      : koreanName || englishName,
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

const currentMemberOrderByCategory = {
  "박사후연구원": [
    "윤효준",
  ],
  "박사/통합과정": [
    "박종호",
    "이수령",
    "김성훈",
    "유연우",
    "신승호",
    "문영기",
    "이주용",
    "원두연",
    "김원준",
    "김재현",
    "윤두현",
    "김나연",
    "김다영",
    "정유진",
    "김다훈",
    "김승태",
    "박경규",
    "이미혜",
    "임수민",
    "김강현",
  ],
  "석사과정": [
    "손누리",
    "최연호",
    "손정현",
    "위호연",
    "김준거",
    "조준희",
    "신재우",
    "권인아",
  ],
  "인턴": [
    "김준혁",
  ],
};

function getCurrentMemberDisplayOrder(member) {
  const categoryOrder = currentMemberOrderByCategory[member.category] || [];
  const memberIndex = categoryOrder.indexOf(member.name_kr);
  return memberIndex === -1 ? Number.MAX_SAFE_INTEGER : memberIndex;
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

function createCurrentMemberName(member, className) {
  const name = document.createElement("h4");
  name.className = className + " member-bilingual-name";
  const koreanName = String(member.name_kr || "").trim();
  const englishName = String(member.name_en || "").trim();

  if (koreanName) {
    const korean = document.createElement("span");
    korean.className = "member-name-korean";
    korean.textContent = koreanName;
    name.append(korean);
  }

  if (englishName) {
    const english = document.createElement("span");
    english.className = "member-name-english";
    english.textContent = englishName;
    name.append(english);
  }

  return name;
}

function createCurrentMemberDetail(member, detailId) {
  const category = getMemberCategoryLabels(member.category);
  const detail = document.createElement("section");
  detail.className = "member-detail-panel";
  detail.id = detailId;
  detail.hidden = true;

  const photo = createMemberPhoto(member, "member-detail-photo");
  const content = document.createElement("div");
  content.className = "member-detail-content";
  const name = createCurrentMemberName(member, "member-detail-name");
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

function placeDetailAfterCardRow(card, detail) {
  const container = card.parentElement;
  if (!container) {
    return;
  }

  const wasHidden = detail.hidden;
  detail.hidden = true;
  const cardTop = card.offsetTop;
  const rowCards = [...container.children].filter(
    (element) =>
      element.matches(".member-card, .alumni-card") &&
      Math.abs(element.offsetTop - cardTop) <= 1
  );
  const lastCardInRow = rowCards[rowCards.length - 1] || card;
  lastCardInRow.after(detail);
  detail.hidden = wasHidden;
}

function repositionOpenMemberDetails() {
  document
    .querySelectorAll(
      '.member-photo-button[aria-expanded="true"], ' +
      '.alumni-card-button[aria-expanded="true"]'
    )
    .forEach((button) => {
      const card = button.closest(".member-card, .alumni-card");
      const detail = document.getElementById(button.getAttribute("aria-controls"));

      if (card && detail) {
        placeDetailAfterCardRow(card, detail);
      }
    });
}

let memberDetailResizeFrame = 0;
window.addEventListener("resize", () => {
  window.cancelAnimationFrame(memberDetailResizeFrame);
  memberDetailResizeFrame = window.requestAnimationFrame(
    repositionOpenMemberDetails
  );
});

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

  const name = createCurrentMemberName(member, "member-card-name");
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

    if (willOpen) {
      placeDetailAfterCardRow(card, detail);
    }

    detail.hidden = !willOpen;
    photoButton.setAttribute("aria-expanded", String(willOpen));
  });

  return { card, detail };
}

function renderCurrentMembers(members) {
  document.querySelectorAll("[data-member-category]").forEach((container) => {
    const category = container.dataset.memberCategory;
    const categoryMembers = members
      .filter(
        (member) =>
          member &&
          member.category === category &&
          !["faculty", "staff", "alumni"].includes(member.group)
      )
      .sort(
        (first, second) =>
          getCurrentMemberDisplayOrder(first) -
          getCurrentMemberDisplayOrder(second)
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
      const cards = document.createDocumentFragment();
      const details = document.createDocumentFragment();

      categoryMembers.forEach((member, index) => {
        const elements = createCurrentMemberElements(member, index);
        cards.append(elements.card);
        details.append(elements.detail);
      });

      fragment.append(cards, details);
    }

    container.replaceChildren(fragment);
  });
}

function getProfessorProfileValues(member, sectionName) {
  const values = member && member.profile && member.profile[sectionName];
  return Array.isArray(values)
    ? values.filter((value) => String(value).trim() !== "")
    : [];
}

function createProfessorProfileSection(
  member,
  sectionName,
  labelEn,
  className = ""
) {
  const values = getProfessorProfileValues(member, sectionName);
  if (values.length === 0) {
    return null;
  }

  const section = document.createElement("section");
  section.className = ["professor-profile-section", className]
    .filter(Boolean)
    .join(" ");
  const heading = document.createElement("h5");
  setLocalizedContent(heading, sectionName, labelEn);
  const list = document.createElement("ul");

  values.forEach((value) => {
    const item = document.createElement("li");
    item.textContent = String(value);
    list.append(item);
  });

  section.append(heading, list);
  return section;
}

function renderProfessorProfile(members) {
  const container = document.querySelector("[data-professor-profile]");
  if (!container) {
    return;
  }

  const professor = members.find(
    (member) => member && member.group === "faculty" && member.category === "지도교수"
  );
  if (!professor) {
    const empty = document.createElement("p");
    empty.className = "member-empty";
    setLocalizedContent(
      empty,
      "지도교수 정보가 없습니다.",
      "Professor information is unavailable."
    );
    container.replaceChildren(empty);
    return;
  }

  const profile = document.createElement("article");
  profile.className = "professor-profile";
  const photo = createMemberPhoto(professor, "professor-photo");
  const main = document.createElement("div");
  main.className = "professor-profile-main";
  const name = document.createElement("h4");
  name.className = "professor-profile-name";
  const originalName = getProfessorProfileValues(professor, "이름")[0];
  name.textContent = originalName === undefined
    ? [professor.name_kr, professor.name_en].filter(Boolean).join(" ")
    : String(originalName);

  const mainSections = document.createElement("div");
  mainSections.className = "professor-main-sections";
  [
    createProfessorProfileSection(professor, "연구분야", "Research Areas"),
    createProfessorProfileSection(professor, "사무실", "Office"),
    createProfessorProfileSection(professor, "면담시간", "Office Hours"),
  ].filter(Boolean).forEach((section) => mainSections.append(section));
  main.append(name, mainSections);

  const more = document.createElement("details");
  more.className = "more-panel professor-more-panel";
  const summary = document.createElement("summary");
  const summaryText = document.createElement("span");
  setLocalizedContent(summaryText, "교수님 상세 프로필 보기", "View More");
  const summaryIcon = document.createElement("span");
  summaryIcon.className = "summary-icon";
  summaryIcon.setAttribute("aria-hidden", "true");
  summary.append(summaryText, summaryIcon);

  const moreBody = document.createElement("div");
  moreBody.className = "more-panel-body professor-more-body";
  [
    createProfessorProfileSection(professor, "학력", "Education"),
    createProfessorProfileSection(professor, "경력", "Career"),
    createProfessorProfileSection(
      professor,
      "수상",
      "Awards",
      "professor-awards-section"
    ),
    createProfessorProfileSection(professor, "취미", "Hobbies"),
  ].filter(Boolean).forEach((section) => moreBody.append(section));
  more.append(summary, moreBody);

  profile.append(photo, main, more);
  container.replaceChildren(profile);
}

function getGraduationSortValue(graduation) {
  const match = String(graduation || "")
    .trim()
    .match(/^((?:19|20)\d{2})(?:[.\/-](\d{1,2}))?/);

  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  const year = Number(match[1]);
  const month = Number(match[2] || 0);
  return year * 12 + month;
}

function compareAlumniByGraduation(first, second) {
  return (
    getGraduationSortValue(first.graduation) -
    getGraduationSortValue(second.graduation)
  );
}

function getObfuscationSeed(member) {
  return [
    String(member.name_kr || ""),
    String(member.graduation || ""),
    "soclab-alumni-v1",
  ].join("|");
}

function createObfuscationState(value) {
  let state = 2166136261;
  const bytes = new TextEncoder().encode(value);

  bytes.forEach((byte) => {
    state ^= byte;
    state = Math.imul(state, 16777619) >>> 0;
  });

  return state || 1;
}

function advanceObfuscationState(state) {
  let next = state >>> 0;
  next ^= (next << 13) >>> 0;
  next ^= next >>> 17;
  next ^= (next << 5) >>> 0;
  return next >>> 0;
}

function decodeAlumniPrivateDetail(member) {
  const protectedValue = String(member.private_detail_obfuscated || "");
  const [version, encodedValue] = protectedValue.split(".", 2);

  if (version !== "v1" || !encodedValue) {
    return {};
  }

  try {
    const base64Value = encodedValue.replace(/-/g, "+").replace(/_/g, "/");
    const paddedValue = base64Value.padEnd(
      Math.ceil(base64Value.length / 4) * 4,
      "="
    );
    const encryptedText = window.atob(paddedValue);
    const decryptedBytes = new Uint8Array(encryptedText.length);
    let state = createObfuscationState(getObfuscationSeed(member));

    for (let index = 0; index < encryptedText.length; index += 1) {
      state = advanceObfuscationState(state);
      decryptedBytes[index] = encryptedText.charCodeAt(index) ^ (state & 0xff);
    }

    const detail = JSON.parse(new TextDecoder().decode(decryptedBytes));
    return detail && typeof detail === "object" ? detail : {};
  } catch (error) {
    console.error("Alumni detail could not be decoded.", error);
    return {};
  }
}

function populateAlumniDetail(detail, member) {
  const privateDetail = decodeAlumniPrivateDetail(member);
  const affiliationValue = String(member.work || "").trim();
  const photo = createMemberPhoto(
    member,
    "member-detail-photo alumni-detail-photo"
  );
  const content = document.createElement("div");
  content.className = "member-detail-content";
  const name = createCurrentMemberName(member, "member-detail-name");
  const fields = document.createElement("dl");
  fields.className = "member-profile-fields";

  [
    createProfileField(
      "재직처",
      "Affiliation",
      affiliationValue || "재직처 확인 중",
      "",
      affiliationValue || "Affiliation pending"
    ),
    createProfileField("학위논문", "Thesis", member.thesis),
    createProfileField("메일", "Email", privateDetail.email, "mailto:"),
    createProfileField("취미", "Hobby", privateDetail.hobby),
  ].filter(Boolean).forEach((field) => fields.append(field));

  content.append(name, fields);
  detail.replaceChildren(photo, content);
}

function clearAlumniDetail(detail) {
  detail.hidden = true;
  detail.replaceChildren();
}

function closeAlumniDetails(exceptButton = null) {
  document
    .querySelectorAll('.alumni-card-button[aria-expanded="true"]')
    .forEach((button) => {
      if (button === exceptButton) {
        return;
      }

      button.setAttribute("aria-expanded", "false");
      const detail = document.getElementById(button.getAttribute("aria-controls"));
      if (detail) {
        clearAlumniDetail(detail);
      }
    });
}

function createAlumniElements(member, index) {
  const names = getMemberDisplayNames(member);
  const detailId = "alumni-detail-" + String(index);
  const card = document.createElement("article");
  card.className = "alumni-card";
  const button = document.createElement("button");
  button.className = "alumni-card-button";
  button.type = "button";
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", detailId);
  button.dataset.ariaKr = names.kr + " 상세정보 보기";
  button.dataset.ariaEn = "View profile for " + names.en;
  button.setAttribute(
    "aria-label",
    localStorage.getItem("soclab-language") === "en"
      ? button.dataset.ariaEn
      : button.dataset.ariaKr
  );

  const name = createCurrentMemberName(member, "alumni-card-name");
  button.append(name);

  const affiliationValue = String(member.work || "").trim();
  const affiliation = document.createElement("span");
  affiliation.className = "alumni-card-affiliation";
  setLocalizedContent(
    affiliation,
    affiliationValue || "재직처 확인 중",
    affiliationValue || "Affiliation pending"
  );
  button.append(affiliation);
  card.append(button);

  const detail = document.createElement("section");
  detail.className = "member-detail-panel alumni-detail-panel";
  detail.id = detailId;
  detail.hidden = true;

  button.addEventListener("click", () => {
    const willOpen = detail.hidden;
    closeAlumniDetails(button);

    if (willOpen) {
      placeDetailAfterCardRow(card, detail);
      populateAlumniDetail(detail, member);
      detail.hidden = false;
    } else {
      clearAlumniDetail(detail);
    }

    button.setAttribute("aria-expanded", String(willOpen));
  });

  return { card, detail };
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
  entries.className = "alumni-card-grid";
  const cards = document.createDocumentFragment();
  const details = document.createDocumentFragment();
  alumni.forEach((member, index) => {
    const categoryKey = category === "박사" ? "phd" : "ms";
    const elements = createAlumniElements(
      member,
      categoryKey + "-" + String(index)
    );
    cards.append(elements.card);
    details.append(elements.detail);
  });
  entries.append(cards, details);
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
  const doctoralAlumni = alumni
    .filter((member) => member.category === "박사")
    .sort(compareAlumniByGraduation);
  const mastersAlumni = alumni
    .filter((member) => member.category === "석사")
    .sort(compareAlumniByGraduation);
  setLocalizedContent(total, "총 " + alumni.length + "명", alumni.length + " alumni");
  container.replaceChildren(
    createAlumniDegreeSection("박사", doctoralAlumni),
    createAlumniDegreeSection("석사", mastersAlumni)
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
  const professorContainer = document.querySelector("[data-professor-profile]");
  if (professorContainer) {
    const message = document.createElement("p");
    message.className = "member-error";
    setLocalizedContent(
      message,
      "지도교수 정보를 불러오지 못했습니다.",
      "The professor profile could not be loaded."
    );
    professorContainer.replaceChildren(message);
  }

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

    renderProfessorProfile(members);
    renderCurrentMembers(members);
    renderAlumni(members);
    updateLabStatisticsFromMembers(members);
  } catch (error) {
    renderMemberLoadError();
    console.error(error);
  }
}

function parseProjectDate(value) {
  const match = String(value || "")
    .trim()
    .match(/^((?:19|20)\d{2})\.(\d{2})\.(\d{2})$/);

  if (!match) {
    return null;
  }

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  );
  date.setHours(0, 0, 0, 0);
  return date;
}

function isCurrentProject(project, today) {
  const endDate = parseProjectDate(project.end);
  return Boolean(endDate && endDate >= today);
}

function compareCompletedProjects(first, second) {
  const firstEnd = parseProjectDate(first.end)?.getTime() || 0;
  const secondEnd = parseProjectDate(second.end)?.getTime() || 0;

  if (firstEnd !== secondEnd) {
    return secondEnd - firstEnd;
  }

  const firstStart = parseProjectDate(first.start)?.getTime() || 0;
  const secondStart = parseProjectDate(second.start)?.getTime() || 0;

  if (firstStart !== secondStart) {
    return secondStart - firstStart;
  }

  return Number(second.id || 0) - Number(first.id || 0);
}

function getProjectLocalizedValue(project, key) {
  const koreanValue = String(project[key + "_kr"] || "").trim();
  const englishValue = String(project[key + "_en"] || "").trim();
  return {
    kr: koreanValue || englishValue,
    en: englishValue || koreanValue,
  };
}

function getProjectDateRange(project) {
  return [project.start, project.end]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" – ");
}

function getProjectMachineDateRange(project) {
  return [project.start, project.end]
    .map((value) => String(value || "").trim().replace(/\./g, "-"))
    .filter(Boolean)
    .join("/");
}

function createCurrentProjectCard(project, index) {
  const titleValue = getProjectLocalizedValue(project, "title");
  const agencyValue = getProjectLocalizedValue(project, "agency");
  const card = document.createElement("article");
  card.className = "feature-card project-card";
  const label = document.createElement("span");
  label.className = "item-label";
  label.textContent =
    "CURRENT PROJECT " +
    String(index + 1).padStart(2, "0") +
    " · ID " +
    String(project.id);
  const title = document.createElement("h3");
  setLocalizedContent(title, titleValue.kr, titleValue.en);
  const date = document.createElement("time");
  date.className = "project-date";
  date.dateTime = getProjectMachineDateRange(project);
  date.textContent = getProjectDateRange(project);
  const agency = document.createElement("p");
  agency.className = "project-agency";
  setLocalizedContent(agency, agencyValue.kr, agencyValue.en);
  card.append(label, title, date, agency);
  return card;
}

function createCompletedProjectItem(project) {
  const titleValue = getProjectLocalizedValue(project, "title");
  const agencyValue = getProjectLocalizedValue(project, "agency");
  const item = document.createElement("article");
  item.className = "tl";
  const id = document.createElement("span");
  id.className = "item-label project-id";
  id.textContent = "PROJECT ID " + String(project.id);
  const date = document.createElement("time");
  date.className = "yr";
  date.dateTime = getProjectMachineDateRange(project);
  date.textContent = getProjectDateRange(project);
  const title = document.createElement("h3");
  setLocalizedContent(title, titleValue.kr, titleValue.en);
  const agency = document.createElement("div");
  agency.className = "src";
  setLocalizedContent(agency, agencyValue.kr, agencyValue.en);
  item.append(id, date, title, agency);
  return item;
}

function renderProjects(projects) {
  const currentContainer = document.querySelector("[data-current-projects]");
  const completedContainer = document.querySelector("[data-completed-projects]");

  if (!currentContainer || !completedContainer) {
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentProjects = projects.filter((project) =>
    isCurrentProject(project, today)
  );
  const completedProjects = projects
    .filter((project) => !isCurrentProject(project, today))
    .sort(compareCompletedProjects);

  if (currentProjects.length === 0) {
    const empty = document.createElement("p");
    empty.className = "project-empty";
    setLocalizedContent(
      empty,
      "현재 수행 중인 과제가 없습니다.",
      "There are no current projects."
    );
    currentContainer.replaceChildren(empty);
  } else {
    currentContainer.replaceChildren(
      ...currentProjects.map(createCurrentProjectCard)
    );
  }

  if (completedProjects.length === 0) {
    const empty = document.createElement("p");
    empty.className = "project-empty";
    setLocalizedContent(
      empty,
      "기수행 과제가 없습니다.",
      "There are no completed projects."
    );
    completedContainer.replaceChildren(empty);
  } else {
    completedContainer.replaceChildren(
      ...completedProjects.map(createCompletedProjectItem)
    );
  }
}

function renderProjectLoadError() {
  document
    .querySelectorAll("[data-current-projects], [data-completed-projects]")
    .forEach((container) => {
      const message = document.createElement("p");
      message.className = "project-error";
      setLocalizedContent(
        message,
        "연구과제 정보를 불러오지 못했습니다.",
        "Project information could not be loaded."
      );
      container.replaceChildren(message);
    });
}

function initializeCompletedProjectLinks() {
  const completedPanel = document.getElementById("completed-projects");
  if (!completedPanel) {
    return;
  }

  document
    .querySelectorAll('a[href="#completed-projects"]')
    .forEach((link) => {
      link.addEventListener("click", () => {
        completedPanel.open = true;
      });
    });

  if (window.location.hash === "#completed-projects") {
    completedPanel.open = true;
  }
}

async function initializeProjects() {
  const projectSection = document.querySelector("[data-projects-source]");
  if (!projectSection) {
    return;
  }

  initializeCompletedProjectLinks();

  try {
    const response = await fetch(projectSection.dataset.projectsSource, {
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error("Project data request failed: " + response.status);
    }

    const projects = await response.json();
    if (!Array.isArray(projects)) {
      throw new TypeError("Project data must be an array.");
    }

    renderProjects(projects);
  } catch (error) {
    renderProjectLoadError();
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
  initializeProjects();
  initializeNewsFilters();
  initializePublications();
}

document.addEventListener("DOMContentLoaded", initializePage);
