import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { HeartButton } from "./HeartButton";
import { PICK_DETAIL_COPY } from "./copy";

afterEach(cleanup);

describe("HeartButton", () => {
  it("renders with the remove-ownership label when hearted", () => {
    render(<HeartButton hearted={true} onClick={() => undefined} />);

    expect(
      screen.getByRole("button", {
        name: PICK_DETAIL_COPY.heart.removeOwnership,
      }),
    ).toBeDefined();
  });

  it("renders with the add-ownership label when not hearted", () => {
    render(<HeartButton hearted={false} onClick={() => undefined} />);

    expect(
      screen.getByRole("button", {
        name: PICK_DETAIL_COPY.heart.addOwnership,
      }),
    ).toBeDefined();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<HeartButton hearted={false} onClick={onClick} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: PICK_DETAIL_COPY.heart.addOwnership,
      }),
    );

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(<HeartButton hearted={false} disabled={true} onClick={onClick} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: PICK_DETAIL_COPY.heart.addOwnership,
      }),
    );

    expect(onClick).not.toHaveBeenCalled();
  });

  it("is marked disabled in the DOM when disabled", () => {
    render(
      <HeartButton hearted={false} disabled={true} onClick={() => undefined} />,
    );

    const button = screen.getByRole("button", {
      name: PICK_DETAIL_COPY.heart.addOwnership,
    });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it("reflects the hearted state via aria-pressed", () => {
    render(<HeartButton hearted={true} onClick={() => undefined} />);

    const button = screen.getByRole("button", {
      name: PICK_DETAIL_COPY.heart.removeOwnership,
    });
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });
});
