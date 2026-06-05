import { test, expect } from "@playwright/test";

/** E2E for the enterprise inquiry — success only when the API accepts it. */

test("enterprise request confirms on success", async ({ page }) => {
  await page.route("**/api/enterprise", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) })
  );

  await page.goto("/enterprise");
  await page.getByLabel("Name", { exact: true }).fill("Dana Lee");
  await page.getByLabel("Work email").fill("dana@acme.com");
  await page.getByLabel("Company", { exact: true }).fill("Acme Corp");
  await page.getByRole("button", { name: "Request access" }).click();

  await expect(page.getByText("Got it.")).toBeVisible();
});

test("enterprise request shows an error (no fake success) on failure", async ({ page }) => {
  await page.route("**/api/enterprise", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Couldn't save your request right now." }),
    })
  );

  await page.goto("/enterprise");
  await page.getByLabel("Name", { exact: true }).fill("Dana Lee");
  await page.getByLabel("Work email").fill("dana@acme.com");
  await page.getByLabel("Company", { exact: true }).fill("Acme Corp");
  await page.getByRole("button", { name: "Request access" }).click();

  await expect(page.getByText(/Couldn't save your request/)).toBeVisible();
  await expect(page.getByText("Got it.")).toHaveCount(0);
});
