const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  navLinks.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  navLinks.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("resize", () => {
  if (window.innerWidth > 820) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navLinks.classList.contains("is-open")) {
    closeMenu();
    menuToggle.focus();
  }
});

const serviceTabs = [...document.querySelectorAll(".service-tab")];

function selectServiceTab(tab, focusTab) {
  serviceTabs.forEach((serviceTab) => {
    const selected = serviceTab === tab;
    serviceTab.setAttribute("aria-selected", String(selected));
    serviceTab.tabIndex = selected ? 0 : -1;
    document.getElementById(serviceTab.getAttribute("aria-controls")).hidden = !selected;
  });

  if (focusTab) tab.focus();
}

serviceTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectServiceTab(tab, false));
  tab.addEventListener("keydown", (event) => {
    let nextIndex;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (index + 1) % serviceTabs.length;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = (index - 1 + serviceTabs.length) % serviceTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = serviceTabs.length - 1;

    if (nextIndex !== undefined) {
      event.preventDefault();
      selectServiceTab(serviceTabs[nextIndex], true);
    }
  });
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

document.querySelector("#year").textContent = new Date().getFullYear();

const contactForm = document.querySelector("#contact-form");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const fields = [
    ["Name", formData.get("name")],
    ["Phone", formData.get("phone")],
    ["Email", formData.get("email")],
    ["Subject", formData.get("subject")],
    ["Service", formData.get("service")],
    ["Message", formData.get("message")]
  ].filter(([, value]) => typeof value === "string" && value.trim());
  const message = [
    "Hello B-Creative, I'd like to inquire about your services.",
    "",
    ...fields.map(([label, value]) => `${label}: ${value.trim()}`)
  ].join("\n");
  const whatsappUrl = `https://wa.me/966597630124?text=${encodeURIComponent(message)}`;
  window.location.assign(whatsappUrl);
});

const workSection = document.querySelector(".work-section");

if (workSection) {
  const reducedWorkMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const workTitles = workSection.querySelectorAll("[data-work-title]");

  function typeWorkTitle(title) {
    const segments = [...title.querySelectorAll("[data-type-text]")];
    title.classList.add("is-typing");

    if (reducedWorkMotion) {
      segments.forEach((segment) => {
        segment.textContent = segment.dataset.typeText;
      });
      title.classList.add("is-typed");
      return;
    }

    let segmentIndex = 0;
    let characterIndex = 0;

    function typeNextCharacter() {
      if (segmentIndex >= segments.length) {
        title.classList.add("is-typed");
        return;
      }

      const segment = segments[segmentIndex];
      const text = segment.dataset.typeText;

      if (characterIndex >= text.length) {
        segmentIndex += 1;
        characterIndex = 0;
        typeNextCharacter();
        return;
      }

      segment.textContent += text[characterIndex];
      characterIndex += 1;
      window.setTimeout(typeNextCharacter, 32);
    }

    typeNextCharacter();
  }

  if ("IntersectionObserver" in window && !reducedWorkMotion) {
    const titleObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          typeWorkTitle(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    workTitles.forEach((title) => titleObserver.observe(title));
  } else {
    workTitles.forEach(typeWorkTitle);
  }

  const videoCards = [...workSection.querySelectorAll(".work-reel-card")];

  videoCards.forEach((card) => {
    const video = card.querySelector("video");
    const button = card.querySelector("[data-video-toggle]");
    const icon = button.querySelector("i");
    const status = card.querySelector("[data-video-status]");
    const videoName = video.getAttribute("aria-label");

    function updateVideoButton(isPlaying) {
      card.querySelector(".work-video-media").classList.toggle("is-playing", isPlaying);
      button.setAttribute("aria-label", `${isPlaying ? "Pause" : "Play"} ${videoName}`);
      icon.classList.toggle("fa-play", !isPlaying);
      icon.classList.toggle("fa-pause", isPlaying);
    }

    button.addEventListener("click", async () => {
      if (!video.paused) {
        video.pause();
        return;
      }

      videoCards.forEach((otherCard) => {
        const otherVideo = otherCard.querySelector("video");
        if (otherVideo !== video) otherVideo.pause();
      });

      try {
        await video.play();
        status.textContent = "";
      } catch (error) {
        console.error(`Unable to play the ${videoName} project video.`, error);
        status.textContent = `Unable to play ${videoName}.`;
      }
    });

    video.addEventListener("play", () => updateVideoButton(true));
    video.addEventListener("pause", () => updateVideoButton(false));
    video.addEventListener("ended", () => updateVideoButton(false));
    video.addEventListener("error", () => {
      status.textContent = `Unable to load ${videoName}.`;
    });
  });

  const reel = workSection.querySelector(".work-reel-row");
  const previousReelButton = workSection.querySelector("[data-reel-prev]");
  const nextReelButton = workSection.querySelector("[data-reel-next]");

  function updateReelButtons() {
    const canScroll = reel.scrollWidth > reel.clientWidth + 1;
    previousReelButton.hidden = !canScroll || reel.scrollLeft <= 1;
    nextReelButton.hidden = !canScroll || reel.scrollLeft + reel.clientWidth >= reel.scrollWidth - 1;
  }

  function scrollReel(direction) {
    const firstCard = reel.querySelector(".work-reel-card");
    const gap = parseFloat(getComputedStyle(reel).columnGap) || 0;
    reel.scrollBy({
      left: direction * (firstCard.getBoundingClientRect().width + gap),
      behavior: reducedWorkMotion ? "auto" : "smooth"
    });
  }

  previousReelButton.addEventListener("click", () => scrollReel(-1));
  nextReelButton.addEventListener("click", () => scrollReel(1));
  reel.addEventListener("scroll", updateReelButtons, { passive: true });
  window.addEventListener("resize", updateReelButtons);
  updateReelButtons();

  const lightbox = workSection.querySelector(".work-lightbox");
  const lightboxImage = lightbox.querySelector("[data-lightbox-image]");
  const lightboxTitle = lightbox.querySelector("[data-lightbox-title]");
  const lightboxCategory = lightbox.querySelector("[data-lightbox-category]");

  workSection.querySelectorAll("[data-project-view]").forEach((button) => {
    button.addEventListener("click", () => {
      const image = button.querySelector("img");
      const card = button.closest(".work-graphic-card");
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt;
      lightboxTitle.textContent = button.getAttribute("aria-label").replace(/^View\s+/, "");
      lightboxCategory.textContent = card.querySelector(".work-project-meta small").textContent;
      lightbox.showModal();
    });
  });

  lightbox.querySelector("[data-lightbox-close]").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener("close", () => {
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
  });
}

const heroArt = document.querySelector(".hero-art");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

if (heroArt && !reduceMotion.matches && finePointer.matches) {
  const parallaxLayers = heroArt.querySelectorAll("[data-parallax]");
  let pointerFrame = 0;
  let pointerPosition = null;

  function applyParallax() {
    pointerFrame = 0;
    const bounds = heroArt.getBoundingClientRect();
    const x = pointerPosition ? ((pointerPosition.x - bounds.left) / bounds.width - 0.5) * 18 : 0;
    const y = pointerPosition ? ((pointerPosition.y - bounds.top) / bounds.height - 0.5) * 18 : 0;

    parallaxLayers.forEach((layer) => {
      const depth = Number(layer.dataset.parallax);
      layer.style.setProperty("--parallax-x", `${(x * depth).toFixed(2)}px`);
      layer.style.setProperty("--parallax-y", `${(y * depth).toFixed(2)}px`);
    });
  }

  function scheduleParallax(event) {
    pointerPosition = event ? { x: event.clientX, y: event.clientY } : null;
    if (!pointerFrame) pointerFrame = window.requestAnimationFrame(applyParallax);
  }

  heroArt.addEventListener("pointermove", scheduleParallax, { passive: true });
  heroArt.addEventListener("pointerleave", () => scheduleParallax(null), { passive: true });
}
