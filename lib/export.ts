export function downloadCSV(headers: string[], rows: string[][], filename: string) {
  const escape = (val: string) => (/[",\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val)
  const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
