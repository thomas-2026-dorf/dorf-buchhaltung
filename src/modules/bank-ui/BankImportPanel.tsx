import { useCallback, useEffect, useMemo, useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import { readDir } from "@tauri-apps/plugin-fs"
import type { BankBooking, BelegData, BookingSearchMap, SlimAssignmentMap } from "./types/bankSlimTypes"
import { deriveBookingViews } from "./lib/utils"
import { loadBankBelege } from "./lib/loadBankBelege"
import { getFilteredBelege } from "./lib/getFilteredBelege"
import { applyRemarkChange } from "./lib/applyRemarkChange"
import { applyKundennrChange } from "./lib/applyKundennrChange"
import { applyMitgliedNameChange } from "./lib/applyMitgliedNameChange"
import { applyFewoChange } from "./lib/applyFewoChange"
import { applyAnzahlungChange } from "./lib/applyAnzahlungChange"
import { applySplitBetragChange } from "./lib/applySplitBetragChange"
import { removeSplitBeleg } from "./lib/removeSplitBeleg"
import { applyAddSplitBelegChange } from "./lib/applyAddSplitBelegChange"
import { applyAssignChange } from "./lib/applyAssignChange"
import { buildAssignmentsAfterBelegReset } from "./lib/buildAssignmentsAfterBelegReset"
import { findBelegToOpen } from "./lib/findBelegToOpen"
import { buildBankSavePayload } from "./lib/buildBankSavePayload"
import { prepareImportSession } from "./lib/prepareImportSession"
import { applySearchValueChange } from "./lib/applySearchValueChange"
import { prepareImportData } from "./lib/prepareImportData"
import BankBookingCard from "./components/BankBookingCard"
import { prepareImportedBookings } from "./lib/prepareImportedBookings"
import { ladeCsvFeldZuordnung, type CsvFeldZuordnung } from "../../lib/settings/csvFeldZuordnung"
import { ladeBelegeAusJahresdatei } from "../../lib/belege"
import { loadAllBankJsons } from "./loadAllBankJsons"

type Props = {
    baseFolder?: string
    year?: string
    onKontoExportReady?: ((handler: (() => Promise<void>) | null) => void)
}

type CsvListItem = {
    name: string
    path: string
    savedIsComplete: boolean
    savedHasBelegFehlt: boolean
    hasSavedJson: boolean
}

type StoredAssignmentLike = {
    belegId?: string
    bemerkung?: string
    splitAssignments?: Array<{ belegId?: string }>
    istAnzahlung?: boolean
    belegFehlt?: boolean
}

type StoredBankImportLike = {
    fileName?: string
    bookings?: Array<{ bookingKey?: string }>
    assignments?: Record<string, StoredAssignmentLike>
}

function normalizeName(value: string) {
    return value.trim().toLowerCase()
}

function hasText(value: unknown) {
    return typeof value === "string" && value.trim().length > 0
}

function isAssignmentComplete(assignment?: StoredAssignmentLike) {
    if (!assignment) return false

    const hasMainBeleg = hasText(assignment.belegId)
    const hasSplitBeleg =
        Array.isArray(assignment.splitAssignments) &&
        assignment.splitAssignments.some((item) => hasText(item?.belegId))
    const isAnzahlung = assignment.istAnzahlung === true
    const hasRemark = hasText(assignment.bemerkung)
    const isBelegFehlt = assignment.belegFehlt === true

    return hasMainBeleg || hasSplitBeleg || isAnzahlung || hasRemark || isBelegFehlt
}

function isImportComplete(importData: StoredBankImportLike) {
    const bookings = Array.isArray(importData.bookings) ? importData.bookings : []
    if (bookings.length === 0) return false

    const assignments =
        importData.assignments && typeof importData.assignments === "object"
            ? importData.assignments
            : {}

    return bookings.every((booking) => {
        const bookingKey = typeof booking?.bookingKey === "string" ? booking.bookingKey : ""
        if (!bookingKey) return false
        return isAssignmentComplete(assignments[bookingKey])
    })
}

function importHasBelegFehlt(importData: StoredBankImportLike) {
    const assignments =
        importData.assignments && typeof importData.assignments === "object"
            ? Object.values(importData.assignments)
            : []

    return assignments.some((assignment) => assignment?.belegFehlt === true)
}

export default function BankImportPanel({
    baseFolder,
    year,
    onKontoExportReady,
}: Props) {
    const [bookings, setBookings] = useState<BankBooking[]>([])
    const [currentImportId, setCurrentImportId] = useState("")
    const [currentFileName, setCurrentFileName] = useState("")
    const [belege, setBelege] = useState<BelegData[]>([])
    const [assignments, setAssignments] = useState<SlimAssignmentMap>({})
    const [suggestionMap, setSuggestionMap] = useState<Record<string, BelegData[]>>({})
    const [savedAssignments, setSavedAssignments] = useState<SlimAssignmentMap>({})
    const [searchMap, setSearchMap] = useState<BookingSearchMap>({})
    const [dateFilterMap, setDateFilterMap] = useState<Record<string, boolean>>({})
    const [openBookingKey, setOpenBookingKey] = useState<string | null>(null)
    const [openAssignKey, setOpenAssignKey] = useState<string | null>(null)
    const [openSplitAssignKey, setOpenSplitAssignKey] = useState<string | null>(null)
    const [csvFiles, setCsvFiles] = useState<CsvListItem[]>([])
    const [loadingCsvFiles, setLoadingCsvFiles] = useState(false)
    const [csvFilesError, setCsvFilesError] = useState("")
    const [csvZuordnung, setCsvZuordnung] = useState<CsvFeldZuordnung | undefined>(undefined)

    useEffect(() => {
        ladeCsvFeldZuordnung().then(setCsvZuordnung)
    }, [])

    useEffect(() => {
        async function loadBelege() {
            if (!baseFolder || !year) {
                setBelege([])
                return
            }

            try {
                const mapped = await loadBankBelege(baseFolder, year)
                setBelege(mapped)
            } catch {
                setBelege([])
            }
        }

        void loadBelege()
    }, [baseFolder, year])

    useEffect(() => {
        if (!onKontoExportReady) return
        onKontoExportReady(null)

        

    return () => {
            onKontoExportReady?.(null)
        }
    }, [onKontoExportReady])

    const loadAvailableCsvFiles = useCallback(async () => {
        if (!baseFolder) {
            setCsvFiles([])
            setCsvFilesError("Basisordner fehlt.")
            return
        }

        setLoadingCsvFiles(true)
        setCsvFilesError("")

        try {
            // Elternordner (eine Ebene über baseFolder) für globalen Bank-Ordner
            const parentFolder = baseFolder.replace(/\/[^/]+\/?$/, "")

            const candidateFolders = [
                `${baseFolder}/Bank`,
                `${baseFolder}/Bank/Unbearbeitet`,
                `${baseFolder}/Bank/Eingang`,
                `${baseFolder}/Bank/Import`,
                `${baseFolder}/Bank/Bearbeitet`,
                `${parentFolder}/Bank`,
            ]

            const csvMap = new Map<string, CsvListItem>()

            for (const ordner of candidateFolders) {
                try {
                    const entries = await readDir(ordner)

                    for (const entry of entries) {
                        const name = entry.name || ""
                        if (!name.toLowerCase().endsWith(".csv")) continue
                        if (year && !name.startsWith(`${year}-`)) continue

                        const key = normalizeName(name)
                        if (csvMap.has(key)) continue

                        csvMap.set(key, {
                            name,
                            path: `${ordner}/${name}`,
                            savedIsComplete: false,
                            savedHasBelegFehlt: false,
                            hasSavedJson: false,
                        })
                    }
                } catch {
                    // Ordner existiert evtl. nicht, dann nächsten testen
                }
            }

            const savedImports = (await loadAllBankJsons(baseFolder)) as StoredBankImportLike[]

            const nextCsvFiles = Array.from(csvMap.values())
                .map((item) => {
                    const matchingImport = savedImports.find(
                        (entry) => normalizeName(entry?.fileName || "") === normalizeName(item.name)
                    )

                    return {
                        ...item,
                        savedIsComplete: matchingImport ? isImportComplete(matchingImport) : false,
                        savedHasBelegFehlt: matchingImport ? importHasBelegFehlt(matchingImport) : false,
                        hasSavedJson: !!matchingImport,
                    }
                })
                .sort((a, b) =>
                    a.name.localeCompare(b.name, "de", {
                        numeric: true,
                        sensitivity: "base",
                    })
                )

            setCsvFiles(nextCsvFiles)

            if (nextCsvFiles.length === 0) {
                setCsvFilesError("Keine CSV-Dateien im Bankordner gefunden.")
            }
        } catch (err) {
            setCsvFiles([])
            setCsvFilesError("CSV-Liste konnte nicht geladen werden: " + String(err))
        } finally {
            setLoadingCsvFiles(false)
        }
    }, [baseFolder, year])

    useEffect(() => {
        void loadAvailableCsvFiles()
    }, [loadAvailableCsvFiles])

    const views = useMemo(() => {
        return deriveBookingViews(bookings, assignments, belege)
    }, [bookings, assignments, belege])

    const currentImportIsComplete = useMemo(() => {
        return isImportComplete({
            bookings,
            assignments,
        })
    }, [bookings, assignments])

    const currentImportHasBelegFehlt = useMemo(() => {
        return Object.values(assignments).some((assignment) => assignment?.belegFehlt === true)
    }, [assignments])

    async function importCsvText(text: string, fileName: string) {
        if (!baseFolder) {
            alert("Bitte zuerst einen Basisordner wählen.")
            return
        }

        if (!year) {
            alert("Bitte zuerst ein Jahr wählen.")
            return
        }

        const { nextBookingsAlt, nextBookings } = prepareImportedBookings(text, csvZuordnung)
        const originalBelege = await ladeBelegeAusJahresdatei(baseFolder, year)
        const { importId, geladeneAssignments } =
            await prepareImportSession(baseFolder, year, fileName)

        setCurrentImportId(importId)
        setCurrentFileName(fileName)

        const {
            mappedBelege,
            nextSuggestionMap,
            nextAssignments,
        } = prepareImportData(
            originalBelege,
            nextBookingsAlt,
            geladeneAssignments
        )

        setBookings(nextBookings)
        setBelege(mappedBelege)
        setSuggestionMap(nextSuggestionMap)
        setAssignments(nextAssignments)
        setSavedAssignments(geladeneAssignments)
        setSearchMap({})
        setDateFilterMap({})
        setOpenBookingKey(null)
        setOpenAssignKey(null)
        setOpenSplitAssignKey(null)
    }

    function handleAssign(bookingKey: string, belegId: string) {
        setAssignments((prev) => {
            const result = applyAssignChange(prev, bookingKey, belegId, belege)

            if (result.type === "not-found") {
                window.alert(`Beleg ${belegId} wurde nicht gefunden. Zuordnung wurde blockiert.`)
                return prev
            }

            if (result.type === "duplicate") {
                window.alert(
                    `Beleg ${belegId} ist bereits einer anderen Buchung zugeordnet.\n\nVorhandene Buchung:\n${result.andererBookingKey}\n\nDoppelte Zuordnung wurde blockiert.`
                )
                return prev
            }

            return result.nextAssignments
        })

        if (belegId) {
            setAssignments((prev) => {
                const current = prev[bookingKey]
                if (!current?.belegFehlt) return prev

                return {
                    ...prev,
                    [bookingKey]: {
                        ...current,
                        belegFehlt: false,
                    },
                }
            })

        }
    }

    function handleRemarkChange(bookingKey: string, bemerkung: string) {
        setAssignments((prev) =>
            applyRemarkChange(prev, bookingKey, bemerkung)
        )
    }

    function handleKundennrChange(bookingKey: string, kundennr: string) {
        setAssignments((prev) =>
            applyKundennrChange(prev, bookingKey, kundennr)
        )
    }

    function handleMitgliedNameChange(bookingKey: string, mitgliedName: string) {
        setAssignments((prev) =>
            applyMitgliedNameChange(prev, bookingKey, mitgliedName)
        )
    }

    function handleFewoChange(bookingKey: string, fewo: string) {
        setAssignments((prev) =>
            applyFewoChange(prev, bookingKey, fewo)
        )
    }

    function handleAnzahlungChange(bookingKey: string, istAnzahlung: boolean) {
        setAssignments((prev) =>
            applyAnzahlungChange(prev, bookingKey, istAnzahlung)
        )
    }

    function handleBelegFehltChange(bookingKey: string, belegFehlt: boolean) {
        setAssignments((prev) => {
            const current = prev[bookingKey] || {}
            const next = {
                ...prev,
                [bookingKey]: {
                    ...current,
                    belegFehlt,
                },
            }

            const nextEntry = next[bookingKey]
            const hasSplitAssignments =
                Array.isArray(nextEntry.splitAssignments) &&
                nextEntry.splitAssignments.length > 0

            const hasAnyValue =
                !!nextEntry.belegId ||
                !!nextEntry.bemerkung?.trim() ||
                !!nextEntry.kundennr?.trim() ||
                !!nextEntry.mitgliedId?.trim() ||
                !!nextEntry.mitgliedName?.trim() ||
                !!nextEntry.fewo?.trim() ||
                nextEntry.istAnzahlung === true ||
                nextEntry.belegFehlt === true ||
                hasSplitAssignments

            if (!hasAnyValue) {
                const cleaned = { ...next }
                delete cleaned[bookingKey]
                return cleaned
            }

            return next
        })
    }

    function handleAddSplitBeleg(bookingKey: string, belegId: string) {
        if (!belegId) return

        setAssignments((prev) => {
            const result = applyAddSplitBelegChange(prev, bookingKey, belegId)

            if (result.type === "already-included") {
                window.alert(`Beleg ${belegId} ist für diese Buchung bereits enthalten.`)
                return prev
            }

            if (result.type === "duplicate") {
                window.alert(
                    `Beleg ${belegId} ist bereits einer anderen Bankbuchung zugeordnet.\n\nVorhandene Buchung:\n${result.andererBookingKey}\n\nDoppelte Zuordnung wurde blockiert.`
                )
                return prev
            }

            return result.nextAssignments
        })
    }

    function handleSplitBetragChange(
        bookingKey: string,
        belegId: string,
        betrag: string
    ) {
        setAssignments((prev) =>
            applySplitBetragChange(prev, bookingKey, belegId, betrag)
        )
    }

    async function handleImportCsvFromPath(filePath: string, fileName: string) {
        try {
            let text: string

            try {
                text = await invoke<string>("bank_datei_oeffnen", { pfad: filePath })
            } catch {
                const raw = await invoke<number[]>("bank_datei_oeffnen_bytes", { pfad: filePath })
                const decoder = new TextDecoder("latin1")
                text = decoder.decode(new Uint8Array(raw))
            }

            await importCsvText(text, fileName)
        } catch (err) {
            alert("CSV konnte nicht geladen werden: " + String(err))
        }
    }

    async function handleSaveAssignments() {
        if (!baseFolder || !year) {
            alert("Bitte zuerst Basisordner und Jahr wählen.")
            return
        }

        if (!currentImportId) {
            alert("Bitte zuerst eine CSV laden.")
            return
        }

        const payload = buildBankSavePayload({
            currentImportId,
            currentFileName,
            bookings,
            assignments,
        })

        try {
            const pfad = await invoke<string>("bank_speichern", {
                baseFolder,
                year,
                content: JSON.stringify(payload, null, 2),
            })

            setSavedAssignments(assignments)
            setOpenBookingKey(null)
            setOpenAssignKey(null)
            setOpenSplitAssignKey(null)
            alert(`Zuordnung gespeichert:\n${pfad}`)
            await loadAvailableCsvFiles()
        } catch (err) {
            alert("Zuordnung konnte nicht gespeichert werden: " + String(err))
        }
    }

    async function handleOpenBeleg(belegId: string) {
        try {
            const result = await findBelegToOpen(baseFolder, year, belegId)

            if (result.type === "missing-input") {
                alert("Basisordner, Jahr oder Beleg-ID fehlt.")
                return
            }

            if (result.type === "not-found") {
                alert("Beleg konnte nicht gefunden werden.")
                return
            }

            if (!result.beleg.pfad) {
                alert("Für diesen Beleg ist kein PDF-Pfad gespeichert.")
                return
            }

            await invoke("pdf_im_system_oeffnen", {
                baseFolder,
                year,
                relpath: result.beleg.pfad,
            })
        } catch (err) {
            alert("Beleg konnte nicht geöffnet werden: " + String(err))
        }
    }

    async function handleResetBeleg(bookingKey: string, belegId: string) {
        if (!belegId) {
            alert("Beleg-ID fehlt.")
            return
        }

        const ok = window.confirm(
            `Zuordnung zu Beleg ${belegId} wirklich zurücksetzen?\n\nDer Beleg in der Jahresdatei bleibt erhalten.`
        )

        if (!ok) return

        setAssignments((prev) =>
            buildAssignmentsAfterBelegReset(prev, bookingKey)
        )
    }

    

    return (
        <div style={{ padding: 16, display: "grid", gap: 16 }}>
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 20,
                    display: "grid",
                    gap: 12,
                    paddingBottom: 8,
                    background: "#F8FAFC",
                }}
            >
                <div
                    style={{
                        padding: 14,
                        border: "1px solid #E5E7EB",
                        borderRadius: 12,
                        background: "#FFFFFF",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                        display: "grid",
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            flexWrap: "wrap",
                        }}
                    >
                        <div style={{ display: "grid", gap: 4 }}>
                            <strong>CSV-Monatsleiste</strong>
                            <span style={{ fontSize: 13, color: "#6B7280" }}>
                                Direkt aus dem Bankordner laden, oben sichtbar bleiben und per Klick wechseln.
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => void loadAvailableCsvFiles()}
                            style={{
                                border: "1px solid #D1D5DB",
                                borderRadius: 10,
                                padding: "8px 12px",
                                background: "#FFFFFF",
                                cursor: "pointer",
                                fontWeight: 600,
                            }}
                        >
                            Liste neu laden
                        </button>
                    </div>

                    {loadingCsvFiles && (
                        <div style={{ fontSize: 13, color: "#6B7280" }}>
                            CSV-Dateien werden geladen...
                        </div>
                    )}

                    {!!csvFilesError && (
                        <div style={{ fontSize: 13, color: "#B91C1C" }}>
                            {csvFilesError}
                        </div>
                    )}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                            gap: 8,
                            alignItems: "start",
                        }}
                    >
                        {csvFiles.map((file) => {
                            const isActive =
                                normalizeName(currentFileName) === normalizeName(file.name)

                            const isComplete = isActive
                                ? currentImportIsComplete
                                : file.savedIsComplete

                            const hasBelegFehlt = isActive
                                ? currentImportHasBelegFehlt
                                : file.savedHasBelegFehlt

                            const background = hasBelegFehlt
                                ? "#FEF3C7"
                                : isComplete
                                    ? "#DCFCE7"
                                    : "#FEE2E2"

                            const borderColor = hasBelegFehlt
                                ? "#FCD34D"
                                : isComplete
                                    ? "#86EFAC"
                                    : "#FCA5A5"

                            

    return (
                                <button
                                    key={file.path}
                                    type="button"
                                    onClick={() => void handleImportCsvFromPath(file.path, file.name)}
                                    style={{
                                        textAlign: "left",
                                        border: `2px solid ${isActive ? "#2563EB" : borderColor}`,
                                        borderRadius: 10,
                                        padding: "8px 10px",
                                        background,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 10,
                                        minHeight: 0,
                                        boxShadow: isActive
                                            ? "0 0 0 3px rgba(37,99,235,0.12)"
                                            : "none",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                            minWidth: 0,
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <strong style={{ fontSize: 15, whiteSpace: "nowrap" }}>
                                            {file.name.replace(/\.csv$/i, "")}
                                        </strong>

                                        <span
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 700,
                                                color: hasBelegFehlt
                                                    ? "#92400E"
                                                    : isComplete
                                                        ? "#166534"
                                                        : "#991B1B",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {hasBelegFehlt ? "gelb" : isComplete ? "grün" : "rot"}
                                        </span>

                                        <span
                                            style={{
                                                fontSize: 12,
                                                color: "#6B7280",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {isActive
                                                ? "geöffnet"
                                                : file.hasSavedJson
                                                    ? "gespeichert"
                                                    : "neu"}
                                        </span>
                                    </div>

                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: "#374151",
                                            whiteSpace: "nowrap",
                                            flexShrink: 0,
                                        }}
                                    >
                                        öffnen
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {views.map((view) => {
                const booking = bookings.find((b) => b.bookingKey === view.bookingKey)
                if (!booking) return null

                

    return (
                    <BankBookingCard
                        key={view.bookingKey}
                        view={view}
                        booking={booking}
                        belege={belege}
                        assignments={assignments}
                        savedAssignments={savedAssignments}
                        searchFields={
                            searchMap[view.bookingKey] || {
                                name: "",
                                rechnungsnummer: "",
                            }
                        }
                        isOpen={openBookingKey === view.bookingKey}
                        isAssignOpen={openAssignKey === view.bookingKey}
                        isSplitAssignOpen={openSplitAssignKey === view.bookingKey}
                        useDateFilter={!!dateFilterMap[view.bookingKey]}
                        onToggleDateFilter={(checked) =>
                            setDateFilterMap((prev) => ({
                                ...prev,
                                [view.bookingKey]: checked,
                            }))
                        }
                        getFilteredBelege={(currentBookingKey) =>
                            getFilteredBelege(
                                currentBookingKey,
                                searchMap,
                                suggestionMap,
                                belege,
                                booking.datum,
                                !!dateFilterMap[currentBookingKey]
                            )
                        }
                        onToggleOpen={() => {
                            const nextOpenBookingKey =
                                openBookingKey === view.bookingKey ? null : view.bookingKey

                            setOpenBookingKey(nextOpenBookingKey)

                            if (nextOpenBookingKey === view.bookingKey) {
                                setOpenAssignKey(view.bookingKey)
                            }
                        }}
                        onSearchFocus={() => {
                            setOpenAssignKey(view.bookingKey)
                        }}
                        onCloseAssignOnly={() => {
                            setOpenAssignKey(null)
                        }}
                        onSearchChange={(field, value) => {
                            setOpenAssignKey(view.bookingKey)
                            setSearchMap((prev) =>
                                applySearchValueChange(prev, view.bookingKey, field, value)
                            )
                        }}
                        onAssign={(belegId) => handleAssign(view.bookingKey, belegId)}
                        onRemarkChange={(bemerkung) =>
                            handleRemarkChange(view.bookingKey, bemerkung)
                        }
                        onKundennrChange={(kundennr) =>
                            handleKundennrChange(view.bookingKey, kundennr)
                        }
                        onMitgliedNameChange={(mitgliedName) =>
                            handleMitgliedNameChange(view.bookingKey, mitgliedName)
                        }
                        onFewoChange={(fewo) =>
                            handleFewoChange(view.bookingKey, fewo)
                        }
                        onAnzahlungChange={(istAnzahlung) =>
                            handleAnzahlungChange(view.bookingKey, istAnzahlung)
                        }
                        onBelegFehltChange={(belegFehlt) =>
                            handleBelegFehltChange(view.bookingKey, belegFehlt)
                        }
                        onSplitBetragChange={(belegId, betrag) =>
                            handleSplitBetragChange(view.bookingKey, belegId, betrag)
                        }
                        onRemoveSplitBeleg={(belegId) => {
                            setAssignments((prev) =>
                                removeSplitBeleg(prev, view.bookingKey, belegId)
                            )
                        }}
                        onToggleSplitAssign={() =>
                            setOpenSplitAssignKey((prev) =>
                                prev === view.bookingKey ? null : view.bookingKey
                            )
                        }
                        onAddSplitBeleg={(belegId) => {
                            handleAddSplitBeleg(view.bookingKey, belegId)
                            setOpenSplitAssignKey(null)
                        }}
                        onSaveAssignments={() => void handleSaveAssignments()}
                        onOpenBeleg={(belegId) => void handleOpenBeleg(belegId)}
                        onResetBeleg={(belegId) =>
                            void handleResetBeleg(view.bookingKey, belegId)
                        }
                    />
                )
            })}

            <details
                style={{
                    border: "1px solid #E5E7EB",
                    borderRadius: 12,
                    background: "#FFFFFF",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                    padding: 16,
                }}
            >
                <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                    Zuordnungs-Debug anzeigen
                </summary>

                <pre
                    style={{
                        marginTop: 12,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        fontSize: 12,
                        lineHeight: 1.5,
                    }}
                >
                    {JSON.stringify(assignments, null, 2)}
                </pre>
            </details>
        </div>
    )
}
