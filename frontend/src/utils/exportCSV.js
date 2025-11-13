// Simple CSV export utility
export function exportToCsv(filename, rows) {
  if (!rows || !rows.length) {
    const csvContent = "";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const keys = Object.keys(rows[0]);
  const lines = [keys.join(",")];
  for (const row of rows) {
    const vals = keys.map((k) => {
      let v = row[k] === null || row[k] === undefined ? "" : row[k];
      // escape quotes
      if (typeof v === "string") {
        v = v.replace(/"/g, '""');
        if (v.indexOf(",") >= 0 || v.indexOf("\n") >= 0) {
          v = `"${v}"`;
        }
      }
      return v;
    });
    lines.push(vals.join(","));
  }

  const csvContent = lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
