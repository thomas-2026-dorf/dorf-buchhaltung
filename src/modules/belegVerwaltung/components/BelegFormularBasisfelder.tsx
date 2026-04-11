import { formStyles } from "../../../design/forms";
import { ladeAppSettings } from "../../../lib/settings/appSettingsStorage";
import { findeDatevKontoZuLieferant } from "../../../lib/settings/localSettings";

type Props = {
  lieferant: string;
  setLieferant: (value: string) => void;
  belegDatum: string;
  setBelegDatum: (value: string) => void;
  betrag: string;
  setBetrag: (value: string) => void;
  rechnungsnummer: string;
  setRechnungsnummer: (value: string) => void;
  kategorie: string;
  setKategorie: (value: string) => void;
};

export default function BelegFormularBasisfelder(props: Props) {
  const {
    lieferant,
    setLieferant,
    belegDatum,
    setBelegDatum,
    betrag,
    setBetrag,
    rechnungsnummer,
    setRechnungsnummer,
    kategorie,
    setKategorie,
  } = props;

  const konten = ladeAppSettings().konten || [];

  function handleLieferantChange(value: string) {
    setLieferant(value);

    const gemerktesKonto = findeDatevKontoZuLieferant(value);
    if (gemerktesKonto) {
      setKategorie(gemerktesKonto);
    }
  }

  const rowStyle = {
    display: "grid",
    gridTemplateColumns: "110px minmax(0, 1fr)",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  } as const;

  const row2Style = {
    display: "grid",
    gridTemplateColumns: "110px minmax(0, 1fr) 80px minmax(0, 1fr)",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  } as const;

  const labelStyle = {
    ...formStyles.label,
    margin: 0,
    fontSize: 13,
    lineHeight: 1.2,
  };

  const inputStyle = {
    ...formStyles.input,
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box" as const,
    minHeight: 36,
    padding: "6px 10px",
  };

  const selectStyle = {
    ...formStyles.select,
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box" as const,
    minHeight: 36,
    padding: "6px 10px",
  };

  return (
    <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
      <div style={rowStyle}>
        <label style={labelStyle}>Lieferant</label>
        <input
          style={inputStyle}
          value={lieferant}
          onChange={(e) => handleLieferantChange(e.target.value)}
        />
      </div>

      <div style={row2Style}>
        <label style={labelStyle}>Datum</label>
        <input
          style={inputStyle}
          placeholder="TT.MM.JJJJ"
          value={belegDatum}
          onChange={(e) => setBelegDatum(e.target.value)}
        />

        <label style={labelStyle}>Betrag</label>
        <input
          style={inputStyle}
          placeholder="z.B. 333,20"
          value={betrag}
          onChange={(e) => setBetrag(e.target.value)}
        />
      </div>

      <div style={rowStyle}>
        <label style={labelStyle}>Nummer</label>
        <input
          style={inputStyle}
          value={rechnungsnummer}
          onChange={(e) => setRechnungsnummer(e.target.value)}
        />
      </div>

      <div style={rowStyle}>
        <label style={labelStyle}>Konto</label>
        <select
          style={selectStyle}
          value={kategorie}
          onChange={(e) => setKategorie(e.target.value)}
        >
          <option value="">Bitte Konto wählen</option>
          {konten.map((konto) => (
            <option key={konto.id} value={konto.nummer}>
              {konto.nummer} – {konto.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
