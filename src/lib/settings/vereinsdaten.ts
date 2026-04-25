export type Vereinsdaten = {
    name: string;
    strasse: string;
    plz: string;
    ort: string;

    telefon: string;
    email: string;

    iban: string;
    bic: string;
    kreditinstitut: string;

    glaeubigerId: string;

    logoPfad: string;
};

const KEY = "vereinsdaten-v1";

const DEFAULT: Vereinsdaten = {
    name: "",
    strasse: "",
    plz: "",
    ort: "",
    telefon: "",
    email: "",
    iban: "",
    bic: "",
    kreditinstitut: "",
    glaeubigerId: "",
    logoPfad: "",
};

export function ladeVereinsdaten(): Vereinsdaten {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;

    try {
        return { ...DEFAULT, ...JSON.parse(raw) };
    } catch {
        return DEFAULT;
    }
}

export function speichereVereinsdaten(data: Vereinsdaten) {
    localStorage.setItem(KEY, JSON.stringify(data));
}