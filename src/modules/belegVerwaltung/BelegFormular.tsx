import { appStyles as styles } from "../../styles/appStyles";
import { cardStyle } from "../../design/styles";
import BelegFormularHeader from "./components/BelegFormularHeader";
import BelegFormularActions from "./components/BelegFormularActions";
import BelegFormularBasisfelder from "./components/BelegFormularBasisfelder";
import BelegFormularZuordnung from "./components/BelegFormularZuordnung";
import BelegSplitInputs from "./components/BelegSplitInputs";

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
    splitMode,
    splitTina,
    setSplitTina,
    splitHarmony,
    setSplitHarmony,
    splitTinchen,
    setSplitTinchen,
    splitRS,
    setSplitRS,
    splitPrivat,
    setSplitPrivat,
    kategorie,
    setKategorie,
    zahlungsart,
    setZahlungsart,
    bankkontoId,
    setBankkontoId,
    bankkonten,
    manuellesZahldatum,
    setManuellesZahldatum,
    erkannterText,
    activeFeWoId,
    setActiveFeWoId,
    fewos,
    onSpeichern,
    onVerschiebenSonstiges,
  } = props;

  const toNumber = (v: string) => parseFloat(v.replace(",", ".")) || 0;
  const formatEuro = (wert: number) => wert.toFixed(2).replace(".", ",");

  const bruttoGesamt = toNumber(betrag);

  const nettoVerteilt =
    toNumber(splitTina) +
    toNumber(splitHarmony) +
    toNumber(splitTinchen) +
    toNumber(splitRS) +
    toNumber(splitPrivat);

  const restZuGesamt = bruttoGesamt - nettoVerteilt;
  const restGerundet = Math.round(restZuGesamt * 100) / 100;

  const istSecraBeleg =
    splitMode &&
    (
      lieferant.toLowerCase().includes("secra") ||
      erkannterText.toLowerCase().includes("secra") ||
      erkannterText.toLowerCase().includes("fewo-channelmanager.de") ||
      erkannterText.toLowerCase().includes("gastgeber-nr.") ||
      erkannterText.toLowerCase().includes("provisionsrechnung")
    );

  const mwstGerundet = restGerundet;
  const bruttoAusNetto = nettoVerteilt + mwstGerundet;
  const bruttoDifferenz =
    Math.round((bruttoGesamt - bruttoAusNetto) * 100) / 100;

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
        <div style={titleStyle}>Aufteilung</div>

        <BelegSplitInputs
          splitTina={splitTina}
          setSplitTina={setSplitTina}
          splitHarmony={splitHarmony}
          setSplitHarmony={setSplitHarmony}
          splitTinchen={splitTinchen}
          setSplitTinchen={setSplitTinchen}
          splitRS={splitRS}
          setSplitRS={setSplitRS}
          splitPrivat={splitPrivat}
          setSplitPrivat={setSplitPrivat}
          toNumber={toNumber}
          formatEuro={formatEuro}
        />

        {istSecraBeleg ? (
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 10,
              background: "#f8fafc",
              display: "grid",
              gap: 6,
            }}
          >
            <div style={{ fontWeight: 700, color: "#1f2937" }}>
              Netto verteilt: {formatEuro(nettoVerteilt)} €
            </div>

            <div style={{ fontWeight: 700, color: "#d97706" }}>
              MwSt: {formatEuro(mwstGerundet)} €
            </div>

            <div style={{ fontWeight: 700, color: "#1f2937" }}>
              Brutto gesamt: {formatEuro(bruttoGesamt)} €
            </div>

            <div
              style={{
                fontSize: 13,
                opacity: 0.9,
                color:
                  bruttoDifferenz === 0
                    ? "green"
                    : bruttoDifferenz > 0
                      ? "#d97706"
                      : "red",
              }}
            >
              {bruttoDifferenz === 0
                ? "Brutto-Prüfung stimmt"
                : bruttoDifferenz > 0
                  ? `Prüfdifferenz: ${formatEuro(bruttoDifferenz)} €`
                  : `Prüfdifferenz: -${formatEuro(Math.abs(bruttoDifferenz))} €`}
            </div>
          </div>
        ) : (
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 10,
              background: "#f8fafc",
              display: "grid",
              gap: 6,
            }}
          >
            <div style={{ fontWeight: 700, color: "#1f2937" }}>
              Verteilt: {formatEuro(nettoVerteilt)} €
            </div>
            <div
              style={{
                fontSize: 13,
                opacity: 0.9,
                color:
                  restGerundet === 0
                    ? "green"
                    : restGerundet > 0
                      ? "#d97706"
                      : "red",
              }}
            >
              {restGerundet === 0
                ? "Split stimmt"
                : restGerundet > 0
                  ? `Offen: ${formatEuro(restGerundet)} €`
                  : `Überzogen: ${formatEuro(Math.abs(restGerundet))} €`}
            </div>
          </div>
        )}
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
