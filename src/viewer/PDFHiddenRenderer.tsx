"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useSelections } from "@/store/useSelections";
import { pdfjs } from "react-pdf";

// worker do pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const Document = dynamic(async () => (await import("react-pdf")).Document, { ssr: false });
const Page = dynamic(async () => (await import("react-pdf")).Page, { ssr: false });

export default function PDFHiddenRenderer({ file }: { file: File }) {
  const { page, setPageInfo, setNaturalSize, setBgSource } = useSelections();
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // sempre que mudar página, vamos procurar o canvas e repassar pro Konva
    const id = setInterval(() => {
      const canvas = wrapRef.current?.querySelector("canvas");
      if (canvas && canvas.width && canvas.height) {
        setNaturalSize({ width: canvas.width, height: canvas.height });
        setBgSource(canvas);
        clearInterval(id);
      }
    }, 60);
    return () => clearInterval(id);
  }, [page, setNaturalSize, setBgSource]);

  return (
    <div style={{ position: "absolute", left: -10000, top: 0 }} aria-hidden ref={wrapRef}>
      <Document file={file} onLoadSuccess={(doc) => setPageInfo(1, doc.numPages)}>
        <Page pageNumber={page} scale={1} renderTextLayer={false} renderAnnotationLayer={false} />
      </Document>
    </div>
  );
}
