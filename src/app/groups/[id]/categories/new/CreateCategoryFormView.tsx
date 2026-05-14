import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { CREATE_CATEGORY_COPY } from "./copy";

interface CreateCategoryFormViewProps {
  name: string;
  onNameChange: (name: string) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  loading: boolean;
  error: string | undefined;
}

export function CreateCategoryFormView({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  onSubmit,
  loading,
  error,
}: CreateCategoryFormViewProps) {
  return (
    <div className="w-full max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold">{CREATE_CATEGORY_COPY.title}</h1>
      <form
        aria-label={CREATE_CATEGORY_COPY.title}
        onSubmit={onSubmit}
        className="space-y-4"
      >
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            {CREATE_CATEGORY_COPY.nameLabel}
          </label>
          <Input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => {
              onNameChange(e.target.value);
            }}
            placeholder={CREATE_CATEGORY_COPY.namePlaceholder}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="description" className="text-sm font-medium">
            {CREATE_CATEGORY_COPY.descriptionLabel}
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => {
              onDescriptionChange(e.target.value);
            }}
            placeholder={CREATE_CATEGORY_COPY.descriptionPlaceholder}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {CREATE_CATEGORY_COPY.submitButton}
        </Button>
      </form>
    </div>
  );
}
