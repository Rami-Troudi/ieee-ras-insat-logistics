import { describe, it, expect } from "vitest";
import { calculatePickupWindow, isDatePast } from "@/lib/dates";

describe("Date & Pickup Window Utilities", () => {
  it("calculates 48-hour pickup window remaining time and urgency", () => {
    // Approved 10 hours ago -> 38 hours remaining
    const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString();
    const window = calculatePickupWindow(tenHoursAgo);

    expect(window.isExpired).toBe(false);
    expect(window.hoursRemaining).toBeGreaterThanOrEqual(37);
    expect(window.hoursRemaining).toBeLessThanOrEqual(38);
    expect(window.status).toBe("NORMAL");
  });

  it("marks pickup window as DUE_SOON when <= 24 hours remain", () => {
    // Approved 30 hours ago -> 18 hours remaining
    const thirtyHoursAgo = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
    const window = calculatePickupWindow(thirtyHoursAgo);

    expect(window.isExpired).toBe(false);
    expect(window.hoursRemaining).toBeLessThanOrEqual(24);
    expect(window.status).toBe("DUE_SOON");
  });

  it("marks pickup window as EXPIRED when past 48 hours", () => {
    // Approved 50 hours ago
    const fiftyHoursAgo = new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString();
    const window = calculatePickupWindow(fiftyHoursAgo);

    expect(window.isExpired).toBe(true);
    expect(window.status).toBe("EXPIRED");
    expect(window.hoursRemaining).toBe(0);
  });

  it("accurately detects past dates for overdue loans", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    expect(isDatePast(yesterday)).toBe(true);
    expect(isDatePast(tomorrow)).toBe(false);
  });
});
