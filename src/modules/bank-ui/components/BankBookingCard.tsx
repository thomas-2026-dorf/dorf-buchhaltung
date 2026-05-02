import { useEffect, useRef } from "react"
import type { BankBooking, BelegData, BookingSearchFields, SlimAssignmentMap } from "../types/bankSlimTypes"

function extractNameFromVerwendungszweck(verwendungszweck?: string) {
    if (!verwendungszweck) return ""

    return verwendungszweck
        .split("|")[0]
        .replace(/\s+/g, " ")
        .trim()
}


function extractRechnungsnrFromVerwendungszweck(verwendungszweck?: string) {
    if (!verwendungszweck) return ""

    const match =
        verwendungszweck.match(/\bRG\s*[:.-]?\s*(\d{2,})\b/i) ||
        verwendungszweck.match(/\bRECHNUNG\s*[:.-]?\s*(\d{2,})\b/i)

    return match?.[1] || ""
}

function isLikelyMitgliedszahlung(verwendungszweck?: string) {
    const text = String(verwendungszweck || "").toLowerCase()

    return [
        "mitglied",
        "mitgliedsbeitrag",
        "beitrag",
        "jahresbeitrag",
        "verein",
        "dorfgemeinschaft",
    ].some((keyword) => text.includes(keyword))
}

type BookingView = {
    bookingKey: string
    status: string
    belegId?: string
    bemerkung?: string
    kundennr?: string
    fewo?: string
    konto?: string
    lieferant?: string
    pfad?: string
    istAnzahlung?: boolean
}

type Props = {
    view: BookingView
    booking: BankBooking
    belege: BelegData[]
    assignments: SlimAssignmentMap
    savedAssignments: SlimAssignmentMap
    searchFields: BookingSearchFields
    isOpen: boolean
    isAssignOpen: boolean
    isSplitAssignOpen: boolean
    getFilteredBelege: (bookingKey: string) => BelegData[]
    useDateFilter: boolean
    onToggleDateFilter: (checked: boolean) => void
    onToggleOpen: () => void
    onSearchFocus: () => void
    onCloseAssignOnly: () => void
    onSearchChange: (field: keyof BookingSearchFields, value: string) => void
    onAssign: (belegId: string) => void
    onRemarkChange: (bemerkung: string) => void
    onKundennrChange: (kundennr: string) => void
    onMitgliedNameChange: (mitgliedName: string) => void
    onFewoChange: (fewo: string) => void
    onAnzahlungChange: (istAnzahlung: boolean) => void
    onBelegFehltChange: (belegFehlt: boolean) => void
    onSplitBetragChange: (belegId: string, betrag: string) => void
    onRemoveSplitBeleg: (belegId: string) => void
    onToggleSplitAssign: () => void
    onAddSplitBeleg: (belegId: string) => void
    onSaveAssignments: () => void
    onOpenBeleg: (belegId: string) => void
    onResetBeleg: (belegId: string) => void
}

export default function BankBookingCard({
    view,
    booking,
    belege,
    assignments,
    savedAssignments,
    searchFields,
    isOpen,
    isAssignOpen,
    getFilteredBelege,
    useDateFilter,
    onToggleDateFilter,
    onToggleOpen,
    onSearchFocus,
    onCloseAssignOnly,
    onSearchChange,
    onAssign,
    onRemarkChange,
    onKundennrChange,
    onMitgliedNameChange,
    onAnzahlungChange,
    onBelegFehltChange,
    onRemoveSplitBeleg,
    onAddSplitBeleg,
    onSaveAssignments,
    onOpenBeleg,
    onResetBeleg,
}: Props) {
    const rootRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!isOpen) return

        requestAnimationFrame(() => {
            rootRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            })
        })
    }, [isOpen])

    const currentAssignment = assignments[view.bookingKey] || {}
    const currentBelegId = currentAssignment.belegId || ""
    const savedBelegId = savedAssignments[view.bookingKey]?.belegId || ""
    const isSaved = !!currentBelegId && currentBelegId === savedBelegId
    const splitAssignments = currentAssignment.splitAssignments || []
    const isBelegFehlt = !!currentAssignment.belegFehlt

    const currentBeleg =
        belege.find((entry) => entry.id === currentBelegId) || null

    const quickSearchName = extractNameFromVerwendungszweck(booking.verwendungszweck)
    const quickSearchRechnungsnr = extractRechnungsnrFromVerwendungszweck(booking.verwendungszweck)

    useEffect(() => {
        if (!isOpen) return
        if (currentAssignment.mitgliedName?.trim()) return
        if (!quickSearchName.trim()) return
        if (!isLikelyMitgliedszahlung(booking.verwendungszweck)) return

        onMitgliedNameChange(quickSearchName)
    }, [
        isOpen,
        currentAssignment.mitgliedName,
        quickSearchName,
        booking.verwendungszweck,
        onMitgliedNameChange,
    ])

    function applyQuickSearch(field: keyof BookingSearchFields, value: string) {
        if (!value.trim()) return
        onSearchFocus()
        onSearchChange(field, value)
    }

    function toNumber(value?: string) {
        const normalized = String(value || "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim()

        const parsed = Number(normalized)
        return Number.isFinite(parsed) ? parsed : 0
    }

    const splitSumme = splitAssignments.reduce((sum, item) => {
        const splitBeleg = belege.find((entry) => entry.id === item.belegId)
        const wert = item.betrag || splitBeleg?.betrag || ""
        return sum + toNumber(wert)
    }, 0)

    const hauptbelegSumme = currentBeleg ? toNumber(currentBeleg.betrag) : 0
    const zuordnungssumme = hauptbelegSumme + splitSumme

    const amountSearchValue = Math.abs(booking.betrag)
        .toFixed(2)
        .replace(".", ",")

    function getUsageInfo(belegId: string) {
        const entries = Object.entries(assignments).filter(
            ([, value]) =>
                value?.belegId === belegId ||
                (value?.splitAssignments || []).some((item) => item.belegId === belegId)
        )

        const isCurrent = currentBelegId === belegId
        const isSplitSelected = splitAssignments.some((item) => item.belegId === belegId)
        const isSelected = isCurrent || isSplitSelected
        const isUsedAnywhere = entries.length > 0
        const isUsedElsewhere = entries.some(([key]) => key !== view.bookingKey)

        return {
            isCurrent,
            isSplitSelected,
            isSelected,
            isUsedAnywhere,
            isUsedElsewhere,
        }
    }

    const cardBackground = isOpen
        ? "#E5E7EB"
        : isBelegFehlt
            ? "#FEF3C7"
            : view.status === "offen"
                ? "#fff4f4"
                : view.status === "fehlt"
                    ? "#ffeaea"
                    : view.status === "vermerkt"
                        ? "#EFF6FF"
                        : view.status === "zugeordnet"
                            ? "#f4fff4"
                            : "#ffffff"

    const badgeBackground =
        isBelegFehlt
            ? "#FDE68A"
            : view.status === "vermerkt"
                ? "#DBEAFE"
                : !currentBelegId
                    ? "#FEE2E2"
                    : isSaved
                        ? "#DCFCE7"
                        : "#FEF3C7"

    const badgeColor =
        isBelegFehlt
            ? "#92400E"
            : view.status === "vermerkt"
                ? "#1D4ED8"
                : !currentBelegId
                    ? "#991B1B"
                    : isSaved
                        ? "#166534"
                        : "#92400E"

    const badgeText = isBelegFehlt ? "beleg fehlt" : view.status

    return (
        <div
            ref={rootRef}
            onClick={onToggleOpen}
            style={{
                border: isOpen ? "2px solid #9CA3AF" : "1px solid #D7E3D7",
                borderRadius: 10,
                padding: 8,
                display: "grid",
                gap: 8,
                cursor: "pointer",
                background: cardBackground,
                scrollMarginTop: 140,
                boxShadow: isOpen ? "0 0 0 2px rgba(156,163,175,0.18)" : "none",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                }}
            >
                <div style={{ fontWeight: 800, fontSize: 16 }}>
                    Buchung {booking.bookingKey}
                </div>

                <div
                    style={{
                        fontSize: 13,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: badgeBackground,
                        color: badgeColor,
                    }}
                >
                    {badgeText}
                </div>
            </div>

            {isOpen && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: "grid", gap: 8 }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(150px, 200px) minmax(120px, 160px)",
                            gap: 10,
                            alignItems: "start",
                        }}
                    >
                        <div>
                            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 2 }}>Betrag</div>
                            <button
                                type="button"
                                onClick={() => {
                                    onSearchFocus()
                                    onSearchChange("name", amountSearchValue)
                                }}
                                style={{
                                    fontWeight: 700,
                                    fontSize: 16,
                                    border: "none",
                                    background: "transparent",
                                    padding: 0,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    color: "#1D4ED8",
                                }}
                                title="Betrag als Suchwert übernehmen"
                            >
                                {booking.betrag.toFixed(2)} €
                            </button>
                        </div>

                        <div>
                            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 2 }}>Status</div>
                            <div style={{ fontWeight: 700 }}>{badgeText}</div>
                        </div>

                        <div
                            style={{
                                display: "none"
                            }}
                        >
                        </div>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(0, 1.6fr) minmax(260px, 0.9fr)",
                            gap: 10,
                            alignItems: "start",
                        }}
                    >
                        <div style={{ display: "grid", gap: 4 }}>
                            <div style={{ fontSize: 12, color: "#6B7280" }}>
                                Verwendungszweck
                            </div>

                            <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.3 }}>
                                {booking.verwendungszweck || "-"}
                            </div>
                        </div>

                        <div style={{ display: "grid", gap: 4, justifyItems: "start" }}>
                            <div style={{ fontSize: 12, color: "#6B7280" }}>
                                Auswahl
                            </div>

                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                <button
                                    type="button"
                                    onClick={() => applyQuickSearch("name", amountSearchValue)}
                                    style={{
                                        padding: "4px 10px",
                                        borderRadius: 999,
                                        border: "1px solid #D1D5DB",
                                        background: "#fff",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                    }}
                                >
                                    Betrag: {amountSearchValue}
                                </button>

                                {quickSearchName ? (
                                    <button
                                        type="button"
                                        onClick={() => applyQuickSearch("name", quickSearchName)}
                                        style={{
                                            padding: "4px 10px",
                                            borderRadius: 999,
                                            border: "1px solid #D1D5DB",
                                            background: "#fff",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Name: {quickSearchName}
                                    </button>
                                ) : null}

                                {quickSearchRechnungsnr ? (
                                    <button
                                        type="button"
                                        onClick={() => applyQuickSearch("rechnungsnummer", quickSearchRechnungsnr)}
                                        style={{
                                            padding: "4px 10px",
                                            borderRadius: 999,
                                            border: "1px solid #D1D5DB",
                                            background: "#fff",
                                            cursor: "pointer",
                                        }}
                                    >
                                        RG: {quickSearchRechnungsnr}
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "grid", gap: 8 }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 12,
                                flexWrap: "wrap",
                            }}
                        >
                            <div style={{ fontSize: 13, color: "#6B7280" }}>Beleg-Zuordnung</div>

                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 13,
                                    color: "#334155",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={useDateFilter}
                                    onChange={(e) => onToggleDateFilter(e.target.checked)}
                                />
                                <span>Zeitraum eingrenzen (6W davor bis Buchungstag)</span>
                            </label>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 1fr",
                                gap: 8,
                                alignItems: "end",
                            }}
                        >
                            <div style={{ display: "grid", gap: 4 }}>
                                <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>
                                    Name
                                </div>
                                <input
                                    value={searchFields.name}
                                    onFocus={onSearchFocus}
                                    onChange={(e) => onSearchChange("name", e.target.value)}
                                    placeholder="Name / Lieferant"
                                    style={{
                                        width: "100%",
                                        padding: "8px 10px",
                                        borderRadius: 6,
                                        border: "1px solid #D1D5DB",
                                        background: "#fff",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>

                            <div style={{ display: "grid", gap: 4 }}>
                                <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>
                                    RG-Nr
                                </div>
                                <input
                                    value={searchFields.rechnungsnummer}
                                    onFocus={onSearchFocus}
                                    onChange={(e) => onSearchChange("rechnungsnummer", e.target.value)}
                                    placeholder="RG-Nr"
                                    style={{
                                        width: "100%",
                                        padding: "8px 10px",
                                        borderRadius: 6,
                                        border: "1px solid #D1D5DB",
                                        background: "#fff",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                        </div>

                        {isAssignOpen && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onWheel={(e) => e.stopPropagation()}
                                style={{
                                    border: "1px solid #E5E7EB",
                                    borderRadius: 8,
                                    height: 260,
                                    maxHeight: 320,
                                    minHeight: 220,
                                    overflowY: "auto",
                                    overflowX: "hidden",
                                    overscrollBehaviorY: "contain",
                                    background: "#fff",
                                    boxSizing: "border-box",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => onAssign("")}
                                    style={{
                                        width: "100%",
                                        textAlign: "left",
                                        padding: "8px 10px",
                                        border: "none",
                                        borderBottom: "1px solid #F1F5F9",
                                        background: !view.belegId ? "#F8FAFC" : "#fff",
                                        cursor: "pointer",
                                    }}
                                >
                                    - keine Zuordnung -
                                </button>

                                {getFilteredBelege(view.bookingKey).map((beleg) => {
                                    const usage = getUsageInfo(beleg.id)

                                    return (
                                        <div
                                            key={`${view.bookingKey}-${beleg.id}`}
                                            style={{
                                                width: "100%",
                                                padding: "8px 10px",
                                                borderBottom: "1px solid #F1F5F9",
                                                background: usage.isCurrent
                                                    ? "#DBEAFE"
                                                    : usage.isSplitSelected
                                                        ? "#E0F2FE"
                                                        : usage.isUsedElsewhere
                                                            ? "#FFFBEB"
                                                            : "#fff",
                                                display: "grid",
                                                gap: 6,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "24px minmax(0, 1fr) auto auto",
                                                    gap: 10,
                                                    alignItems: "start",
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={usage.isSelected}
                                                    onChange={() => {
                                                        if (usage.isCurrent) {
                                                            onAssign("")
                                                            return
                                                        }

                                                        if (usage.isSplitSelected) {
                                                            onRemoveSplitBeleg(beleg.id)
                                                            return
                                                        }

                                                        if (!currentBelegId) {
                                                            onAssign(beleg.id)
                                                            return
                                                        }

                                                        onAddSplitBeleg(beleg.id)
                                                    }}
                                                    style={{
                                                        marginTop: 3,
                                                        width: 16,
                                                        height: 16,
                                                        cursor: "pointer",
                                                    }}
                                                />

                                                <div style={{ display: "grid", gap: 0 }}>
                                                    <div style={{ fontWeight: 600, fontSize: 14, color: "#334155" }}>
                                                        {beleg.id} | {beleg.lieferant || "Ohne Name"} | {beleg.datum || "-"} | {beleg.betrag || "-"} € | RG: {beleg.rechnungsnummer || "-"} | {beleg.konto || "-"} | {beleg.fewoId || "-"}
                                                    </div>
                                                </div>

                                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                    {usage.isCurrent ? (
                                                        <span
                                                            style={{
                                                                fontSize: 12,
                                                                fontWeight: 700,
                                                                padding: "2px 8px",
                                                                borderRadius: 999,
                                                                background: "#DBEAFE",
                                                                color: "#1D4ED8",
                                                            }}
                                                        >
                                                            Hauptbeleg
                                                        </span>
                                                    ) : null}

                                                    {usage.isSplitSelected ? (
                                                        <span
                                                            style={{
                                                                fontSize: 12,
                                                                fontWeight: 700,
                                                                padding: "2px 8px",
                                                                borderRadius: 999,
                                                                background: "#E0F2FE",
                                                                color: "#0369A1",
                                                            }}
                                                        >
                                                            zusätzlich
                                                        </span>
                                                    ) : null}

                                                    {!usage.isSelected && usage.isUsedElsewhere ? (
                                                        <span
                                                            style={{
                                                                fontSize: 12,
                                                                fontWeight: 700,
                                                                padding: "2px 8px",
                                                                borderRadius: 999,
                                                                background: "#FEF3C7",
                                                                color: "#92400E",
                                                            }}
                                                        >
                                                            bereits verwendet
                                                        </span>
                                                    ) : null}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => onOpenBeleg(beleg.id)}
                                                    style={{
                                                        padding: "4px 8px",
                                                        borderRadius: 8,
                                                        border: "1px solid #CBD5E1",
                                                        background: "#fff",
                                                        cursor: "pointer",
                                                        fontSize: 16,
                                                        lineHeight: 1,
                                                    }}
                                                    title="Beleg ansehen"
                                                >
                                                    👁
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 8 }}>
                        <div style={{ display: "flex", gap: 8 }}>
                            {isAssignOpen ? (
                                <button
                                    type="button"
                                    onClick={onCloseAssignOnly}
                                    style={{
                                        flex: 1,
                                        padding: "10px 12px",
                                        borderRadius: 8,
                                        border: "1px solid #94A3B8",
                                        background: "#F1F5F9",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                    }}
                                >
                                    Fertig
                                </button>
                            ) : (
                                <div style={{ flex: 1 }} />
                            )}

                            <button
                                type="button"
                                onClick={() => onResetBeleg(currentBelegId || "")}
                                style={{
                                    padding: "10px 12px",
                                    borderRadius: 8,
                                    border: "1px solid #FCA5A5",
                                    background: "#FEF2F2",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                }}
                            >
                                Zurücksetzen
                            </button>

                            <button
                                type="button"
                                onClick={onSaveAssignments}
                                style={{
                                    padding: "10px 12px",
                                    borderRadius: 8,
                                    border: "1px solid #86EFAC",
                                    background: "#ECFDF5",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                }}
                            >
                                Speichern
                            </button>
                        </div>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(260px, 1.8fr) minmax(180px, 220px) minmax(180px, 220px)",
                            gap: 12,
                            alignItems: "end",
                        }}
                    >
                        <div>
                            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>
                                Bemerkung
                            </div>
                            <input
                                type="text"
                                placeholder="z. B. Altfall 2024, kein Beleg vorhanden"
                                value={currentAssignment.bemerkung || ""}
                                onChange={(e) => onRemarkChange(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "1px solid #D1D5DB",
                                    borderRadius: 8,
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        <div>
                            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>
                                Kd.Nr / Mitgl.Nr.
                            </div>
                            <input
                                type="text"
                                placeholder="z. B. M-0001"
                                value={currentAssignment.kundennr || ""}
                                onChange={(e) => onKundennrChange(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "1px solid #D1D5DB",
                                    borderRadius: 8,
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        <div>
                            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>
                                Mitglied
                            </div>
                            <input
                                type="text"
                                placeholder="z. B. Thomas Küster"
                                value={currentAssignment.mitgliedName || ""}
                                onChange={(e) => onMitgliedNameChange(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "1px solid #D1D5DB",
                                    borderRadius: 8,
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                    </div>

                    {(currentBeleg || splitAssignments.length > 0) && (
                        <div style={{ display: "grid", gap: 8 }}>
                            {currentBeleg ? (
                                <div
                                    style={{
                                        padding: "10px 12px",
                                        border: "1px solid #BFDBFE",
                                        borderRadius: 8,
                                        background: "#EFF6FF",
                                        display: "grid",
                                        gap: 4,
                                    }}
                                >
                                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8" }}>
                                        Zugeordneter Hauptbeleg
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: 14, color: "#334155" }}>
                                        {currentBeleg.id} | {currentBeleg.lieferant || "Ohne Name"} | {currentBeleg.datum || "-"} | {currentBeleg.betrag || "-"} € | RG: {currentBeleg.rechnungsnummer || "-"} | {currentBeleg.konto || "-"} | {currentBeleg.fewoId || "-"}
                                    </div>
                                </div>
                            ) : null}

                            {splitAssignments.length > 0 ? (
                                <div style={{ display: "grid", gap: 6 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
                                        Weitere zugeordnete Belege
                                    </div>

                                    {splitAssignments.map((item, index) => {
                                        const beleg = belege.find((entry) => entry.id === item.belegId)

                                        return (
                                            <div
                                                key={`${view.bookingKey}-split-info-${item.belegId}-${index}`}
                                                style={{
                                                    padding: "8px 10px",
                                                    border: "1px solid #E5E7EB",
                                                    borderRadius: 8,
                                                    background: "#F8FAFC",
                                                    display: "grid",
                                                    gap: 4,
                                                }}
                                            >
                                                <div style={{ fontWeight: 600, fontSize: 14, color: "#334155" }}>
                                                    {item.belegId} {beleg?.lieferant ? `| ${beleg.lieferant}` : ""} | {beleg?.datum || "-"} | Beleg: {beleg?.betrag || "-"} € | Teil: {item.betrag || "-"} € | RG: {beleg?.rechnungsnummer || "-"}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : null}
                        </div>
                    )}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(180px, 220px) minmax(180px, 220px)",
                            gap: 12,
                            alignItems: "center",
                        }}
                    >
                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={!!currentAssignment.istAnzahlung}
                                onChange={(e) => onAnzahlungChange(e.target.checked)}
                            />
                            <span style={{ fontSize: 14, color: "#334155" }}>
                                Als Anzahlung markieren
                            </span>
                        </label>

                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={!!currentAssignment.belegFehlt}
                                onChange={(e) => onBelegFehltChange(e.target.checked)}
                            />
                            <span style={{ fontSize: 14, color: "#92400E" }}>
                                Beleg fehlt
                            </span>
                        </label>
                    </div>

                    <div
                        style={{
                            padding: "10px 12px",
                            borderRadius: 8,
                            background: "#F8FAFC",
                            fontSize: 13,
                            color: "#334155",
                            display: "flex",
                            gap: 16,
                            flexWrap: "wrap",
                        }}
                    >
                        <span>Ausgewählte Summe: {zuordnungssumme.toFixed(2)} €</span>
                        <span>Bankbetrag: {booking.betrag.toFixed(2)} €</span>
                        <span>Mitglied: {currentAssignment.mitgliedName || "-"}</span>
                        <span>Konto: {view.konto || "-"}</span>
                        <span>Lieferant: {view.lieferant || "-"}</span>
                    </div>
                </div>
            )}
        </div>
    )
}