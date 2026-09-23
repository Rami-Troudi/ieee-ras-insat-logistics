import { test, expect } from "@playwright/test";

test.describe("Member Journeys (Pre-Backend Freeze)", () => {
  test.beforeEach(async ({ page }) => {
    // Set member persona in localStorage before load and mark onboarding completed
    await page.addInitScript(() => {
      window.localStorage.removeItem("ras_insat_mock_db_v4");
      window.localStorage.setItem("ras_active_user_id", "p-member-ieee");
      window.localStorage.setItem("ras_dev_persona_id", "p-member-ieee");
      window.localStorage.setItem("ras_onboarding_completed", "true");
    });
  });

  test("Member Journey 1: Catalogue discovery -> Cart -> Request submission -> Activity view", async ({
    page,
  }) => {
    // 1. Borrower lands on Equipment Catalogue
    await page.goto("/app");
    await expect(page.getByRole("heading", { name: "Equipment Catalogue" })).toBeVisible();

    // 2. Search for STM32 development board (Class E)
    const searchInput = page.getByPlaceholder(/Search equipment/i);
    await searchInput.fill("STM32");
    await expect(page.getByText("STM32F401RE Nucleo-64")).toBeVisible();

    // 3. Navigate to detail page
    await page.getByRole("link", { name: /STM32F401RE Nucleo-64/i }).click();
    await expect(page).toHaveURL(/\/app\/inventory\/item-stm32-f4/);
    await expect(page.getByRole("heading", { name: "STM32F401RE Nucleo-64" })).toBeVisible();

    // 4. Add to cart from detail page
    const addBtn = page.getByRole("button", { name: /Add to cart/i });
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // 5. Navigate to Cart
    await page.goto("/app/cart");
    await expect(page.getByRole("heading", { name: "Cart" })).toBeVisible();
    await expect(page.getByText("STM32F401RE Nucleo-64")).toBeVisible();

    // 6. Set future expected return date
    const returnDateInput = page.locator('input[type="date"]');
    const futureDate = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
    await returnDateInput.fill(futureDate);

    // 7. Submit borrow request
    const sendBtn = page.getByRole("button", { name: /Send Request/i });
    await sendBtn.click();

    // 8. Success confirmation appears
    await expect(page.getByRole("heading", { name: "Request sent" })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole("link", { name: "View Activity" }).click();

    // 9. Lands on Activity page showing Waiting section
    await expect(page).toHaveURL(/\/app\/activity/);
    await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Waiting" })).toBeVisible();
  });

  test("Member Journey 2: Class enforcement & online request gating", async ({ page }) => {
    // 1. Visit catalogue
    await page.goto("/app/inventory");
    await expect(page.getByRole("heading", { name: "Equipment Catalogue" })).toBeVisible();

    // 2. Class A item (Consumables: Hot Melt Glue Sticks) shows "Workshop only"
    const glueLink = page.getByRole("link", { name: /Hot Melt Glue Sticks/i }).first();
    await glueLink.click();
    await expect(page.getByRole("heading", { name: /Hot Melt Glue Sticks/i })).toBeVisible();
    // Cannot add online
    await expect(page.getByRole("button", { name: /Add to cart/i })).not.toBeVisible();
    await expect(page.getByText(/Available at RAS workspace/i)).toBeVisible();

    // 3. Class F item (Soldering Station) shows "Ask logistics team"
    await page.goto("/app/inventory/item-soldering-station");
    await expect(page.getByRole("heading", { name: /Soldering Station/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Add to cart/i })).not.toBeVisible();
    await expect(page.getByText(/Ask logistics team/i)).toBeVisible();
  });

  test("Member Journey 3: Borrower stock privacy verification", async ({ page }) => {
    // 1. Member inspects item detail page
    await page.goto("/app/inventory/item-stm32-f4");
    await expect(page.getByRole("heading", { name: "STM32F401RE Nucleo-64" })).toBeVisible();

    // 2. Qualitative status is displayed
    await expect(page.getByText(/Available|Limited/i).first()).toBeVisible();

    // 3. Exact stock numbers, bin/cabinet storage location, trackingMode, and serials must NOT be exposed
    await expect(page.getByText(/Cabinet A-02/i)).not.toBeVisible();
    await expect(page.getByText(/SN-STM32-/i)).not.toBeVisible();
    await expect(page.getByText(/INDIVIDUAL_ASSET/i)).not.toBeVisible();
    await expect(page.getByText(/totalQuantity|availableQuantity/i)).not.toBeVisible();
  });

  test("Member Journey 4: Activity states & absence of borrower extension/return buttons", async ({
    page,
  }) => {
    // 1. Visit Activity
    await page.goto("/app/activity");
    await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();

    // 2. Check sections
    await expect(page.getByRole("heading", { name: "Waiting" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ready to pick up" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "With you" })).toBeVisible();

    // 3. Navigate to active loan detail
    await page.goto("/app/loans/LN-2026-0089");
    await expect(page.getByText(/Equipment with you/i)).toBeVisible();

    // 4. Verify STRICT absence of member extension or return declaration buttons
    await expect(page.getByRole("button", { name: /Request Extension/i })).not.toBeVisible();
    await expect(page.getByRole("button", { name: /Initiate Return/i })).not.toBeVisible();
    await expect(page.getByRole("button", { name: /Declare Return/i })).not.toBeVisible();

    // 5. Verify physical instruction notice
    await expect(
      page.getByText(/Bring equipment to the logistics desk for physical return inspection/i)
    ).toBeVisible();
  });
});
