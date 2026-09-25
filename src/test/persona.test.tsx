import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DevPersonaProvider } from "@/dev/DevPersonaProvider";
import { MemberLayout } from "@/layouts/MemberLayout";
import { BoardLayout } from "@/layouts/BoardLayout";
import { MemberInventoryPage } from "@/pages/member";
import { BoardDashboardPage } from "@/pages/board";
import { authService } from "@/services";

describe("Dev Persona Switching & Shell Transition", () => {
  beforeEach(() => {
    localStorage.clear();
    authService.clearSession();
  });

  function createTestRouter(initialPath = "/app") {
    return createMemoryRouter(
      [
        {
          path: "/app",
          element: <MemberLayout />,
          children: [
            { index: true, element: <MemberInventoryPage /> },
            { path: "requests/:requestId", element: <div>Member Request Detail View</div> },
          ],
        },
        {
          path: "/board",
          element: <BoardLayout />,
          children: [
            { index: true, element: <BoardDashboardPage /> },
            { path: "requests/:requestId", element: <div>Board Request Detail View</div> },
          ],
        },
      ],
      {
        initialEntries: [initialPath],
      }
    );
  }

  it("verifies interactive persona switching between Member, Board, and Superadmin shells", async () => {
    const router = createTestRouter("/app");
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DevPersonaProvider>
          <RouterProvider router={router} />
        </DevPersonaProvider>
      </QueryClientProvider>
    );

    // 1. Initially on /app in MemberLayout
    const trigger = screen.getByTitle("Switch Active Dev Persona");
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText("MEMBER")).toBeInTheDocument();
    expect(screen.getByText("Equipment Catalogue")).toBeInTheDocument();

    // 2. Open switcher dropdown using Radix trigger interaction
    fireEvent.pointerDown(trigger);
    fireEvent.keyDown(trigger, { key: "Enter" });

    // 3. Select Board persona
    const boardOption = await screen.findByText("Emna Taghlet (Logistics Board)");
    expect(boardOption).toBeInTheDocument();
    fireEvent.click(boardOption);

    // 4. Verify Board persona is active and navigated to /board (BoardLayout rendered)
    expect(await screen.findByText("OPERATOR")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/board");
    expect(await screen.findByText("Logistics Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Board Operations")).toBeInTheDocument();

    // 5. Open switcher again and select Member
    const boardTrigger = screen.getByTitle("Switch Active Dev Persona");
    fireEvent.pointerDown(boardTrigger);
    fireEvent.keyDown(boardTrigger, { key: "Enter" });

    const memberOption = await screen.findByText("Rami Troudi (IEEE Member)");
    fireEvent.click(memberOption);

    // 6. Verify Member shell is restored at /app
    expect(await screen.findByText("MEMBER")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/app");
    expect(screen.getByText("Equipment Catalogue")).toBeInTheDocument();

    // 7. Open switcher again and select Superadmin
    const memberTrigger = screen.getByTitle("Switch Active Dev Persona");
    fireEvent.pointerDown(memberTrigger);
    fireEvent.keyDown(memberTrigger, { key: "Enter" });

    const superadminOption = await screen.findByText("Amine Elkadhi (RAS Chairman)");
    fireEvent.click(superadminOption);

    // 8. Verify Superadmin uses Board shell
    expect(await screen.findByText("SUPERADMIN")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/board");
    expect(screen.getByText("Logistics Dashboard")).toBeInTheDocument();
  });

  it("switches persona and transitions shell when originating from deep routes", async () => {
    const router = createTestRouter("/app/requests/REQ-001");
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DevPersonaProvider>
          <RouterProvider router={router} />
        </DevPersonaProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText("Member Request Detail View")).toBeInTheDocument();

    // Switch to Board persona
    const trigger = screen.getByTitle("Switch Active Dev Persona");
    fireEvent.pointerDown(trigger);
    fireEvent.keyDown(trigger, { key: "Enter" });

    const boardOption = await screen.findByText("Emna Taghlet (Logistics Board)");
    fireEvent.click(boardOption);

    // Shell transitions to /board
    expect(await screen.findByText("Logistics Dashboard")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/board");
    expect(screen.getByText("Board Operations")).toBeInTheDocument();
  });
});
