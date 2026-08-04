"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/TransitionLink";

const RETURN_KEY = "portfolio-about-return";

type SiteChromeProps = {
  name: string;
  aboutLabel: string;
  closeLabel: string;
};

export function SiteChrome({ name, aboutLabel, closeLabel }: SiteChromeProps) {
  const pathname = usePathname();
  const isAbout = pathname === "/about";

  useEffect(() => {
    document.body.classList.remove("page-leaving");
  }, [pathname]);

  function rememberLocation() {
    sessionStorage.setItem(RETURN_KEY, "true");
  }

  function clearReturnLocation() {
    sessionStorage.removeItem(RETURN_KEY);
  }

  function closeAbout() {
    document.body.classList.add("page-leaving");
    window.setTimeout(returnFromAbout, 180);
  }

  function returnFromAbout() {
    if (sessionStorage.getItem(RETURN_KEY) === "true") {
      sessionStorage.removeItem(RETURN_KEY);
      history.back();
      return;
    }

    location.assign("/");
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
