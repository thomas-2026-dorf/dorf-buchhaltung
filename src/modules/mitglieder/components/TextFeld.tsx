type TextFeldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
};

export default function TextFeld({
  label,
  value,
  onChange,
  type = "text",
}: TextFeldProps) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontWeight: 600, marginBottom: 6, whiteSpace: "nowrap" }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: "100%",
          border: "1px solid #d1d5db",
          borderRadius: 8,
          padding: 10,
          boxSizing: "border-box",
          font: "inherit",
        }}
      />
    </label>
  );
}
