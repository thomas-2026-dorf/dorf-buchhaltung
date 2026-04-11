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
  | "Korrektur";

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