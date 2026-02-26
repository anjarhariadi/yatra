import { z } from "zod";

export const categoryTypes = [
  "IDLE_CASH",
  "HOT_CASH",
  "EMERGENCY_FUND",
] as const;

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(categoryTypes, {
    errorMap: () => ({ message: "Please select a category type" }),
  }),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export type CategoryType = z.infer<typeof categorySchema.shape.type>;

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  IDLE_CASH: "Uang Dingin",
  HOT_CASH: "Uang Panas",
  EMERGENCY_FUND: "Dana Darurat",
};
