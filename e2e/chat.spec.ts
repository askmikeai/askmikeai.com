import { test, expect } from "@playwright/test";

/**
 * E2E for the home pain-point form + optional AI assist.
 *
 * /api/chat is mocked with canned SSE in the shape the client parses
 * (`data: {"content": "..."}` / `data: {"profile": {...}}`, ended by `[DONE]`),
 * so the AI-assist tests are deterministic and free.
 */

const PROBLEM_PLACEHOLDER = "Describe your pain point…";

function sse(parts: Array<Record<string, unknown>>): string {
  return parts.map((p) => `data: ${JSON.stringify(p)}\n\n`).join("") + `data: [DONE]\n\n`;
}

test("typing a pain point enables the Back the build button", async ({ page }) => {
  await page.goto("/");

  const locked = page.getByRole("button", { name: "Describe your pain point to continue" });
  await expect(locked).toBeVisible();
  await expect(locked).toBeDisabled();

  await page.getByPlaceholder(PROBLEM_PLACEHOLDER).fill("I waste hours reconciling invoices.");

  await expect(page.getByRole("button", { name: /Back the build —/ })).toBeEnabled();
});

test("the AI magic button fills the form and unlocks the pledge", async ({ page }) => {
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status: 200,
      headers: { "content-type": "text/event-stream" },
      body: sse([
        { content: "Got it — that sounds painful." },
        { profile: { problem: "manual invoicing eats the week" } },
      ]),
    })
  );

  await page.goto("/");
  await page.getByRole("button", { name: /Describe it with AI/ }).click();

  const aiInput = page.getByPlaceholder(/lose hours each week/);
  await aiInput.fill("I lose hours every week reconciling invoices.");
  await page.getByRole("button", { name: "Send" }).click();

  // The problem field gets filled and the pledge unlocks.
  await expect(page.getByPlaceholder(PROBLEM_PLACEHOLDER)).toHaveValue("manual invoicing eats the week");
  await expect(page.getByRole("button", { name: /Back the build —/ })).toBeEnabled();
});

test("the AI assist surfaces the graceful fallback on a 503", async ({ page }) => {
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        error: "LLM service unavailable",
        fallback: true,
        message: "Chat isn't connected yet. Reach out to Mike directly.",
      }),
    })
  );

  await page.goto("/");
  await page.getByRole("button", { name: /Describe it with AI/ }).click();
  await page.getByPlaceholder(/lose hours each week/).fill("Testing the fallback path.");
  await page.getByRole("button", { name: "Send" }).click();

  await expect(page.getByText("Chat isn't connected yet. Reach out to Mike directly.")).toBeVisible();
});
