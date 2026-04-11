import BelegListe from "../BelegListe";
import { appStyles as styles } from "../../../styles/appStyles";
import { cardStyle } from "../../../design/styles";

type Props = {
  year: string;
  setYear: (value: string) => void;
  chooseBaseFolder: () => void | Promise<void>;
  checkUnbearbeitet: () => void;
  loading: boolean;
  baseFolder: string;
  unbearbeitetFiles: string[];
  selectedPdfBytes: number[] | null;
  loadPdf: (filename: string) => void;
};

export default function BelegeTabToolbar(props: Props) {
  const {
    year,
    chooseBaseFolder,
    loading,
    baseFolder,
    unbearbeitetFiles,
    selectedPdfBytes,
    loadPdf,
  } = props;

  return (
    <div
      style={{
        ...cardStyle,
        display: "grid",
        gridTemplateColumns: "minmax(360px, 620px) minmax(0, 1fr)",
        gap: 16,
        alignItems: "start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button style={styles.primaryButton} onClick={chooseBaseFolder}>
            Basisordner wählen
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
          <div style={{ fontSize: 13 }}>
            <strong>Jahr:</strong> {year || "-"}
          </div>

          <div style={{ fontSize: 13, minWidth: 0, wordBreak: "break-word" }}>
            <strong>Basisordner:</strong>{" "}
            {baseFolder || "noch nicht gewählt"}
          </div>
        </div>
      </div>

      <div>
        {loading && <p>Lade…</p>}

        {!loading && baseFolder && unbearbeitetFiles.length === 0 && (
          <p>Keine unbearbeiteten Dateien gefunden.</p>
        )}

        {!selectedPdfBytes && !loading && unbearbeitetFiles.length > 0 && (
          <div
            style={{
              ...cardStyle,
              maxHeight: 180,
              overflowY: "auto",
              padding: 10,
            }}
          >
            <BelegListe files={unbearbeitetFiles} onSelectFile={loadPdf} />
          </div>
        )}
      </div>
    </div>
  );
}
