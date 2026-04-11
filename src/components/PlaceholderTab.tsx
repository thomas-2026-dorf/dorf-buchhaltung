import { formStyles } from "../design/forms";

export default function PlaceholderTab() {
  return (
    <div>
      <p style={{ marginTop: 0 }}>
        Dieser Bereich ist als nächstes dran. Wir bauen ihn Schritt für Schritt aus.
      </p>
      <div style={formStyles.small}>
        (Dashboard, Zuordnung, Suche, Tools und weitere Module)
      </div>
    </div>
  );
}
