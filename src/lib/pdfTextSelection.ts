export function handlePdfTextSelection(args: {
  span: HTMLSpanElement;
  rawText: string;
  x: number;
  y: number;
  width: number;
  height: number;
  safePage: number;
  multiSelect: boolean;
  activeSelectedSpan: HTMLSpanElement | null;
  setActiveSelectedSpan: (span: HTMLSpanElement) => void;
}) {
  const {
    span,
    rawText,
    x,
    y,
    width,
    height,
    safePage,
    multiSelect,
    activeSelectedSpan,
    setActiveSelectedSpan,
  } = args;

  const currentText = ((window as any).selectedPdfText || "").trim();

  if (!multiSelect && activeSelectedSpan) {
    activeSelectedSpan.style.background = "transparent";
    activeSelectedSpan.style.outline = "none";
  }

  span.style.background = "rgba(255, 230, 0, 0.35)";
  span.style.outline = "1px solid rgba(255, 140, 0, 0.7)";
  setActiveSelectedSpan(span);

  let newText = rawText;

  if (multiSelect && currentText) {
    newText = `${currentText} ${rawText}`.trim();
  }

  (window as any).selectedPdfText = newText;
  window.dispatchEvent(
    new CustomEvent("pdf-text-selected", { detail: newText })
  );

  console.log("PDF/OCR Klick:", {
    text: newText,
    x,
    y,
    width,
    height,
    page: safePage,
    multiSelect,
  });
}
