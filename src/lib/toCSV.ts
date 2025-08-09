export type CsvSelection = {
  id: string;
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
  x_norm?: number;
  y_norm?: number;
  w_norm?: number;
  h_norm?: number;
};

export function toCSV(selections: Array<Partial<CsvSelection>>): string {
  const header = [
    "id",
    "page",
    "x",
    "y",
    "w",
    "h",
    "x_norm",
    "y_norm",
    "w_norm",
    "h_norm",
  ];

  const rows = selections.map((s) => [
    String(s.id ?? ""),
    String(s.page ?? ""),
    String(Math.round((s.x ?? 0) as number)),
    String(Math.round((s.y ?? 0) as number)),
    String(Math.round((s.w ?? 0) as number)),
    String(Math.round((s.h ?? 0) as number)),
    s.x_norm != null ? String(s.x_norm) : "",
    s.y_norm != null ? String(s.y_norm) : "",
    s.w_norm != null ? String(s.w_norm) : "",
    s.h_norm != null ? String(s.h_norm) : "",
  ]);

  return [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
