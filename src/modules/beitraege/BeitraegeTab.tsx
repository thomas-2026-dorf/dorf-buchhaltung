import { useEffect, useMemo, useState } from "react";
import { ladeMitglieder } from "../mitglieder/storage/mitgliederStorage";
import { loadBeitraege, saveBeitraege } from "./beitraegeStorage";
import type { Beitrag } from "./beitraegeStorage";
import type { Mitglied } from "../mitglieder/types/mitglieder";
import type { Zahlungsart } from "./createBeitraegeForYear";
import { createBeitrag } from "./createBeitrag";
import { syncBeitraegeFromBank, createDummyBankJson } from "./syncBeitraegeFromBank";
import { colors } from "../../design/colors";
import { readJsonFile, ensureDir } from "../../lib/fileStorage";
import { ladeLocalSettings, getGlobalVereinsdatenDir } from "../../lib/settings/localSettings";
import { readDir, remove } from "@tauri-apps/plugin-fs";

const AKTUELLES_JAHR = new Date().getFullYear();

type BeitraegeEinstellungen = { standardBeitrag: number; familienBeitrag: number };

const LS_KEY_EINSTELLUNGEN = "dorf-buchhaltung-settings-v1";

async function ladeEinstellungen(): Promise<BeitraegeEinstellungen> {
  const fallback: BeitraegeEinstellungen = { standardBeitrag: 50, familienBeitrag: 30 };
  const dir = getGlobalVereinsdatenDir();

  if (!dir) {
    try {
      const raw = localStorage.getItem(LS_KEY_EINSTELLUNGEN);
      return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
    } catch { return fallback; }
  }

  try {
    await ensureDir(dir);
    return readJsonFile<BeitraegeEinstellungen>(`${dir}/beitraege-einstellungen.json`, fallback);
  } catch {
    try {
      const raw = localStorage.getItem(LS_KEY_EINSTELLUNGEN);
      return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
    } catch { return fallback; }
  }
}

const ZAHLUNGSART_OPTIONEN: { wert: Zahlungsart; label: string }[] = [
  { wert: "einzug", label: "Einzug" },
  { wert: "ueberweisung", label: "Überweisung" },
  { wert: "bar", label: "Bar" },
];

function zahlungsartAnzeige(wert: string): string {
  if (wert === "einzug" || wert === "sepa") return "Einzug";
  if (wert === "ueberweisung") return "Überweisung";
  if (wert === "bar") return "Bar";
  return wert;
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 600,
  color: colors.textLight,
  borderBottom: `1px solid ${colors.border}`,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 14,
  borderBottom: `1px solid ${colors.border}`,
  verticalAlign: "middle",
};

const selectStyle: React.CSSProperties = {
  border: `1px solid ${colors.border}`,
  borderRadius: 6,
  padding: "3px 8px",
  fontSize: 13,
  background: "#fff",
  cursor: "pointer",
};

export default function BeitraegeTab() {
  const [mitglieder, setMitglieder] = useState<Mitglied[]>([]);
  const [beitraege, setBeitraege] = useState<Beitrag[]>([]);
  const [einstellungen, setEinstellungen] = useState<BeitraegeEinstellungen>({ standardBeitrag: 50, familienBeitrag: 30 });
  const [syncing, setSyncing] = useState(false);
  const [dummyMitgliedId, setDummyMitgliedId] = useState("");

  async function ladeAlles(mitgliederListe: Mitglied[]) {
    const { baseFolder } = ladeLocalSettings();
    if (baseFolder) {
      await syncBeitraegeFromBank(baseFolder, mitgliederListe);
    }
    setBeitraege(await loadBeitraege());
  }

  useEffect(() => {
    async function init() {
      const [geladeneMitglieder, geladeneEinstellungen] = await Promise.all([
        ladeMitglieder(),
        ladeEinstellungen(),
      ]);
      setMitglieder(geladeneMitglieder);
      setEinstellungen(geladeneEinstellungen);

      for (const mitglied of geladeneMitglieder.filter((m) => m.status === "aktiv")) {
        const betrag =
          mitglied.aufnahmeart === "familie"
            ? geladeneEinstellungen.familienBeitrag
            : geladeneEinstellungen.standardBeitrag;
        const zahlungsart: Zahlungsart = mitglied.sepa?.iban ? "einzug" : "ueberweisung";
        await createBeitrag({
          mitgliedId: mitglied.id,
          mitgliedsnummer: mitglied.mitgliedsnummer,
          name: `${mitglied.vorname} ${mitglied.nachname}`,
          jahr: AKTUELLES_JAHR,
          betrag,
          zahlungsart,
        });
      }

      await ladeAlles(geladeneMitglieder);
    }
    init();
  }, []);

  const aktiveMitglieder = useMemo(
    () => mitglieder.filter((m) => m.status === "aktiv"),
    [mitglieder]
  );

  const jahre = useMemo(() => {
    const jahreSet = new Set<number>(beitraege.map((b) => b.jahr));
    jahreSet.add(AKTUELLES_JAHR);
    return Array.from(jahreSet).sort((a, b) => b - a);
  }, [beitraege]);

  const beitragMap = useMemo(() => {
    const map = new Map<string, Beitrag>();
    for (const b of beitraege) {
      map.set(`${b.mitgliedId}-${b.jahr}`, b);
    }
    return map;
  }, [beitraege]);

  const mitgliedMap = useMemo(() => {
    const map = new Map<string, Mitglied>();
    for (const m of mitglieder) map.set(m.id, m);
    return map;
  }, [mitglieder]);

  const anzahlOffen = beitraege.filter((b) => b.status === "offen").length;
  const anzahlBezahlt = beitraege.filter((b) => b.status === "bezahlt").length;

  const summeOffen = beitraege
    .filter((b) => b.status === "offen")
    .reduce((s, b) => {
      const m = mitgliedMap.get(b.mitgliedId);
      return s + (m ? getBetrag(m) : b.betrag);
    }, 0);

  const summeBezahlt = beitraege
    .filter((b) => b.status === "bezahlt")
    .reduce((s, b) => {
      const m = mitgliedMap.get(b.mitgliedId);
      return s + (m ? getBetrag(m) : b.betrag);
    }, 0);

  function getBetrag(mitglied: Mitglied): number {
    return mitglied.aufnahmeart === "familie"
      ? einstellungen.familienBeitrag
      : einstellungen.standardBeitrag;
  }

  async function handleStatusChange(beitragId: string, neuerStatus: Beitrag["status"]) {
    const updated = beitraege.map((b) =>
      b.id === beitragId
        ? { ...b, status: neuerStatus, aktualisiertAm: new Date().toISOString() }
        : b
    );
    await saveBeitraege(updated);
    setBeitraege(updated);
  }

  async function handleZahlungsartChange(beitragId: string, neueZahlungsart: Zahlungsart) {
    const updated = beitraege.map((b) =>
      b.id === beitragId
        ? { ...b, zahlungsart: neueZahlungsart, aktualisiertAm: new Date().toISOString() }
        : b
    );
    await saveBeitraege(updated);
    setBeitraege(updated);
  }

  async function handleBankSync() {
    setSyncing(true);
    await ladeAlles(mitglieder);
    setSyncing(false);
  }

  async function handleDummyErstellen() {
    const { baseFolder } = ladeLocalSettings();
    if (!baseFolder) return;
    const mitglied = mitglieder.find((m) => m.id === dummyMitgliedId) ?? aktiveMitglieder[0];
    if (!mitglied) return;
    const betrag = getBetrag(mitglied);
    await createDummyBankJson(baseFolder, mitglied, betrag);
    await handleBankSync();
  }

  async function handleDummyLoeschen() {
    const { baseFolder } = ladeLocalSettings();
    if (!baseFolder) return;
    const ordner = `${baseFolder}/Bank/Bearbeitet`;
    try {
      const files = await readDir(ordner);
      for (const file of files) {
        if (file.name?.includes("dummy")) {
          await remove(`${ordner}/${file.name}`);
        }
      }
    } catch { /* Ordner existiert nicht */ }
    await handleBankSync();
  }

  return (
    <div className="space-y-6">

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={handleBankSync}
          disabled={syncing}
          style={{
            padding: "6px 14px", fontSize: 13, borderRadius: 6, cursor: "pointer",
            border: `1px solid ${colors.border}`, background: colors.card,
          }}
        >
          {syncing ? "Synchronisiere…" : "Bank-Sync"}
        </button>

        <span style={{ fontSize: 12, color: colors.textLight, marginLeft: 8 }}>Test:</span>
        <select
          value={dummyMitgliedId}
          onChange={(e) => setDummyMitgliedId(e.target.value)}
          style={{ ...selectStyle, fontSize: 12 }}
        >
          <option value="">Mitglied wählen…</option>
          {aktiveMitglieder.map((m) => (
            <option key={m.id} value={m.id}>
              {m.vorname} {m.nachname}
            </option>
          ))}
        </select>
        <button
          onClick={handleDummyErstellen}
          disabled={!ladeLocalSettings().baseFolder}
          style={{
            padding: "6px 14px", fontSize: 13, borderRadius: 6, cursor: "pointer",
            border: `1px solid ${colors.border}`, background: colors.card,
          }}
        >
          Dummy erstellen
        </button>
        <button
          onClick={handleDummyLoeschen}
          disabled={!ladeLocalSettings().baseFolder}
          style={{
            padding: "6px 14px", fontSize: 13, borderRadius: 6, cursor: "pointer",
            border: `1px solid #fca5a5`, background: "#fef2f2", color: "#b91c1c",
          }}
        >
          Dummy löschen
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        {[
          { titel: "Aktive Mitglieder", wert: String(aktiveMitglieder.length) },
          { titel: "Beiträge offen", wert: String(anzahlOffen) },
          { titel: "Offener Gesamtbetrag", wert: `${summeOffen.toFixed(2)} €` },
          { titel: "Beiträge bezahlt", wert: String(anzahlBezahlt) },
          { titel: "Bezahlter Gesamtbetrag", wert: `${summeBezahlt.toFixed(2)} €` },
        ].map(({ titel, wert }) => (
          <div
            key={titel}
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              padding: 14,
              background: colors.card,
            }}
          >
            <div style={{ fontSize: 12, color: colors.textLight, marginBottom: 4 }}>{titel}</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{wert}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: colors.background }}>
              <th style={thStyle}>Nr.</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Betrag</th>
              <th style={thStyle}>Zahlungsart</th>
              {jahre.map((jahr) => (
                <th key={jahr} style={{ ...thStyle, textAlign: "center" }}>
                  {jahr}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {aktiveMitglieder.length === 0 && (
              <tr>
                <td
                  colSpan={4 + jahre.length}
                  style={{ ...tdStyle, color: colors.textLight, textAlign: "center", padding: 32 }}
                >
                  Keine aktiven Mitglieder gefunden.
                </td>
              </tr>
            )}
            {aktiveMitglieder.map((mitglied) => {
              const betrag = getBetrag(mitglied);
              const aktuellerBeitrag = beitragMap.get(`${mitglied.id}-${AKTUELLES_JAHR}`);

              return (
                <tr key={mitglied.id}>
                  <td style={{ ...tdStyle, color: colors.textLight, fontFamily: "monospace" }}>
                    {mitglied.mitgliedsnummer || "—"}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>
                    {mitglied.vorname} {mitglied.nachname}
                  </td>
                  <td style={{ ...tdStyle }}>
                    {betrag.toFixed(2)} €
                  </td>
                  <td style={{ ...tdStyle }}>
                    {aktuellerBeitrag ? (
                      <select
                        value={aktuellerBeitrag.zahlungsart}
                        onChange={(e) =>
                          handleZahlungsartChange(
                            aktuellerBeitrag.id,
                            e.target.value as Zahlungsart
                          )
                        }
                        style={selectStyle}
                      >
                        {ZAHLUNGSART_OPTIONEN.map((opt) => (
                          <option key={opt.wert} value={opt.wert}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ color: colors.textLight, fontSize: 13 }}>
                        {zahlungsartAnzeige(mitglied.sepa.iban ? "einzug" : "ueberweisung")}
                      </span>
                    )}
                  </td>
                  {jahre.map((jahr) => {
                    const eintrag = beitragMap.get(`${mitglied.id}-${jahr}`);
                    return (
                      <td key={jahr} style={{ ...tdStyle, textAlign: "center" }}>
                        {eintrag ? (
                          <select
                            value={eintrag.status}
                            onChange={(e) =>
                              handleStatusChange(
                                eintrag.id,
                                e.target.value as Beitrag["status"]
                              )
                            }
                            style={selectStyle}
                          >
                            <option value="offen">offen</option>
                            <option value="bezahlt">bezahlt</option>
                            <option value="storniert">storniert</option>
                          </select>
                        ) : (
                          <span style={{ color: colors.textLight, fontSize: 13 }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
