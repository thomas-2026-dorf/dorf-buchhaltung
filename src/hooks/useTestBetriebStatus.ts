import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type UseTestBetriebStatusParams = {
  baseFolder: string;
  year: string;
};

export function useTestBetriebStatus({
  baseFolder,
  year,
}: UseTestBetriebStatusParams) {
  const [testBetriebAktiv, setTestBetriebAktiv] = useState(false);
  const [testBetriebRefreshKey, setTestBetriebRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function checkTestBetriebStatus() {
      if (!year || !baseFolder) {
        if (isMounted) setTestBetriebAktiv(false);
        return;
      }

      try {
        const aktiv = await invoke<boolean>("jahresdatei_backup_status", {
          baseFolder,
          year: String(year),
        });

        if (isMounted) {
          setTestBetriebAktiv(aktiv);
        }
      } catch (error) {
        console.error("Testbetrieb-Status konnte nicht geladen werden:", error);
        if (isMounted) {
          setTestBetriebAktiv(false);
        }
      }
    }

    function handleTestbetriebStatusChanged() {
      setTestBetriebRefreshKey((prev) => prev + 1);
    }

    checkTestBetriebStatus();
    window.addEventListener("testbetrieb-status-changed", handleTestbetriebStatusChanged);

    return () => {
      isMounted = false;
      window.removeEventListener("testbetrieb-status-changed", handleTestbetriebStatusChanged);
    };
  }, [year, baseFolder, testBetriebRefreshKey]);

  function refreshTestBetriebStatus(aktiv: boolean) {
    setTestBetriebAktiv(aktiv);
    setTestBetriebRefreshKey((prev) => prev + 1);
  }

  return {
    testBetriebAktiv,
    refreshTestBetriebStatus,
  };
}
