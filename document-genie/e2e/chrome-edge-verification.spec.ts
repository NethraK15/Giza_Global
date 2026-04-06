import { expect, test } from "../playwright-fixture";

test.describe("Roadmap browser verification flows", () => {
  test("public pages load", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Turn Documents into Structured Data/i })).toBeVisible();

    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: /Simple, transparent pricing/i })).toBeVisible();

    await page.goto("/about");
    await expect(page.getByRole("heading", { name: /Making document processing effortless/i })).toBeVisible();
  });

  test("auth flow works", async ({ page }) => {
    await page.goto("/auth/login");

    await page.getByLabel("Email").fill("demo@giza.ai");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: /^Dashboard$/i })).toBeVisible();
  });

  test("upload flow works", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("document-genie-token", "user-demo-1");
    });

    await page.goto("/dashboard/upload");

    const uploadInput = page.locator("input[type='file']");
    await uploadInput.setInputFiles({
      name: "diagram.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake-image-content"),
    });

    await expect(page.getByRole("heading", { name: /Upload Successful!/i })).toBeVisible();
  });

  test("status polling page renders and refresh is available", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("document-genie-token", "user-demo-1");
    });

    await page.goto("/dashboard/jobs");

    await expect(page.getByRole("heading", { name: /Job Status/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Refresh/i })).toBeVisible();
    await expect(page.getByText(/Polling|Up to date/i)).toBeVisible();
  });

  test("results rendering and download actions", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("document-genie-token");
    });

    await page.goto("/dashboard/results");

    await page.getByRole("button", { name: /invoice_march_2026\.pdf/i }).click();
    await expect(page.getByText(/Graph Panel/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /JSON/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /CSV/i })).toBeVisible();
  });

  test("plan limit messaging and billing status", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("document-genie-token", "user-demo-1");
      localStorage.setItem(
        "document-genie-usage",
        JSON.stringify({ used: 5, limit: 5, plan: "free", window: "daily" })
      );
    });

    await page.goto("/dashboard/billing");

    await expect(page.getByText(/You\'re running low on uploads/i)).toBeVisible();
    await page.getByRole("button", { name: /^Upgrade to Paid$/i }).click();
    await expect(page.getByRole("button", { name: /Current Plan Active/i })).toBeVisible();
  });
});
