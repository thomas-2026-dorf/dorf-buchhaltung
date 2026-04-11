// ==============================
// FEWO BASIS
// ==============================

export const FEWO_OPTIONS = ['Tina', 'Tinchen', 'Harmony', 'RS', 'Privat'] as const;

export type FewoType = (typeof FEWO_OPTIONS)[number];

// ==============================
// BANK CSV (Rohdaten)
// ==============================

export interface BankCsvRow {
    bookingDate: string;
    valueDate?: string;
    amount: number;
    payee: string;
    purpose: string;
    account?: string;
    raw: Record<string, string>;
}

// ==============================
// BANK BUCHUNG (mit stabilem Schlüssel)
// ==============================

export interface BankBooking extends BankCsvRow {
    bookingKey: string;
}

// ==============================
// ZUORDNUNG (wichtigster Teil!)
// ==============================

export type AssignmentSource = 'auto' | 'manual';

export interface BankAssignment {
    bookingKey: string;
    fewo: FewoType | '';
    konto: string;
    belegId?: string;   // 👈 DAS HIER
    source: AssignmentSource;
    updatedAt: string;
}

// Map: bookingKey -> Zuordnung
export type BankAssignmentMap = Record<string, BankAssignment>;

// ==============================
// MONATS-IMPORT (NEU!)
// ==============================

export interface BankImportSession {
    id: string;              // z.B. "2026-01"
    createdAt: string;
    fileName: string;

    bookings: BankBooking[];

    assignments: BankAssignmentMap;
}

// ==============================
// VIEW (für UI)
// ==============================

export interface BankBookingViewRow {
    booking: BankBooking;
    assignment?: BankAssignment;

    finalFewo: FewoType | '';
    finalKonto: string;
}