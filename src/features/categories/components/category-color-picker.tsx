import {
  categoryColors,
  categoryColorVar,
  type CategoryColor,
} from "../validation";
import { FieldLabel } from "@/components/ui/field";

interface CategoryColorPickerProps {
  value: CategoryColor;
  onChange: (value: CategoryColor) => void;
}

export function CategoryColorPicker({
  value,
  onChange,
}: CategoryColorPickerProps) {
  return (
    <div>
      <FieldLabel>Color</FieldLabel>
      <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Color">
        {categoryColors.map((color) => {
          const selected = value === color;
          return (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`Color ${color}`}
              onClick={() => onChange(color)}
              className={`h-8 w-8 rounded-full border-2 transition ${
                selected
                  ? "border-foreground scale-110"
                  : "border-transparent hover:scale-110"
              }`}
              style={{ backgroundColor: categoryColorVar(color) }}
            />
          );
        })}
      </div>
    </div>
  );
}
