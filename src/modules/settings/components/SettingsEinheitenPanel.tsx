import { cardStyle } from "../../../design/styles";

type Einheit = {
  id: string;
  name: string;
  anzeigename: string;
  typ: string;
  aktiv: boolean;
  steuerExport: boolean;
};

type Props = {
  einheiten: Einheit[];
  onNeueEinheit: () => void;
  onSpeichernEinheiten: () => void;
  onEinheitNameChange: (id: string, value: string) => void;
  onEinheitLoeschen: (id: string) => void;
};

export default function SettingsEinheitenPanel(props: Props) {
  const {
    einheiten,
    onNeueEinheit,
    onSpeichernEinheiten,
    onEinheitNameChange,
    onEinheitLoeschen,
  } = props;

  return (
    <div style={{ ...cardStyle, overflow: "visible" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
          flexWrap: "wrap",
          paddingBottom: 10,
          background: "#F9FAFB",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <div style={{ fontWeight: 700 }}>Einheiten</div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onNeueEinheit}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #d0d7de",
              background: "#fff",
              color: "#22364a",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Einheit hinzufügen
          </button>

          <button
            type="button"
            onClick={onSpeichernEinheiten}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #1F5FA8",
              background: "#1F5FA8",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Einheiten speichern
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {einheiten.map((einheit) => (
          <div
            key={einheit.id}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(220px, 1fr) 140px",
              gap: 12,
              padding: "12px",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              background: "#fff",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
                Name
              </div>
              <input
                type="text"
                value={einheit.name}
                onChange={(e) => onEinheitNameChange(einheit.id, e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #d0d7de",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>
                ID: {einheit.id}
                {einheit.typ ? ` • Typ: ${einheit.typ}` : ""}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
                Aktion
              </div>

              <button
                type="button"
                onClick={() => onEinheitLoeschen(einheit.id)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #d92d20",
                  background: "#fff",
                  color: "#d92d20",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}