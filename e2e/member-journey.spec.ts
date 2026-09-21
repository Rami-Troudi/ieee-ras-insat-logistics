import { test, expect } from "@playwright/test";

test.describe("Member Complete Logistics Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Member app root
    await page.goto("/app");
  });

  test("Journey 1: Equipment discovery -> Cart -> Request submission -> Request detail view", async ({
    page,
  }) => {
    // 1. Home has live dynamic metrics
    await expect(page.getByRole("heading", { name: /Welcome/i })).toBeVisible();
    await expect(page.getByText("Quick Operational Actions")).toBeVisible();

    // 2. Click Browse Equipment
    await page
      .getByRole("link", { name: /Browse Equipment/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/app\/inventory/);
    await expect(page.getByRole("heading", { name: "Equipment Inventory" })).toBeVisible();

    // 3. Search and filter items
    const searchInput = page.getByPlaceholder(/Search by name/i);
    await searchInput.fill("STM32");
    await expect(page.getByText("STM32F401RE Nucleo-64")).toBeVisible();

    // 4. Click Details of STM32
    await page
      .getByRole("link", { name: /Details/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/app\/inventory\/item-stm32-f4/);
    await expect(page.getByRole("heading", { name: "STM32F401RE Nucleo-64" })).toBeVisible();
    await expect(page.getByText("Technical Specifications")).toBeVisible();

    // 5. Add to cart from detail page
    const addToCartBtn = page.getByRole("button", { name: /Add.*to Borrow Cart/i });
    await addToCartBtn.click();
    await expect(page.getByRole("button", { name: /Update in Cart/i })).toBeVisible();

    // 6. Navigate to cart via link in TopBar
    await page.getByRole("link", { name: /View Borrow Cart/i }).click();
    await expect(page).toHaveURL(/\/app\/cart/);
    await expect(page.getByRole("heading", { name: "Borrow Request Cart" })).toBeVisible();
    await expect(page.getByText("STM32F401RE Nucleo-64")).toBeVisible();

    // 7. Fill in purpose and submit
    const purposeTextarea = page.getByPlaceholder(/Explain the technical activity/i);
    await purposeTextarea.fill("Autonomous rover CAN-bus motor control profiling for cup.");

    const submitBtn = page.getByRole("button", { name: /Submit Borrow Request/i });
    await submitBtn.click();

    // 8. Redirected to request detail page
    await expect(page).toHaveURL(/\/app\/requests\/REQ-2026-/);
    await expect(page.getByRole("heading", { name: "Borrow Request Summary" })).toBeVisible();
    await expect(page.getByText("Line Item Decision Breakdown")).toBeVisible();
    await expect(page.getByText("Request Activity Timeline")).toBeVisible();
  });

  test("Journey 2: Inspect partial approval and 48-hour collection window", async ({ page }) => {
    // Navigate directly to seeded partially approved request REQ-2026-0142
    await page.goto("/app/requests/REQ-2026-0142");

    await expect(page.getByRole("heading", { name: "Borrow Request Summary" })).toBeVisible();
    await expect(page.getByText("Partially Approved")).toBeVisible();

    // Verify 48-Hour Collection Window banner
    await expect(page.getByText(/48-Hour Collection Window/i)).toBeVisible();

    // Verify Line item approval vs rejection
    await expect(page.getByText("Line Item Decision Breakdown")).toBeVisible();
    await expect(
      page.getByText("Rejection note: Requires active Level V supervisor on-site")
    ).toBeVisible();
  });

  test("Journey 3: Active loan detail -> Due date extension request workflow", async ({ page }) => {
    // Navigate to active loan LN-2026-0089
    await page.goto("/app/loans/LN-2026-0089");

    await expect(
      page.getByRole("heading", { name: "Equipment Loan Custody Record" })
    ).toBeVisible();
    await expect(page.getByText("Equipment Units in Custody")).toBeVisible();

    // Click Request Extension button
    const extBtn = page.getByRole("button", { name: /Request Extension/i });
    await extBtn.click();

    // Fill extension dialog
    const reasonInput = page.getByPlaceholder(/Why is an extension needed/i);
    await reasonInput.fill("Postponed testing session due to university exam schedule.");

    await page.getByRole("button", { name: /Submit Extension Request/i }).click();

    // Policy notice or status should show extension pending
    await expect(page.getByText("Due Date Extension Requested")).toBeVisible();
    await expect(page.getByText("Extension Requests History")).toBeVisible();
  });

  test("Journey 4: Active loan detail -> Partial return declaration workflow", async ({ page }) => {
    // Navigate to active loan LN-2026-0089
    await page.goto("/app/loans/LN-2026-0089");

    // Click Initiate Return button
    const returnBtn = page.getByRole("button", { name: /Initiate Return/i });
    await returnBtn.click();

    // Fill return declaration
    const notesInput = page.getByPlaceholder(/Any component behavior or parts replaced/i);
    await notesInput.fill(
      "Bringing back 1 stepper motor driver carrier in original anti-static bag."
    );

    await page.getByRole("button", { name: /Declare Return/i }).click();

    // Verify Return declaration notice
    await expect(
      page.getByText("Return Declaration Awaiting Physical Custodian Confirmation")
    ).toBeVisible();
    await expect(page.getByText("Return Request Submissions")).toBeVisible();
  });
});
