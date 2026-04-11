// ===============================
// BANK SCHLANK – TYPES
// ===============================

// Eine Bankbuchung (aus CSV)
export type BankBooking = {
    bookingKey: string
    datum: string
    betrag: number
    verwendungszweck?: string
}

// Schlanke Zuordnung: Beleg + optionale Bemerkung
export type SplitAssignmentItem = {
    belegId: string
    betrag?: string
}

// Schlanke Zuordnung: Beleg + optionale Bemerkung + optionale Split-Belege
export type SlimAssignment = {
    belegId?: string
    bemerkung?: string
    kundennr?: string
    mitgliedId?: string
    mitgliedName?: string
    fewo?: string
    istAnzahlung?: boolean
    belegFehlt?: boolean
    splitAssignments?: SplitAssignmentItem[]
}

// Map: bookingKey → Zuordnung
export type SlimAssignmentMap = Record<string, SlimAssignment>

// Neue Suchfelder je Buchung
export type BookingSearchFields = {
    name: string
    rechnungsnummer: string
}

export type BookingSearchMap = Record<string, BookingSearchFields>

// Minimales Beleg-Modell (aus JSON gelesen)
export type BelegData = {
    id: string
    fewoId?: string
    konto?: string
    lieferant?: string
    pfad?: string
    rechnungsnummer?: string
    kundennr?: string
    betrag?: string
    datum?: string
}

// Ergebnis für Anzeige (berechnet)
export type DerivedBookingView = {
    bookingKey: string
    belegId?: string
    bemerkung?: string
    kundennr?: string
    mitgliedId?: string
    mitgliedName?: string
    istAnzahlung?: boolean
    splitAssignments?: { belegId: string; betrag?: string }[]

    // aus JSON gezogen
    fewo?: string
    konto?: string
    lieferant?: string
    pfad?: string

    // Status
    status: "offen" | "zugeordnet" | "fehlt" | "vermerkt"
}