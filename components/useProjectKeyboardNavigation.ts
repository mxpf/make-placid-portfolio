"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { withBasePath } from "@/lib/base-path";

type NavigationItem = { slug: string } | null;

export function useProjectKeyboardNavigation({
  disabled,
  previousProject,
  nextProject,
}: {
  disabled: boolean;
  previousProject: NavigationItem;
  nextProject: NavigationItem;
}) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (disabled) return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target !== document.body && target.closest("a, button, input, textarea, select, video, iframe, [contenteditable='true'], [role='button'], [role='slider']")) return;

      if (event.key === "ArrowLeft" && previousProject) {
        event.preventDefault();
        router.push(withBasePath(`/projects/${previousProject.slug}`));
      } else if (event.key === "ArrowRight" && nextProject) {
        event.preventDefault();
        router.push(withBasePath(`/projects/${nextProject.slug}`));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disabled, nextProject, previousProject, router]);
}
