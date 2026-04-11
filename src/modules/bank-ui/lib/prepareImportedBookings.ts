import { toBankBookings } from "../../bank/matching"
import type { BankBooking } from "../types/bankSlimTypes"
import { parseCsv } from "./bankImportHelpers"

export function prepareImportedBookings(text: string): {
    nextBookingsAlt: ReturnType<typeof toBankBookings>
    nextBookings: BankBooking[]
} {
    const nextBookingsAlt = toBankBookings(parseCsv(text))

    const nextBookings: BankBooking[] = nextBookingsAlt.map((b) => ({
        bookingKey: b.bookingKey,
        datum: b.bookingDate,
        betrag: b.amount,
        verwendungszweck: [b.payee, b.purpose].filter(Boolean).join(" | "),
    }))

    return {
        nextBookingsAlt,
        nextBookings,
    }
}
