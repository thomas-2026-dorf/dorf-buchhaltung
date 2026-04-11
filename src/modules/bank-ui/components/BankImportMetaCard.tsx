type Props = {
    currentFileName: string
    currentImportId: string
    bookingsCount: number
    onChooseCsv: () => void
    onFileChange: (file: File | null) => void
}

export default function BankImportMetaCard({
    currentFileName,
    currentImportId,
    bookingsCount,
    onChooseCsv,
    onFileChange,
}: Props) {
    return (
        <div
            style={{
                padding: 16,
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                background: "#FFFFFF",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                display: "grid",
                gap: 12,
            }}
        >
            <div>
                <button
                    type="button"
                    onClick={onChooseCsv}
                    style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid #4f46e5",
                        background: "#6366f1",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 700,
                    }}
                >
                    Neue CSV wählen
                </button>

                <input
                    id="bank-csv-input"
                    type="file"
                    accept=".csv"
                    style={{ display: "none" }}
                    onChange={(e) => {
                        onFileChange(e.target.files?.[0] || null)
                    }}
                />
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 14,
                    alignItems: "start",
                }}
            >
                <div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
                        Datei
                    </div>
                    <div style={{ fontWeight: 700, wordBreak: "break-word" }}>
                        {currentFileName || "-"}
                    </div>
                </div>

                <div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
                        Import-ID
                    </div>
                    <div style={{ fontWeight: 700, wordBreak: "break-word" }}>
                        {currentImportId || "-"}
                    </div>
                </div>

                <div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
                        Buchungen
                    </div>
                    <div style={{ fontWeight: 700 }}>
                        {bookingsCount}
                    </div>
                </div>
            </div>
        </div>
    )
}
