import { formStyles } from "../../../design/forms";

type Props = {
  splitTina: string;
  setSplitTina: (value: string) => void;
  splitHarmony: string;
  setSplitHarmony: (value: string) => void;
  splitTinchen: string;
  setSplitTinchen: (value: string) => void;
  splitRS: string;
  setSplitRS: (value: string) => void;
  splitPrivat: string;
  setSplitPrivat: (value: string) => void;
  toNumber: (v: string) => number;
  formatEuro: (wert: number) => string;
};

export default function BelegSplitInputs(props: Props) {
  const {
    splitTina,
    setSplitTina,
    splitHarmony,
    setSplitHarmony,
    splitTinchen,
    setSplitTinchen,
    splitRS,
    setSplitRS,
    splitPrivat,
    setSplitPrivat,
    toNumber,
    formatEuro,
  } = props;

  const rowStyle = {
    display: "grid",
    gridTemplateColumns: "150px minmax(0, 1fr)",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  } as const;

  const row2Style = {
    display: "grid",
    gridTemplateColumns: "150px minmax(0, 1fr) 150px minmax(0, 1fr)",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  } as const;

  const nameWrapStyle = {
    display: "grid",
    gap: 1,
    minWidth: 0,
  } as const;

  const nameStyle = {
    ...formStyles.label,
    margin: 0,
    fontSize: 13,
    lineHeight: 1.2,
  };

  const nrStyle = {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 1.1,
  };

  const inputStyle = {
    ...formStyles.input,
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box" as const,
    minHeight: 36,
    padding: "6px 10px",
  };

  return (
    <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
      <div style={row2Style}>
        <div style={nameWrapStyle}>
          <div style={nameStyle}>Tina</div>
          <div style={nrStyle}>264810</div>
        </div>
        <input
          style={inputStyle}
          value={splitTina}
          onChange={(e) => setSplitTina(e.target.value)}
          onBlur={() => {
            const wert = toNumber(splitTina);
            setSplitTina(wert ? formatEuro(wert) : "");
          }}
        />

        <div style={nameWrapStyle}>
          <div style={nameStyle}>Harmony</div>
          <div style={nrStyle}>264817</div>
        </div>
        <input
          style={inputStyle}
          value={splitHarmony}
          onChange={(e) => setSplitHarmony(e.target.value)}
          onBlur={() => {
            const wert = toNumber(splitHarmony);
            setSplitHarmony(wert ? formatEuro(wert) : "");
          }}
        />
      </div>

      <div style={row2Style}>
        <div style={nameWrapStyle}>
          <div style={nameStyle}>Tinchen</div>
          <div style={nrStyle}>264816</div>
        </div>
        <input
          style={inputStyle}
          value={splitTinchen}
          onChange={(e) => setSplitTinchen(e.target.value)}
          onBlur={() => {
            const wert = toNumber(splitTinchen);
            setSplitTinchen(wert ? formatEuro(wert) : "");
          }}
        />

        <div style={nameWrapStyle}>
          <div style={nameStyle}>RS</div>
          <div style={nrStyle}>&nbsp;</div>
        </div>
        <input
          style={inputStyle}
          value={splitRS}
          onChange={(e) => setSplitRS(e.target.value)}
          onBlur={() => {
            const wert = toNumber(splitRS);
            setSplitRS(wert ? formatEuro(wert) : "");
          }}
        />
      </div>

      <div style={rowStyle}>
        <div style={nameWrapStyle}>
          <div style={nameStyle}>Privat</div>
          <div style={nrStyle}>&nbsp;</div>
        </div>
        <input
          style={inputStyle}
          value={splitPrivat}
          onChange={(e) => setSplitPrivat(e.target.value)}
          onBlur={() => {
            const wert = toNumber(splitPrivat);
            setSplitPrivat(wert ? formatEuro(wert) : "");
          }}
        />
      </div>
    </div>
  );
}
