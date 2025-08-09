"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, Scissors, FileJson, FileDown, Trash2 } from "lucide-react";
import { useSelections } from "@/store/useSelections";
import dynamic from "next/dynamic";
const Viewer = dynamic(() => import("@/viewer/Viewer"), { ssr: false });
import { z } from "zod";
import { toCSV } from "@/lib/toCSV";

const selectionsSchema = z.array(z.object({
  id: z.string(),
  page: z.number(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  x_norm: z.number(),
  y_norm: z.number(),
  w_norm: z.number(),
  h_norm: z.number(),
}));

export default function Page() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    resetAll, file, setFile, isPDF, scale, setScale,
    selections, activeId, setActive, removeActive,
    exportActiveCrop, naturalSize
  } = useSelections();

  // Export JSON/CSV
  const jsonStr = useMemo(() => JSON.stringify(selections, null, 2), [selections]);

  const handleSelectFile = (f: File) => {
    resetAll();
    setFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) handleSelectFile(f);
  };

  const csvContent = useMemo(() => toCSV(selections), [selections]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Header */}
      <div className="xl:col-span-12 sticky top-0 z-10 backdrop-blur bg-white/60 dark:bg-slate-900/50 border border-white/20 dark:border-slate-800/80 rounded-2xl shadow-soft px-4 py-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 shadow-soft" />
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Selecionar Regiões em Imagens & PDFs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Carregue arquivos, desenhe áreas e exporte coordenadas/recortes.</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Sidebar */}
      <aside className="xl:col-span-4 space-y-6" onDragOver={(e)=>e.preventDefault()} onDrop={onDrop}>
        <Card>
          <CardHeader className="pb-2"><CardTitle>Arquivo</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div
              className="relative rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 text-center cursor-pointer bg-white/60 dark:bg-slate-900/40 hover:bg-white/80 dark:hover:bg-slate-900/60 transition"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e)=>e.preventDefault()}
              onDrop={onDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleSelectFile(f);
                }}
              />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <Upload className="h-10 w-10 opacity-80" />
                <p className="text-sm"><b>Clique</b> ou <b>arraste</b> (PNG, JPG, PDF)</p>
              </div>
            </div>

            {file && (
              <div className="text-sm text-slate-600 dark:text-slate-300">
                <b>{file.name}</b> • {(file.size/1024).toFixed(0)} KB {isPDF ? "(PDF)" : "(Imagem)"}
              </div>
            )}

            <Separator />

            <div>
              <label className="text-xs">Zoom: <span className="font-medium">{Math.round(scale*100)}%</span></label>
              <input
                type="range" min={50} max={300} step={10}
                value={Math.round(scale*100)}
                className="w-full accent-indigo-500"
                onChange={(e)=>setScale(parseInt(e.target.value)/100)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle>Exportar</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(jsonStr)}>
              <FileJson className="mr-2 h-4 w-4" /> Copiar JSON
            </Button>
            <Button variant="outline" onClick={() => {
              const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = "selecoes.csv"; a.click();
              URL.revokeObjectURL(url);
            }}>
              <FileDown className="mr-2 h-4 w-4" /> Baixar CSV
            </Button>
            <Button className="col-span-2" onClick={() => exportActiveCrop()?.catch(console.error)}>
              <Scissors className="mr-2 h-4 w-4" /> Baixar recorte da seleção ativa
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle>Seleções ({selections.length})</CardTitle></CardHeader>
          <CardContent className="grid gap-2 max-h-72 overflow-auto nice-scroll pr-1">
            {!selections.length && <div className="text-xs text-slate-500">Nenhuma seleção.</div>}
            {selections.map((sel: any) => (
              <div key={sel.id}
                   className={`p-3 rounded-xl border text-xs ${activeId===sel.id ? "border-indigo-400 bg-indigo-50/60 dark:bg-indigo-500/10" : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/30"}`}
                   onClick={()=>setActive(sel.id)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">#{sel.id.slice(-6)} {isPDF && `(página ${sel.page})`}</span>
                  <Button size="sm" variant="outline" onClick={() => removeActive()}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
                  </Button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                  <div>X: <b>{Math.round(sel.x)}</b></div>
                  <div>Y: <b>{Math.round(sel.y)}</b></div>
                  <div>Larg: <b>{Math.round(sel.w)}</b></div>
                  <div>Alt: <b>{Math.round(sel.h)}</b></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>

      {/* Stage */}
      <section className="xl:col-span-8">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>Área de Trabalho</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Viewer />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
