"use client";

import { FileJson, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

const exports = [
  {
    format: "csv",
    label: "Export CSV",
    description: "Spreadsheet-friendly balance history",
    icon: FileSpreadsheet,
  },
  {
    format: "json",
    label: "Export JSON",
    description: "Full data dump for backups",
    icon: FileJson,
  },
];

export function ExportButtons() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {exports.map((item) => (
        <Button
          key={item.format}
          asChild
          variant="outline"
          className="h-auto w-full justify-start px-4 py-4"
        >
          <a href={`/api/export/${item.format}`} download>
            <item.icon className="size-5 shrink-0" />
            <span className="flex flex-col items-start">
              <span>{item.label}</span>
              <span className="text-muted-foreground text-xs font-normal">
                {item.description}
              </span>
            </span>
          </a>
        </Button>
      ))}
    </div>
  );
}
