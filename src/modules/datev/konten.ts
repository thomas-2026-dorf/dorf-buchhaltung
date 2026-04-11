export type Konto = {
  nr: string;
  name: string;
};

export const KONTEN: Konto[] = [
  { nr: "8100", name: "Erlöse" },
  { nr: "6800", name: "Sonstige betriebliche Aufwendungen" },
  { nr: "4300", name: "Energie / Internet / Telefon / Alarm" },
  { nr: "4360", name: "Versicherung" },
  { nr: "4210", name: "Miete / Pacht" },
  { nr: "Darlehen", name: "Kredit / Rate" },
];