import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";

describe("ResponsiveDialog Adaptability", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  function mockViewport(isDesktop: boolean) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: isDesktop,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }

  it("renders desktop modal dialog on wide viewports (>=1024px)", () => {
    mockViewport(true);
    const handleOpenChange = vi.fn();

    render(
      <ResponsiveDialog
        open={true}
        onOpenChange={handleOpenChange}
        title="Desktop Equipment Modal"
        description="Detailed specification for STM32 board"
      >
        <button onClick={() => handleOpenChange(false)}>Close Modal</button>
      </ResponsiveDialog>
    );

    // Title and description accessible
    expect(screen.getByText("Desktop Equipment Modal")).toBeInTheDocument();
    expect(screen.getByText("Detailed specification for STM32 board")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Close button interaction
    fireEvent.click(screen.getByText("Close Modal"));
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders mobile bottom sheet on small viewports (<1024px)", () => {
    mockViewport(false);
    const handleOpenChange = vi.fn();

    render(
      <ResponsiveDialog
        open={true}
        onOpenChange={handleOpenChange}
        title="Mobile Equipment Sheet"
        description="Ergonomic thumb-friendly drawer"
      >
        <button onClick={() => handleOpenChange(false)}>Close Drawer</button>
      </ResponsiveDialog>
    );

    expect(screen.getByText("Mobile Equipment Sheet")).toBeInTheDocument();
    expect(screen.getByText("Ergonomic thumb-friendly drawer")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close Drawer"));
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("transitions cleanly across 1024px viewport boundary while open without locking", () => {
    let isDesktop = true;
    const listeners: ((e: { matches: boolean }) => void)[] = [];

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      get matches() {
        return isDesktop;
      },
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, cb: (e: { matches: boolean }) => void) => {
        if (event === "change") listeners.push(cb);
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const handleOpenChange = vi.fn();

    const { rerender } = render(
      <ResponsiveDialog
        open={true}
        onOpenChange={handleOpenChange}
        title="Dynamic Breakpoint Modal"
        description="Testing viewport transition while open"
      >
        <div>Content Inside</div>
      </ResponsiveDialog>
    );

    expect(screen.getByText("Dynamic Breakpoint Modal")).toBeInTheDocument();
    expect(screen.getByText("Content Inside")).toBeInTheDocument();

    // Transition across breakpoint
    act(() => {
      isDesktop = false;
      listeners.forEach((l) => l({ matches: false }));
    });

    rerender(
      <ResponsiveDialog
        open={true}
        onOpenChange={handleOpenChange}
        title="Dynamic Breakpoint Modal"
        description="Testing viewport transition while open"
      >
        <div>Content Inside</div>
      </ResponsiveDialog>
    );

    expect(screen.getByText("Dynamic Breakpoint Modal")).toBeInTheDocument();
    expect(screen.getByText("Content Inside")).toBeInTheDocument();
  });
});
