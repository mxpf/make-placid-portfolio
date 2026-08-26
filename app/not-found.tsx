import type { Metadata } from "next";
import { TransitionLink } from "@/components/TransitionLink";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="not-found-layout">
      <section className="not-found-copy" aria-labelledby="not-found-title">
        <h1 id="not-found-title">404 — Page not found.</h1>
        <TransitionLink className="not-found-link" href="/">
          Return to selected projects.
        </TransitionLink>
      </section>
    </main>
  );
}

