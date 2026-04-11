import { useState } from "react";
import type { Tab } from "../types";
import { colors } from "../design/colors";

type Props = {
  tab: Tab;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
};

export default function SidebarButton({ tab, activeTab, setActiveTab }: Props) {
  const [hover, setHover] = useState(false);
  const aktiv = activeTab === tab;

  return (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "12px 14px",
        borderRadius: 12,
        border: aktiv
          ? `1px solid ${colors.primary}`
          : `1px solid ${hover ? "#d6e4f5" : "transparent"}`,
        background: aktiv
          ? colors.primaryLight
          : hover
            ? "#EEF4FB"
            : "transparent",
        color: aktiv ? colors.primary : colors.text,
        fontWeight: aktiv ? 700 : 600,
        cursor: "pointer",
        transition: "all 0.15s ease",
        boxShadow: aktiv ? "0 1px 2px rgba(31,95,168,0.08)" : "none",
      }}
    >
      {tab}
    </button>
  );
}