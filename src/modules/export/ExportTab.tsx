type Props = {
    onBelegExport: () => void;
    onPdfExport: () => void;
    onKontoExport: () => Promise<void>;
    onStbExport: () => Promise<void>;
    pdfExportLoading: boolean;
};

export default function ExportTab({
    onStbExport,
    pdfExportLoading,
}: Props) {
    return (
        <div style={{ display: "grid", gap: 16 }}>
            <h2>STB Export</h2>

            <button
                onClick={() => void onStbExport()}
                disabled={pdfExportLoading}
                style={{ opacity: pdfExportLoading ? 0.6 : 1 }}
            >
                🔥 STB Gesamt Export
            </button>
        </div>
    );
}