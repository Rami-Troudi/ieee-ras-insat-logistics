import { test, expect } from "@playwright/test";

test.describe("Board & Superadmin Complete Operational Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to board
    await page.goto("/board");
  });

  test("Journey 1: Action Center triage -> Review borrow request", async ({ page }) => {
    // 1. Action Center renders operational widgets
    await expect(page.getByRole("heading", { name: "Logistics Action Center" })).toBeVisible();
    await expect(page.getByText(/Unified operational triage queue/i)).toBeVisible();

    // 2. Navigate to Board Requests Queue via sidebar
    await page.getByRole("link", { name: "Requests", exact: true }).click();
    await expect(page).toHaveURL(/\/board\/requests/);
    await expect(page.getByRole("heading", { name: "Borrow Requests & Approvals" })).toBeVisible();

    // 3. Select pending request REQ-2026-0155 for line-item review
    const reqLink = page.locator('a[href*="REQ-2026-0155"]').first();
    await reqLink.click();
    await expect(page).toHaveURL(/\/board\/requests\/REQ-2026-0155/);
    await expect(page.getByRole("heading", { name: /Request REQ-2026-0155/i })).toBeVisible();
    await expect(page.getByText(/Borrower Dossier/i)).toBeVisible();
  });

  test("Journey 2: Loan management -> Return intake inspection", async ({ page }) => {
    // 1. Navigate to Loans
    await page.getByRole("link", { name: "Loans", exact: true }).click();
    await expect(page).toHaveURL(/\/board\/loans/);
    await expect(
      page.getByRole("heading", { name: "Active Loans & Custodial Tracking" })
    ).toBeVisible();

    // 2. Select loan LN-2026-0089
    const loanLink = page.locator('a[href*="LN-2026-0089"]').first();
    await loanLink.click();
    await expect(page).toHaveURL(/\/board\/loans\/LN-2026-0089/);
    await expect(page.getByRole("heading", { name: /Loan LN-2026-0089/i })).toBeVisible();
    await expect(page.getByText(/Borrower Dossier/i)).toBeVisible();
  });

  test("Journey 3: Inventory management -> Item mutation & Event ledger", async ({ page }) => {
    // 1. Navigate to Inventory
    await page.getByRole("link", { name: "Inventory", exact: true }).click();
    await expect(page).toHaveURL(/\/board\/inventory/);
    await expect(page.getByRole("heading", { name: "Board Inventory Operations" })).toBeVisible();

    // 2. Search for STM32
    const searchInput = page.getByPlaceholder(/Search by name/i);
    await searchInput.fill("STM32");
    await expect(page.getByText("STM32F401RE Nucleo-64")).toBeVisible();

    // 3. Click detail link
    const itemLink = page.locator('a[href*="item-stm32-f4"]').first();
    await itemLink.click();
    await expect(page).toHaveURL(/\/board\/inventory\/item-stm32-f4/);
    await expect(page.getByRole("heading", { name: "STM32F401RE Nucleo-64" })).toBeVisible();
  });

  test("Journey 4: Semester Physical Audits & Discrepancy Reconciliation", async ({ page }) => {
    // 1. Navigate to Audits
    await page.getByRole("link", { name: "Audits", exact: true }).click();
    await expect(page).toHaveURL(/\/board\/audits/);
    await expect(page.getByRole("heading", { name: "Physical Inventory Audits" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Start Semester Audit/i })).toBeVisible();
  });

  test("Journey 5: Disciplinary Incidents & Strike Sanctions", async ({ page }) => {
    // 1. Navigate to Incidents
    await page.getByRole("link", { name: "Incidents", exact: true }).click();
    await expect(page).toHaveURL(/\/board\/incidents/);
    await expect(
      page.getByRole("heading", { name: "Incidents, Strikes & Sanctions" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Recommendations/i })).toBeVisible();
  });

  test("Journey 6: Operational Insights Analytics & Export Center", async ({ page }) => {
    // 1. Navigate to Insights
    await page.getByRole("link", { name: "Insights", exact: true }).click();
    await expect(page).toHaveURL(/\/board\/insights/);
    await expect(
      page.getByRole("heading", { name: "Logistics Insights & Telemetry" })
    ).toBeVisible();
    await expect(page.getByText(/Total Items/i)).toBeVisible();

    // 2. Navigate to Exports
    await page.getByRole("link", { name: "Exports", exact: true }).click();
    await expect(page).toHaveURL(/\/board\/exports/);
    await expect(page.getByRole("heading", { name: "CSV Data Exports" })).toBeVisible();
    await expect(page.getByText(/Master Inventory Catalog/i)).toBeVisible();
  });
});
