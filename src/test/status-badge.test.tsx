import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusBadge, STATUS_CONFIG, DomainStatus } from "@/components/shared/StatusBadge";

describe("StatusBadge Declarative Configuration", () => {
  it("corrects all previously broken status mappings", () => {
    // 1. BANNED was incorrectly mapped to 'Restricted'
    const { unmount: u1 } = render(<StatusBadge status="BANNED" />);
    expect(screen.getByText("Banned")).toBeInTheDocument();
    u1();

    // 2. ERROR was incorrectly mapped to 'Restricted'
    const { unmount: u2 } = render(<StatusBadge status="ERROR" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    u2();

    // 3. HANDED_OVER was incorrectly mapped to 'Info'
    const { unmount: u3 } = render(<StatusBadge status="HANDED_OVER" />);
    expect(screen.getByText("Handed Over")).toBeInTheDocument();
    u3();

    // 4. PARTIALLY_RETURNED was incorrectly mapped to 'Warning'
    const { unmount: u4 } = render(<StatusBadge status="PARTIALLY_RETURNED" />);
    expect(screen.getByText("Partially Returned")).toBeInTheDocument();
    u4();

    // 5. LOST was incorrectly mapped to 'Retired'
    const { unmount: u5 } = render(<StatusBadge status="LOST" />);
    expect(screen.getByText("Lost")).toBeInTheDocument();
    u5();
  });

  it("verifies every defined DomainStatus in STATUS_CONFIG has a valid label, variant, and icon", () => {
    const definedStatuses: DomainStatus[] = [
      "PENDING",
      "APPROVED",
      "PARTIALLY_APPROVED",
      "REJECTED",
      "EXPIRED",
      "WAITING",
      "HANDED_OVER",
      "ACTIVE",
      "CLOSED",
      "RETURNED",
      "PARTIALLY_RETURNED",
      "AVAILABLE",
      "BORROWED",
      "DAMAGED",
      "MAINTENANCE",
      "LOST",
      "RETIRED",
      "DUE_SOON",
      "OVERDUE",
      "RESTRICTED",
      "BANNED",
      "SUCCESS",
      "WARNING",
      "ERROR",
      "INFO",
    ];

    definedStatuses.forEach((status) => {
      const config = STATUS_CONFIG[status];
      expect(config, `Missing config for status ${status}`).toBeDefined();
      expect(config.label.length, `Label must not be empty for ${status}`).toBeGreaterThan(0);
      expect(config.variant, `Variant must exist for ${status}`).toBeDefined();
      expect(config.icon, `Icon must exist for ${status}`).toBeDefined();

      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(config.label)).toBeInTheDocument();
      unmount();
    });
  });

  it("supports custom label overriding", () => {
    render(<StatusBadge status="DUE_SOON" label="Due in 3 hours" />);
    expect(screen.getByText("Due in 3 hours")).toBeInTheDocument();
  });

  it("handles extreme text label lengths with shrink-0 icon protection", () => {
    const longLabel =
      "Very Long Custom Status Label That Exceeds Normal Length For Testing SVG Icon Integrity Under Flex Container Constraints";
    const { container } = render(<StatusBadge status="WARNING" label={longLabel} />);

    expect(screen.getByText(longLabel)).toBeInTheDocument();
    const svgIcon = container.querySelector("svg");
    expect(svgIcon).toBeInTheDocument();
    expect(svgIcon).toHaveClass("shrink-0");
  });
});
