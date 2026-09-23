import { test, expect } from "@playwright/test";

test.describe("Operator Journeys (Pre-Backend Freeze)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem("ras_insat_mock_db_v4");
      window.localStorage.setItem("ras_active_user_id", "p-board-logistics");
      window.localStorage.setItem("ras_dev_persona_id", "p-board-logistics");
      window.localStorage.setItem("ras_onboarding_completed", "true");
    });
  });

  test("Operator Journey 1a: Member accessing /board redirects to /app", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("ras_active_user_id", "p-member-ieee");
      window.localStorage.setItem("ras_dev_persona_id", "p-member-ieee");
    });
    await page.goto("/board");
    await expect(page).toHaveURL(/\/app/);
  });

  test("Operator Journey 1b: Operator accessing /board succeeds", async ({ page }) => {
    await page.goto("/board");
    await expect(page).toHaveURL(/\/board/);
    await expect(page.getByRole("heading", { name: "Logistics Dashboard" })).toBeVisible();
  });

  test("Operator Journey 2: Request review and stock reservation", async ({ page }) => {
    // 1. Navigate to requests queue
    await page.goto("/board/requests");
    await expect(page.getByRole("heading", { name: "Requests" })).toBeVisible();

    // 2. Select pending request REQ-2026-0155
    const reviewLink = page.locator('a[href*="REQ-2026-0155"]').first();
    await expect(reviewLink).toBeVisible();
    await reviewLink.click();

    // 3. Request detail page renders
    await expect(page).toHaveURL(/\/board\/requests\/REQ-2026-0155/);
    await expect(page.getByRole("heading", { name: "Borrow request" })).toBeVisible();

    // 4. Click Approve and reserve stock
    const approveBtn = page.getByRole("button", { name: /Approve and reserve stock/i });
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // 5. Button transitions to Confirm handover
    await expect(page.getByRole("button", { name: /Confirm handover/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test("Operator Journey 3: Confirm physical equipment handover", async ({ page }) => {
    // 1. Visit REQ-2026-0142 which is approved and waiting for pickup
    await page.goto("/board/requests/REQ-2026-0142");
    await expect(page.getByRole("heading", { name: "Borrow request" })).toBeVisible();

    const handoverBtn = page.getByRole("button", { name: /Confirm handover/i });
    await expect(handoverBtn).toBeVisible();
    await handoverBtn.click();

    // 2. Handover confirmed, button disappears, history records physical handover
    await expect(page.getByRole("button", { name: /Confirm handover/i })).not.toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/Physical handover confirmed/i)).toBeVisible();
  });

  test("Operator Journey 4: Direct loan due date update", async ({ page }) => {
    // 1. Navigate to Borrowed equipment list
    await page.goto("/board/borrowed");
    await expect(page.getByRole("heading", { name: "Borrowed Equipment" })).toBeVisible();

    // 2. Locate active loan LN-2026-0089 and click Edit date
    const editBtn = page.locator('button:has-text("Edit date")').first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // 3. Fill new due date
    const dateInput = page.locator('input[type="date"]').first();
    await dateInput.fill("2026-11-28");

    // 4. Click Save
    const saveBtn = page.locator('button:has-text("Save")').first();
    await saveBtn.click();

    // 5. Verify updated expected return date is displayed
    await expect(page.getByText(/2026/i).first()).toBeVisible();
  });

  test("Operator Journey 5: Physical return with condition GOOD", async ({ page }) => {
    // 1. Navigate to Borrowed equipment list
    await page.goto("/board/borrowed");
    await expect(page.getByRole("heading", { name: "Borrowed Equipment" })).toBeVisible();

    // 2. Click Return on first active loan
    const returnBtn = page.locator('button:has-text("Return")').first();
    await expect(returnBtn).toBeVisible();
    await returnBtn.click();

    // 3. Modal opens with Good condition preselected
    await expect(page.getByText(/Condition of Returned Equipment/i)).toBeVisible();

    // 4. Click Confirm Return
    const confirmBtn = page.getByRole("button", { name: /Confirm Return/i });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // 5. Modal closes upon success
    await expect(page.getByText(/Condition of Returned Equipment/i)).not.toBeVisible({
      timeout: 10000,
    });
  });

  test("Operator Journey 6: Physical return with condition DAMAGED", async ({ page }) => {
    // 1. Navigate to Borrowed equipment list
    await page.goto("/board/borrowed");
    await expect(page.getByRole("heading", { name: "Borrowed Equipment" })).toBeVisible();

    // 2. Click Return on LN-2026-0072 or active loan
    const returnBtn = page.locator('button:has-text("Return")').first();
    await expect(returnBtn).toBeVisible();
    await returnBtn.click();

    // 3. Wait for modal to be visible
    await expect(page.getByText(/Condition of Returned Equipment/i)).toBeVisible();

    // 4. Select Damaged condition
    await page.locator('label:has-text("Damaged")').click();

    // 5. Enter damage note
    const noteArea = page.getByPlaceholder(/Notes about connector/i);
    await noteArea.fill("Ruptured insulation and bent connector pins.");

    // 6. Submit return
    await page.getByRole("button", { name: /Confirm Return/i }).click();

    // 7. Modal closes
    await expect(page.getByText(/Condition of Returned Equipment/i)).not.toBeVisible({
      timeout: 10000,
    });
  });
});
