import { cardStyle } from "../../design/styles";
import { AUSWERTUNG_FEWOS } from "./auswertungUtils";

type Props = {
  auswahl: string[];
  toggleFewo: (option: string) => void;
};

export default function AuswertungFilterPanel(props: Props) {
  const { auswahl, toggleFewo } = props;

  return (
    <div style={cardStyle}>
      <div style={{ fontWeight: 700, marginBottom: 12 }}>Einheiten-Auswahl</div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {AUSWERTUNG_FEWOS.map((option) => {
          const aktiv = auswahl.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleFewo(option)}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: aktiv ? "1px solid #1F5FA8" : "1px solid #d0d7de",
                background: aktiv ? "#1F5FA8" : "#fff",
                color: aktiv ? "#fff" : "#22364a",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 14, color: "#445468" }}>
        Ausgewählt:{" "}
        <strong>{auswahl.length ? auswahl.join(", ") : "nichts"}</strong>
      </div>
    </div>
  );
}
