import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { HeartButton } from "./HeartButton";
import { OPTION_LIST_COPY } from "./copy";

afterEach(cleanup);

describe("HeartButton", () => {
  it("renders with aria-label for interested state", () => {
    render(<HeartButton interested={true} onClick={() => undefined} />);

    const button = screen.getByRole("button", {
      name: OPTION_LIST_COPY.heart.removeInterest,
    });
    expect(button).toBeDefined();
  });

  it("renders with aria-label for not-interested state", () => {
    render(<HeartButton interested={false} onClick={() => undefined} />);

    const button = screen.getByRole("button", {
      name: OPTION_LIST_COPY.heart.markInterested,
    });
    expect(button).toBeDefined();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<HeartButton interested={false} onClick={onClick} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: OPTION_LIST_COPY.heart.markInterested,
      }),
    );
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <HeartButton interested={false} disabled={true} onClick={onClick} />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: OPTION_LIST_COPY.heart.markInterested,
      }),
    );
    expect(onClick).not.toHaveBeenCalled();
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <HeartButton
        interested={false}
        disabled={true}
        onClick={() => undefined}
      />,
    );

    const button = screen.getByRole("button", {
      name: OPTION_LIST_COPY.heart.markInterested,
    });
    expect(button.getAttribute("disabled")).toBeDefined();
  });
});
