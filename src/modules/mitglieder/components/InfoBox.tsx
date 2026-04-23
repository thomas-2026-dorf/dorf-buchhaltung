type InfoBoxProps = {
  titel: string;
  wert: string;
};

export default function InfoBox({ titel, wert }: InfoBoxProps) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 14,
        background: "#ffffff",
      }}
    >
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{titel}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{wert}</div>
    </div>
  );
}
