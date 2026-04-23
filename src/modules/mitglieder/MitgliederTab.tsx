import { useEffect, useMemo, useState } from "react";
import InfoBox from "./components/InfoBox";
import MitgliedFormular from "./components/MitgliedFormular";
import MitgliederListe from "./components/MitgliederListe";
import { ladeMitglieder, speichereMitglieder } from "./storage/mitgliederStorage";
import { LEERES_MITGLIED } from "./types/mitglieder";
import type { Mitglied } from "./types/mitglieder";

export default function MitgliederTab() {
  const [mitglieder, setMitglieder] = useState<Mitglied[]>([]);
  const [formular, setFormular] = useState<Mitglied>(LEERES_MITGLIED());

  useEffect(() => {
    setMitglieder(ladeMitglieder());
  }, []);

  const anzahlAktiv = useMemo(
    () => mitglieder.filter((eintrag) => eintrag.status === "aktiv").length,
    [mitglieder]
  );

  const anzahlOffen = useMemo(
    () => mitglieder.filter((eintrag) => eintrag.status === "antrag-offen").length,
    [mitglieder]
  );

  const formularZuruecksetzen = () => {
    setFormular(LEERES_MITGLIED());
  };

  const speichern = () => {
    if (!formular.vorname.trim() || !formular.nachname.trim()) {
      alert("Bitte mindestens Vorname und Nachname ausfüllen.");
      return;
    }

    const neuerEintrag: Mitglied = {
      ...formular,
      aktualisiertAm: new Date().toISOString(),
    };

    const neueListe = [neuerEintrag, ...mitglieder];
    setMitglieder(neueListe);
    speichereMitglieder(neueListe);
    formularZuruecksetzen();
  };

  return (
    <div className="space-y-6">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <InfoBox titel="Mitglieder gesamt" wert={String(mitglieder.length)} />
        <InfoBox titel="Aktiv" wert={String(anzahlAktiv)} />
        <InfoBox titel="Anträge offen" wert={String(anzahlOffen)} />
      </div>

      <MitgliedFormular
        formular={formular}
        setFormular={setFormular}
        onSpeichern={speichern}
        onZuruecksetzen={formularZuruecksetzen}
      />

      <MitgliederListe mitglieder={mitglieder} />
    </div>
  );
}
