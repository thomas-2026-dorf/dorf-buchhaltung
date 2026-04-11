import {
  primaryButton,
  warningButton,
  buttonFullWidth,
  buttonDisabled,
} from "../../../design/buttons";

type Props = {
  formularVollstaendig: boolean;
  lieferantDatevMerken: boolean;
  setLieferantDatevMerken: (value: boolean) => void;
  onSpeichern: () => void;
  onVerschiebenSonstiges: () => void;
};

export default function BelegFormularActions(props: Props) {
  const {
    formularVollstaendig,
    lieferantDatevMerken,
    setLieferantDatevMerken,
    onSpeichern,
    onVerschiebenSonstiges,
  } = props;

  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        background: "#fff",
        paddingTop: 10,
        paddingBottom: 6,
        marginTop: 10,
        borderTop: "1px solid rgba(0,0,0,0.08)",
        display: "grid",
        gap: 10,
      }}
    >
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 14,
          color: "#334155",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={lieferantDatevMerken}
          onChange={(e) => setLieferantDatevMerken(e.target.checked)}
        />
        <span>Lieferant für DATEV merken</span>
      </label>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          style={{
            ...primaryButton,
            ...buttonFullWidth,
            ...(formularVollstaendig ? {} : buttonDisabled),
            flex: 1,
          }}
          disabled={!formularVollstaendig}
          onClick={onSpeichern}
        >
          Beleg speichern
        </button>

        <button
          type="button"
          style={{
            ...warningButton,
            ...buttonFullWidth,
            flex: 1,
          }}
          onClick={onVerschiebenSonstiges}
        >
          Anders ablegen
        </button>
      </div>
    </div>
  );
}
