import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter, RouterProvider, createMemoryRouter } from "react-router-dom";
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
import { MemberLayout } from "@/layouts/MemberLayout";
import { BoardLayout } from "@/layouts/BoardLayout";
import { MemberRequestDetailPage, MemberLoanDetailPage } from "@/pages/member";
import { BoardRequestDetailPage, BoardProfilePage, BoardNotificationsPage } from "@/pages/board";
import { NotFoundPage } from "@/pages/system/NotFoundPage";
import { authService } from "@/services";
import { PRESET_PERSONAS } from "@/constants/personas";

beforeEach(() => {
  localStorage.clear();
  authService.clearSession();
});

describe("Stage 1 Navigation & Shell Architecture", () => {
  it("renders Desktop Member Navigation with simplified human links and excludes board links", () => {
    render(
      <Providers>
        <MemoryRouter>
          <DesktopSidebar />
        </MemoryRouter>
      </Providers>
    );

    expect(screen.getByText("Catalogue")).toBeInTheDocument();
    expect(screen.getByText("Activity")).toBeInTheDocument();

    expect(screen.queryByText("Action Center")).not.toBeInTheDocument();
    expect(screen.queryByText("Audits")).not.toBeInTheDocument();
    expect(screen.queryByText("Incidents & Strikes")).not.toBeInTheDocument();
    expect(screen.queryByText("Telemetry & Insights")).not.toBeInTheDocument();
  });

  it("renders Desktop Board Navigation with streamlined operational links", () => {
    render(
      <Providers>
        <MemoryRouter>
          <DesktopBoardSidebar />
        </MemoryRouter>
      </Providers>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Requests")).toBeInTheDocument();
    expect(screen.getByText("Borrowed")).toBeInTheDocument();
    expect(screen.getByText("Inventory")).toBeInTheDocument();
    expect(screen.getByText("People")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("renders Member Mobile Bottom Nav with 2 primary touch destinations", () => {
    render(
      <Providers>
        <MemoryRouter>
          <MobileBottomNav />
        </MemoryRouter>
      </Providers>
    );

    expect(screen.getByText("Catalogue")).toBeInTheDocument();
    expect(screen.getByText("Activity")).toBeInTheDocument();
  });

  it("renders Board Mobile Bottom Nav with operational actions plus More sheet", () => {
    render(
      <Providers>
        <MemoryRouter>
          <MobileBoardBottomNav />
        </MemoryRouter>
      </Providers>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Requests")).toBeInTheDocument();
    expect(screen.getByText("Borrowed")).toBeInTheDocument();
    expect(screen.getByText("Inventory")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("opens Board More bottom sheet with secondary management links", async () => {
    render(
      <Providers>
        <MemoryRouter>
          <MobileBoardBottomNav />
        </MemoryRouter>
      </Providers>
    );

    const moreTrigger = screen.getByLabelText("More Board Options");
    fireEvent.click(moreTrigger);

    expect(await screen.findByText("Board Operations Menu")).toBeInTheDocument();
    expect(screen.getByText("People")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Insights")).toBeInTheDocument();
    expect(screen.getByText("Inventory Audits")).toBeInTheDocument();
    expect(screen.getByText("Exports")).toBeInTheDocument();
    expect(screen.getByText("Incidents")).toBeInTheDocument();
    expect(screen.getByText("Audit Log")).toBeInTheDocument();
  });

  it("renders 404 NotFoundPage for unmapped route", () => {
    const testRouter = createMemoryRouter([{ path: "*", element: <NotFoundPage /> }], {
      initialEntries: ["/unmapped/invalid/path"],
    });

    render(
      <Providers>
        <RouterProvider router={testRouter} />
      </Providers>
    );

    expect(screen.getByText("404 Error")).toBeInTheDocument();
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });

  it("renders structural detail placeholder routes", async () => {
    const detailRouter = createMemoryRouter(
      [
        {
          path: "/app",
          element: <MemberLayout />,
          children: [
            { path: "requests/:requestId", element: <MemberRequestDetailPage /> },
            { path: "loans/:loanId", element: <MemberLoanDetailPage /> },
          ],
        },
        {
          path: "/board",
          element: <BoardLayout />,
          children: [{ path: "requests/:requestId", element: <BoardRequestDetailPage /> }],
        },
      ],
      { initialEntries: ["/app/requests/REQ-2026-0142"] }
    );

    render(
      <Providers>
        <RouterProvider router={detailRouter} />
      </Providers>
    );

    expect(await screen.findByText("Equipment request")).toBeInTheDocument();
    expect(screen.getByText("Updates")).toBeInTheDocument();
  });

  it("preserves Board shell context when navigating to Board Profile and Board Notifications", () => {
    authService.setSession(PRESET_PERSONAS.find((p) => p.role === "OPERATOR")!);

    const boardContextRouter = createMemoryRouter(
      [
        {
          path: "/board",
          element: <BoardLayout />,
          children: [
            { path: "profile", element: <BoardProfilePage /> },
            { path: "notifications", element: <BoardNotificationsPage /> },
          ],
        },
      ],
      { initialEntries: ["/board/profile"] }
    );

    render(
      <Providers>
        <RouterProvider router={boardContextRouter} />
      </Providers>
    );

    // Board layout is active (has Board Operations sidebar)
    expect(screen.getByText("Board Operations")).toBeInTheDocument();
    expect(screen.getByText("Board Custodian Profile")).toBeInTheDocument();
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

    render(<QuantitySelector value={quantity} onChange={handleChange} min={1} max={5} />);

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
  it("renders the active persona and role indicator in development", async () => {
    render(
      <Providers>
        <MemoryRouter>
          <DevPersonaSwitcher />
        </MemoryRouter>
      </Providers>
    );

    const trigger = await screen.findByTitle("Switch Active Dev Persona");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("MEMBER");
  });
});
