# `noPlaywrightMissingAwait` false positives on React Testing Library + jest-dom matchers

## Environment

```
CLI:
  Version:                      2.4.2
  Color support:                true

Platform:
  CPU Architecture:             x86_64
  OS:                           linux

Environment:
  BIOME_LOG_PATH:                    unset
  BIOME_LOG_PREFIX_NAME:             unset
  BIOME_LOG_LEVEL:                   unset
  BIOME_LOG_KIND:                    unset
  BIOME_CONFIG_PATH:                 unset
  BIOME_THREADS:                     unset
  BIOME_WATCHER_KIND:                unset
  BIOME_WATCHER_POLLING_INTERVAL:    unset
  NO_COLOR:                     unset
  TERM:                         xterm-256color
  JS_RUNTIME_VERSION:           v25.6.1
  JS_RUNTIME_NAME:              node
  NODE_PACKAGE_MANAGER:         npm/11.10.0

Biome Configuration:
  Status:                       Loaded successfully
  Path:                         biome.json
  Formatter enabled:            true
  Linter enabled:               true
  Assist enabled:               true
  VCS enabled:                  false
  HTML full support enabled:    unset

Workspace:
  Open Documents:               0
```

## Description

The `nursery/noPlaywrightMissingAwait` rule produces **false positives** on projects that use **React Testing Library** with **jest-dom** (or Vitest with `@testing-library/jest-dom`).

The root cause is that `ASYNC_PLAYWRIGHT_MATCHERS` (the internal list the rule uses to identify Playwright async matchers) contains matcher names that **also exist in jest-dom as synchronous matchers**. The rule only checks the matcher name on an `expect()` call — it does not distinguish between Playwright's async `expect` and Vitest/Jest's synchronous `expect`.

### Overlapping matchers (12 total)

The following matchers appear in **both** `ASYNC_PLAYWRIGHT_MATCHERS` and `@testing-library/jest-dom`:

| Matcher | Playwright (async) | jest-dom (sync) |
|---|---|---|
| `toBeChecked` | ✅ | ✅ |
| `toBeDisabled` | ✅ | ✅ |
| `toBeEmpty` | ✅ | ✅ (deprecated) |
| `toBeEnabled` | ✅ | ✅ |
| `toBeVisible` | ✅ | ✅ |
| `toHaveAccessibleDescription` | ✅ | ✅ |
| `toHaveAccessibleErrorMessage` | ✅ | ✅ |
| `toHaveAccessibleName` | ✅ | ✅ |
| `toHaveAttribute` | ✅ | ✅ |
| `toHaveClass` | ✅ | ✅ |
| `toHaveRole` | ✅ | ✅ |
| `toHaveValue` | ✅ | ✅ |

## How to reproduce

A minimal reproduction repository is available at: **https://github.com/THernandez03/biome-noPlaywrightMissingAwait**

### Setup

```bash
git clone https://github.com/THernandez03/biome-noPlaywrightMissingAwait.git
cd biome-noPlaywrightMissingAwait
npm install
```

### `biome.json`

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.2/schema.json",
  "linter": {
    "enabled": true,
    "domains": {
      "playwright": "all"
    },
    "rules": {
      "recommended": false,
      "nursery": {
        "noPlaywrightMissingAwait": "error"
      }
    }
  }
}
```

### Run the linter

```bash
npx biome lint e2e/ tests/
```

### Result

The rule reports **24 errors**: 12 in `e2e/` (correct) and 12 in `tests/` (false positives).

#### `e2e/playwright-missing-await.spec.ts` — ✅ Correctly flagged

These are real Playwright tests using `@playwright/test`'s async `expect`. The matchers are intentionally **not** awaited, so the rule correctly flags them.

```ts
import { expect, type Page, test } from "@playwright/test";

test("toBeVisible", ({ page }) => {
  // Missing await — rule correctly flags this
  expect(page.locator("button")).toBeVisible();
});
```

#### `tests/rtl-jest-dom.spec.tsx` — ❌ False positives

These are React Testing Library tests using `vitest` + `@testing-library/jest-dom`. The matchers are **synchronous** — no `await` is needed. Yet the rule flags every single one:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

test("toBeVisible", () => {
  render(<Widget />);
  // jest-dom's toBeVisible is synchronous — no await needed
  // But Biome flags this as: "Async matcher toBeVisible must be awaited or returned."
  expect(screen.getByRole("button")).toBeVisible();
});
```

## Expected behavior

The rule should **only flag** matchers when the `expect` originates from `@playwright/test`. When `expect` is imported from `vitest`, `jest`, or any non-Playwright source, the rule should **not** fire — even if the matcher name matches one in `ASYNC_PLAYWRIGHT_MATCHERS`.

Possible approaches:
1. **Check the import source** of `expect` — only flag when it comes from `@playwright/test`.
2. **Check the file path** — skip files outside the Playwright test directory (e.g., not matching the Playwright `testDir` pattern).
3. **Respect domain scoping** — if a file doesn't belong to the `playwright` domain, don't apply the rule to it.

## Additional context

- The `noPlaywrightMissingAwait` rule was introduced in Biome **2.4.2** (nursery).
- The overlap affects any project that uses **both** Playwright (e2e tests) and jest-dom (unit/integration tests) in the same repository, which is a very common setup.
- The jest-dom matchers listed above are all **synchronous** — they return `void`, not a `Promise`. Adding `await` to them is unnecessary and misleading.
