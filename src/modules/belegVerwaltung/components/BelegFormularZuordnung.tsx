import { formStyles } from "../../../design/forms";

type Props = {
  zahlungsart: "bank" | "bar" | "offen" | "privat";
  setZahlungsart: (value: "bank" | "bar" | "offen" | "privat") => void;
  bankkontoId: string;
  setBankkontoId: (value: string) => void;
  bankkonten: { id: string; bezeichnung: string }[];
  activeFeWoId: string;
  setActiveFeWoId: (value: string) => void;
  fewos: { id: string; name: string }[];
  manuellesZahldatum: string;
  setManuellesZahldatum: (value: string) => void;
};

export default function BelegFormularZuordnung(props: Props) {
  const {
    zahlungsart,
    setZahlungsart,
    bankkontoId,
    setBankkontoId,
    bankkonten,
    activeFeWoId,
    setActiveFeWoId,
    fewos,
    manuellesZahldatum,
    setManuellesZahldatum,
  } = props;

  const row2Style = {
    display: "grid",
    gridTemplateColumns: "90px minmax(0, 1fr) 90px minmax(0, 1fr)",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  } as const;

  const rowStyle = {
    display: "grid",
    gridTemplateColumns: "90px minmax(0, 1fr)",
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
      <div style={row2Style}>
        <label style={labelStyle}>Zahlung</label>
        <select
          style={selectStyle}
          value={zahlungsart}
          onChange={(e) =>
            setZahlungsart(
              e.target.value as "bank" | "bar" | "offen" | "privat"
            )
          }
        >
          <option value="bank">Bank</option>
          <option value="bar">Bar</option>
          <option value="offen">Offen</option>
          <option value="privat">Privat</option>
        </select>

        <label style={labelStyle}>Bereich</label>
        <select
          style={selectStyle}
          value={activeFeWoId}
          onChange={(e) => setActiveFeWoId(e.target.value)}
        >
          <option value="">Bitte Abteilung wählen</option>
          {(fewos ?? []).map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {zahlungsart === "bank" && (
        <div style={rowStyle}>
          <label style={labelStyle}>Konto</label>
          <select
            style={selectStyle}
            value={bankkontoId}
            onChange={(e) => setBankkontoId(e.target.value)}
          >
            <option value="">Bitte Bankkonto wählen</option>
            {(bankkonten ?? []).map((konto) => (
              <option key={konto.id} value={konto.id}>
                {konto.bezeichnung}
              </option>
            ))}
          </select>
        </div>
      )}

      {(zahlungsart === "bar" || zahlungsart === "privat") && (
        <div style={rowStyle}>
          <label style={labelStyle}>Zahldatum</label>
          <input
            type="date"
            style={inputStyle}
            value={manuellesZahldatum}
            onChange={(e) => setManuellesZahldatum(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
