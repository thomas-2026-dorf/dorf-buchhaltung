import { useState } from "react";
import type { CsvFeldZuordnung } from "../../../lib/settings/csvFeldZuordnung";
import { erkenneFelderAusKopfzeile } from "../../../lib/settings/csvFeldZuordnung";
import { cardStyle } from "../../../design/styles";

type Props = {
  zuordnung: CsvFeldZuordnung;
  onSpeichern: (z: CsvFeldZuordnung) => Promise<void>;
};

const FELDER: { key: keyof Omit<CsvFeldZuordnung, "trennzeichen">; label: string; optional: boolean }[] = [
  { key: "buchungstag",      label: "Buchungstag",                        optional: false },
  { key: "valuta",           label: "Valuta",                             optional: false },
  { key: "betrag",           label: "Betrag",                             optional: false },
  { key: "waehrung",         label: "Währung",                            optional: true  },
  { key: "verwendungszweck", label: "Verwendungszweck",                   optional: false },
  { key: "buchungstext",     label: "Buchungstext (optional)",            optional: true  },
  { key: "auftraggeber",     label: "Auftraggeber / Begünstigter",        optional: false },
  { key: "mitgliedsnummer",  label: "Mitgliedsnummer (optional)",         optional: true  },
];

const inputNr: React.CSSProperties = {
  width: 64,
  padding: "6px 8px",
  border: "1px solid #d0d7de",
  borderRadius: 6,
  fontSize: 14,
  textAlign: "center",
  fontFamily: "monospace",
};

export default function SettingsCsvImportPanel({ zuordnung, onSpeichern }: Props) {
  const [form, setForm] = useState<CsvFeldZuordnung>({ ...zuordnung });
  const [kopfzeile, setKopfzeile] = useState("");
  const [gespeichert, setGespeichert] = useState(false);

  function setFeld(key: keyof CsvFeldZuordnung, wert: number | string) {
    setForm((prev) => ({ ...prev, [key]: wert }));
  }

  function autoErkennen() {
    if (!kopfzeile.trim()) return;
    const erkannt = erkenneFelderAusKopfzeile(kopfzeile, form.trennzeichen);
    setForm(erkannt);
  }

  async function handleSpeichern() {
    await onSpeichern(form);
    setGespeichert(true);
    setTimeout(() => setGespeichert(false), 2000);
  }

  return (
    <div style={cardStyle}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
        CSV-Feldzuordnung (Bank-Import)
      </div>

      {/* Trennzeichen */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 14, color: "#374151" }}>Trennzeichen:</span>
        <input
          value={form.trennzeichen}
          onChange={(e) => setFeld("trennzeichen", e.target.value)}
          style={{ ...inputNr, width: 48 }}
        />
      </div>

      {/* Kopfzeile Auto-Erkennen */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 6, fontWeight: 600 }}>
          CSV-Kopfzeile einfügen → automatisch erkennen
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={kopfzeile}
            onChange={(e) => setKopfzeile(e.target.value)}
            placeholder="Buchungstag;Valuta;Betrag;Waehrung;Verwendungszweck;Auftraggeber;Mitgliedsnummer"
            style={{
              flex: 1,
              padding: "8px 10px",
              border: "1px solid #d0d7de",
              borderRadius: 8,
              fontSize: 13,
              fontFamily: "monospace",
            }}
          />
          <button
            onClick={autoErkennen}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #d0d7de",
              background: "#f3f4f6",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Erkennen
          </button>
        </div>
      </div>

      {/* Feld-Tabelle */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 100px",
            background: "#f9fafb",
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 700,
            color: "#6B7280",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <span>Feld</span>
          <span style={{ textAlign: "center" }}>Spalte (0-basiert, -1 = fehlt)</span>
        </div>

        {FELDER.map(({ key, label, optional }, idx) => (
          <div
            key={key}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px",
              padding: "10px 12px",
              alignItems: "center",
              borderBottom: idx < FELDER.length - 1 ? "1px solid #f3f4f6" : "none",
              background: (form[key] as number) < 0 && !optional ? "#fff7ed" : "#fff",
            }}
          >
            <span style={{ fontSize: 14, color: "#374151" }}>
              {label}
              {optional && (
                <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 6 }}>optional</span>
              )}
            </span>
            <input
              type="number"
              value={form[key] as number}
              onChange={(e) =>
                setFeld(key, parseInt(e.target.value) !== undefined ? parseInt(e.target.value) : -1)
              }
              style={{ ...inputNr, margin: "0 auto", display: "block" }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSpeichern}
        style={{
          padding: "10px 24px",
          borderRadius: 8,
          border: "none",
          background: gespeichert ? "#16a34a" : "#2563eb",
          color: "#fff",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 14,
          transition: "background 0.2s",
        }}
      >
        {gespeichert ? "Gespeichert ✓" : "Speichern"}
      </button>
    </div>
  );
}
