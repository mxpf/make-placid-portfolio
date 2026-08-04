"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    if (window.location.pathname === href) {
      window.scrollTo({ top: 0 });
      return;
    }

    document.body.classList.add("page-leaving");
    window.setTimeout(() => router.push(href, { scroll: true }), 180);
  }

  return (
    <Link className={className} href={href} aria-label={ariaLabel} onClick={navigate}>
      {children}
    </Link>
  );
}
