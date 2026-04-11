import { formStyles } from "../../../design/forms";
import {
  primaryButton,
  secondaryButton,
  buttonFullWidth,
} from "../../../design/buttons";

type Props = {
  ausgewaehlterText: string;
  bereinigeDatum: (text: string) => string;
  bereinigeBetrag: (text: string) => string;
  bereinigeRechnungsnummer: (text: string) => string;
  onTextAlsLieferantUebernehmen: (text: string) => void;
  onTextAlsDatumUebernehmen: (text: string) => void;
  onTextAlsBetragUebernehmen: (text: string) => void;
  onTextAlsRechnungsnummerUebernehmen: (text: string) => void;
  onTextAlsNotizUebernehmen: (text: string) => void;
};

export default function BelegTextUebernahmePanel(props: Props) {
  const {
    ausgewaehlterText,
    bereinigeDatum,
    bereinigeBetrag,
    bereinigeRechnungsnummer,
    onTextAlsLieferantUebernehmen,
    onTextAlsDatumUebernehmen,
    onTextAlsBetragUebernehmen,
    onTextAlsRechnungsnummerUebernehmen,
    onTextAlsNotizUebernehmen,
  } = props;

  return (
    <>
      <div
        style={{
          padding: 12,
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 10,
          background: "#fff",
          marginBottom: 12,
        }}
      >
        <div style={{ ...formStyles.small, fontWeight: 700, marginBottom: 8 }}>
          Ausgewählter Text
        </div>

        <div
          style={{
            minHeight: 64,
            fontSize: 14,
            lineHeight: 1.45,
            wordBreak: "break-word",
            color: "#1F2937",
          }}
        >
          {ausgewaehlterText || "Noch kein Text im PDF angeklickt."}
        </div>
      </div>

      {ausgewaehlterText ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            alignContent: "start",
          }}
        >
          <button
            style={{ ...primaryButton, ...buttonFullWidth }}
            onClick={() => onTextAlsLieferantUebernehmen(ausgewaehlterText)}
          >
            Als Lieferant
          </button>

          <button
            style={{ ...primaryButton, ...buttonFullWidth }}
            onClick={() =>
              onTextAlsDatumUebernehmen(bereinigeDatum(ausgewaehlterText))
            }
          >
            Als Datum
          </button>

          <button
            style={{ ...primaryButton, ...buttonFullWidth }}
            onClick={() =>
              onTextAlsBetragUebernehmen(bereinigeBetrag(ausgewaehlterText))
            }
          >
            Als Betrag
          </button>

          <button
            style={{ ...primaryButton, ...buttonFullWidth }}
            onClick={() =>
              onTextAlsRechnungsnummerUebernehmen(
                bereinigeRechnungsnummer(ausgewaehlterText)
              )
            }
          >
            Als Rechnung
          </button>

          <button
            style={{
              ...secondaryButton,
              ...buttonFullWidth,
              gridColumn: "1 / -1",
            }}
            onClick={() => onTextAlsNotizUebernehmen(ausgewaehlterText)}
          >
            Als Notiz übernehmen
          </button>
        </div>
      ) : (
        <div
          style={{
            marginTop: 4,
            padding: 12,
            borderRadius: 10,
            background: "#EEF2F7",
            color: "#5B6573",
            fontSize: 14,
          }}
        >
          Erst Text im PDF anklicken, dann erscheinen hier die Übernahme-Buttons.
        </div>
      )}
    </>
  );
}
