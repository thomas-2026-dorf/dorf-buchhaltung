import { appStyles as styles } from "../../../styles/appStyles";
import type { Tab } from "../../../types";

type Props = {
  selectedFilename: string;
  setSelectedPdfBytes: (value: number[] | null) => void;
  setSelectedFilename: (value: string) => void;
  belegReturnTab: Tab | null;
  setActiveTab: (tab: Tab) => void;
};

export default function BelegeTabHeader(props: Props) {
  const {
    selectedFilename,
    setSelectedPdfBytes,
    setSelectedFilename,
    belegReturnTab,
    setActiveTab,
  } = props;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        minWidth: 0,
        flexWrap: "nowrap",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => {
          setSelectedPdfBytes(null);
          setSelectedFilename("");

          if (belegReturnTab) {
            setActiveTab(belegReturnTab);
          }
        }}
        style={{
          ...styles.secondaryButton,
          padding: "6px 10px",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        ← Zurück
      </button>

      <div
        style={{
          ...styles.small,
          fontWeight: 600,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1,
        }}
      >
        {selectedFilename}
      </div>
    </div>
  );
}
