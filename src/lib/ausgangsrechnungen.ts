import type { FewoName } from "./belege"

export type Ausgangsrechnung = {
    id: string
    jahr: number

    fewo: FewoName | ""

    rechnungsdatum: string
    rechnungsnummer: string

    kundennummer: string
    gastname: string

    bruttobetrag: string

    anzahlungEingangDatum: string
    anzahlungEingangBetrag: string

    restzahlungEingangDatum: string
    restzahlungEingangBetrag: string

    erstelltAm: string
}

const KEY = "fewo-ausgangsrechnungen"
const COUNTER_KEY = "fewo-ausgangsrechnungen-counter"

type CounterState = {
    [jahr: string]: number
}

export function getNaechsteAusgangsId(jahr: number): string {
    const raw = localStorage.getItem(COUNTER_KEY)

    let counter: CounterState = {}

    if (raw) {
        try {
            counter = JSON.parse(raw)
        } catch {
            counter = {}
        }
    }

    const jahrKey = String(jahr)
    const letzteNummer = counter[jahrKey] ?? 0
    const neueNummer = letzteNummer + 1

    counter[jahrKey] = neueNummer
    localStorage.setItem(COUNTER_KEY, JSON.stringify(counter))

    const nummer = String(neueNummer).padStart(4, "0")
    return `${jahr}-AR-${nummer}`
}

export function ladeAusgangsrechnungen(): Ausgangsrechnung[] {
    const raw = localStorage.getItem(KEY)

    if (!raw) return []

    try {
        return JSON.parse(raw)
    } catch {
        return []
    }
}

export function speichereAusgangsrechnung(eintrag: Ausgangsrechnung) {
    const liste = ladeAusgangsrechnungen()
    liste.unshift(eintrag)
    localStorage.setItem(KEY, JSON.stringify(liste))
}

export function loescheAusgangsrechnung(id: string) {
    const liste = ladeAusgangsrechnungen().filter((e) => e.id !== id)
    localStorage.setItem(KEY, JSON.stringify(liste))
}

function leseTsvZeilen(text: string): string[][] {
    const sauber = text.replace(/^\uFEFF/, "")

    const zeilen = sauber
        .split(/\r?\n/)
        .map((zeile) => zeile.trim())
        .filter(Boolean)

    if (zeilen.length === 0) {
        return []
    }

    const ersteZeile = zeilen[0]

    const trenner = ersteZeile.includes("\t")
        ? "\t"
        : ersteZeile.includes(";")
            ? ";"
            : ","

    return zeilen.map((zeile) =>
        zeile.split(trenner).map((spalte) =>
            spalte.trim().replace(/^"|"$/g, "")
        )
    )
}

function findeSpaltenIndex(header: string[], name: string): number {
    const normalize = (value: string) =>
        value
            .replace(/^\uFEFF/, "")
            .trim()
            .toLowerCase()

    return header.findIndex(
        (eintrag) => normalize(eintrag) === normalize(name)
    )
}

export function importiereJournalText(
    text: string,
    jahr: number
): Ausgangsrechnung[] {
    const zeilen = leseTsvZeilen(text)

    if (zeilen.length < 2) {
        return []
    }

    const header = zeilen[0].map((wert) => wert.replace(/^\uFEFF/, "").trim())

    const idxRechnungsdatum = findeSpaltenIndex(header, "Rechnungsdatum")
    const idxRechnungsnummer = findeSpaltenIndex(header, "Rechnungsnummer")
    const idxKundennummer = findeSpaltenIndex(header, "Kundennummer")
    const idxGastname = findeSpaltenIndex(header, "Name des Gastes")
    const idxBruttobetrag = findeSpaltenIndex(header, "Bruttobetrag")
    const idxAnzahlungDatum = findeSpaltenIndex(header, "Anzahlung Eingang Datum")
    const idxAnzahlungBetrag = findeSpaltenIndex(header, "Anzahlung Eingang Betrag")
    const idxRestzahlungDatum = findeSpaltenIndex(header, "Restzahlung Eingang Datum")
    const idxRestzahlungBetrag = findeSpaltenIndex(header, "Restzahlung Eingang Betrag")

    const pflichtfelder = [
        idxRechnungsdatum,
        idxRechnungsnummer,
        idxKundennummer,
        idxGastname,
        idxBruttobetrag,
        idxAnzahlungDatum,
        idxAnzahlungBetrag,
        idxRestzahlungDatum,
        idxRestzahlungBetrag,
    ]

    if (pflichtfelder.some((idx) => idx < 0)) {
        console.log("👉 Header erkannt:", header)
        console.log("👉 Indizes:", {
            idxRechnungsdatum,
            idxRechnungsnummer,
            idxKundennummer,
            idxGastname,
            idxBruttobetrag,
            idxAnzahlungDatum,
            idxAnzahlungBetrag,
            idxRestzahlungDatum,
            idxRestzahlungBetrag,
        })

        throw new Error("Journal-Spalten wurden nicht vollständig erkannt.")
    }

    return zeilen.slice(1).map((spalten, index) => ({
        id: `${jahr}-AR-IMPORT-${String(index + 1).padStart(4, "0")}`,
        jahr,
        fewo: "",
        rechnungsdatum: spalten[idxRechnungsdatum] || "",
        rechnungsnummer: spalten[idxRechnungsnummer] || "",
        kundennummer: spalten[idxKundennummer] || "",
        gastname: spalten[idxGastname] || "",
        bruttobetrag: spalten[idxBruttobetrag] || "",
        anzahlungEingangDatum: spalten[idxAnzahlungDatum] || "",
        anzahlungEingangBetrag: spalten[idxAnzahlungBetrag] || "",
        restzahlungEingangDatum: spalten[idxRestzahlungDatum] || "",
        restzahlungEingangBetrag: spalten[idxRestzahlungBetrag] || "",
        erstelltAm: new Date().toISOString(),
    }))
}

export function speichereVieleAusgangsrechnungen(eintraege: Ausgangsrechnung[]) {
    const bisher = ladeAusgangsrechnungen()

    const keys = new Set(
        bisher.map(
            (e) =>
                `${e.jahr}__${e.rechnungsnummer}__${e.kundennummer}__${e.gastname}__${e.bruttobetrag}`
        )
    )

    const neue = eintraege.filter((e) => {
        const key = `${e.jahr}__${e.rechnungsnummer}__${e.kundennummer}__${e.gastname}__${e.bruttobetrag}`
        if (keys.has(key)) return false
        keys.add(key)
        return true
    })

    localStorage.setItem(KEY, JSON.stringify([...neue, ...bisher]))

    return neue.length
}