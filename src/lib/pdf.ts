import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { handlePdfTextSelection } from "./pdfTextSelection";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker;

let currentRenderTask: any = null;
let activeSelectedSpan: HTMLSpanElement | null = null;

type OcrWord = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

function createClickableTextSpan(args: {
  textLayer: HTMLDivElement;
  rawText: string;
  x: number;
  y: number;
  width: number;
  height: number;
  safePage: number;
}) {
  const { textLayer, rawText, x, y, width, height, safePage } = args;

  const span = document.createElement("span");
  span.textContent = rawText;
  span.dataset.text = rawText;

  span.style.position = "absolute";
  span.style.left = `${x}px`;
  span.style.top = `${y}px`;
  span.style.width = `${width}px`;
  span.style.height = `${height}px`;
  span.style.fontSize = `${Math.max(height * 0.8, 12)}px`;
  span.style.lineHeight = `${Math.max(height, 16)}px`;
  span.style.fontFamily = "sans-serif";
  span.style.whiteSpace = "nowrap";
  span.style.color = "rgba(255, 0, 0, 0.01)";
  span.style.background = "transparent";
  span.style.cursor = "pointer";
  span.style.userSelect = "none";
  (span.style as any).webkitUserSelect = "none";
  (span.style as any).webkitTouchCallout = "none";
  span.style.pointerEvents = "auto";
  span.style.zIndex = "2";
  span.style.display = "inline-block";
  span.style.overflow = "hidden";

  textLayer.appendChild(span);

  span.addEventListener("mouseup", (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    handlePdfTextSelection({
      span,
      rawText,
      x,
      y,
      width,
      height,
      safePage,
      multiSelect: event.shiftKey,
      activeSelectedSpan,
      setActiveSelectedSpan: (nextSpan) => {
        activeSelectedSpan = nextSpan;
      },
    });
  });

  span.addEventListener("dblclick", (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  });

  span.addEventListener("click", (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    handlePdfTextSelection({
      span,
      rawText,
      x,
      y,
      width,
      height,
      safePage,
      multiSelect: event.shiftKey,
      activeSelectedSpan,
      setActiveSelectedSpan: (nextSpan) => {
        activeSelectedSpan = nextSpan;
      },
    });
  });
}

export async function renderPdfPage(
  bytes: number[],
  pageNumber: number,
  zoom: number,
  ocrWords?: OcrWord[]
) {
  const pdf = await (pdfjsLib as any).getDocument({
    data: new Uint8Array(bytes),
  }).promise;

  const totalPages = pdf.numPages;
  const safePage = Math.min(Math.max(pageNumber, 1), totalPages);
  const page = await pdf.getPage(safePage);
  const renderScale = 1.0;
  const viewport = page.getViewport({ scale: renderScale * zoom });

  const canvas = document.getElementById("pdfCanvas") as HTMLCanvasElement | null;
  const textLayer = document.getElementById("pdfTextLayer") as HTMLDivElement | null;

  if (!canvas) return { totalPages };

  const ctx = canvas.getContext("2d");
  if (!ctx) return { totalPages };

  if (currentRenderTask) {
    try {
      currentRenderTask.cancel();
      await currentRenderTask.promise;
    } catch (error: any) {
      if (error?.name !== "RenderingCancelledException") {
        console.warn(
          "Vorheriger Render-Vorgang konnte nicht sauber beendet werden:",
          error
        );
      }
    } finally {
      currentRenderTask = null;
    }
  }

  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.floor(viewport.width * dpr);
  canvas.height = Math.floor(viewport.height * dpr);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (textLayer) {
    textLayer.innerHTML = "";
    textLayer.style.position = "absolute";
    textLayer.style.left = "0";
    textLayer.style.top = "0";
    textLayer.style.width = `${viewport.width}px`;
    textLayer.style.height = `${viewport.height}px`;
    textLayer.style.pointerEvents = "none";
    textLayer.style.userSelect = "none";
    textLayer.style.opacity = "1";
    textLayer.style.background = "transparent";
    textLayer.style.zIndex = "1";
  }

  activeSelectedSpan = null;
  (window as any).selectedPdfText = "";

  currentRenderTask = page.render({
    canvasContext: ctx,
    viewport,
  });

  try {
    await currentRenderTask.promise;
  } catch (error: any) {
    if (error?.name === "RenderingCancelledException") {
      return { totalPages };
    }
    throw error;
  } finally {
    currentRenderTask = null;
  }

  if (textLayer) {
    const textContent = await page.getTextContent();
    const textItems = (textContent.items as any[]).filter(
      (item) => item?.str && String(item.str).trim()
    );

    if (textItems.length > 0) {
      for (const item of textItems) {
        const rawText = String(item.str).trim();

        const tx = (pdfjsLib as any).Util.transform(
          viewport.transform,
          item.transform
        );

        const x = tx[4];
        const y = tx[5];
        const fontHeight = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
        const textWidth = Math.abs(item.width ? item.width * viewport.scale : 0);

        createClickableTextSpan({
          textLayer,
          rawText,
          x,
          y: y - fontHeight,
          width: textWidth,
          height: fontHeight,
          safePage,
        });
      }
    } else if (ocrWords && ocrWords.length > 0) {
      const maxRight = Math.max(...ocrWords.map((word) => word.x + word.width), 1);
      const maxBottom = Math.max(...ocrWords.map((word) => word.y + word.height), 1);

      const scaleX = viewport.width / maxRight;
      const scaleY = viewport.height / maxBottom;

      for (const word of ocrWords) {
        const rawText = String(word.text || "").trim();
        if (!rawText) continue;

        createClickableTextSpan({
          textLayer,
          rawText,
          x: word.x * scaleX,
          y: word.y * scaleY,
          width: word.width * scaleX,
          height: word.height * scaleY,
          safePage,
        });
      }

      console.log("OCR-Fallback-Overlay aktiv:", {
        page: safePage,
        words: ocrWords.length,
        scaleX,
        scaleY,
        viewportWidth: viewport.width,
        viewportHeight: viewport.height,
        maxRight,
        maxBottom,
      });
    }
  }

  return { totalPages };
}

export async function extractPdfText(bytes: number[]): Promise<string> {
  const pdf = await (pdfjsLib as any).getDocument({
    data: new Uint8Array(bytes),
  }).promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item: any) => item.str || "")
      .join(" ");

    fullText += "\n" + pageText;
  }

  return fullText.trim();
}

export async function pdfHatGenugText(bytes: number[]): Promise<boolean> {
  const pdf = await (pdfjsLib as any).getDocument({
    data: new Uint8Array(bytes),
  }).promise;

  let gefundeneZeichen = 0;
  const maxSeiten = Math.min(pdf.numPages, 3);

  for (let pageNum = 1; pageNum <= maxSeiten; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item: any) => item.str || "")
      .join(" ")
      .trim();

    gefundeneZeichen += pageText.replace(/\s+/g, "").length;

    if (gefundeneZeichen >= 40) {
      return true;
    }
  }

  return false;
}
