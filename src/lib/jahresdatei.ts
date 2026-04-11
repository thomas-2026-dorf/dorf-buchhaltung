// src/lib/jahresdatei.ts

export type Fewo = {
    id: "tina" | "harmony" | "tinchen";
    name: string;
    objektNr: string;
};

export type Beleg = {
    id: string;
    datum: string;
    typ: "ausgabe";
    fewoId: Fewo["id"];
    objektNr: string;
    lieferant: string;
    beschreibung: string;
    betrag: number;
    waehrung: "EUR";
    konto: string;
    dateiName: string;
    pfad?: string;
    notiz: string;
    zahlungsart?: "bank" | "bar" | "offen" | "privat";
    manuellesZahldatum?: string;
    bankbuchungIds: string[];
};

export type Erloes = {
    id: string;
    datum: string;
    fewoId: Fewo["id"];
    objektNr: string;
    gastName: string;
    beschreibung: string;
    betrag: number;
    waehrung: "EUR";
    konto: string;
    notiz: string;
    bankbuchungIds: string[];
};

export type Bankbuchung = {
    id: string;
    datum: string;
    buchungstext: string;
    betrag: number;
    waehrung: "EUR";
    richtung: "eingang" | "ausgang";
    fewoId: Fewo["id"] | null;
    objektNr: string | null;
    zugeordnetDurch: "beleg" | "manuell" | "unbekannt";
    belegIds: string[];
    erloesIds: string[];
    notiz: string;
};

export type Jahresdatei = {
    jahr: number;
    version: number;
    createdAt: string;
    updatedAt: string;

    fewos: Fewo[];

    belege: Beleg[];
    erloese: Erloes[];
    bankbuchungen: Bankbuchung[];
};