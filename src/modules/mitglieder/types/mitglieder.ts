export type Mitgliedsstatus = "antrag-offen" | "aktiv" | "inaktiv";
export type Mitgliedsart = "aktiv" | "foerder";
export type Aufnahmeart = "einzel" | "familie";

export type Familienmitglied = {
  id: string;
  mitgliedsnummer: string;
  vorname: string;
  nachname: string;
  geburtsdatum: string;
  telefon: string;
  email: string;
};

export type SepaDaten = {
  kontoinhaber: string;
  iban: string;
  bic: string;
  kreditinstitut: string;
  mandatDatum: string;
};

export type Mitglied = {
  id: string;
  mitgliedsnummer: string;
  status: Mitgliedsstatus;
  mitgliedsart: Mitgliedsart;
  aufnahmeart: Aufnahmeart;
  eintrittsdatum: string;

  vorname: string;
  nachname: string;
  geburtsdatum: string;

  strasse: string;
  plz: string;
  wohnort: string;

  telefon: string;
  email: string;

  familienmitglieder: Familienmitglied[];
  sepa: SepaDaten;

  notiz: string;
  erstelltAm: string;
  aktualisiertAm: string;
};

export const LEERE_SEPA_DATEN: SepaDaten = {
  kontoinhaber: "",
  iban: "",
  bic: "",
  kreditinstitut: "",
  mandatDatum: "",
};

export const LEERES_MITGLIED = (): Mitglied => {
  const jetzt = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    mitgliedsnummer: "",
    status: "antrag-offen",
    mitgliedsart: "aktiv",
    aufnahmeart: "einzel",
    eintrittsdatum: "",

    vorname: "",
    nachname: "",
    geburtsdatum: "",

    strasse: "",
    plz: "",
    wohnort: "",

    telefon: "",
    email: "",

    familienmitglieder: [],
    sepa: { ...LEERE_SEPA_DATEN },

    notiz: "",
    erstelltAm: jetzt,
    aktualisiertAm: jetzt,
  };
};
