import { useEffect } from "react";
import { appStyles as styles } from "../../styles/appStyles";
import { renderPdfPage } from "../../lib/pdf";

type Props = {
  selectedPdfBytes: number[] | null;
  totalPages: number;
  currentPage: number;
  zoom?: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
};

export default function PdfViewer({
  selectedPdfBytes,
  totalPages,
  currentPage,
  zoom = 1,
  setCurrentPage,
  setZoom,
}: Props) {
  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      if (!selectedPdfBytes || selectedPdfBytes.length === 0) return;

      try {
        const result = await renderPdfPage(
          selectedPdfBytes,
          currentPage,
          zoom || 1
        );

        if (!cancelled) {
          console.log("PDF gerendert, Seiten gesamt:", result.totalPages);
        }
      } catch (error) {
        console.error("Fehler beim PDF-Render:", error);
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [selectedPdfBytes, currentPage, zoom]);

  return (
    <div
      style={{
        ...styles.left,
        minWidth: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: 10 }}>
        PDF Vorschau
      </p>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 10,
          alignItems: "center",
          flexWrap: "wrap",
          flexShrink: 0,
        }}
      >
        <button
          style={styles.secondaryButton}
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage <= 1}
        >
          ← Zurück
        </button>

        <div style={{ ...styles.small, minWidth: 100 }}>
          Seite {currentPage} / {Math.max(1, totalPages)}
        </div>

        <button
          style={styles.secondaryButton}
          onClick={() =>
            setCurrentPage((prev) => Math.min(Math.max(1, totalPages), prev + 1))
          }
          disabled={currentPage >= totalPages}
        >
          Weiter →
        </button>

        <button
          style={styles.secondaryButton}
          onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
        >
          Zoom +
        </button>

        <button
          style={styles.secondaryButton}
          onClick={() => setZoom((z) => Math.max(z - 0.2, 0.6))}
        >
          Zoom -
        </button>
      </div>

      <div
        style={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          border: "1px solid #ddd",
          borderRadius: 8,
          background: "#f5f5f5",
          overscrollBehavior: "contain",
          padding: 12,
        }}
      >
        {selectedPdfBytes && selectedPdfBytes.length > 0 ? (
          <div
            style={{
              position: "relative",
              width: "100%",
              minHeight: "100%",
              overflowX: "auto",
              overflowY: "hidden",
              background: "#fff",
            }}
          >
            <canvas
              id="pdfCanvas"
              style={{
                display: "block",
              }}
            />

            <div
              id="pdfTextLayer"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
              }}
            />
          </div>
        ) : (
          <div style={{ padding: 16 }}>Keine PDF ausgewählt.</div>
        )}
      </div>
    </div>
  );
}
