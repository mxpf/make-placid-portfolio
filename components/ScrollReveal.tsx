"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const selector = "[data-reveal]";

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>(selector));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    const rootStyles = getComputedStyle(root);
    const thumbnailOpacityStart = Number.parseFloat(rootStyles.getPropertyValue("--homepage-content-opacity-start")) || 0.1;
    const thumbnailFadeViewport = Number.parseFloat(rootStyles.getPropertyValue("--homepage-content-fade-viewport")) || 12;
    const hasHomepageProjects = Boolean(document.querySelector(".home-project"));
    let opacityFrame = 0;

    const updateHomepageOpacity = () => {
      opacityFrame = 0;
      if (!hasHomepageProjects) return;
      if (reduceMotion) {
        root.style.setProperty("--homepage-content-opacity-current", "1");
        return;
      }

      const fadeDistance = window.innerHeight * (thumbnailFadeViewport / 100);
      const progress = Math.min(1, Math.max(0, window.scrollY / fadeDistance));
      const opacity = thumbnailOpacityStart + ((1 - thumbnailOpacityStart) * progress);
      root.style.setProperty("--homepage-content-opacity-current", opacity.toFixed(3));
    };

    const scheduleHomepageOpacity = () => {
      if (opacityFrame) return;
      opacityFrame = window.requestAnimationFrame(updateHomepageOpacity);
    };

    updateHomepageOpacity();
    if (hasHomepageProjects && !reduceMotion) {
      window.addEventListener("scroll", scheduleHomepageOpacity, { passive: true });
      window.addEventListener("resize", scheduleHomepageOpacity);
    }

    const cleanupHomepageOpacity = () => {
      if (opacityFrame) window.cancelAnimationFrame(opacityFrame);
      window.removeEventListener("scroll", scheduleHomepageOpacity);
      window.removeEventListener("resize", scheduleHomepageOpacity);
      root.style.removeProperty("--homepage-content-opacity-current");
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return cleanupHomepageOpacity;
    }

    const stagger = Number.parseFloat(rootStyles.getPropertyValue("--reveal-stagger")) || 20;
    const initialBoundary = window.innerHeight * 0.94;
    const initialItems = items
      .filter((item) => item.getBoundingClientRect().top < initialBoundary)
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    const initialSet = new Set(initialItems);

    items.forEach((item) => {
      item.classList.remove("is-visible");
      item.style.removeProperty("--reveal-delay");
    });
    document.documentElement.classList.add("reveal-ready");

    let initialFrame = window.requestAnimationFrame(() => {
      initialFrame = window.requestAnimationFrame(() => {
        initialItems.forEach((item, index) => {
          item.style.setProperty("--reveal-delay", `${index * stagger}ms`);
          item.classList.add("is-visible");
        });
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        .forEach((entry, index) => {
          (entry.target as HTMLElement).style.setProperty("--reveal-delay", `${index * stagger}ms`);
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
    }, {
      rootMargin: "0px 0px -2% 0px",
      threshold: 0.04,
    });

    items.forEach((item) => {
      if (!initialSet.has(item)) observer.observe(item);
    });

    return () => {
      window.cancelAnimationFrame(initialFrame);
      observer.disconnect();
      cleanupHomepageOpacity();
    };
  }, [pathname]);

  return null;
}
