import { test, expect } from "@playwright/test";

test.describe("Member Complete Logistics Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Member app root
    await page.goto("/app");
  });

  test("Journey 1: Equipment discovery -> Cart -> Request submission -> Activity view", async ({
    page,
  }) => {
    // 1. Borrower lands directly on Equipment Catalogue
    await expect(page.getByRole("heading", { name: "Equipment Catalogue" })).toBeVisible();

    // 2. Search and filter items
    const searchInput = page.getByPlaceholder(/Search equipment/i);
    await searchInput.fill("STM32");
    await expect(page.getByText("STM32F401RE Nucleo-64")).toBeVisible();

    // 3. Click Details of STM32
    await page.getByRole("link", { name: /STM32F401RE Nucleo-64/i }).click();
    await expect(page).toHaveURL(/\/app\/inventory\/item-stm32-f4/);
    await expect(page.getByRole("heading", { name: "STM32F401RE Nucleo-64" })).toBeVisible();

    // 4. Increase quantity to 2 and add to cart from detail page
    const increaseBtn = page.getByRole("button", { name: "Increase quantity" });
    await increaseBtn.click();
    const addToCartBtn = page.getByRole("button", { name: /Add.*to Borrow Cart/i });
    await addToCartBtn.click();
    await expect(page.getByRole("button", { name: /Update in Cart/i })).toBeVisible();

    // 5. Add second item (navigate back to inventory, add A4988)
    await page.getByRole("link", { name: /Back to Equipment Catalog/i }).click();
    await expect(page).toHaveURL(/\/app\/inventory/);
    const searchInput2 = page.getByPlaceholder(/Search equipment/i);
    await searchInput2.fill("A4988");
    await expect(page.getByText("A4988 Stepper Motor Driver Carrier")).toBeVisible();
    await page.getByRole("button", { name: /^Add$/i }).first().click();

    // 6. Navigate to cart via link in TopBar
    await page.getByRole("link", { name: /View Borrow Cart/i }).click();
    await expect(page).toHaveURL(/\/app\/cart/);
    await expect(page.getByRole("heading", { name: "Your Request" })).toBeVisible();
    await expect(page.getByText("STM32F401RE Nucleo-64")).toBeVisible();
    await expect(page.getByText("A4988 Stepper Motor Driver Carrier")).toBeVisible();

    // 7. Fill return date and optional note
    const returnDateInput = page.locator('input[type="date"]');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const dateString = futureDate.toISOString().split("T")[0];
    await returnDateInput.fill(dateString);

    // 8. Submit borrow request
    const submitBtn = page.getByRole("button", { name: /Send Request/i });
    await submitBtn.click();

    // 9. Success screen appears with link to Activity
    await expect(page.getByRole("heading", { name: "Request Sent!" })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole("link", { name: "View Activity" }).click();

    // 10. Lands on Activity page showing Waiting (Pending Review)
    await expect(page).toHaveURL(/\/app\/activity/);
    await expect(page.getByRole("heading", { name: "Your Activity" })).toBeVisible();
    await expect(page.getByText("Waiting for Approval")).toBeVisible();
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
      page.getByText(/Class F equipment requires verified Level V\+ supervisor/i)
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

  test("Scenario 5: User-scoped project assignment in Cart", async ({ page }) => {
    // Navigate to inventory, add an item
    await page.goto("/app/inventory/item-stm32-f4");
    await page.getByRole("button", { name: /Add.*to Borrow Cart/i }).click();
    await expect(page.getByRole("button", { name: /Update in Cart/i })).toBeVisible();

    // Navigate to cart via TopBar link (client-side nav preserves in-memory cart state)
    await page.getByRole("link", { name: /View Borrow Cart/i }).click();
    await expect(page).toHaveURL(/\/app\/cart/);
    await expect(page.getByRole("heading", { name: "Borrow Request Cart" })).toBeVisible();

    // Current persona is p-member-ieee (Rami Troudi, assigned to Eurobot Tunisia 2027)
    const projectSelect = page.locator("#project-assignment");
    await expect(projectSelect).toBeVisible();

    // Verify Eurobot is listed as option
    await expect(projectSelect.getByRole("option", { name: /Eurobot/i })).toBeAttached();
    // Non-assigned project (e.g. Robot Cup Autonomous Drone) should NOT be listed
    const droneOption = projectSelect.getByRole("option", { name: /RoboCup/i });
    await expect(droneOption).not.toBeAttached();
  });

  test("Scenario 6: Double-submission / return quantity limit on active loan", async ({ page }) => {
    // Navigate to active loan LN-2026-0089
    await page.goto("/app/loans/LN-2026-0089");

    // Line lline-2 has 2 borrowed, 0 returned, 0 pending initially
    const returnBtn = page.getByRole("button", { name: /Initiate Return/i });
    await returnBtn.click();

    // Find the input for A4988 Stepper Motor Driver
    const qtyInput = page.getByLabel(/Quantity to return for A4988 Stepper Motor Driver Carrier/i);
    await expect(qtyInput).toHaveAttribute("max", "2");

    // Declare return of 1 item
    await qtyInput.fill("1");
    const notesInput = page.getByPlaceholder(/Any component behavior or parts replaced/i);
    await notesInput.fill("Returning first unit.");
    await page.getByRole("button", { name: /Declare Return/i }).click();

    // Now returnRequestedQuantity is 1. Maximum returnable remaining should be 1
    await expect(page.getByText("Return Request Submissions")).toBeVisible();

    // Click Initiate Return again
    await page.getByRole("button", { name: /Initiate Return/i }).click();
    const qtyInput2 = page.getByLabel(/Quantity to return for A4988 Stepper Motor Driver Carrier/i);
    await expect(qtyInput2).toHaveAttribute("max", "1");
  });

  test("Scenario 7: Strike 2 Advisory on Cart", async ({ page }) => {
    // Switch to restricted persona via dev switcher dropdown
    const switcherTrigger = page.getByTitle("Switch Active Dev Persona");
    await switcherTrigger.click();
    await page.getByText("Borrower (Strike 2 Active)").click();
    // Wait for persona navigation + React effects (localStorage write) to settle
    await page.waitForLoadState("networkidle");

    // Add eligible item (Class C — not blocked by Strike 2)
    await page.goto("/app/inventory/item-lipo-battery");
    await page.getByRole("button", { name: /Add.*to Borrow Cart/i }).click();
    await expect(page.getByRole("button", { name: /Update in Cart/i })).toBeVisible();

    // Navigate to cart via TopBar link (client-side nav preserves in-memory cart state)
    await page.getByRole("link", { name: /View Borrow Cart/i }).click();
    await expect(page).toHaveURL(/\/app\/cart/);
    await expect(page.getByText(/Strike 2 Active/i)).toBeVisible();
    await expect(page.getByText(/Classes F and G are unavailable/i)).toBeVisible();
  });

  test("Scenario 8: Provisional User Notice on Cart", async ({ page }) => {
    // Switch to provisional persona via dev switcher dropdown
    const switcherTrigger = page.getByTitle("Switch Active Dev Persona");
    await switcherTrigger.click();
    await page.getByText("New Student (Unprocessed)").click();
    // Wait for persona navigation + React effects (localStorage write) to settle
    await page.waitForLoadState("networkidle");

    // Add eligible item (Class A)
    await page.goto("/app/inventory/item-glue-sticks");
    await page.getByRole("button", { name: /Add.*to Borrow Cart/i }).click();
    await expect(page.getByRole("button", { name: /Update in Cart/i })).toBeVisible();

    // Navigate to cart via TopBar link (client-side nav preserves in-memory cart state)
    await page.getByRole("link", { name: /View Borrow Cart/i }).click();
    await expect(page).toHaveURL(/\/app\/cart/);
    await expect(page.getByText(/Provisional Membership Status/i)).toBeVisible();
    await expect(page.getByText(/immediate request submission is permitted/i)).toBeVisible();
  });
});
