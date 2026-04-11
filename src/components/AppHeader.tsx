import type { Tab } from "../types";
import { appStyles as styles } from "../styles/appStyles";
import { formStyles } from "../design/forms";
import { colors } from "../design/colors";

type Props = {
  subtitleRight?: string;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
};

const NAV_ITEMS: Tab[] = [
  "Belege",
  "Bank",
  "Export",
  "Auswertung",
  "Suche",
  "Einstellungen",
  "Korrektur",
];

export default function AppHeader({
  subtitleRight,
  activeTab,
  setActiveTab,
}: Props) {
  return (
    <header style={styles.header}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            minWidth: 0,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>
              Dorf Buchhaltung
            </div>

            <div style={{ ...formStyles.small, marginTop: 2 }}>
              Offline • Tresorit • DATEV (SKR03)
            </div>
          </div>

          {subtitleRight && (
            <div
              style={{
                ...formStyles.small,
                textAlign: "right",
                maxWidth: "42%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flexShrink: 1,
              }}
            >
              {subtitleRight}
            </div>
          )}
        </div>

        <nav
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          {NAV_ITEMS.map((tab) => {
            const aktiv = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "4px 2px 6px 2px",
                  border: "none",
                  borderRadius: 0,
                  background: "transparent",
                  fontSize: 13,
                  fontWeight: aktiv ? 800 : 700,
                  color: aktiv ? colors.primary : "#5f6b7a",
                  cursor: "pointer",
                  borderBottom: aktiv
                    ? `2px solid ${colors.primary}`
                    : "2px solid transparent",
                  lineHeight: 1.1,
                  boxShadow: "none",
                }}
              >
                {tab}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}