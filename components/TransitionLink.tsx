"use client";

import type { MouseEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { withBasePath } from "@/lib/base-path";

export function TransitionLink({
  href,
  className,
  children,
  ariaLabel,
  beforeNavigate,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  beforeNavigate?: () => void;
}) {
  const router = useRouter();
  const renderedHref = withBasePath(href);

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
    if (window.location.pathname === renderedHref) {
      window.scrollTo({ top: 0 });
      return;
    }

    document.body.classList.add("page-leaving");
    window.setTimeout(() => router.push(href), 180);
  }

  return (
    <a className={className} href={renderedHref} aria-label={ariaLabel} onClick={navigate}>
      {children}
    </a>
  );
}
