import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MutationErrorHost } from "@/features/auth/MutationErrorHost";
import { MUTATION_ERROR_EVENT } from "@/app/query-client";

const emit = (detail: { code?: string; message: string }) =>
  act(() => {
    window.dispatchEvent(new CustomEvent(MUTATION_ERROR_EVENT, { detail }));
  });

describe("MutationErrorHost", () => {
  it("shows the failure message instead of failing silently", () => {
    render(<MutationErrorHost />);
    emit({ code: "CONFLICT", message: "Inventory item or serial number already exists" });
    expect(screen.getByText("Inventory item or serial number already exists")).toBeTruthy();
  });

  it("does not prompt for password confirmation for admin changes", () => {
    render(<MutationErrorHost />);
    emit({ code: "FRESH_AUTH_REQUIRED", message: "Reverify with your staff password" });
    expect(screen.getByText("Action failed")).toBeTruthy();
    expect(screen.queryByText("Confirm password")).toBeNull();
  });
});
