"use client";

import { useQueryState } from "nuqs";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import {
  categoryTypes,
  CATEGORY_TYPE_LABELS,
  categoryBadgeStyle,
} from "@/features/categories/validation";
import { sortOptions } from "../query-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ChipProps {
  label: string;
  active: boolean;
  style?: React.CSSProperties;
  onClick: () => void;
}

function Chip({ label, active, style, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border text-xs px-2.5 py-1 transition-colors",
        !style && active && "bg-blue-500/10",
        !active && "text-muted-foreground hover:bg-accent",
      )}
      style={style && active ? style : undefined}
    >
      {label}
    </button>
  );
}

export function WalletFilters() {
  const [sort, setSort] = useQueryState("sort", sortOptions.sort);
  const [category, setCategory] = useQueryState(
    "category",
    sortOptions.category,
  );
  const [type, setType] = useQueryState("type", sortOptions.type);
  const { data: categories } = trpc.categories.getAll.useQuery();

  const toggle = (set: (v: string[]) => void, value: string[], item: string) =>
    set(
      value.includes(item) ? value.filter((v) => v !== item) : [...value, item],
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Sort</span>
        <Select
          value={sort}
          onValueChange={(v) => setSort(v as "asc" | "desc")}
        >
          <SelectTrigger size="sm" className="w-full lg:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Highest first</SelectItem>
            <SelectItem value="asc">Lowest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Category
        </span>
        <div className="flex flex-wrap gap-1.5">
          {categories?.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              active={category.includes(c.id)}
              style={categoryBadgeStyle(c.color)}
              onClick={() => toggle(setCategory, category, c.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Type</span>
        <div className="flex flex-wrap gap-1.5">
          {categoryTypes.map((t) => (
            <Chip
              key={t}
              label={CATEGORY_TYPE_LABELS[t]}
              active={type.includes(t)}
              onClick={() => toggle(setType, type, t)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function WalletFiltersSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <Filter className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="lg:hidden">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className=" p-4">
          <WalletFilters />
        </div>
      </SheetContent>
    </Sheet>
  );
}
