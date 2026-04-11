import { useEffect, useState } from "react";
import { appStyles as styles } from "../../styles/appStyles";
import { ladeBelegeAusJahresdatei, type Beleg } from "../../lib/belege";

type Props = {
  loadGespeichertenBeleg: (beleg: Beleg) => void;
  baseFolder: string;
  year: string;
};

function normalizePath(value: string): string {
  return String(value || "").replace(/\\/g, "/").replace(/\/+$/, "");
}

function getSearchBaseFolders(baseFolder: string): Array<{ folder: string; year: string }> {
  const normalized = normalizePath(baseFolder);

  if (!normalized) return [];

  const match = normalized.match(/^(.*)\/(2025|2026)$/);
  if (match) {
    const root = match[1];

    return [
      { folder: `${root}/2025`, year: "2025" },
      { folder: `${root}/2026`, year: "2026" },
    ];
  }

  return [
    { folder: normalized, year: "2025" },
    { folder: normalized, year: "2026" },
  ];
}

export default function BelegSuchePanel({
  loadGespeichertenBeleg,
  baseFolder,
  year,
}: Props) {
  const [suchText, setSuchText] = useState("");
  const [treffer, setTreffer] = useState<Beleg[]>([]);

  useEffect(() => {
    const reset = () => {
      setSuchText("");
      setTreffer([]);
    };

    window.addEventListener("resetBelegSuche", reset);

    return () => {
      window.removeEventListener("resetBelegSuche", reset);
    };
  }, []);

  async function handleSuche() {
    if (!baseFolder) {
      setTreffer([]);
      return;
    }

    const suche = suchText.trim().toLowerCase();

    if (!suche) {
      setTreffer([]);
      return;
    }

    const searchTargets = getSearchBaseFolders(baseFolder);

    const belegListen = await Promise.all(
      searchTargets.map(async ({ folder, year: targetYear }) => {
        try {
          return await ladeBelegeAusJahresdatei(folder, targetYear);
        } catch (error) {
          console.warn("Suche: Jahresdatei konnte nicht geladen werden:", {
            folder,
            year: targetYear,
            error,
          });
          return [];
        }
      })
    );

    const belege = belegListen.flat();

    console.log("SUCHE baseFolder:", baseFolder);
    console.log("SUCHE aktives year:", year);
    console.log("SUCHE searchTargets:", searchTargets);
    console.log("SUCHE belege gesamt:", belege);
    console.log("SUCHE suchText:", suchText);

    const suchWoerter = suche.split(/\s+/).filter(Boolean);

    const gefiltert = belege
      .filter((beleg) => {
        const text = [
          beleg.id || "",
          beleg.lieferant || "",
          beleg.fewo || "",
          beleg.notiz || "",
          beleg.konto || "",
          beleg.kategorie || "",
          beleg.dateiname || "",
          beleg.datum || "",
          String(beleg.betrag || ""),
        ]
          .join(" ")
          .toLowerCase();

        return suchWoerter.every((wort) => text.includes(wort));
      })
      .sort((a, b) => {
        if (a.jahr !== b.jahr) return b.jahr - a.jahr;
        return b.id.localeCompare(a.id);
      });

    console.log("SUCHE gefiltert:", gefiltert);
    setTreffer(gefiltert);
  }

  useEffect(() => {
    handleSuche().catch(console.error);
  }, [suchText, baseFolder, year]);

  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Belegsuche</div>

      <p style={{ marginTop: 10 }}>
        Suche über 2025 und 2026 nach Lieferant, Einheit, Konto, Notiz, Datei,
        Datum und Betrag.
      </p>

      <div style={{ marginTop: 14 }}>
        <label style={styles.small}>Suche</label>
        <input
          type="text"
          placeholder="z. B. amazon tina waschmittel"
          style={styles.input}
          value={suchText}
          onChange={(e) => setSuchText(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {treffer.map((beleg) => (
          <div
            key={`${beleg.jahr}-${beleg.id}`}
            onClick={() => loadGespeichertenBeleg(beleg)}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 12,
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {beleg.id} – {beleg.lieferant}
            </div>

            <div style={{ marginTop: 6 }}>
              Datum: {beleg.datum || "—"}
            </div>

            <div>
              Konto: {beleg.konto || beleg.kategorie || "—"}
            </div>

            <div>
              Notiz: {beleg.notiz || "—"}
            </div>

            <div style={{ ...styles.small, marginTop: 6 }}>
              Datei: {beleg.dateiname || "—"}
            </div>

            <div style={{ ...styles.small, marginTop: 4 }}>
              Einheit: {beleg.fewo || "—"}
            </div>

            <div style={{ ...styles.small, marginTop: 4 }}>
              Jahr: {beleg.jahr || "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}