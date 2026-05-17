import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RouteErrorBoundary } from "./RouteErrorBoundary";

const mockCaptureException = vi.hoisted(() => vi.fn());
vi.mock("@sentry/nextjs", () => ({
  captureException: mockCaptureException,
}));

afterEach(cleanup);
beforeEach(() => mockCaptureException.mockClear());

describe("Sentry reporting", () => {
  it("reports the error to Sentry on mount", () => {
    const error = new Error("page crash");
    render(<RouteErrorBoundary error={error} reset={() => undefined} />);
    expect(mockCaptureException).toHaveBeenCalledWith(error);
  });
});
