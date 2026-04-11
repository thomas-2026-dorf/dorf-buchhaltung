import type {
    BankBooking,
    BelegData,
    DerivedBookingView,
    SlimAssignmentMap,
} from "../types/bankSlimTypes"

export function findBelegById(
    belege: BelegData[],
    belegId?: string,
): BelegData | undefined {
    if (!belegId) return undefined
    return belege.find((beleg) => beleg.id === belegId)
}

export function mapFewoIdToLabel(fewoId?: string): string {
    if (!fewoId) return ""

    if (fewoId === "tina") return "Tina"
    if (fewoId === "harmony") return "Harmony"
    if (fewoId === "tinchen") return "Tinchen"

    return fewoId
}

export function deriveBookingView(
    booking: BankBooking,
    assignments: SlimAssignmentMap,
    belege: BelegData[],
): DerivedBookingView {
    const assignment = assignments[booking.bookingKey]
    const belegId = assignment?.belegId || ""
    const bemerkung = assignment?.bemerkung?.trim() || ""
    const splitAssignments = assignment?.splitAssignments || []
    const kundennr = assignment?.kundennr?.trim() || ""
    const assignmentFewo = assignment?.fewo?.trim() || ""
    const istAnzahlung = !!assignment?.istAnzahlung
    const beleg = findBelegById(belege, belegId)

    const hatVermerk =
        !!bemerkung || !!kundennr || !!assignmentFewo || istAnzahlung

    if (!belegId && hatVermerk) {
        return {
            bookingKey: booking.bookingKey,
            bemerkung,
            kundennr,
            fewo: assignmentFewo,
            istAnzahlung,
            splitAssignments,
            status: "vermerkt",
        }
    }

    if (!belegId) {
        return {
            bookingKey: booking.bookingKey,
            bemerkung,
            kundennr,
            fewo: assignmentFewo,
            istAnzahlung,
            splitAssignments,
            status: "offen",
        }
    }

    if (!beleg) {
        return {
            bookingKey: booking.bookingKey,
            belegId,
            bemerkung,
            kundennr,
            fewo: assignmentFewo,
            istAnzahlung,
            splitAssignments,
            status: "fehlt",
        }
    }

    return {
        bookingKey: booking.bookingKey,
        belegId,
        bemerkung,
        kundennr,
        istAnzahlung,
        splitAssignments,
        fewo: mapFewoIdToLabel(beleg.fewoId),
        konto: beleg.konto || "",
        lieferant: beleg.lieferant || "",
        pfad: beleg.pfad || "",
        status: "zugeordnet",
    }
}

export function deriveBookingViews(
    bookings: BankBooking[],
    assignments: SlimAssignmentMap,
    belege: BelegData[],
): DerivedBookingView[] {
    return bookings.map((booking) => deriveBookingView(booking, assignments, belege))
}
