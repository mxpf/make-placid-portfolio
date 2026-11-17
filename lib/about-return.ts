import { withoutBasePath } from "@/lib/base-path";

export const ABOUT_RETURN_KEY = "portfolio-about-return";
export const ABOUT_RESTORE_KEY = "portfolio-about-restore";

export type AboutReturn = {
  pathname: string;
  scrollX: number;
  scrollY: number;
};

// Capture the position even when the About link is followed before React hydrates.
export const captureAboutReturn = `
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
        event.ctrlKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return;

    const link = event.target.closest("#site-about-link, #site-home-link");
    if (!link) return;
    try {
      if (link.id === "site-about-link") {
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
