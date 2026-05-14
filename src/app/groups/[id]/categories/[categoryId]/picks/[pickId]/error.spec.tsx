import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";

const mockCaptureException = vi.fn();
vi.mock("@sentry/nextjs", () => ({
  captureException: mockCaptureException,
}));

afterEach(cleanup);

beforeEach(() => {
  mockCaptureException.mockClear();
});

async function importComponent() {
  const { default: ErrorBoundary } = await import("./error");
  return ErrorBoundary;
}

describe("Sentry reporting", () => {
  it("reports the error to Sentry on mount", async () => {
    const ErrorBoundary = await importComponent();
    const error = new Error("page crash");
    render(<ErrorBoundary error={error} reset={() => undefined} />);
    expect(mockCaptureException).toHaveBeenCalledWith(error);
  });
});
