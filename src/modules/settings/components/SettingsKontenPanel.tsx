import { cardStyle } from "../../../design/styles";

type Konto = {
  id: string;
  nummer: string;
  name: string;
  typ: string;
};

type Bankkonto = {
  id: string;
  bezeichnung: string;
  kontonummer: string;
  typ: "bank" | "bar" | "privat";
};

type Props = {
  mode: "datev" | "bank";
  konten: Konto[];
  bankkonten: Bankkonto[];
  onNeuesKonto: () => void;
  onSpeichernKonten: () => void;
  onKontoChange: (id: string, field: "nummer" | "name" | "typ", value: string) => void;
  onKontoLoeschen: (id: string) => void;
  onNeuesBankkonto: () => void;
  onSpeichernBankkonten: () => void;
  onBankkontoChange: (
    id: string,
    field: "bezeichnung" | "kontonummer" | "typ",
    value: string
  ) => void;
  onBankkontoLoeschen: (id: string) => void;
};

function parseKontoNummer(value: string): number {
  const cleaned = String(value || "").trim();
  if (!cleaned) return Number.MAX_SAFE_INTEGER;

  const numeric = Number(cleaned.replace(/\D/g, ""));
  if (!Number.isFinite(numeric)) return Number.MAX_SAFE_INTEGER;

  return numeric;
}

export default function SettingsKontenPanel(props: Props) {
  const {
    mode,
    konten,
    bankkonten,
    onNeuesKonto,
    onSpeichernKonten,
    onKontoChange,
    onKontoLoeschen,
    onNeuesBankkonto,
    onSpeichernBankkonten,
    onBankkontoChange,
    onBankkontoLoeschen,
  } = props;

  const sortierteKonten = [...konten].sort((a, b) => {
    const nummerA = parseKontoNummer(a.nummer);
    const nummerB = parseKontoNummer(b.nummer);

    if (nummerA !== nummerB) return nummerA - nummerB;
    return a.name.localeCompare(b.name, "de", { sensitivity: "base" });
  });

  const sortierteBankkonten = [...bankkonten].sort((a, b) =>
    a.bezeichnung.localeCompare(b.bezeichnung, "de", { sensitivity: "base" })
  );

  if (mode === "datev") {
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
          <div style={{ fontWeight: 700 }}>DATEV-/Sachkonten</div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onNeuesKonto}
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
              Konto hinzufügen
            </button>

            <button
              type="button"
              onClick={onSpeichernKonten}
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
              Konten speichern
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {sortierteKonten.map((konto) => (
            <div
              key={konto.id}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(120px, 160px) minmax(240px, 1fr) minmax(140px, 180px) auto",
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
                  Nummer
                </div>
                <input
                  type="text"
                  value={konto.nummer}
                  onChange={(e) => onKontoChange(konto.id, "nummer", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #d0d7de",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
                  Name
                </div>
                <input
                  type="text"
                  value={konto.name}
                  onChange={(e) => onKontoChange(konto.id, "name", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #d0d7de",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>
                  ID: {konto.id}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
                  Typ
                </div>
                <select
                  value={konto.typ}
                  onChange={(e) => onKontoChange(konto.id, "typ", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #d0d7de",
                    background: "#fff",
                  }}
                >
                  <option value="aufwand">aufwand</option>
                  <option value="erloes">erloes</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => onKontoLoeschen(konto.id)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #DC2626",
                    background: "#fff",
                    color: "#DC2626",
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

  return (
    <div style={{ ...cardStyle, overflow: "visible" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
          flexWrap: "wrap",
          paddingBottom: 10,
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <div>
          <div style={{ fontWeight: 700 }}>Bankkonten</div>
          <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
            Diese Bezeichnungen sollen später in den Belegen sichtbar sein.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onNeuesBankkonto}
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
            Bankkonto hinzufügen
          </button>

          <button
            type="button"
            onClick={onSpeichernBankkonten}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #15803d",
              background: "#15803d",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Bankkonten speichern
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {sortierteBankkonten.map((konto) => (
          <div
            key={konto.id}
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(220px, 1.2fr) minmax(180px, 1fr) minmax(140px, 180px) auto",
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
                Bezeichnung
              </div>
              <input
                type="text"
                value={konto.bezeichnung}
                onChange={(e) =>
                  onBankkontoChange(konto.id, "bezeichnung", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #d0d7de",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>
                ID: {konto.id}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
                Konto-Nr. / Kennung
              </div>
              <input
                type="text"
                value={konto.kontonummer}
                onChange={(e) =>
                  onBankkontoChange(konto.id, "kontonummer", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #d0d7de",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
                Typ
              </div>
              <select
                value={konto.typ}
                onChange={(e) => onBankkontoChange(konto.id, "typ", e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #d0d7de",
                  background: "#fff",
                }}
              >
                <option value="bank">bank</option>
                <option value="bar">bar</option>
                <option value="privat">privat</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => onBankkontoLoeschen(konto.id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #DC2626",
                  background: "#fff",
                  color: "#DC2626",
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
