"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PDFHiddenRenderer from "./PDFHiddenRenderer";
import { Stage, Layer, Image as KImage, Rect } from "react-konva";
import { useSelections } from "@/store/useSelections";

function useImage(url: string | null, crossOrigin?: string): [HTMLImageElement | null] {
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!url) {
      setImageEl(null);
      return;
    }
    const img = new Image();
    if (crossOrigin) img.crossOrigin = crossOrigin as any;
    img.onload = () => setImageEl(img);
    img.onerror = () => setImageEl(null);
    img.src = url;
    return () => {
      setImageEl(null);
    };
  }, [url, crossOrigin]);
  return [imageEl];
}


function ImageBackground({ fileUrl }: { fileUrl: string }) {
  const [img] = useImage(fileUrl, "anonymous");
  const { setNaturalSize, setBgSource } = useSelections();

  useEffect(() => {
    if (img && img.width && img.height) {
      setNaturalSize({ width: img.width, height: img.height });
      setBgSource(img as any);
    }
  }, [img, setNaturalSize, setBgSource]);

  if (!img) return null;
  return <KImage image={img} x={0} y={0} />;
}

export default function Viewer() {
  const {
    file, isPDF, scale, page, pages, naturalSize,
    selections, activeId, setActive, addSelection, updateActive
  } = useSelections();

  const [drawing, setDrawing] = useState(false);
  const [start, setStart] = useState<{x:number;y:number}|null>(null);

  const stageRef = useRef<any>(null);

  // URL local para imagem
  const fileUrl = useMemo(() => file && !isPDF ? URL.createObjectURL(file) : null, [file, isPDF]);
  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);

  // pointer helper (ajusta pelo scale do Stage)
  const getPointer = () => {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return { x: 0, y: 0 };
    return { x: pos.x / scale, y: pos.y / scale };
  };

  const onMouseDown = () => {
    if (!file) return;
    const p = getPointer();
    setDrawing(true);
    setStart(p);
    // cria seleção vazia
    addSelection({ page, x: p.x, y: p.y, w: 0, h: 0 });
  };
  const onMouseMove = () => {
    if (!drawing || !start) return;
    const p = getPointer();
    const x = Math.min(start.x, p.x);
    const y = Math.min(start.y, p.y);
    const w = Math.abs(p.x - start.x);
    const h = Math.abs(p.y - start.y);
    // atualiza última seleção (ativa)
    updateActive({ x, y, w, h, page });
  };
  const onMouseUp = () => {
    setDrawing(false);
    setStart(null);
  };

  // dimensões do stage (mantemos o stage no tamanho natural e usamos scale do stage para zoom)
  const W = naturalSize.width || 1200;
  const H = naturalSize.height || 800;

  return (
    <div className="relative">
      {/* renderizador escondido do PDF apenas para gerar o canvas base */}
      {file && isPDF && <PDFHiddenRenderer file={file} />}

      {/* top toolbar para páginas PDF */}
      {isPDF && pages > 1 && (
        <div className="absolute z-10 left-3 top-3 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 shadow-soft px-2 py-1 text-sm">
          Página {page} de {pages} (use setPageInfo no store se quiser botões Prev/Next)
        </div>
      )}

      {/* área com scroll */}
      <div className="max-h-[75vh] overflow-auto bg-slate-50 dark:bg-slate-950 rounded-2xl">
        <Stage
          ref={stageRef}
          width={W * scale}
          height={H * scale}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          className="cursor-crosshair"
        >
          <Layer>
            {/* Background (imagem ou canvas do PDF) */}
            {!isPDF && fileUrl && <ImageBackground fileUrl={fileUrl} />}
            {/* se for PDF, o background já foi "setado" como canvas no store; usamos uma KImage com esse canvas */}
            {isPDF && <PDFBackground />}
            {/* Seleções */}
            {selections.map(sel => (
              <Rect
                key={sel.id}
                x={sel.x} y={sel.y} width={Math.max(1, sel.w)} height={Math.max(1, sel.h)}
                fill={activeId===sel.id ? "rgba(37,99,235,0.25)" : "rgba(14,165,233,0.18)"}
                stroke={activeId===sel.id ? "#1d4ed8" : "#0284c7"}
                strokeWidth={activeId===sel.id ? 2 : 1.5}
                onClick={(e) => { e.cancelBubble = true; setActive(sel.id); }}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

function PDFBackground() {
  const { bgSource } = useSelections();
  // quando o PDFHiddenRenderer terminar, bgSource será um <canvas>; Konva aceita como image source
  if (!bgSource) return null;
  return <KImage image={bgSource as HTMLCanvasElement} x={0} y={0} />;
}
