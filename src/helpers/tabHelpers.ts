import type { Tab } from "../types";

export function isKnownTabValue(activeTab: Tab): boolean {
  return (
    activeTab === "Belege" ||
    activeTab === "Suche" ||
    activeTab === "Export" ||
    activeTab === "Auswertung" ||
    activeTab === "Bank" ||
    activeTab === "Ausgang" ||
    activeTab === "Einstellungen" ||
    activeTab === "Korrektur" ||
    activeTab === "Beiträge" ||
    activeTab === "Kassen" ||
    activeTab === "Mitglieder"
  );
}

export function shouldShowPlaceholderTab(activeTab: Tab): boolean {
  return !isKnownTabValue(activeTab);
}
