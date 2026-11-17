import { withoutBasePath } from "@/lib/base-path";

export const ABOUT_RETURN_KEY = "portfolio-about-return";
export const ABOUT_RESTORE_KEY = "portfolio-about-restore";

export type AboutReturn = {
  pathname: string;
  scrollX: number;
  scrollY: number;
};

// The About controls can be used while the application modules are still loading.
export const aboutReturnScript = `
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
        event.ctrlKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return;

    const control = event.target.closest("#site-about-link, #site-home-link, #site-about-close");
    if (!control) return;
    if (control.id === "site-about-close") {
      window.setTimeout(() => {
        // A hydrated Close handler cancels the native fallback.
        if (event.defaultPrevented || !control.isConnected || document.body.classList.contains("page-leaving")) return;
        document.body.classList.add("page-leaving");
        const home = new URL(document.getElementById("site-home-link").href);
        let destination = home;
        try {
          const position = JSON.parse(sessionStorage.getItem(${JSON.stringify(ABOUT_RETURN_KEY)}) || "null");
          sessionStorage.removeItem(${JSON.stringify(ABOUT_RETURN_KEY)});
          if (position && typeof position.pathname === "string" && position.pathname.startsWith("/") &&
              Number.isFinite(position.scrollX) && Number.isFinite(position.scrollY)) {
            const source = new URL(position.pathname, home.origin);
            if (source.origin === home.origin) {
              // Older records may contain a pathname without the deployment prefix.
              const pathname = source.pathname.startsWith(home.pathname)
                ? source.pathname
                : home.pathname + source.pathname.slice(1);
              sessionStorage.setItem(${JSON.stringify(ABOUT_RESTORE_KEY)}, JSON.stringify({ ...position, pathname }));
              destination = new URL(pathname, home.origin);
            }
          }
        } catch {
          // Without a usable return position, Close opens the homepage.
        }
        location.replace(destination.href);
      }, 0);
      return;
    }

    try {
      if (control.id === "site-about-link") {
        sessionStorage.setItem(${JSON.stringify(ABOUT_RETURN_KEY)}, JSON.stringify({
          pathname: location.pathname,
          scrollX: window.scrollX,
          scrollY: Math.max(0, window.scrollY),
        }));
      } else {
        sessionStorage.removeItem(${JSON.stringify(ABOUT_RETURN_KEY)});
        sessionStorage.removeItem(${JSON.stringify(ABOUT_RESTORE_KEY)});
      }
    } catch {
      // The links still work when browser storage is unavailable.
    }
  }, true);
`;

export function readAboutReturn(key: string): AboutReturn | null {
  try {
    const position = JSON.parse(sessionStorage.getItem(key) ?? "null") as AboutReturn | null;
    if (!position || typeof position.pathname !== "string" ||
        !Number.isFinite(position.scrollX) || !Number.isFinite(position.scrollY)) {
      return null;
    }
    const pathname = withoutBasePath(position.pathname);
    if (!pathname.startsWith("/") || pathname.startsWith("//") || /[\s\\]/.test(pathname)) return null;
    return position;
  } catch {
    return null;
  }
}
