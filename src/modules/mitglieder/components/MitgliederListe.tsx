import type { Mitglied } from "../types/mitglieder";

type MitgliederListeProps = {
  mitglieder: Mitglied[];
  onDelete: (id: string) => void;
  onEdit: (mitglied: Mitglied) => void;
};

export default function MitgliederListe({
  mitglieder,
  onDelete,
  onEdit,
}: MitgliederListeProps) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        background: "#ffffff",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>Gespeicherte Mitglieder</h2>

      {mitglieder.length === 0 ? (
        <p style={{ margin: 0, color: "#6b7280" }}>Noch keine Mitglieder gespeichert.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {mitglieder.map((mitglied) => (
            <div
              key={mitglied.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 12,
                background: "#f9fafb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {mitglied.vorname} {mitglied.nachname}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 13, color: "#6b7280" }}>
                    Mitgliedsnummer: {mitglied.mitgliedsnummer || "-"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button type="button" onClick={() => onEdit(mitglied)}>
                    Bearbeiten
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Mitglied wirklich löschen?")) {
                        onDelete(mitglied.id);
                      }
                    }}
                  >
                    Löschen
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 6, color: "#374151" }}>
                Status: {mitglied.status} | Art: {mitglied.mitgliedsart} | Aufnahme:{" "}
                {mitglied.aufnahmeart}
              </div>

              <div style={{ marginTop: 6, color: "#374151" }}>
                Ort: {mitglied.plz} {mitglied.wohnort}
              </div>

              <div style={{ marginTop: 6, color: "#374151" }}>
                E-Mail: {mitglied.email || "-"} | Telefon: {mitglied.telefon || "-"}
              </div>

              {mitglied.familienmitglieder.length > 0 && (
                <div
                  style={{
                    marginTop: 10,
                    padding: 10,
                    borderRadius: 8,
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>
                    Familienmitglieder: {mitglied.familienmitglieder.length}
                  </div>

                  <div style={{ display: "grid", gap: 6 }}>
                    {mitglied.familienmitglieder.map((familienmitglied) => (
                      <div
                        key={familienmitglied.id}
                        style={{
                          fontSize: 14,
                          color: "#374151",
                        }}
                      >
                        {familienmitglied.mitgliedsnummer || "-"} |{" "}
                        {familienmitglied.vorname} {familienmitglied.nachname}
                        {familienmitglied.geburtsdatum
                          ? ` | ${familienmitglied.geburtsdatum}`
                          : ""}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
