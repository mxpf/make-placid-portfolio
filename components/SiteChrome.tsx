"use client";

import { useLayoutEffect, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TransitionLink } from "@/components/TransitionLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ABOUT_RESTORE_KEY, ABOUT_RETURN_KEY, readAboutReturn, type AboutReturn } from "@/lib/about-return";
import { withoutBasePath } from "@/lib/base-path";

type SiteChromeProps = {
  name: string;
  aboutLabel: string;
  closeLabel: string;
};

function normalizePathname(pathname: string) {
  return withoutBasePath(pathname).replace(/\/+$/, "") || "/";
}

function restoreScroll({ scrollX, scrollY }: AboutReturn, onFinish: () => void) {
  const input = new AbortController();
  const observer = new ResizeObserver(tryRestore);
  let frame = window.requestAnimationFrame(() => {
    frame = window.requestAnimationFrame(() => {
      // A short initial layout can clamp scrollTo until the page grows.
      observer.observe(document.body);
      tryRestore();
    });
  });

  function stop() {
    window.cancelAnimationFrame(frame);
    observer.disconnect();
    input.abort();
  }

  function finish() {
    stop();
    onFinish();
  }

  function tryRestore() {
    window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
    if (Math.abs(window.scrollY - scrollY) <= 1) finish();
  }

  for (const event of ["wheel", "touchmove", "pointerdown", "keydown"]) {
    window.addEventListener(event, finish, { passive: true, signal: input.signal });
  }
  return stop;
}

export function SiteChrome({ name, aboutLabel, closeLabel }: SiteChromeProps) {
  const pathname = usePathname();
  const router = useRouter();
  const normalizedPathname = normalizePathname(pathname);
  const isAbout = normalizedPathname === "/about";

  useLayoutEffect(() => {
    document.body.classList.remove("page-leaving");

    if (isAbout) return;

    const position = readAboutReturn(ABOUT_RESTORE_KEY);
    if (!position) return;

    const clearPosition = () => sessionStorage.removeItem(ABOUT_RESTORE_KEY);
    if (normalizePathname(position.pathname) === normalizedPathname) {
      return restoreScroll(position, clearPosition);
    }
    clearPosition();
  }, [isAbout, normalizedPathname]);

  function closeAbout(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (document.body.classList.contains("page-leaving")) return;
    document.body.classList.add("page-leaving");
    window.setTimeout(returnFromAbout, 180);
  }

  function returnFromAbout() {
    const position = readAboutReturn(ABOUT_RETURN_KEY);
    if (position) {
      try {
        sessionStorage.removeItem(ABOUT_RETURN_KEY);
        sessionStorage.setItem(ABOUT_RESTORE_KEY, JSON.stringify(position));
        router.replace(withoutBasePath(position.pathname), { scroll: false });
        return;
      } catch {
        // Fall back to the homepage if the return position cannot be saved.
      }
    }

    router.push("/");
  }

  return (
    <header className="site-header">
      <div className="site-name">
        <TransitionLink id="site-home-link" className="site-link" href="/">
          {name}
        </TransitionLink>
      </div>
      <div className="site-action">
        {isAbout ? (
          <button id="site-about-close" className="site-link" type="button" onClick={closeAbout}>
            {closeLabel}
          </button>
        ) : (
          <TransitionLink id="site-about-link" className="site-link" href="/about">
            {aboutLabel}
          </TransitionLink>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
