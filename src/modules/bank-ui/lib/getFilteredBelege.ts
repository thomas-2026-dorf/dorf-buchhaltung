import type { BelegData, BookingSearchMap } from "../types/bankSlimTypes"

function tokenize(value: string): string[] {
    return value
        .toLowerCase()
        .replace(/[|,;:/\\()\-_.]+/g, " ")
        .split(/\s+/)
        .map((wort) => wort.trim())
        .filter((wort) => wort.length >= 2)
}

function normalizeAmountSearch(value: string): string {
    return value
        .trim()
        .replace(/\s+/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
}

function normalizeAmountStored(value: string): string {
    return value
        .trim()
        .replace(/\s+/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
}

function parseGermanDate(value?: string): Date | null {
    if (!value) return null

    const trimmed = value.trim()

    const matchGermanLong = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
    if (matchGermanLong) {
        const day = Number(matchGermanLong[1])
        const month = Number(matchGermanLong[2]) - 1
        const year = Number(matchGermanLong[3])
        const date = new Date(year, month, day)
        return Number.isNaN(date.getTime()) ? null : date
    }

    const matchGermanShort = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/)
    if (matchGermanShort) {
        const day = Number(matchGermanShort[1])
        const month = Number(matchGermanShort[2]) - 1
        const shortYear = Number(matchGermanShort[3])
        const year = shortYear >= 70 ? 1900 + shortYear : 2000 + shortYear
        const date = new Date(year, month, day)
        return Number.isNaN(date.getTime()) ? null : date
    }

    const matchIso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (matchIso) {
        const year = Number(matchIso[1])
        const month = Number(matchIso[2]) - 1
        const day = Number(matchIso[3])
        const date = new Date(year, month, day)
        return Number.isNaN(date.getTime()) ? null : date
    }

    const matchIsoWithTime = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[T\s].*$/)
    if (matchIsoWithTime) {
        const year = Number(matchIsoWithTime[1])
        const month = Number(matchIsoWithTime[2]) - 1
        const day = Number(matchIsoWithTime[3])
        const date = new Date(year, month, day)
        return Number.isNaN(date.getTime()) ? null : date
    }

    return null
}

function isBelegInDateRange(
    beleg: BelegData,
    bookingDate: string,
    enableDateFilter: boolean
): boolean {
    if (!enableDateFilter) return true

    const booking = parseGermanDate(bookingDate)
    const belegDate = parseGermanDate(beleg.datum)

    if (!booking) return true
    if (!belegDate) return false

    const start = new Date(booking)
    start.setDate(start.getDate() - 42)
    start.setHours(0, 0, 0, 0)

    const end = new Date(booking)
    end.setHours(23, 59, 59, 999)

    return belegDate >= start && belegDate <= end
}

function matchesName(beleg: BelegData, rawNameSearch: string): { matches: boolean; score: number } {
    const nameSearch = rawNameSearch.trim().toLowerCase()
    if (!nameSearch) return { matches: true, score: 0 }

    const suchWoerter = tokenize(nameSearch)
    const mindestTreffer = suchWoerter.length >= 2 ? 2 : 1

    const nameText = [
        beleg.id,
        beleg.lieferant,
        beleg.konto,
        beleg.fewoId,
        beleg.pfad,
        beleg.datum,
        beleg.betrag,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

    const nameTextWoerter = tokenize(nameText)
    const searchAmount = normalizeAmountSearch(rawNameSearch)
    const isAmountSearch = /^\d+(\.\d+)?$/.test(searchAmount)
    const belegAmount = normalizeAmountStored(String(beleg.betrag || ""))

    let score = 0
    let wortTreffer = 0

    if (beleg.id?.toLowerCase().includes(nameSearch)) score += 100
    if ((beleg.lieferant || "").toLowerCase().includes(nameSearch)) score += 40
    if ((beleg.konto || "").toLowerCase().includes(nameSearch)) score += 20

    if (isAmountSearch && belegAmount) {
        if (belegAmount === searchAmount) score += 120
        else if (belegAmount.includes(searchAmount)) score += 60
    }

    for (const wort of suchWoerter) {
        const hatTreffer =
            nameText.includes(wort) || nameTextWoerter.includes(wort)

        if (hatTreffer) {
            wortTreffer += 1
            score += 12
        }
    }

    if (!suchWoerter.length && !isAmountSearch) {
        return { matches: true, score }
    }

    if (beleg.id?.toLowerCase().includes(nameSearch)) {
        return { matches: true, score }
    }

    if (isAmountSearch && belegAmount) {
        const amountMatch =
            belegAmount === searchAmount ||
            belegAmount.includes(searchAmount)

        return { matches: amountMatch, score }
    }

    return { matches: wortTreffer >= mindestTreffer, score }
}

function matchesRg(beleg: BelegData, rawRgSearch: string): { matches: boolean; score: number } {
    const rgSearch = rawRgSearch.trim().toLowerCase()
    if (!rgSearch) return { matches: true, score: 0 }

    const rechnungsnummer = String(beleg.rechnungsnummer || "").toLowerCase()
    const belegId = String(beleg.id || "").toLowerCase()

    let score = 0
    let matches = false

    if (rechnungsnummer === rgSearch) {
        score += 140
        matches = true
    } else if (rechnungsnummer.includes(rgSearch)) {
        score += 90
        matches = true
    }

    if (belegId === rgSearch) {
        score += 80
        matches = true
    } else if (belegId.includes(rgSearch)) {
        score += 40
        matches = true
    }

    return { matches, score }
}


export function getFilteredBelege(
    bookingKey: string,
    searchMap: BookingSearchMap,
    suggestionMap: Record<string, BelegData[]>,
    belege: BelegData[],
    bookingDate?: string,
    enableDateFilter?: boolean,
) {
    const fields = searchMap[bookingKey] || {
        name: "",
        rechnungsnummer: "",
    }

    const hasAnySearch =
        !!fields.name.trim() ||
        !!fields.rechnungsnummer.trim()

    const vorschlaege = suggestionMap[bookingKey] || []

    const restlicheBelege = belege.filter(
        (beleg) => !vorschlaege.some((vorschlag) => vorschlag.id === beleg.id)
    )

    const alleBelege = [...vorschlaege, ...restlicheBelege].filter((beleg) =>
        isBelegInDateRange(beleg, bookingDate || "", !!enableDateFilter)
    )

    if (!hasAnySearch) {
        return alleBelege.slice(0, 30)
    }

    const bewertet = alleBelege
        .map((beleg, index) => {
            const nameResult = matchesName(beleg, fields.name)
            const rgResult = matchesRg(beleg, fields.rechnungsnummer)
            const istVorschlag = vorschlaege.some((v) => v.id === beleg.id)

            let score = nameResult.score + rgResult.score
            if (istVorschlag) score += 20

            const hasNameSearch = !!fields.name.trim()
            const hasRgSearch = !!fields.rechnungsnummer.trim()

            let matches = true

            if (hasNameSearch && hasRgSearch) {
                matches = nameResult.matches || rgResult.matches
            } else if (hasNameSearch) {
                matches = nameResult.matches
            } else if (hasRgSearch) {
                matches = rgResult.matches
            }

            return {
                beleg,
                index,
                score,
                matches,
            }
        })
        .filter((eintrag) => eintrag.matches)
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score
            return a.index - b.index
        })

    return bewertet.map((eintrag) => eintrag.beleg).slice(0, 30)
}
