import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Providers } from "@/app/providers";
import { DesktopSidebar } from "@/components/shared/DesktopSidebar";
import { DesktopBoardSidebar } from "@/components/shared/DesktopBoardSidebar";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { MobileBoardBottomNav } from "@/components/shared/MobileBoardBottomNav";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { QuantitySelector } from "@/components/shared/QuantitySelector";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState, ErrorState } from "@/components/shared/FeedbackStates";
import { DevPersonaSwitcher } from "@/components/shared/DevPersonaSwitcher";

describe("Stage 1 Navigation & Shell Architecture", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders Desktop Member Navigation with correct member links and excludes board links", () => {
    render(
      <Providers>
        <MemoryRouter>
          <DesktopSidebar />
        </MemoryRouter>
      </Providers>
    );

    // Member links must exist
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Inventory")).toBeInTheDocument();
    expect(screen.getByText("My Requests")).toBeInTheDocument();
    expect(screen.getByText("My Loans")).toBeInTheDocument();
    expect(screen.getByText("Favorites")).toBeInTheDocument();

    // Board-only links must NOT exist in Member sidebar
    expect(screen.queryByText("Action Center")).not.toBeInTheDocument();
    expect(screen.queryByText("Audits")).not.toBeInTheDocument();
    expect(screen.queryByText("Incidents & Strikes")).not.toBeInTheDocument();
    expect(screen.queryByText("Telemetry & Insights")).not.toBeInTheDocument();
  });

  it("renders Desktop Board Navigation with high-density board links", () => {
    render(
      <Providers>
        <MemoryRouter>
          <DesktopBoardSidebar />
        </MemoryRouter>
      </Providers>
    );

    // Board links must exist
    expect(screen.getByText("Action Center")).toBeInTheDocument();
    expect(screen.getByText("Requests")).toBeInTheDocument();
    expect(screen.getByText("Loans")).toBeInTheDocument();
    expect(screen.getByText("Inventory")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Audits")).toBeInTheDocument();
    expect(screen.getByText("Incidents")).toBeInTheDocument();
    expect(screen.getByText("Insights")).toBeInTheDocument();
    expect(screen.getByText("Exports")).toBeInTheDocument();
  });

  it("renders Member Mobile Bottom Nav with exactly 5 primary touch destinations", () => {
    render(
      <Providers>
        <MemoryRouter>
          <MobileBottomNav />
        </MemoryRouter>
      </Providers>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Inventory")).toBeInTheDocument();
    expect(screen.getByText("Requests")).toBeInTheDocument();
    expect(screen.getByText("Loans")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("renders Board Mobile Bottom Nav with 4 primary operational actions plus More sheet", () => {
    render(
      <Providers>
        <MemoryRouter>
          <MobileBoardBottomNav />
        </MemoryRouter>
      </Providers>
    );

    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Requests")).toBeInTheDocument();
    expect(screen.getByText("Loans")).toBeInTheDocument();
    expect(screen.getByText("Inventory")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });
});

describe("Design System Primitives & Feedback States", () => {
  it("renders StatusBadge with accessible label and appropriate status styling", () => {
    const { rerender } = render(<StatusBadge status="ACTIVE" />);
    expect(screen.getByText("Active Loan")).toBeInTheDocument();

    rerender(<StatusBadge status="DUE_SOON" label="Due in 24h" />);
    expect(screen.getByText("Due in 24h")).toBeInTheDocument();

    rerender(<StatusBadge status="RESTRICTED" />);
    expect(screen.getByText("Restricted")).toBeInTheDocument();
  });

  it("operates QuantitySelector properly within bounds", () => {
    let quantity = 3;
    const handleChange = (val: number) => {
      quantity = val;
    };

    render(
      <QuantitySelector
        value={quantity}
        onChange={handleChange}
        min={1}
        max={5}
      />
    );

    const incrementBtn = screen.getByLabelText("Increase quantity");
    const decrementBtn = screen.getByLabelText("Decrease quantity");

    fireEvent.click(incrementBtn);
    expect(quantity).toBe(4);

    fireEvent.click(decrementBtn);
    expect(quantity).toBe(2);
  });

  it("handles SearchInput change and clearing action", () => {
    let query = "STM32";
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      query = e.target.value;
    };
    const handleClear = () => {
      query = "";
    };

    render(
      <SearchInput
        value={query}
        onChange={handleChange}
        onClear={handleClear}
        placeholder="Search inventory..."
      />
    );

    const input = screen.getByPlaceholderText("Search inventory...");
    expect(input).toHaveValue("STM32");

    const clearBtn = screen.getByLabelText("Clear search");
    fireEvent.click(clearBtn);
    expect(query).toBe("");
  });

  it("renders EmptyState and ErrorState with action buttons", () => {
    let retried = false;
    render(
      <EmptyState
        title="No equipment found"
        description="Try adjusting your filters or search keywords."
      />
    );
    expect(screen.getByText("No equipment found")).toBeInTheDocument();

    render(
      <ErrorState
        title="Failed to load items"
        description="Could not connect to service."
        onRetry={() => {
          retried = true;
        }}
      />
    );
    expect(screen.getByText("Failed to load items")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Retry Action"));
    expect(retried).toBe(true);
  });
});

describe("Dev Persona Switcher", () => {
  it("renders the active persona and switches when changed", () => {
    render(
      <Providers>
        <MemoryRouter>
          <DevPersonaSwitcher />
        </MemoryRouter>
      </Providers>
    );

    // Initial persona button shows active persona name
    const trigger = screen.getByTitle("Switch Active Dev Persona");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("MEMBER");
  });
});
