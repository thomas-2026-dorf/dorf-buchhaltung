import { appStyles as styles } from "../../styles/appStyles";
import { cardStyle } from "../../design/styles";
import BelegFormularHeader from "./components/BelegFormularHeader";
import BelegFormularActions from "./components/BelegFormularActions";
import BelegFormularBasisfelder from "./components/BelegFormularBasisfelder";
import BelegFormularZuordnung from "./components/BelegFormularZuordnung";

type Props = {
  lieferant: string;
  setLieferant: (value: string) => void;
  belegDatum: string;
  setBelegDatum: (value: string) => void;
  betrag: string;
  setBetrag: (value: string) => void;
  rechnungsnummer: string;
  setRechnungsnummer: (value: string) => void;
  lieferantDatevMerken: boolean;
  setLieferantDatevMerken: (value: boolean) => void;
  splitMode: boolean;
  setSplitMode: (value: boolean) => void;
  splitTina: string;
  setSplitTina: (value: string) => void;
  splitHarmony: string;
  setSplitHarmony: (value: string) => void;
  splitTinchen: string;
  setSplitTinchen: (value: string) => void;
  splitRS: string;
  setSplitRS: (value: string) => void;
  splitPrivat: string;
  setSplitPrivat: (value: string) => void;
  kategorie: string;
  setKategorie: (value: string) => void;
  zahlungsart: "bank" | "bar" | "offen" | "privat";
  setZahlungsart: (value: "bank" | "bar" | "offen" | "privat") => void;
  bankkontoId: string;
  setBankkontoId: (value: string) => void;
  bankkonten: { id: string; bezeichnung: string }[];
  manuellesZahldatum: string;
  setManuellesZahldatum: (value: string) => void;
  notiz: string;
  setNotiz: (value: string) => void;
  erkannterText: string;
  activeFeWoId: string;
  setActiveFeWoId: (value: string) => void;
  fewos: { id: string; name: string }[];
  onSpeichern: () => void;
  onVerschiebenSonstiges: () => void;
};

export default function BelegFormular(props: Props) {
  const {
    lieferant,
    setLieferant,
    belegDatum,
    setBelegDatum,
    betrag,
    setBetrag,
    rechnungsnummer,
    setRechnungsnummer,
    lieferantDatevMerken,
    setLieferantDatevMerken,
    kategorie,
    setKategorie,
    zahlungsart,
    setZahlungsart,
    bankkontoId,
    setBankkontoId,
    bankkonten,
    manuellesZahldatum,
    setManuellesZahldatum,
    activeFeWoId,
    setActiveFeWoId,
    fewos,
    onSpeichern,
    onVerschiebenSonstiges,
  } = props;


  const sectionStyle = {
    ...cardStyle,
    background: "#ffffff",
    border: "1px solid #dbe4ee",
    borderRadius: 12,
    padding: 10,
    display: "grid" as const,
    gap: 8,
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
  };

  const titleStyle = {
    fontSize: 14,
    fontWeight: 800,
    color: "#0f172a",
    margin: 0,
    lineHeight: 1.2,
  };

  return (
    <div
      style={{
        ...styles.right,
        paddingLeft: 0,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minWidth: 0,
        overflowX: "hidden",
        height: "100%",
        minHeight: 0,
        flex: 1,
        overflowY: "auto",
      }}
    >
      <BelegFormularHeader />

      <div style={sectionStyle}>
        <div style={titleStyle}>Basisdaten</div>

        <BelegFormularBasisfelder
          lieferant={lieferant}
          setLieferant={setLieferant}
          belegDatum={belegDatum}
          setBelegDatum={setBelegDatum}
          betrag={betrag}
          setBetrag={setBetrag}
          rechnungsnummer={rechnungsnummer}
          setRechnungsnummer={setRechnungsnummer}
          kategorie={kategorie}
          setKategorie={setKategorie}
        />
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>Zuordnung</div>

        <BelegFormularZuordnung
          zahlungsart={zahlungsart}
          setZahlungsart={setZahlungsart}
          bankkontoId={bankkontoId}
          setBankkontoId={setBankkontoId}
          bankkonten={bankkonten}
          activeFeWoId={activeFeWoId}
          setActiveFeWoId={setActiveFeWoId}
          fewos={fewos}
          manuellesZahldatum={manuellesZahldatum}
          setManuellesZahldatum={setManuellesZahldatum}
        />
      </div>


      <div style={sectionStyle}>
        <div style={titleStyle}>Aktion</div>

        <BelegFormularActions
          formularVollstaendig={
            !!lieferant &&
            !!belegDatum &&
            !!betrag &&
            !!rechnungsnummer &&
            !!kategorie &&
            !!activeFeWoId &&
            (zahlungsart !== "bank" || !!bankkontoId)
          }
          lieferantDatevMerken={lieferantDatevMerken}
          setLieferantDatevMerken={setLieferantDatevMerken}
          onSpeichern={onSpeichern}
          onVerschiebenSonstiges={onVerschiebenSonstiges}
        />
      </div>
    </div>
  );
}
