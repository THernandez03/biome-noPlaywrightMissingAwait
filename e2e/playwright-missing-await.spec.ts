/**
 * Playwright test fixture using the 12 matchers that overlap with jest-dom.
 *
 * Every `expect(locator).toXxx()` call below is intentionally NOT awaited.
 * Biome's `noPlaywrightMissingAwait` rule SHOULD flag these — this is
 * correct behaviour because Playwright matchers are async.
 */
import { expect, type Page, test } from "@playwright/test";

// ── helpers ──────────────────────────────────────────────────────────
const checkbox = (page: Page) => page.locator('input[type="checkbox"]');
const button = (page: Page) => page.locator("button");
const input = (page: Page) => page.locator("input");
const container = (page: Page) => page.locator("#container");

// ── tests ────────────────────────────────────────────────────────────
test.describe("overlapping matchers — Playwright (correctly flagged)", () => {
	test("toBeChecked", async ({ page }) => {
		await expect(checkbox(page)).toBeChecked();
	});

	test("toBeDisabled", async ({ page }) => {
		await expect(button(page)).toBeDisabled();
	});

	test("toBeEmpty", async ({ page }) => {
		await expect(container(page)).toBeEmpty();
	});

	test("toBeEnabled", async ({ page }) => {
		await expect(button(page)).toBeEnabled();
	});

	test("toBeVisible", async ({ page }) => {
		await expect(button(page)).toBeVisible();
	});

	test("toHaveAccessibleDescription", async ({ page }) => {
		await expect(input(page)).toHaveAccessibleDescription("helper text");
	});

	test("toHaveAccessibleErrorMessage", async ({ page }) => {
		await expect(input(page)).toHaveAccessibleErrorMessage("required");
	});

	test("toHaveAccessibleName", async ({ page }) => {
		await expect(input(page)).toHaveAccessibleName("Username");
	});

	test("toHaveAttribute", async ({ page }) => {
		await expect(input(page)).toHaveAttribute("type", "text");
	});

	test("toHaveClass", async ({ page }) => {
		await expect(button(page)).toHaveClass("btn-primary");
	});

	test("toHaveRole", async ({ page }) => {
		await expect(button(page)).toHaveRole("button");
	});

	test("toHaveValue", async ({ page }) => {
		await expect(input(page)).toHaveValue("hello");
	});
});
