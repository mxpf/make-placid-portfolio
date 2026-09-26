import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("core pages have no automatically detectable accessibility violations", async ({ page }) => {
  test.setTimeout(60_000);
  for (const path of ["/", "/about/", "/projects/project-03/", "/missing/"]) {
    await page.goto(path);
    await expect(page.locator("body")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, `${path}: ${results.violations.map((item) => item.id).join(", ")}`).toEqual([]);
  }
});

test("image detail traps focus, supports arrows, and restores its trigger", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "Detail mode is intentionally desktop-only");
  await page.goto("/projects/project-03/");
  const trigger = page.getByRole("button", { name: /Open detail view:/ }).first();
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Image detail" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Close", exact: true })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Close image detail" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Close", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(dialog.locator("img")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
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
