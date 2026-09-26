"use client";

import type { MouseEvent, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { withBasePath } from "@/lib/base-path";

export function TransitionLink({
  href,
  className,
  children,
  ariaLabel,
  beforeNavigate,
  dataReveal = false,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  beforeNavigate?: () => void;
  dataReveal?: boolean;
}) {
  const router = useRouter();
  const renderedHref = withBasePath(href);
  const navigationTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (navigationTimer.current !== null) window.clearTimeout(navigationTimer.current);
  }, []);

  function navigate(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    beforeNavigate?.();
    const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";
    if (normalizePath(window.location.pathname) === normalizePath(renderedHref)) {
      window.scrollTo({ top: 0 });
      return;
    }

    document.body.classList.add("page-leaving");
    navigationTimer.current = window.setTimeout(() => router.push(href), 180);
  }

  return (
    <Link
      className={className}
      href={renderedHref}
      aria-label={ariaLabel}
      data-reveal={dataReveal || undefined}
      onClick={navigate}
    >
      {children}
    </Link>
  );
}
