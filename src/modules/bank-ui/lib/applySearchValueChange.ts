import type { BookingSearchFields, BookingSearchMap } from "../types/bankSlimTypes"

type SearchFieldKey = keyof BookingSearchFields

function getEmptySearchFields(): BookingSearchFields {
    return {
        name: "",
        rechnungsnummer: "",
    }
}

export function applySearchValueChange(
    prev: BookingSearchMap,
    bookingKey: string,
    field: SearchFieldKey,
    value: string
): BookingSearchMap {
    const current = prev[bookingKey] || getEmptySearchFields()

    return {
        ...prev,
        [bookingKey]: {
            ...current,
            [field]: value,
        },
    }
}