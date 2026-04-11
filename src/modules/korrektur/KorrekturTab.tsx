import { useEffect, useMemo, useState } from "react";
import {
  ladeBelegeAusJahresdatei,
  type Beleg,
} from "../../lib/belege";
import {
  ladeJahresdatei,
  speichereJahresdatei,
} from "../../lib/storage";
import { ladeAppSettings } from "../../lib/settings/appSettingsStorage";
import KorrekturFilterPanel from "./KorrekturFilterPanel";

type Props = {
  baseFolder: string;
};

export default function KorrekturTab({ baseFolder }: Props) {
  const [jahr, setJahr] = useState("2026");
  const [lieferantFilter, setLieferantFilter] = useState("");
  const [einheitFilter, setEinheitFilter] = useState("");
  const [basisKonto, setBasisKonto] = useState("");
  const [belege, setBelege] = useState<Beleg[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const appSettings = useMemo(() => ladeAppSettings(), []);

  const einheiten = useMemo(() => {
    return (appSettings.einheiten ?? []).filter((einheit) => einheit.aktiv);
  }, [appSettings]);

  const kontoSuffix = useMemo(() => {
    const einheit = einheiten.find((item) => item.name === einheitFilter);
    return einheit?.kontoSuffix ?? "";
  }, [einheiten, einheitFilter]);

  const endKonto = useMemo(() => {
    const basis = basisKonto.replace(/\D/g, "").slice(0, 4);
    const suffix = kontoSuffix.replace(/\D/g, "").slice(0, 2);

    if (basis.length !== 4 || suffix.length !== 2) {
      return "";
    }

    return `${basis}${suffix}`;
  }, [basisKonto, kontoSuffix]);

  useEffect(() => {
    let aktiv = true;

    async function load() {
      if (!baseFolder) {
        setBelege([]);
        setStatus("Kein Basisordner gewählt.");
        return;
      }

      try {
        setLoading(true);
        setStatus("");

        const geladeneBelege = await ladeBelegeAusJahresdatei(baseFolder, jahr);

        if (!aktiv) return;
        setBelege(geladeneBelege);
      } catch (error) {
        if (!aktiv) return;
        setBelege([]);
        setStatus(
          error instanceof Error ? `Fehler: ${error.message}` : "Fehler beim Laden"
        );
      } finally {
        if (aktiv) setLoading(false);
      }
    }

    load();

    return () => {
      aktiv = false;
    };
  }, [baseFolder, jahr]);

  const gefiltert = useMemo(() => {
    return belege.filter((b) => {
      const matchLieferant = lieferantFilter
        ? b.lieferant.toLowerCase().includes(lieferantFilter.toLowerCase())
        : true;

      const fewoWert = String(b.fewo || "").trim().toLowerCase();
      const filterWert = String(einheitFilter || "").trim().toLowerCase();

      const matchEinheit = filterWert
        ? fewoWert === filterWert ||
          fewoWert.includes(filterWert) ||
          filterWert.includes(fewoWert)
        : true;

      return matchLieferant && matchEinheit;
    });
  }, [belege, lieferantFilter, einheitFilter]);

  async function handleKontoAnwenden() {
    if (!baseFolder) {
      setStatus("Kein Basisordner gewählt.");
      return;
    }

    if (!basisKonto.trim()) {
      setStatus("Bitte DATEV-Basiskonto eingeben.");
      return;
    }

    if (!einheitFilter) {
      setStatus("Bitte eine Einheit wählen.");
      return;
    }

    if (!endKonto) {
      setStatus("Endkonto konnte nicht gebildet werden.");
      return;
    }

    if (gefiltert.length === 0) {
      setStatus("Keine passenden Belege gefunden.");
      return;
    }

    const bestaetigt = window.confirm(
      `${gefiltert.length} Belege wirklich auf Konto ${endKonto} ändern?`
    );

    if (!bestaetigt) {
      return;
    }

    try {
      setSaving(true);
      setStatus("Änderungen werden gespeichert...");

      const ids = new Set(gefiltert.map((b) => b.id));
      const basis = basisKonto.replace(/\D/g, "").slice(0, 4);

      const aktualisierteBelege = belege.map((b) =>
        ids.has(b.id)
          ? {
              ...b,
              konto: endKonto,
              kategorie: basis,
            }
          : b
      );

      const jahresdatei = await ladeJahresdatei(baseFolder, jahr);

      const aktualisierteJahresdateiBelege = jahresdatei.belege.map((rawBeleg) => {
        const rawId =
          rawBeleg &&
          typeof rawBeleg === "object" &&
          "id" in rawBeleg &&
          typeof rawBeleg.id === "string"
            ? rawBeleg.id
            : "";

        if (!ids.has(rawId)) {
          return rawBeleg;
        }

        return {
          ...rawBeleg,
          konto: endKonto,
          kategorie: basis,
        };
      });

      await speichereJahresdatei(baseFolder, jahr, {
        ...jahresdatei,
        belege: aktualisierteJahresdateiBelege,
        updatedAt: new Date().toISOString(),
      });

      setBelege(aktualisierteBelege);
      setStatus(`${gefiltert.length} Belege wurden auf Konto ${endKonto} geändert.`);
    } catch (error) {
      setStatus(
        error instanceof Error ? `Fehler: ${error.message}` : "Fehler beim Speichern"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 20, display: "grid", gap: 16 }}>
      <h2 style={{ margin: 0 }}>Korrektur</h2>

      <KorrekturFilterPanel
        jahr={jahr}
        setJahr={setJahr}
        lieferantFilter={lieferantFilter}
        setLieferantFilter={setLieferantFilter}
        einheitFilter={einheitFilter}
        setEinheitFilter={setEinheitFilter}
        einheiten={einheiten}
        basisKonto={basisKonto}
        setBasisKonto={setBasisKonto}
        kontoSuffix={kontoSuffix}
        endKonto={endKonto}
        handleKontoAnwenden={handleKontoAnwenden}
        loading={loading}
        saving={saving}
        gefiltertAnzahl={gefiltert.length}
      />

      {loading && <div>Lade Belege…</div>}

      {!loading && (
        <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
          <div>
            <strong>Gefundene Belege:</strong> {gefiltert.length}
          </div>

          {gefiltert.length > 0 && (
            <div style={{ fontSize: 14, color: "#374151" }}>
              {gefiltert.map((b) => b.lieferant || "-").join(", ")}
            </div>
          )}
        </div>
      )}

      {status && <div style={{ fontSize: 13 }}>{status}</div>}
    </div>
  );
}
