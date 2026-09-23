import { test, expect } from "@playwright/test";

const viewports = [
  { width: 375, height: 667, name: "mobile-375" },
  { width: 430, height: 932, name: "mobile-430" },
  { width: 768, height: 1024, name: "tablet-768" },
  { width: 1024, height: 768, name: "desktop-1024" },
  { width: 1440, height: 900, name: "desktop-1440" },
];

test.describe("Responsive Viewport Validation", () => {
  for (const vp of viewports) {
    test(`renders catalogue and shell properly at ${vp.name} (${vp.width}x${vp.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.addInitScript(() => {
        window.localStorage.removeItem("ras_insat_mock_db_v4");
        window.localStorage.setItem("ras_active_user_id", "p-member-ieee");
        window.localStorage.setItem("ras_dev_persona_id", "p-member-ieee");
        window.localStorage.setItem("ras_onboarding_completed", "true");
      });

      await page.goto("/app/inventory");
      await expect(page.getByRole("heading", { name: "Equipment Catalogue" })).toBeVisible();

      // TopBar header logo or text is visible
      await expect(
        page.getByRole("link", { name: /IEEE RAS INSAT Logistics Home/i })
      ).toBeVisible();

      if (vp.width < 1024) {
        // Mobile bottom navigation is visible
        await expect(page.getByRole("navigation", { name: "Mobile Navigation" })).toBeVisible();
      } else {
        // Desktop sidebar navigation is visible
        await expect(page.getByRole("navigation", { name: "Sidebar Navigation" })).toBeVisible();
      }
    });

    test(`renders operator dashboard at ${vp.name} (${vp.width}x${vp.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.addInitScript(() => {
        window.localStorage.removeItem("ras_insat_mock_db_v4");
        window.localStorage.setItem("ras_active_user_id", "p-board-logistics");
        window.localStorage.setItem("ras_dev_persona_id", "p-board-logistics");
        window.localStorage.setItem("ras_onboarding_completed", "true");
      });

      await page.goto("/board");
      await expect(page.getByRole("heading", { name: "Logistics Dashboard" })).toBeVisible();

      if (vp.width < 1024) {
        // Mobile board bottom navigation is visible
        await expect(
          page.getByRole("navigation", { name: "Board Mobile Navigation" })
        ).toBeVisible();
      } else {
        // Desktop board sidebar navigation is visible
        await expect(
          page.getByRole("navigation", { name: "Board Sidebar Navigation" })
        ).toBeVisible();
      }
    });
  }
});
