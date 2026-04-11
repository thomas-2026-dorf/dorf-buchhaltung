import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { cardStyle } from "../../../design/styles";

type Props = {
  baseFolder: string;
  status: string;
  onBackup: () => void;
  onRestore: () => void;
  onChooseBaseFolder: () => void;
};

type ExternalBackupResult = {
  success: boolean;
  source: string;
  target: string;
  copied_files: number;
  copied_dirs: number;
};

export default function SettingsLocalPanel({
  baseFolder,
  status,
  onBackup,
  onRestore,
  onChooseBaseFolder,
}: Props) {
  const [externalBackupStatus, setExternalBackupStatus] = useState("");

  async function handleExternalBackup() {
    try {
      if (!baseFolder) {
        setExternalBackupStatus("❌ Kein Basisordner gesetzt.");
        return;
      }

      const selected = await open({
        directory: true,
        multiple: false,
        title: "Backup-Zielordner wählen",
      });

      if (!selected || Array.isArray(selected)) {
        setExternalBackupStatus("Backup abgebrochen.");
        return;
      }

      setExternalBackupStatus("⏳ Externes Backup läuft...");

      const result = await invoke<ExternalBackupResult>("run_external_backup", {
        sourceDir: baseFolder,
        backupRootDir: selected,
      });

      setExternalBackupStatus(
        [
          "✅ Externes Backup erfolgreich erstellt.",
          `Quelle: ${result.source}`,
          `Ziel: ${result.target}`,
          `Dateien: ${result.copied_files}`,
          `Ordner: ${result.copied_dirs}`,
        ].join("\n")
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setExternalBackupStatus(`❌ Fehler beim externen Backup: ${message}`);
    }
  }

  return (
    <div style={cardStyle}>
      <div style={{ fontWeight: 700, marginBottom: 12 }}>
        Lokale Geräte-Einstellungen
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <button
          type="button"
          onClick={onBackup}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #1F5FA8",
            background: "#1F5FA8",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Teststand speichern
        </button>

        <button
          type="button"
          onClick={onRestore}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #d92d20",
            background: "#d92d20",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Auf Testbeginn zurücksetzen
        </button>

        <button
          type="button"
          onClick={handleExternalBackup}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #15803d",
            background: "#15803d",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Externes Backup erstellen
        </button>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <div>
          <strong>Basisordner lokal:</strong>{" "}
          {baseFolder || "noch nicht gesetzt"}
        </div>

        <div style={{ fontSize: 14, color: "#475467", lineHeight: 1.5 }}>
          Das externe Backup kopiert den kompletten Datenbestand aus dem aktuell
          gesetzten Basisordner in einen frei wählbaren Backup-Zielordner. So
          bleiben Beleg-Ordner und JSON-Dateien zusammen erhalten.
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onChooseBaseFolder}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #1F5FA8",
              background: "#1F5FA8",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Basisordner lokal wählen
          </button>
        </div>

        {status ? (
          <div
            style={{
              marginTop: 4,
              padding: 10,
              background: "#f7f7f7",
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              color: "#333",
              whiteSpace: "pre-wrap",
            }}
          >
            {status}
          </div>
        ) : null}

        {externalBackupStatus ? (
          <div
            style={{
              marginTop: 4,
              padding: 10,
              background: "#f6ffed",
              border: "1px solid #b7eb8f",
              borderRadius: 8,
              color: "#1f2937",
              whiteSpace: "pre-wrap",
            }}
          >
            {externalBackupStatus}
          </div>
        ) : null}
      </div>
    </div>
  );
}
