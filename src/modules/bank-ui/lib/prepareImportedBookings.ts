import { toBankBookings } from "../../bank/matching"
import type { BankBooking } from "../types/bankSlimTypes"
import type { CsvFeldZuordnung } from "../../../lib/settings/csvFeldZuordnung"
import { parseCsv } from "./bankImportHelpers"

export function prepareImportedBookings(
    text: string,
    zuordnung?: CsvFeldZuordnung
): {
    nextBookingsAlt: ReturnType<typeof toBankBookings>
    nextBookings: BankBooking[]
} {
    const nextBookingsAlt = toBankBookings(parseCsv(text, zuordnung))

    const nextBookings: BankBooking[] = nextBookingsAlt.map((b) => ({
        bookingKey:      b.bookingKey,
        datum:           b.bookingDate,
        betrag:          b.amount,
        verwendungszweck: [b.payee, b.purpose].filter(Boolean).join(" | "),
        mitgliedsnummer: b.raw.mitgliedsnummer || undefined,
    }))

    return { nextBookingsAlt, nextBookings }
}
