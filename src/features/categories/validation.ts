import { z } from "zod";

export const categoryTypes = [
  "IDLE_CASH",
  "HOT_CASH",
  "EMERGENCY_FUND",
] as const;

export const categoryColors = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
] as const;

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(categoryTypes, {
    errorMap: () => ({ message: "Please select a category type" }),
  }),
  color: z.enum(categoryColors, {
    errorMap: () => ({ message: "Please select a color" }),
  }),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export type CategoryType = z.infer<typeof categorySchema.shape.type>;

export type CategoryColor = z.infer<typeof categorySchema.shape.color>;

export const categoryColorVar = (color: CategoryColor | string) =>
  `var(--${color})`;

export const categoryBadgeStyle = (color: CategoryColor | string) => {
  const base = categoryColorVar(color);
  return {
    color: base,
    backgroundColor: `color-mix(in srgb, ${base} 15%, transparent)`,
    borderColor: `color-mix(in srgb, ${base} 40%, transparent)`,
  };
};

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  IDLE_CASH: "Uang Dingin",
  HOT_CASH: "Uang Panas",
  EMERGENCY_FUND: "Dana Darurat",
};
