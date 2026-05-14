"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

function SheetDemo({
  side,
}: {
  side: "top" | "right" | "bottom" | "left";
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger onClick={() => setOpen(true)}>Open sheet</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Sheet title</SheetTitle>
          <SheetDescription>Sheet description goes here.</SheetDescription>
        </SheetHeader>
        <p className="p-4 text-sm text-muted-foreground">Sheet body content.</p>
      </SheetContent>
    </Sheet>
  );
}

const meta: Meta<typeof SheetDemo> = {
  title: "UI/Sheet",
  component: SheetDemo,
  args: {
    side: "right",
  },
};

export default meta;
type Story = StoryObj<typeof SheetDemo>;

export const Right: Story = {
  args: { side: "right" },
};

export const Bottom: Story = {
  args: { side: "bottom" },
};

export const Left: Story = {
  args: { side: "left" },
};

export const Top: Story = {
  args: { side: "top" },
};
