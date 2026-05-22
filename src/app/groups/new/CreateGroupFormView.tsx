import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { CREATE_GROUP_COPY } from "./copy";

const NEXT_GROUP_EMOJI: Record<string, string> = {
  "👥": "🎬",
  "🎬": "🍽️",
  "🍽️": "🎮",
  "🎮": "🎵",
  "🎵": "⚽",
  "⚽": "👥",
};

interface CreateGroupFormViewProps {
  name: string;
  emoji: string;
  onNameChange: (name: string) => void;
  onEmojiChange: (emoji: string) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  onCancel: () => void;
  loading: boolean;
  error: string | undefined;
}

export function CreateGroupFormView({
  name,
  emoji,
  onNameChange,
  onEmojiChange,
  onSubmit,
  onCancel,
  loading,
  error,
}: CreateGroupFormViewProps) {
  function handleEmojiButtonClick() {
    onEmojiChange(NEXT_GROUP_EMOJI[emoji] ?? "👥");
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold">{CREATE_GROUP_COPY.title}</h1>
      <div className="flex justify-center">
        <button
          type="button"
          aria-label={CREATE_GROUP_COPY.emojiPickerLabel}
          onClick={handleEmojiButtonClick}
          disabled={loading}
          className="flex h-24 w-24 items-center justify-center rounded-2xl bg-muted text-4xl disabled:pointer-events-none disabled:opacity-50"
        >
          {emoji}
        </button>
      </div>
      <form
        aria-label={CREATE_GROUP_COPY.title}
        onSubmit={onSubmit}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="create-group-name">
            {CREATE_GROUP_COPY.nameLabel}
          </Label>
          <Input
            id="create-group-name"
            type="text"
            required
            value={name}
            onChange={(e) => {
              onNameChange(e.target.value);
            }}
            placeholder={CREATE_GROUP_COPY.namePlaceholder}
            disabled={loading}
            className="w-full"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="space-y-2">
          <Button type="submit" disabled={loading} className="w-full">
            {CREATE_GROUP_COPY.submitButton}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            className="w-full"
          >
            {CREATE_GROUP_COPY.cancelButton}
          </Button>
        </div>
      </form>
    </div>
  );
}
