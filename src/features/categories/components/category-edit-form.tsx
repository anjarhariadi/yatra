"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { categorySchema, type CategoryInput } from "../validation";
import { CATEGORY_TYPE_LABELS, type CategoryType } from "../validation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryEditFormProps {
  id: string;
  onSuccess?: () => void;
}

export function CategoryEditForm({ id, onSuccess }: CategoryEditFormProps) {
  const utils = trpc.useUtils();

  const { data: category, isLoading } = trpc.categories.getById.useQuery({
    id,
  });

  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      toast.success("Category updated successfully");
      utils.categories.getAll.invalidate();
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || "An error occurred");
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    values: category
      ? {
          name: category.name,
          type: category.type,
        }
      : undefined,
  });

  const onSubmit = async (data: CategoryInput) => {
    await updateMutation.mutateAsync({ id, data });
  };

  const categoryTypes: CategoryType[] = [
    "IDLE_CASH",
    "HOT_CASH",
    "EMERGENCY_FUND",
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded-md" />
        <div className="h-10 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  if (!category) {
    return <p>Category not found</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Category Name</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="e.g., Bank, EWallet, Cash"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="type"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Category Type</FieldLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger id="type" aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {categoryTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {CATEGORY_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={isSubmitting || updateMutation.isPending}
        >
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
