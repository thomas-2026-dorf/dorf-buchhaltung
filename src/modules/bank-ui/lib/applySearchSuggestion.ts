import type { BookingSearchFields, BookingSearchMap } from "../types/bankSlimTypes"

type SearchFieldKey = keyof BookingSearchFields

function getEmptySearchFields(): BookingSearchFields {
    return {
        name: "",
        rechnungsnummer: "",
    }
}

export function applySearchSuggestion(
    prev: BookingSearchMap,
    bookingKey: string,
    field: SearchFieldKey,
    suggestion: string
): BookingSearchMap {
    const current = prev[bookingKey] || getEmptySearchFields()

    if ((current[field] || "").trim()) return prev

    return {
        ...prev,
        [bookingKey]: {
            ...current,
            [field]: suggestion,
        },
    }
}