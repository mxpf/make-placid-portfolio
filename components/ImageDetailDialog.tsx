"use client";

import type { ReactNode, RefObject } from "react";
import { useEffect, useRef } from "react";

export function ImageDetailDialog({
  children,
  scrollerRef,
  onClose,
  onPrevious,
  onNext,
  currentIndex,
  total,
}: {
  children: ReactNode;
  scrollerRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  currentIndex: number;
  total: number;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus({ preventScroll: true });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "Tab") {
        const focusable = Array.from(
          scrollerRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])") ?? [],
        ).filter((element) => !element.hidden);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable.at(-1) ?? first;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      } else if (event.key === "ArrowLeft" && onPrevious) {
        event.preventDefault();
        onPrevious();
      } else if (event.key === "ArrowRight" && onNext) {
        event.preventDefault();
        onNext();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, onNext, onPrevious, scrollerRef]);

  return (
    <div className="detail-layer" ref={scrollerRef} role="dialog" aria-modal="true" aria-label="Image detail" tabIndex={-1}>
      <button className="detail-close-control" type="button" onClick={onClose} ref={closeButton}>
        Close
      </button>
      <div className="detail-navigation" aria-label="Image detail navigation">
        <button type="button" onClick={onPrevious} disabled={!onPrevious} aria-label="Previous image">
          Previous
        </button>
        <p aria-live="polite" aria-atomic="true">{currentIndex} of {total}</p>
        <button type="button" onClick={onNext} disabled={!onNext} aria-label="Next image">
          Next
        </button>
      </div>
      <button className="detail-close" type="button" onClick={onClose} aria-label="Close image detail">
        {children}
      </button>
    </div>
  );
}
