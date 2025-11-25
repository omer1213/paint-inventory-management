"use client"

import * as React from "react"
import { useTypes } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function SettingsModule() {
  const { types, isLoading, addType, deleteType } = useTypes()
  const [name, setName] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      console.log("[v0] Adding product type:", name)
      setSubmitting(true)
      await addType(name)
      console.log("[v0] Product type added successfully")
      setName("")
      const { toast: showToast } = await import("@/hooks/use-toast").then((m) => ({ toast: m.toast }))
      showToast({ title: "✓ Type added", description: name })
    } catch (err: any) {
      setError(err?.message ?? "Failed to add type")
      console.error("[v0] Add type error:", err)
      const { toast: showToast } = await import("@/hooks/use-toast").then((m) => ({ toast: m.toast }))
      showToast({ title: "✗ Add failed", description: err?.message ?? "Failed to add type", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this type?")) return
    try {
      console.log("[v0] Deleting type:", id)
      await deleteType(id)
      console.log("[v0] Type deleted successfully")
      const { toast: showToast } = await import("@/hooks/use-toast").then((m) => ({ toast: m.toast }))
      showToast({ title: "✓ Type deleted" })
    } catch (err: any) {
      console.error("[v0] Delete type error:", err)
      const { toast: showToast } = await import("@/hooks/use-toast").then((m) => ({ toast: m.toast }))
      showToast({
        title: "✗ Delete failed",
        description: err?.message ?? "Failed to delete type",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-balance">Product Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onAdd} className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <Label htmlFor="type-name">New Type</Label>
              <Input
                id="type-name"
                placeholder="e.g. Emulsion"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-describedby="type-help"
              />
              <p id="type-help" className="text-muted-foreground text-sm mt-1">
                Add allowed product types. These appear in the Type dropdown on the Products tab.
              </p>
            </div>
            <Button type="submit" disabled={submitting || !name.trim()} aria-label="Add type">
              {submitting ? "Adding…" : "Add Type"}
            </Button>
          </form>

          {error ? <p className="text-destructive text-sm">{error}</p> : null}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2}>Loading…</TableCell>
                  </TableRow>
                ) : types.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      No types yet. Add your first type above.
                    </TableCell>
                  </TableRow>
                ) : (
                  types.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.name}</TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(t.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
