import { ExportButtons } from '@/features/export'

export default function ExportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Export Data</h1>
        <p className="text-muted-foreground text-sm">
          Download a copy of all your data. Exports contain unencrypted
          financial information — keep them safe.
        </p>
      </div>
      <ExportButtons />
    </div>
  )
}
