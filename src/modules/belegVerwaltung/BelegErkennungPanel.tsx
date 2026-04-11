import { useEffect, useState } from "react";
import { cardStyle } from "../../design/styles";
import { formStyles } from "../../design/forms";
import { secondaryButton } from "../../design/buttons";
import BelegTextUebernahmePanel from "./components/BelegTextUebernahmePanel";

type Props = {
  erkannteDaten: {
    lieferant: string;
    datum: string;
    betrag: string;
    rechnungsnummer: string;
  };
  erkannterText: string;
  ocrStatus: string;
  setOcrStatus: (value: string) => void;
  runOcrTest: () => void;
  onTextAlsLieferantUebernehmen: (text: string) => void;
  onTextAlsDatumUebernehmen: (text: string) => void;
  onTextAlsBetragUebernehmen: (text: string) => void;
  onTextAlsRechnungsnummerUebernehmen: (text: string) => void;
  onTextAlsNotizUebernehmen: (text: string) => void;
};

export default function BelegErkennungPanel({
  runOcrTest,
  onTextAlsLieferantUebernehmen,
  onTextAlsDatumUebernehmen,
  onTextAlsBetragUebernehmen,
  onTextAlsRechnungsnummerUebernehmen,
  onTextAlsNotizUebernehmen,
}: Props) {
  const [ausgewaehlterText, setAusgewaehlterText] = useState("");

  useEffect(() => {
    const initialText = "";
    setAusgewaehlterText(initialText);

    const handlePdfTextSelected = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      const text = (customEvent.detail || "").trim();

      setAusgewaehlterText(text);

      const lower = text.toLowerCase();

      const rechnungNachLabel =
        text.match(
          /(?:rechnungsnummer|rechnung\s*nr\.?|rg\.?\s*nr\.?|nr\.?)\s*:?\s*(\d{3,})/i
        )?.[1] || "";

      const datumNachLabel =
        text.match(/(?:datum|vom)\s*:?\s*(\d{2}[./-]\d{2}[./-]\d{4})/i)?.[1] || "";

      const datumMatch = text.match(/\d{2}[./-]\d{2}[./-]\d{4}/);
      const betragMatch = text.match(/\d{1,4}(?:\.\d{3})*,\d{2}/);
      const rechnungMatch = text.match(/\d{3,}/);

      if (
        (lower.includes("rechnung") ||
          lower.includes("rg") ||
          lower.includes("nr")) &&
        rechnungNachLabel
      ) {
        onTextAlsRechnungsnummerUebernehmen(rechnungNachLabel);
        return;
      }

      if (lower.includes("betrag") && betragMatch) {
        onTextAlsBetragUebernehmen(betragMatch[0]);
        return;
      }

      if ((lower.includes("datum") || lower.includes("vom")) && datumNachLabel) {
        onTextAlsDatumUebernehmen(datumNachLabel);
        return;
      }

      if (betragMatch && !datumMatch) {
        onTextAlsBetragUebernehmen(betragMatch[0]);
        return;
      }

      if (rechnungMatch && !betragMatch && !datumMatch) {
        onTextAlsRechnungsnummerUebernehmen(rechnungMatch[0]);
        return;
      }

      if (datumMatch) {
        onTextAlsDatumUebernehmen(datumMatch[0]);
        return;
      }
    };

    window.addEventListener(
      "pdf-text-selected",
      handlePdfTextSelected as EventListener
    );

    return () => {
      window.removeEventListener(
        "pdf-text-selected",
        handlePdfTextSelected as EventListener
      );
    };
  }, [
    onTextAlsBetragUebernehmen,
    onTextAlsDatumUebernehmen,
    onTextAlsRechnungsnummerUebernehmen,
  ]);

  function bereinigeDatum(text: string) {
    const match = text.match(/\d{2}[./-]\d{2}[./-]\d{4}/);
    return match ? match[0] : text;
  }

  function bereinigeBetrag(text: string) {
    const match = text.match(/\d{1,4}(?:\.\d{3})*,\d{2}/);
    return match ? match[0] : text;
  }

  function bereinigeRechnungsnummer(text: string) {
    const match = text.match(/\d{3,}/);
    return match ? match[0] : text;
  }

  return (
    <div
      style={{
        ...cardStyle,
        width: "100%",
        height: 680,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        padding: 14,
        background: "#F8FAFC",
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
          Beleg-Erkennung
        </div>
        <div style={{ ...formStyles.small, opacity: 0.8 }}>
          Text im PDF anklicken und direkt ins passende Feld übernehmen.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <button style={secondaryButton} onClick={runOcrTest}>
          OCR Test
        </button>

        <div style={{ ...formStyles.small, opacity: 0.75 }}>
          Auswahl erfolgt direkt über den Text-Layer im PDF
        </div>
      </div>

      <BelegTextUebernahmePanel
        ausgewaehlterText={ausgewaehlterText}
        bereinigeDatum={bereinigeDatum}
        bereinigeBetrag={bereinigeBetrag}
        bereinigeRechnungsnummer={bereinigeRechnungsnummer}
        onTextAlsLieferantUebernehmen={onTextAlsLieferantUebernehmen}
        onTextAlsDatumUebernehmen={onTextAlsDatumUebernehmen}
        onTextAlsBetragUebernehmen={onTextAlsBetragUebernehmen}
        onTextAlsRechnungsnummerUebernehmen={onTextAlsRechnungsnummerUebernehmen}
        onTextAlsNotizUebernehmen={onTextAlsNotizUebernehmen}
      />
    </div>
  );
}
