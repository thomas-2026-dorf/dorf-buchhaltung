export type Tab =
  | "Dashboard"
  | "Belege"
  | "Bank"
  | "Zuordnung"
  | "Ausgang"
  | "Export"
  | "Auswertung"
  | "Suche"
  | "Einstellungen"
  | "Korrektur"
  | "Mitglieder"
  | "Beiträge"
  | "Kassen"
  | "Berichte";

export type FeWo = {
  id: string;
  name: string;
};

export type Beleg = {
  id: string;
  lieferant: string;
  datum: string;
  betrag: string;
  rechnungsnummer: string;
  konto: string;
  notiz?: string;
  fewoId: string;
};

export type KassenArt = "bank" | "barkasse";

export type KassenEintragTyp = "einnahme" | "ausgabe";

export type KassenEintrag = {
  id: string;
  datum: string;
  betrag: string;
  typ: KassenEintragTyp;
  kassenArt: KassenArt;
  titel: string;
  beschreibung?: string;
  belegId?: string;
};
