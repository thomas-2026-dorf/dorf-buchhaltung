import { useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/core"

type BankDateiInfo = {
    fileName: string
    pfad: string
}

type SavedBankFile = {
    bookings?: Array<{ bookingKey?: string }>
    assignments?: Record<string, any>
}

type BankFileWithStatus = {
    fileName: string
    pfad: string
    status: "offen" | "fertig"
}

type Props = {
    baseFolder?: string
    year?: string
}

export default function BankImportOverview({ baseFolder, year }: Props) {
    const [files, setFiles] = useState<BankFileWithStatus[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function load() {
            if (!baseFolder || !year) {
                setFiles([])
                return
            }

            setLoading(true)

            try {
                const dateien = await invoke<BankDateiInfo[]>("bank_liste", {
                    baseFolder,
                    year,
                })

                const loaded = await Promise.all(
                    dateien.map(async (file) => {
                        const content = await invoke<string>("bank_datei_oeffnen", {
                            pfad: file.pfad,
                        })

                        let parsed: SavedBankFile = {}
                        try {
                            parsed = JSON.parse(content)
                        } catch {
                            parsed = {}
                        }

                        const bookings = Array.isArray(parsed.bookings) ? parsed.bookings : []
                        const assignments = parsed.assignments || {}

                        if (bookings.length === 0) {
                            return {
                                fileName: file.fileName,
                                pfad: file.pfad,
                                status: "offen",
                            } as BankFileWithStatus
                        }

                        const hasNichtFertig = bookings.some((booking) => {
                            const bookingKey = booking?.bookingKey || ""
                            if (!bookingKey) return true

                            const entry = assignments[bookingKey]

                            if (!entry) {
                                return true
                            }

                            const hasBeleg = !!entry?.belegId
                            const hasRemark = !!entry?.bemerkung?.trim()
                            const hasKundennr = !!entry?.kundennr?.trim()
                            const hasFewo = !!entry?.fewo?.trim()
                            const hasAnzahlung = !!entry?.istAnzahlung
                            const hasSplit = Array.isArray(entry?.splitAssignments) && entry.splitAssignments.length > 0

                            const istZugeordnet = hasBeleg || hasSplit
                            const istNurVermerkt = !istZugeordnet && (hasRemark || hasKundennr || hasFewo || hasAnzahlung)

                            return !istZugeordnet || istNurVermerkt
                        })

                        return {
                            fileName: file.fileName,
                            pfad: file.pfad,
                            status: hasNichtFertig ? "offen" : "fertig",
                        } as BankFileWithStatus
                    })
                )

                setFiles(loaded)
            } catch (err) {
                console.error("Fehler beim Laden der Bank-Übersicht:", err)
                setFiles([])
            } finally {
                setLoading(false)
            }
        }

        void load()
    }, [baseFolder, year])

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
            <strong>Bank-Übersicht</strong>

            {loading && <div>Lädt...</div>}

            {!loading && !baseFolder && (
                <div style={{ color: "#6B7280" }}>
                    Bitte zuerst einen Basisordner wählen.
                </div>
            )}

            {!loading && baseFolder && files.length === 0 && (
                <div style={{ color: "#6B7280" }}>
                    Keine Bank-Dateien gefunden.
                </div>
            )}

            {!loading &&
                files.map((file) => (
                    <div
                        key={file.pfad}
                        style={{
                            padding: "10px 12px",
                            borderRadius: 8,
                            border: "1px solid #E5E7EB",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: file.status === "offen" ? "#fff4f4" : "#f4fff4",
                        }}
                    >
                        <div style={{ fontWeight: 600 }}>
                            {file.fileName}
                        </div>

                        <div
                            style={{
                                fontWeight: 700,
                                color: file.status === "offen" ? "#991B1B" : "#166534",
                            }}
                        >
                            {file.status}
                        </div>
                    </div>
                ))}
        </div>
    )
}
