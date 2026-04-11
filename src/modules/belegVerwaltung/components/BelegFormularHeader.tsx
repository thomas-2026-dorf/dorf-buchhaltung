import { formStyles } from "../../../design/forms";

export default function BelegFormularHeader() {
  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>
        Belegerfassung
      </div>
      <div style={{ ...formStyles.small, opacity: 0.8 }}>
        Rechnung prüfen, Felder ergänzen und danach sauber speichern.
      </div>
    </div>
  );
}
