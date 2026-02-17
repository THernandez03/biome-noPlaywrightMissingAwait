/**
 * React Testing Library + jest-dom fixture using the 12 matchers that
 * overlap with Playwright's ASYNC_PLAYWRIGHT_MATCHERS.
 *
 * None of these calls need `await` — jest-dom matchers are synchronous.
 * Yet Biome's `noPlaywrightMissingAwait` rule flags every single one
 * as a false positive because it only checks the matcher name, not the
 * import source.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

// ── minimal component under test ─────────────────────────────────────
function Widget() {
	return (
		<form>
			<label htmlFor="username">
				Username
				<input
					id="username"
					type="text"
					role="textbox"
					defaultValue="hello"
					className="input-primary"
					aria-describedby="helper"
					aria-errormessage="err"
				/>
			</label>

			<span id="helper">helper text</span>
			<span id="err" role="alert">
				required
			</span>

			<div id="container" />

			<button type="submit" className="btn-primary" disabled>
				Submit
			</button>

			<input type="checkbox" defaultChecked aria-label="Accept terms" />
		</form>
	);
}

// ── tests ─────────────────────────────────────────────────────────────
describe("overlapping matchers — RTL + jest-dom (false positives)", () => {
	test("toBeChecked", () => {
		render(<Widget />);
		expect(screen.getByLabelText("Accept terms")).toBeChecked();
	});

	test("toBeDisabled", () => {
		render(<Widget />);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	test("toBeEmpty", () => {
		render(<Widget />);
		// jest-dom's toBeEmpty is deprecated in favour of toBeEmptyDOMElement,
		// but it still exists and triggers the false positive.
		expect(document.getElementById("container")).toBeEmpty();
	});

	test("toBeEnabled", () => {
		render(<Widget />);
		expect(screen.getByLabelText("Accept terms")).toBeEnabled();
	});

	test("toBeVisible", () => {
		render(<Widget />);
		expect(screen.getByRole("button")).toBeVisible();
	});

	test("toHaveAccessibleDescription", () => {
		render(<Widget />);
		expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
			"helper text",
		);
	});

	test("toHaveAccessibleErrorMessage", () => {
		render(<Widget />);
		expect(screen.getByRole("textbox")).toHaveAccessibleErrorMessage(
			"required",
		);
	});

	test("toHaveAccessibleName", () => {
		render(<Widget />);
		expect(screen.getByRole("textbox")).toHaveAccessibleName("Username");
	});

	test("toHaveAttribute", () => {
		render(<Widget />);
		expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");
	});

	test("toHaveClass", () => {
		render(<Widget />);
		expect(screen.getByRole("button")).toHaveClass("btn-primary");
	});

	test("toHaveRole", () => {
		render(<Widget />);
		expect(screen.getByRole("textbox")).toHaveRole("textbox");
	});

	test("toHaveValue", () => {
		render(<Widget />);
		expect(screen.getByRole("textbox")).toHaveValue("hello");
	});
});
