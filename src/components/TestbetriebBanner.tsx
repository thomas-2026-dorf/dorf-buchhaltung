type Props = {
  visible?: boolean;
};

export default function TestbetriebBanner({ visible = true }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <div
      style={{
        background: "#ffcc00",
        color: "#000",
        padding: "10px 16px",
        fontWeight: 700,
        borderBottom: "1px solid #d4a300",
      }}
    >
      TESTBETRIEB AKTIV – vor dem Beenden bitte zurücksetzen oder bewusst weiterarbeiten
    </div>
  );
}
