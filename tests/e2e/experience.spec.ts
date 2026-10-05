import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("core pages have no automatically detectable accessibility violations", async ({ page }) => {
  test.setTimeout(60_000);
  for (const path of ["/", "/about/", "/projects/project-03/", "/missing/"]) {
    await page.goto(path);
    await expect(page.locator("body")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations, `${path}: ${results.violations.map((item) => item.id).join(", ")}`).toEqual([]);
  }
});

test("theme toggle switches palettes and persists across navigation", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Toggle color theme" });
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("link", { name: "About & contact" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("content links use underlined body copy color in both themes", async ({ page }) => {
  await page.goto("/projects/project-03/");
  const link = page.getByRole("link", { name: "Visit the example project link" });

  for (const theme of ["light", "dark"] as const) {
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect.poll(() => link.evaluate((element) => ({
      linkColor: getComputedStyle(element).color,
      paragraphColor: getComputedStyle(element.parentElement!).color,
    }))).toEqual(expect.objectContaining({
      linkColor: theme === "light" ? "rgb(71, 65, 53)" : "rgb(175, 173, 166)",
      paragraphColor: theme === "light" ? "rgb(71, 65, 53)" : "rgb(175, 173, 166)",
    }));
    const decoration = await link.evaluate((element) => getComputedStyle(element).textDecorationLine);
    expect(decoration).toContain("underline");

    if (theme === "light") {
      await page.getByRole("button", { name: "Toggle color theme" }).click();
    }
  }
});

test("nested lists preserve parent, sibling, and following-item hierarchy", async ({ page }) => {
  await page.goto("/projects/project-03/");
  const summary = page.locator(".project-summary-body");
  await summary.evaluate((element) => {
    element.insertAdjacentHTML(
      "beforeend",
      '<ul data-spacing-fixture><li><span>Parent item</span><ul><li>Nested one</li><li>Nested two</li></ul></li><li>Following item</li></ul>',
    );
  });

  const spacing = await summary.locator("[data-spacing-fixture]").evaluate((list) => {
    const parent = list.children[0] as HTMLLIElement;
    const nested = parent.querySelector(":scope > ul")!;
    const nestedSibling = nested.children[1];
    const following = list.children[1];
    return {
      parentToNested: getComputedStyle(nested).marginTop,
      nestedSibling: getComputedStyle(nestedSibling).marginTop,
      nestedToFollowing: getComputedStyle(following).marginTop,
    };
  });

  expect(spacing).toEqual({
    parentToNested: "4px",
    nestedSibling: "6px",
    nestedToFollowing: "18px",
  });
});

test("image detail traps focus, exposes navigation, and restores its trigger", async ({ page }) => {
  await page.goto("/projects/project-03/");
  const trigger = page.getByRole("button", { name: /Open detail view:/ }).first();
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Image detail" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Close", exact: true })).toBeFocused();
  await expect(page.getByText(/1 of \d+/)).toBeVisible();
  const next = page.getByRole("button", { name: "Next image" });
  await expect(next).toBeEnabled();
  await next.click();
  await expect(page.getByText(/2 of \d+/)).toBeVisible();
  await expect(dialog.locator("img")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("visible project navigation changes routes", async ({ page }) => {
  await page.goto("/projects/project-03/");
  await page.getByRole("link", { name: /Next —/ }).click();
  await expect(page).toHaveURL(/\/projects\/project-04\/?$/);
  await page.getByRole("link", { name: /Previous —/ }).click();
  await expect(page).toHaveURL(/\/projects\/project-03\/?$/);
});

test("About closes back to the previous homepage position", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, Math.min(document.body.scrollHeight, 900)));
  const before = await page.evaluate(() => window.scrollY);
  await page.getByRole("link", { name: "About & contact" }).click();
  await expect(page).toHaveURL(/\/about\/$/);
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(Math.max(0, before - 2));
});

test("video embeds load only after an explicit action", async ({ page }) => {
  await page.goto("/projects/project-03/");
  await expect(page.locator("iframe.youtube-frame")).toHaveCount(0);
  await page.getByRole("button", { name: /Play I Am Easy To Find/ }).click();
  await expect(page.locator("iframe.youtube-frame")).toHaveAttribute("src", /youtube-nocookie\.com/);
  await expect(page.locator("iframe.youtube-frame")).toHaveAttribute("src", /autoplay=1/);
});

test("mobile layouts do not overflow horizontally", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "Mobile-only reflow assertion");
  for (const path of ["/", "/about/", "/projects/project-03/"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${path} has horizontal overflow`).toBeLessThanOrEqual(1);
  }
});

test("project arrows do not override focused media controls", async ({ page }) => {
  await page.goto("/projects/project-03/");
  const control = page.getByRole("button", { name: "Play Hosted motion study" });
  await control.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/\/projects\/project-03\/$/);
});

test("homepage eagerly loads only its lead thumbnail", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("img[fetchpriority='high']")).toHaveCount(1);
});

test("About publishes route-specific social metadata", async ({ page }) => {
  await page.goto("/about/");
  await expect(page.locator("meta[property='og:url']")).toHaveAttribute("content", /\/about\/$/);
  await expect(page.locator("meta[property='og:title']")).toHaveAttribute("content", /About & contact/);
});
