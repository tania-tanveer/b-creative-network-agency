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

const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    projectCards.forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.category !== filter;
    });
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
