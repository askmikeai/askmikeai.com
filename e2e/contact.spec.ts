import { test, expect } from "@playwright/test";

/** E2E for the contact form — it must only show success when the API succeeds. */

test("contact form shows success only when the API accepts it", async ({ page }) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) })
  );

  await page.goto("/contact");
  await page.getByLabel("Name").fill("Sam Rivera");
  await page.getByLabel("Email").fill("sam@acme.io");
  await page.getByLabel("Message").fill("I lose hours reconciling invoices each week.");
  await page.getByRole("button", { name: "Send Message" }).click();

  await expect(page.getByText("Thank you for reaching out!")).toBeVisible();
});

test("contact form surfaces an error (no fake success) when the API fails", async ({ page }) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Messaging isn't configured yet." }),
    })
  );

  await page.goto("/contact");
  await page.getByLabel("Name").fill("Sam Rivera");
  await page.getByLabel("Email").fill("sam@acme.io");
  await page.getByLabel("Message").fill("Testing the failure path.");
  await page.getByRole("button", { name: "Send Message" }).click();

  await expect(page.getByText(/Messaging isn't configured yet\./)).toBeVisible();
  await expect(page.getByText("Thank you for reaching out!")).toHaveCount(0);
});
