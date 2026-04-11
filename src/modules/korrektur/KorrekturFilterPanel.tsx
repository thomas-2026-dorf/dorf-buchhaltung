type EinheitOption = {
  id: string;
  name: string;
};

type Props = {
  jahr: string;
  setJahr: (value: string) => void;
  lieferantFilter: string;
  setLieferantFilter: (value: string) => void;
  basisKonto: string;
  setBasisKonto: (value: string) => void;
  einheitId: string;
  setEinheitId: (value: string) => void;
  einheiten: EinheitOption[];
  endKonto: string;
  status: string;
  gefiltertAnzahl: number;
};

export default function KorrekturFilterPanel(props: Props) {
  const {
    jahr,
    setJahr,
    lieferantFilter,
    setLieferantFilter,
    basisKonto,
    setBasisKonto,
    einheitId,
    setEinheitId,
    einheiten,
    endKonto,
    status,
    gefiltertAnzahl,
  } = props;

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        marginBottom: 16,
      }}
    >
      <div>
        <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
          Jahr
        </div>
        <input
          type="text"
          value={jahr}
          onChange={(e) => setJahr(e.target.value)}
          placeholder="z. B. 2026"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #d0d7de",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div>
        <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
          Lieferant
        </div>
        <input
          type="text"
          value={lieferantFilter}
          onChange={(e) => setLieferantFilter(e.target.value)}
          placeholder="Lieferant filtern"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #d0d7de",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div>
        <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
          Basis-Konto
        </div>
        <input
          type="text"
          value={basisKonto}
          onChange={(e) => setBasisKonto(e.target.value)}
          placeholder="z. B. 8100"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #d0d7de",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div>
        <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
          Einheit
        </div>
        <select
          value={einheitId}
          onChange={(e) => setEinheitId(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #d0d7de",
            boxSizing: "border-box",
            background: "#fff",
          }}
        >
          <option value="">Bitte wählen</option>
          {einheiten.map((einheit) => (
            <option key={einheit.id} value={einheit.id}>
              {einheit.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
          Ziel-Konto
        </div>
        <input
          type="text"
          value={endKonto}
          readOnly
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #d0d7de",
            boxSizing: "border-box",
            background: "#F9FAFB",
          }}
        />
      </div>

      <div>
        <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
          Treffer
        </div>
        <input
          type="text"
          value={String(gefiltertAnzahl)}
          readOnly
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #d0d7de",
            boxSizing: "border-box",
            background: "#F9FAFB",
          }}
        />
      </div>

      <div style={{ gridColumn: "1 / -1" }}>
        <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
          Status
        </div>
        <div
          style={{
            minHeight: 20,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #E5E7EB",
            background: "#F9FAFB",
            color: "#374151",
          }}
        >
          {status || "—"}
        </div>
      </div>
    </div>
  );
}
