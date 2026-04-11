import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import {
  ladeLocalSettings,
  setzeLocalBaseFolder,
} from "../lib/settings/localSettings";
import { normalizeBaseFolderPath } from "../lib/settings/pathUtils";

export function useBaseFolder(setLastError: (msg: string) => void) {
  const [baseFolder, setBaseFolder] = useState<string>("");

  useEffect(() => {
    try {
      const saved = ladeLocalSettings().baseFolder;
      if (saved) {
        const normalized = normalizeBaseFolderPath(saved);
        setBaseFolder(normalized);
        setzeLocalBaseFolder(normalized);
      }
    } catch {
      // ignore
    }
  }, []);

  function saveBaseFolder(path: string) {
    const normalized = normalizeBaseFolderPath(path);
    setBaseFolder(normalized);
    setzeLocalBaseFolder(normalized);
    return normalized;
  }

  async function chooseBaseFolder(): Promise<string | null> {
    setLastError("");
    try {
      const selected = await open({ directory: true, multiple: false });
      if (typeof selected === "string" && selected) {
        return saveBaseFolder(selected);
      }
      return null;
    } catch (e) {
      setLastError(String(e));
      alert("Dialog Fehler: " + String(e));
      return null;
    }
  }

  return {
    baseFolder,
    setBaseFolder: saveBaseFolder,
    chooseBaseFolder,
  };
}
