type Props = {
    baseFolder?: string
    year?: string
    belegeCount: number
    loadingBelege: boolean
    belegeError: string
}

export default function BankImportStatusCard({
    baseFolder,
    year,
    belegeCount,
    loadingBelege,
    belegeError,
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
            <div><strong>Basisordner:</strong> {baseFolder || "-"}</div>
            <div><strong>Jahr:</strong> {year || "-"}</div>
            <div><strong>Belege geladen:</strong> {belegeCount}</div>
            <div><strong>Status:</strong> {loadingBelege ? "lädt..." : "bereit"}</div>
            {!!belegeError && (
                <div style={{ color: "#b91c1c", marginTop: 8 }}>
                    <strong>Fehler:</strong> {belegeError}
                </div>
            )}
        </div>
    )
}
