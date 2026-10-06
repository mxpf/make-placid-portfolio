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

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
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
    };
  }, [pathname]);

  return null;
}
