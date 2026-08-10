"use client";

import { useLayoutEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TransitionLink } from "@/components/TransitionLink";
import { LetterCascade } from "@/components/LetterCascade";

const RETURN_KEY = "portfolio-about-return";

type SiteChromeProps = {
  name: string;
  aboutLabel: string;
  closeLabel: string;
};

export function SiteChrome({ name, aboutLabel, closeLabel }: SiteChromeProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAbout = pathname === "/about";

  useLayoutEffect(() => {
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
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <header className="site-header">
      <div className="site-name">
        <TransitionLink className="site-link" href="/" beforeNavigate={clearReturnLocation}>
          <LetterCascade text={name} />
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
