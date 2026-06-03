import { test, expect } from "@playwright/test";

/**
 * End-to-end test for the home-page chat box.
 *
 * The /api/chat route is mocked with a canned SSE stream in the shape the
 * client parses (`data: {"content": "..."}` lines, terminated by `data: [DONE]`).
 * This keeps the test deterministic and free — it exercises the full UI path
 * (typing → request → streamed render) without calling the real LLM provider.
 */
test("chat box sends a message and renders the streamed reply", async ({ page }) => {
  const replyParts = ["That sounds ", "genuinely frustrating — ", "tell me more."];
  const fullReply = replyParts.join("");

  await page.route("**/api/chat", async (route) => {
    const body =
      replyParts.map((p) => `data: ${JSON.stringify({ content: p })}\n\n`).join("") +
      `data: [DONE]\n\n`;
    await route.fulfill({
      status: 200,
      headers: { "content-type": "text/event-stream" },
      body,
    });
  });

  await page.goto("/");

  const input = page.getByPlaceholder("Describe your pain point…");
  await expect(input).toBeVisible();
  await input.fill("I waste hours every week on manual invoicing.");
  await input.press("Enter");

  // The user's message echoes into the transcript…
  await expect(page.getByText("I waste hours every week on manual invoicing.")).toBeVisible();
  // …and the mocked assistant reply streams in and renders fully.
  await expect(page.getByText(fullReply)).toBeVisible();
});

test("chat box surfaces the graceful fallback on a 503", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        error: "LLM service unavailable",
        fallback: true,
        message: "Chat isn't connected yet. Reach out to Mike directly.",
      }),
    });
  });

  await page.goto("/");
  const input = page.getByPlaceholder("Describe your pain point…");
  await input.fill("Testing the fallback path.");
  await input.press("Enter");

  await expect(page.getByText("Chat isn't connected yet. Reach out to Mike directly.")).toBeVisible();
});
