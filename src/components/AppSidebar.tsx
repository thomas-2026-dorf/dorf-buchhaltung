import type { Tab } from "../types";
import SidebarButton from "./SidebarButton";
import { colors } from "../design/colors";

type Props = {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
};

export default function AppSidebar({ activeTab, setActiveTab }: Props) {
  return (
    <nav
      style={{
        width: 120,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 14,
        background: "#fff",
        borderRadius: 16,
        border: `1px solid ${colors.border}`,
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
        alignSelf: "flex-start",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.3,
          color: colors.textLight,
          textTransform: "uppercase",
          padding: "2px 4px 8px 4px",
        }}
      >
        Navigation
      </div>

      <SidebarButton tab="Belege" activeTab={activeTab} setActiveTab={setActiveTab} />
      <SidebarButton tab="Bank" activeTab={activeTab} setActiveTab={setActiveTab} />
      <SidebarButton tab="Auswertung" activeTab={activeTab} setActiveTab={setActiveTab} />
      <SidebarButton tab="Export" activeTab={activeTab} setActiveTab={setActiveTab} />
    </nav>
  );
}