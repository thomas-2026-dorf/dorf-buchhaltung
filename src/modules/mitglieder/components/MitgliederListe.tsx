import type { Mitglied } from "../types/mitglieder";

type MitgliederListeProps = {
  mitglieder: Mitglied[];
};

export default function MitgliederListe({ mitglieder }: MitgliederListeProps) {
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
              <div style={{ fontWeight: 700 }}>
                {mitglied.vorname} {mitglied.nachname}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
