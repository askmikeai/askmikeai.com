import { test, expect } from "@playwright/test";

/** E2E for Let's Connect — success only when the CRM write succeeds. */

test("Let's Connect saves and confirms on success", async ({ page }) => {
  await page.route("**/api/connect", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) })
  );

  await page.goto("/lets-connect");
  await page.getByLabel("Name").fill("Sam Rivera");
  await page.getByLabel("Email", { exact: true }).fill("sam@acme.io");
  await page.getByRole("button", { name: "Let's connect" }).click();

  await expect(page.getByText("You're in.")).toBeVisible();
});

test("Let's Connect shows an error (no fake success) when the write fails", async ({ page }) => {
  await page.route("**/api/connect", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Couldn't save your details right now." }),
    })
  );

  await page.goto("/lets-connect");
  await page.getByLabel("Name").fill("Sam Rivera");
  await page.getByLabel("Email", { exact: true }).fill("sam@acme.io");
  await page.getByRole("button", { name: "Let's connect" }).click();

  await expect(page.getByText(/Couldn't save your details/)).toBeVisible();
  await expect(page.getByText("You're in.")).toHaveCount(0);
});
