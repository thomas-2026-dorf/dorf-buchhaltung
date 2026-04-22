export type UmbuchungsRichtung = "bank-zu-barkasse" | "barkasse-zu-bank";

type BuchungsTyp = "einnahme" | "ausgabe";
type KassenArt = "bank" | "barkasse";

export type UmbuchungsEintrag = {
    id: string;
    datum: string;
    typ: BuchungsTyp;
    kassenArt: KassenArt;
    titel: string;
    beschreibung: string;
    betrag: string;
    barbelegVorhanden: boolean;
};

export const UMBUCHUNG_TITEL = {
    bankZuBarkasse: "Umbuchung Bank an Barkasse",
    barkasseZuBank: "Umbuchung Barkasse an Bank",
} as const;

const formatEuro = (wert: number) => {
    return `${wert.toFixed(2).replace(".", ",")} €`;
};

export function erstelleUmbuchung(params: {
    datum: string;
    betrag: number;
    richtung: UmbuchungsRichtung;
}): UmbuchungsEintrag[] {
    const { datum, betrag, richtung } = params;

    const idBasis = Date.now().toString();
    const betragFormatiert = formatEuro(betrag);

    if (richtung === "bank-zu-barkasse") {
        const titel = UMBUCHUNG_TITEL.bankZuBarkasse;

        return [
            {
                id: `${idBasis}-bank-ausgabe`,
                datum,
                typ: "ausgabe",
                kassenArt: "bank",
                titel,
                beschreibung: "Automatische Umbuchung von Bank in Barkasse",
                betrag: betragFormatiert,
                barbelegVorhanden: false,
            },
            {
                id: `${idBasis}-barkasse-einnahme`,
                datum,
                typ: "einnahme",
                kassenArt: "barkasse",
                titel,
                beschreibung: "Automatische Umbuchung von Bank in Barkasse",
                betrag: betragFormatiert,
                barbelegVorhanden: true,
            },
        ];
    }

    const titel = UMBUCHUNG_TITEL.barkasseZuBank;

    return [
        {
            id: `${idBasis}-barkasse-ausgabe`,
            datum,
            typ: "ausgabe",
            kassenArt: "barkasse",
            titel,
            beschreibung: "Automatische Umbuchung von Barkasse in Bank",
            betrag: betragFormatiert,
            barbelegVorhanden: true,
        },
        {
            id: `${idBasis}-bank-einnahme`,
            datum,
            typ: "einnahme",
            kassenArt: "bank",
            titel,
            beschreibung: "Automatische Umbuchung von Barkasse in Bank",
            betrag: betragFormatiert,
            barbelegVorhanden: false,
        },
    ];
}