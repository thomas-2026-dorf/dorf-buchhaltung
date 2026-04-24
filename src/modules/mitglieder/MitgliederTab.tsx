import { useEffect, useMemo, useState } from "react";
import InfoBox from "./components/InfoBox";
import MitgliedFormular from "./components/MitgliedFormular";
import MitgliederListe from "./components/MitgliederListe";
import { ladeMitglieder, speichereMitglieder } from "./storage/mitgliederStorage";
import { LEERES_MITGLIED } from "./types/mitglieder";
import type { Familienmitglied, Mitglied } from "./types/mitglieder";
import { erstelleMitgliedsantragPdf } from "./pdf/mitgliedsantragPdf";
import { leseMitgliedsantragPdfFelder } from "./pdf/mitgliedsantragAuslesen";

function naechsteMitgliedsnummer(mitglieder: Mitglied[]): string {
  const hoechsteNummer = mitglieder.reduce((max, mitglied) => {
    const match = /^M-(\d{4})$/.exec(mitglied.mitgliedsnummer || "");
    if (!match) return max;

    const nummer = Number(match[1]);
    return nummer > max ? nummer : max;
  }, 0);

  return `M-${String(hoechsteNummer + 1).padStart(4, "0")}`;
}

function familiennummernVergeben(
  familienmitglieder: Familienmitglied[],
  hauptMitgliedsnummer: string
): Familienmitglied[] {
  return familienmitglieder.map((familienmitglied, index) => ({
    ...familienmitglied,
    mitgliedsnummer: `${hauptMitgliedsnummer}-${index + 1}`,
  }));
}

export default function MitgliederTab() {
  const [mitglieder, setMitglieder] = useState<Mitglied[]>([]);
  const [formular, setFormular] = useState<Mitglied>(LEERES_MITGLIED());
  const [bearbeiteId, setBearbeiteId] = useState<string | null>(null);

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
    setBearbeiteId(null);
  };

  const loeschen = (id: string) => {
    const neueListe = mitglieder.filter((m) => m.id !== id);
    setMitglieder(neueListe);
    speichereMitglieder(neueListe);

    if (bearbeiteId === id) {
      formularZuruecksetzen();
    }
  };

  const bearbeiten = (mitglied: Mitglied) => {
    setFormular({
      ...mitglied,
      familienmitglieder: [...mitglied.familienmitglieder],
      sepa: { ...mitglied.sepa },
    });
    setBearbeiteId(mitglied.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const speichern = () => {
    if (!formular.vorname.trim() || !formular.nachname.trim()) {
      alert("Bitte mindestens Vorname und Nachname ausfüllen.");
      return;
    }

    const bestehendeMitgliedsnummer = formular.mitgliedsnummer || "";

    const hauptMitgliedsnummer =
      formular.status === "aktiv"
        ? bestehendeMitgliedsnummer || naechsteMitgliedsnummer(mitglieder)
        : bestehendeMitgliedsnummer;

    const eintrag: Mitglied = {
      ...formular,
      mitgliedsnummer: hauptMitgliedsnummer,
      familienmitglieder:
        formular.status === "aktiv" && hauptMitgliedsnummer
          ? familiennummernVergeben(formular.familienmitglieder, hauptMitgliedsnummer)
          : formular.familienmitglieder,
      aktualisiertAm: new Date().toISOString(),
    };

    const neueListe =
      bearbeiteId === null
        ? [eintrag, ...mitglieder]
        : mitglieder.map((mitglied) =>
          mitglied.id === bearbeiteId ? eintrag : mitglied
        );

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

      {bearbeiteId !== null && (
        <div
          style={{
            border: "1px solid #fde68a",
            background: "#fffbeb",
            color: "#92400e",
            borderRadius: 12,
            padding: 12,
          }}
        >
          Bearbeitungsmodus aktiv. Änderungen werden beim Speichern am bestehenden Mitglied übernommen.
        </div>
      )}

      <MitgliedFormular
        formular={formular}
        setFormular={setFormular}
        onSpeichern={speichern}
        onZuruecksetzen={formularZuruecksetzen}
        onMitgliedsantrag={() => erstelleMitgliedsantragPdf(formular)}
        onAntragEinlesenOcr={async () => {
          const daten = await leseMitgliedsantragPdfFelder();

          if (!daten) return;

          const [nachnameTeil = "", vornameTeil = ""] = daten.nameVorname
            .split(",")
            .map((teil) => teil.trim());

          const [plzTeil = "", ...ortTeile] = daten.plzWohnort.split(" ");

          setFormular({
            ...formular,
            nachname: nachnameTeil || formular.nachname,
            vorname: vornameTeil || formular.vorname,
            geburtsdatum: daten.geburtsdatum || formular.geburtsdatum,
            strasse: daten.strasse || formular.strasse,
            plz: plzTeil || formular.plz,
            wohnort: ortTeile.join(" ") || formular.wohnort,
            telefon: daten.telefon || formular.telefon,
            email: daten.email || formular.email,
          });
        }}
      />

      <MitgliederListe
        mitglieder={mitglieder}
        onDelete={loeschen}
        onEdit={bearbeiten}
      />
    </div>
  );
}
