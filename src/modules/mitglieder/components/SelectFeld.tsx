type SelectOption = {
  value: string;
  label: string;
};

type SelectFeldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  optionen: SelectOption[];
};

export default function SelectFeld({
  label,
  value,
  onChange,
  optionen,
}: SelectFeldProps) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: "100%",
          border: "1px solid #d1d5db",
          borderRadius: 8,
          padding: 10,
          boxSizing: "border-box",
          font: "inherit",
          background: "#ffffff",
        }}
      >
        {optionen.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
