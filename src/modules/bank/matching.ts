import type { BankBooking, BankCsvRow, FewoType } from "./types";
import type { Beleg } from "../../lib/belege";

function normalizeTextPart(value: string | undefined | null): string {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function normalizeAmount(value: number): string {
    return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

function parseGermanAmount(value: string | number | undefined | null): number {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;

    const text = String(value ?? "")
        .trim()
        .replace(/\./g, "")
        .replace(",", ".");

    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : 0;
}

function fewoNameZuFewoType(fewo: unknown): FewoType | "" {
    if (fewo === "Tina") return "Tina";
    if (fewo === "Harmony") return "Harmony";
    if (fewo === "Tinchen") return "Tinchen";
    if (fewo === "RS") return "RS";
    if (fewo === "Privat") return "Privat";
    return "";
}

function getHauptname(value: string | undefined | null): string {
    const words = normalizeTextPart(value)
        .split(" ")
        .map((w) => w.trim())
        .filter((w) => w.length >= 3);

    if (words.length === 0) return "";
    return words[words.length - 1];
}

function buildNameMatchScore(
    booking: BankBooking,
    beleg: Beleg
): { score: number; reason?: string } {
    const purpose = normalizeTextPart(booking.purpose);
    const payee = normalizeTextPart(booking.payee);
    const rechnungsnummer = normalizeTextPart((beleg as any).rechnungsnummer);
    const hauptname = getHauptname((beleg as any).lieferant);

    if (rechnungsnummer && purpose.includes(rechnungsnummer)) {
        return { score: 60, reason: "Rechnungsnummer passt" };
    }

    if (hauptname && purpose.includes(hauptname)) {
        return { score: 50, reason: "Hauptname im Verwendungszweck" };
    }

    if (hauptname && payee.includes(hauptname)) {
        return { score: 45, reason: "Hauptname im Namen" };
    }

    return { score: 0 };
}

export function buildBookingKey(row: BankCsvRow): string {
    const bookingDate = normalizeTextPart(row.bookingDate);
    const amount = normalizeAmount(row.amount);
    const payee = normalizeTextPart(row.payee);
    const purpose = normalizeTextPart(row.purpose);
    const account = normalizeTextPart(row.account);

    return [bookingDate, amount, payee, purpose, account].join("|");
}

export function toBankBooking(row: BankCsvRow): BankBooking {
    return {
        ...row,
        bookingKey: buildBookingKey(row),
    };
}

export function toBankBookings(rows: BankCsvRow[]): BankBooking[] {
    return rows.map(toBankBooking);
}

export function buildImportSessionId(fileName: string, fallback = "import"): string {
    const baseName = String(fileName || fallback)
        .trim()
        .toLowerCase()
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-z0-9äöüß_-]+/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    return baseName || fallback;
}

export interface LegacyMatchedBeleg {
    id: string;
    fewo: FewoType | "";
    datum: string;
    betrag: number;
    konto: string;
    rechnungsnummer?: string;
    lieferant?: string;
    pfad?: string;
}

export interface LegacyBelegVorschlag {
    beleg: LegacyMatchedBeleg;
    score: number;
    gruende: string[];
    originalBeleg: Beleg;
}

export function ermittleBelegVorschlaege(
    booking: BankBooking,
    belege: Beleg[],
): LegacyBelegVorschlag[] {
    const vorschlaege = belege
        .map((beleg) => {
            let score = 0;
            const gruende: string[] = [];

            const nameMatch = buildNameMatchScore(booking, beleg);
            if (nameMatch.score > 0) {
                score += nameMatch.score;
                if (nameMatch.reason) {
                    gruende.push(nameMatch.reason);
                }
            }

            return {
                beleg: {
                    id: String((beleg as any).id || ""),
                    fewo: fewoNameZuFewoType((beleg as any).fewo ?? (beleg as any).fewoId),
                    datum: String((beleg as any).datum || ""),
                    betrag: Math.abs(parseGermanAmount((beleg as any).betrag)),
                    konto: String((beleg as any).konto || ""),
                    rechnungsnummer: (beleg as any).rechnungsnummer,
                    lieferant: (beleg as any).lieferant,
                    pfad: (beleg as any).pfad,
                },
                score,
                gruende,
                originalBeleg: beleg,
            };
        })
        .filter((eintrag) => eintrag.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    return vorschlaege;
}