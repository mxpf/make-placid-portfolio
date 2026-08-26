"use client";

import { useLayoutEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TransitionLink } from "@/components/TransitionLink";
import { withoutBasePath } from "@/lib/base-path";

const RETURN_KEY = "portfolio-about-return";
const RESTORE_KEY = "portfolio-about-restore";

type AboutReturn = {
  scrollX: number;
  scrollY: number;
};

type SiteChromeProps = {
  name: string;
  aboutLabel: string;
  closeLabel: string;
};

export function SiteChrome({ name, aboutLabel, closeLabel }: SiteChromeProps) {
  const pathname = usePathname();
  const router = useRouter();
  const normalizedPathname = withoutBasePath(pathname).replace(/\/+$/, "") || "/";
  const isAbout = normalizedPathname === "/about";

  useLayoutEffect(() => {
    document.body.classList.remove("page-leaving");

    if (isAbout) return;

    const storedScroll = sessionStorage.getItem(RESTORE_KEY);
    if (!storedScroll) return;

    sessionStorage.removeItem(RESTORE_KEY);
    try {
      const { scrollX, scrollY } = JSON.parse(storedScroll) as AboutReturn;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => window.scrollTo(scrollX, scrollY));
      });
    } catch {
      // Ignore invalid or obsolete return data.
    }
  }, [isAbout, pathname]);

  function rememberLocation() {
    sessionStorage.setItem(
      RETURN_KEY,
      JSON.stringify({ scrollX: window.scrollX, scrollY: window.scrollY } satisfies AboutReturn),
    );
  }

  function clearReturnLocation() {
    sessionStorage.removeItem(RETURN_KEY);
    sessionStorage.removeItem(RESTORE_KEY);
  }

  function closeAbout() {
    document.body.classList.add("page-leaving");
    window.setTimeout(returnFromAbout, 180);
  }

  function returnFromAbout() {
    const storedReturn = sessionStorage.getItem(RETURN_KEY);
    if (storedReturn) {
      sessionStorage.removeItem(RETURN_KEY);
      sessionStorage.setItem(RESTORE_KEY, storedReturn);
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <header className="site-header">
      <div className="site-name">
        <TransitionLink className="site-link" href="/" beforeNavigate={clearReturnLocation}>
          {name}
        </TransitionLink>
      </div>
      <div className="site-action">
        {isAbout ? (
          <button className="site-link" type="button" onClick={closeAbout}>
            {closeLabel}
          </button>
        ) : (
          <TransitionLink className="site-link" href="/about" beforeNavigate={rememberLocation}>
            {aboutLabel}
          </TransitionLink>
        )}
      </div>
    </header>
  );
}
