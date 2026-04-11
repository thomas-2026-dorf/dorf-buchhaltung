export function resetBelegForm(setters: {
  setLieferant: (v: string) => void;
  setBelegDatum: (v: string) => void;
  setBetrag: (v: string) => void;
  setRechnungsnummer: (v: string) => void;
  setLieferantDatevMerken: (v: boolean) => void;
  setSplitMode: (v: boolean) => void;
  setSplitTina: (v: string) => void;
  setSplitHarmony: (v: string) => void;
  setSplitTinchen: (v: string) => void;
  setSplitRS: (v: string) => void;
  setSplitPrivat: (v: string) => void;
  setKategorie: (v: string) => void;
  setNotiz: (v: string) => void;
  setZahlungsart: (v: "bank" | "bar" | "offen" | "privat") => void;
  setBankkontoId: (v: string) => void;
  setManuellesZahldatum: (v: string) => void;
  setErkannterText: (v: string) => void;
  setActiveFeWoId: (v: string) => void;
}) {
  setters.setLieferant("");
  setters.setBelegDatum("");
  setters.setBetrag("");
  setters.setRechnungsnummer("");
  setters.setLieferantDatevMerken(false);

  setters.setSplitMode(false);
  setters.setSplitTina("");
  setters.setSplitHarmony("");
  setters.setSplitTinchen("");
  setters.setSplitRS("");
  setters.setSplitPrivat("");

  setters.setKategorie("");
  setters.setNotiz("");
  setters.setZahlungsart("bank");
  setters.setBankkontoId("");
  setters.setManuellesZahldatum("");
  setters.setErkannterText("");
  setters.setActiveFeWoId("");
}
