import { test, expect } from "@playwright/test";

/**
 * End-to-end tests for the home-page chat box + pledge gating.
 *
 * /api/chat is mocked with canned SSE in the shape the client parses
 * (`data: {"content": "..."}` and `data: {"profile": {...}}`, terminated by
 * `data: [DONE]`). This keeps the tests deterministic and free — they exercise
 * the full UI path without calling the real LLM provider.
 */

const PLACEHOLDER = "Describe your pain point…";

function sse(parts: Array<Record<string, unknown>>): string {
  return parts.map((p) => `data: ${JSON.stringify(p)}\n\n`).join("") + `data: [DONE]\n\n`;
}

test("chat box sends a message and renders the streamed reply", async ({ page }) => {
  const replyParts = ["That sounds ", "genuinely frustrating — ", "tell me more."];
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status: 200,
      headers: { "content-type": "text/event-stream" },
      body: sse(replyParts.map((content) => ({ content }))),
    })
  );

  await page.goto("/");
  const input = page.getByPlaceholder(PLACEHOLDER);
  await expect(input).toBeVisible();
  await input.fill("I waste hours every week on manual invoicing.");
  await input.press("Enter");

  await expect(page.getByText("I waste hours every week on manual invoicing.")).toBeVisible();
  await expect(page.getByText(replyParts.join(""))).toBeVisible();
});

test("pledge button is locked until the chat collects the full profile", async ({ page }) => {
  await page.goto("/");

  // Locked initially.
  const lockedBtn = page.getByRole("button", { name: "Answer a few questions to unlock" });
  await expect(lockedBtn).toBeVisible();
  await expect(lockedBtn).toBeDisabled();

  // Reply that also returns a COMPLETE validation profile.
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status: 200,
      headers: { "content-type": "text/event-stream" },
      body: sse([
        { content: "Perfect — that's everything I need." },
        {
          profile: {
            name: "Sam",
            email: "sam@acme.com",
            company: "Acme",
            role: "Ops Lead",
            problem: "manual invoicing eats the week",
            frequency: "weekly",
            cost: "~5 hours/week",
          },
        },
      ]),
    })
  );

  const input = page.getByPlaceholder(PLACEHOLDER);
  await input.fill("Here are all my details.");
  await input.press("Enter");

  // Button unlocks and switches to the pledge CTA.
  const unlocked = page.getByRole("button", { name: /Back the build —/ });
  await expect(unlocked).toBeEnabled();
});

test("chat box surfaces the graceful fallback on a 503", async ({ page }) => {
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
  const input = page.getByPlaceholder(PLACEHOLDER);
  await input.fill("Testing the fallback path.");
  await input.press("Enter");

  await expect(page.getByText("Chat isn't connected yet. Reach out to Mike directly.")).toBeVisible();
});
