import type { Familienmitglied } from "../types/mitglieder";
import TextFeld from "./TextFeld";

type FamilienmitgliederFelderProps = {
  familienmitglieder: Familienmitglied[];
  onChange: (naechsteListe: Familienmitglied[]) => void;
};

function neuesFamilienmitglied(): Familienmitglied {
  return {
    id: crypto.randomUUID(),
    vorname: "",
    nachname: "",
    geburtsdatum: "",
    telefon: "",
    email: "",
  };
}

export default function FamilienmitgliederFelder({
  familienmitglieder,
  onChange,
}: FamilienmitgliederFelderProps) {
  const hinzufuegen = () => {
    onChange([...familienmitglieder, neuesFamilienmitglied()]);
  };

  const aktualisieren = (
    id: string,
    feld: keyof Omit<Familienmitglied, "id">,
    wert: string
  ) => {
    onChange(
      familienmitglieder.map((eintrag) =>
        eintrag.id === id ? { ...eintrag, [feld]: wert } : eintrag
      )
    );
  };

  const entfernen = (id: string) => {
    onChange(familienmitglieder.filter((eintrag) => eintrag.id !== id));
  };

  return (
    <div style={{ marginTop: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0 }}>Weitere Familienmitglieder</h3>
        <button type="button" onClick={hinzufuegen}>
          Familienmitglied hinzufügen
        </button>
      </div>

      {familienmitglieder.length === 0 ? (
        <p style={{ margin: 0, color: "#6b7280" }}>
          Noch keine weiteren Familienmitglieder eingetragen.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {familienmitglieder.map((familienmitglied, index) => (
            <div
              key={familienmitglied.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 12,
                background: "#f9fafb",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <span>Familienmitglied {index + 1}</span>
                <button type="button" onClick={() => entfernen(familienmitglied.id)}>
                  Entfernen
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <TextFeld
                  label="Vorname"
                  value={familienmitglied.vorname}
                  onChange={(wert) => aktualisieren(familienmitglied.id, "vorname", wert)}
                />

                <TextFeld
                  label="Nachname"
                  value={familienmitglied.nachname}
                  onChange={(wert) => aktualisieren(familienmitglied.id, "nachname", wert)}
                />

                <TextFeld
                  label="Geburtsdatum"
                  type="date"
                  value={familienmitglied.geburtsdatum}
                  onChange={(wert) => aktualisieren(familienmitglied.id, "geburtsdatum", wert)}
                />

                <TextFeld
                  label="Telefon"
                  value={familienmitglied.telefon}
                  onChange={(wert) => aktualisieren(familienmitglied.id, "telefon", wert)}
                />

                <TextFeld
                  label="E-Mail"
                  type="email"
                  value={familienmitglied.email}
                  onChange={(wert) => aktualisieren(familienmitglied.id, "email", wert)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
