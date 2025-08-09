"use client";
import { create } from "zustand";
import { nanoid } from "./_util_nanoid";
import { Selection, SelectionExport, NaturalSize } from "@/types";

// estado global das seleções e arquivo atual
type State = {
  file: File | null;
  isPDF: boolean;
  scale: number;
  page: number;
  pages: number;
  naturalSize: NaturalSize;           // tamanho natural da "página" atual (img ou pdf)
  bgSource: HTMLImageElement | HTMLCanvasElement | null; // background para recortes
  selections: Selection[];
  activeId: string | null;
};

type Actions = {
  resetAll: () => void;
  setFile: (f: File) => void;
  setIsPDF: (b: boolean) => void;
  setScale: (s: number) => void;
  setPageInfo: (p: number, total: number) => void;
  setNaturalSize: (s: NaturalSize) => void;
  setBgSource: (el: HTMLImageElement | HTMLCanvasElement | null) => void;
  addSelection: (s: Omit<Selection, "id">) => void;
  setActive: (id: string | null) => void;
  updateActive: (partial: Partial<Selection>) => void;
  removeActive: () => void;
  exportActiveCrop: () => Promise<void> | null;
};

export const useSelections = create<State & Actions>((set, get) => ({
  file: null,
  isPDF: false,
  scale: 1,
  page: 1,
  pages: 1,
  naturalSize: { width: 0, height: 0 },
  bgSource: null,
  selections: [],
  activeId: null,

  resetAll: () => set({
    file: null, isPDF: false, page: 1, pages: 1, scale: 1,
    naturalSize: { width:0, height:0 }, bgSource: null, selections: [], activeId: null
  }),
  setFile: (f) => set({ file: f, isPDF: f.type==="application/pdf" || f.name.toLowerCase().endsWith(".pdf") }),
  setIsPDF: (b) => set({ isPDF: b }),
  setScale: (s) => set({ scale: Math.min(3, Math.max(0.5, s)) }),
  setPageInfo: (p, total) => set({ page: p, pages: total }),
  setNaturalSize: (s) => set({ naturalSize: s }),
  setBgSource: (el) => set({ bgSource: el }),
  addSelection: (s) => set((st) => ({ selections: [...st.selections, { ...s, id: nanoid() }], activeId: st.selections.length ? st.selections[st.selections.length-1].id : null })),
  setActive: (id) => set({ activeId: id }),
  updateActive: (partial) => set((st) => {
    if (!st.activeId) return st;
    const idx = st.selections.findIndex(s => s.id === st.activeId);
    if (idx < 0) return st;
    const current = st.selections[idx];
    const next = { ...current, ...partial };
    const selections = st.selections.slice(); selections[idx] = next;
    return { selections };
  }),
  removeActive: () => set((st) => {
    if (!st.activeId) return st;
    const selections = st.selections.filter(s => s.id !== st.activeId);
    return { selections, activeId: null };
  }),
  exportActiveCrop: () => {
    const st = get();
    if (!st.activeId || !st.bgSource) return null;
    const sel = st.selections.find(s => s.id === st.activeId);
    if (!sel) return null;

    return new Promise<void>((resolve) => {
      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.round(sel.w));
      off.height = Math.max(1, Math.round(sel.h));
      const ctx = off.getContext("2d")!;
      // desenha da fonte natural (imagem ou pdf canvas)
      ctx.drawImage(st.bgSource as any, sel.x, sel.y, sel.w, sel.h, 0, 0, off.width, off.height);
      off.toBlob((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob!);
        const base = st.file ? st.file.name.replace(/\.[^.]+$/, "") : (st.isPDF ? "pdf" : "imagem");
        a.download = `${base}-sel-${st.activeId!.slice(-6)}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
        resolve();
      }, "image/png");
    });
  },
}));

// helpers
export function selectionsForExport(list: Selection[], size: NaturalSize): SelectionExport[] {
  return list.map(s => ({
    ...s,
    x_norm: +(s.x / size.width),
    y_norm: +(s.y / size.height),
    w_norm: +(s.w / size.width),
    h_norm: +(s.h / size.height),
  }));
}

// nanoid mínimo (sem dependência)
