export type BuchungsTyp = "einnahme" | "ausgabe";
export type KassenArt = "bank" | "barkasse";

export type KassenEintrag = {
    id: string;
    datum: string;
    typ: BuchungsTyp;
    kassenArt: KassenArt;
    titel: string;
    beschreibung: string;
    betrag: string;
    barbelegVorhanden: boolean;
    belegId?: string;
    belegPfad?: string;
};

export const KASSEN_STORAGE_KEY = "dorfbuchhaltung-kassen-eintraege-v1";

function parseBetrag(wert: unknown) {
    const betrag = parseFloat(
        String(wert).replace(",", ".").replace("€", "").trim()
    );

    return isNaN(betrag) ? 0 : betrag;
}

function formatEuro(wert: number) {
    return `${wert.toFixed(2).replace(".", ",")} €`;
}

export function ladeKassenEintraege(): KassenEintrag[] {
    try {
        const gespeichert = localStorage.getItem(KASSEN_STORAGE_KEY);
        if (!gespeichert) return [];

        const daten = JSON.parse(gespeichert);
        if (!Array.isArray(daten)) return [];

        return daten
            .filter((eintrag): eintrag is Partial<KassenEintrag> => {
                return !!eintrag && typeof eintrag === "object";
            })
            .map((eintrag): KassenEintrag => {
                const typ: BuchungsTyp =
                    eintrag.typ === "ausgabe" ? "ausgabe" : "einnahme";

                const kassenArt: KassenArt =
                    eintrag.kassenArt === "bank" ? "bank" : "barkasse";

                return {
                    id:
                        typeof eintrag.id === "string"
                            ? eintrag.id
                            : Date.now().toString() + Math.random().toString(16).slice(2),
                    datum:
                        typeof eintrag.datum === "string" && eintrag.datum
                            ? eintrag.datum
                            : new Date().toISOString().slice(0, 10),
                    typ,
                    kassenArt,
                    titel: typeof eintrag.titel === "string" ? eintrag.titel : "",
                    beschreibung:
                        typeof eintrag.beschreibung === "string"
                            ? eintrag.beschreibung
                            : "",
                    betrag:
                        typeof eintrag.betrag === "string" ? eintrag.betrag : "0,00 €",
                    barbelegVorhanden:
                        typeof eintrag.barbelegVorhanden === "boolean"
                            ? eintrag.barbelegVorhanden
                            : false,
                    belegId:
                        typeof eintrag.belegId === "string" ? eintrag.belegId : undefined,
                    belegPfad:
                        typeof eintrag.belegPfad === "string"
                            ? eintrag.belegPfad
                            : undefined,
                };
            })
            .filter((eintrag) => eintrag.titel.trim() !== "");
    } catch (error) {
        console.error("Fehler beim Laden der Kassen-Einträge:", error);
        return [];
    }
}

export function speichereKassenEintraege(eintraege: KassenEintrag[]) {
    try {
        localStorage.setItem(KASSEN_STORAGE_KEY, JSON.stringify(eintraege));
    } catch (error) {
        console.error("Fehler beim Speichern der Kassen-Einträge:", error);
    }
}

export function fuegeKassenEintragHinzu(neuerEintrag: KassenEintrag) {
    const vorhandeneEintraege = ladeKassenEintraege();
    const neueEintraege = [neuerEintrag, ...vorhandeneEintraege];
    speichereKassenEintraege(neueEintraege);
}

export function erstelleBarbelegAusgabe(params: {
    datum: string;
    betrag: string;
    titel: string;
    beschreibung?: string;
    belegId?: string;
    belegPfad?: string;
}): KassenEintrag | null {
    const betragAlsZahl = parseBetrag(params.betrag);
    if (betragAlsZahl <= 0) return null;

    return {
        id: `barbeleg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        datum: params.datum,
        typ: "ausgabe",
        kassenArt: "barkasse",
        titel: params.titel.trim(),
        beschreibung: (params.beschreibung || "").trim(),
        betrag: formatEuro(betragAlsZahl),
        barbelegVorhanden: true,
        belegId: params.belegId,
        belegPfad: params.belegPfad,
    };
}