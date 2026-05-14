import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// TODO: upgrade to userEvent when @testing-library/user-event is available

const mockCaptureException = vi.fn();
vi.mock("@sentry/nextjs", () => ({
  captureException: mockCaptureException,
}));

afterEach(cleanup);

beforeEach(() => {
  mockCaptureException.mockClear();
});

async function importComponent() {
  const { default: GlobalError } = await import("./global-error");
  return GlobalError;
}

describe("GlobalError — renders fallback UI", () => {
  it("renders a heading that indicates an error occurred", async () => {
    const GlobalError = await importComponent();
    const error = new Error("boom");
    render(<GlobalError error={error} reset={() => undefined} />);

    expect(screen.getByRole("heading")).toBeDefined();
  });

  it("renders a retry button", async () => {
    const GlobalError = await importComponent();
    const error = new Error("boom");
    render(<GlobalError error={error} reset={() => undefined} />);

    expect(screen.getByRole("button")).toBeDefined();
  });

  it("calls reset when the retry button is clicked", async () => {
    const GlobalError = await importComponent();
    const error = new Error("boom");
    const reset = vi.fn();
    render(<GlobalError error={error} reset={reset} />);

    fireEvent.click(screen.getByRole("button"));

    expect(reset).toHaveBeenCalledOnce();
  });
});

describe("GlobalError — Sentry reporting", () => {
  it("reports the error to Sentry on mount", async () => {
    const GlobalError = await importComponent();
    const error = new Error("server crash");
    render(<GlobalError error={error} reset={() => undefined} />);

    expect(mockCaptureException).toHaveBeenCalledWith(error);
  });

  it("reports a different error instance when the error prop changes", async () => {
    const GlobalError = await importComponent();
    const error = new Error("another crash");
    render(<GlobalError error={error} reset={() => undefined} />);

    expect(mockCaptureException).toHaveBeenCalledWith(error);
  });
});
