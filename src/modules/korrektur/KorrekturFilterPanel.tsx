type EinheitOption = {
  id: string;
  name: string;
  kontoSuffix: string;
};

type Props = {
  jahr: string;
  setJahr: (value: string) => void;
  lieferantFilter: string;
  setLieferantFilter: (value: string) => void;
  einheitFilter: string;
  setEinheitFilter: (value: string) => void;
  einheiten: EinheitOption[];
  basisKonto: string;
  setBasisKonto: (value: string) => void;
  kontoSuffix: string;
  endKonto: string;
  handleKontoAnwenden: () => void;
  loading: boolean;
  saving: boolean;
  gefiltertAnzahl: number;
};

export default function KorrekturFilterPanel(props: Props) {
  const {
    jahr,
    setJahr,
    lieferantFilter,
    setLieferantFilter,
    einheitFilter,
    setEinheitFilter,
    einheiten,
    basisKonto,
    setBasisKonto,
    kontoSuffix,
    endKonto,
    handleKontoAnwenden,
    loading,
    saving,
    gefiltertAnzahl,
  } = props;

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
      <div>
        <label>Jahr</label>
        <select value={jahr} onChange={(e) => setJahr(e.target.value)}>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
      </div>

      <div>
        <label>Lieferant (z. B. Vodafone)</label>
        <input
          value={lieferantFilter}
          onChange={(e) => setLieferantFilter(e.target.value)}
        />
      </div>

      <div>
        <label>Einheit</label>
        <select
          value={einheitFilter}
          onChange={(e) => setEinheitFilter(e.target.value)}
        >
          <option value="">Bitte Einheit wählen</option>
          {einheiten.map((einheit) => (
            <option key={einheit.id} value={einheit.name}>
              {einheit.name} ({einheit.kontoSuffix})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>DATEV-Basiskonto (4-stellig)</label>
        <input
          value={basisKonto}
          onChange={(e) =>
            setBasisKonto(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          placeholder="z. B. 4320"
        />
      </div>

      <div>
        <label>Suffix aus Einheit</label>
        <input value={kontoSuffix} readOnly />
      </div>

      <div>
        <label>Errechnetes Endkonto</label>
        <input value={endKonto} readOnly />
      </div>

      <button
        type="button"
        onClick={handleKontoAnwenden}
        disabled={
          loading || saving || gefiltertAnzahl === 0 || !einheitFilter || !endKonto
        }
      >
        {saving ? "Speichert..." : "Endkonto auf gefundene Belege anwenden"}
      </button>
    </div>
  );
}
