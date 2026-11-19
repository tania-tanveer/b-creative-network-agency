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
  if (window.innerWidth > 640) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navLinks.classList.contains("is-open")) {
    closeMenu();
    menuToggle.focus();
  }
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }

      const fineMotion = window.matchMedia("(hover: hover) and (pointer: fine)");
      const motionReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

      if (fineMotion.matches && !motionReduced.matches) {
        document.querySelectorAll(".service-card").forEach((card) => {
          card.addEventListener("pointermove", (event) => {
            const bounds = card.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width;
            const y = (event.clientY - bounds.top) / bounds.height;
            card.style.setProperty("--spot-x", `${x * 100}%`);
            card.style.setProperty("--spot-y", `${y * 100}%`);
            card.style.setProperty("--tilt-x", `${(x - 0.5) * 5}deg`);
            card.style.setProperty("--tilt-y", `${(0.5 - y) * 5}deg`);
          });

          card.addEventListener("pointerleave", () => {
            card.style.setProperty("--spot-x", "50%");
            card.style.setProperty("--spot-y", "50%");
            card.style.setProperty("--tilt-x", "0deg");
            card.style.setProperty("--tilt-y", "0deg");
          });
        });
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

document.querySelector("#year").textContent = new Date().getFullYear();

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
