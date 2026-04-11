import { invoke } from "@tauri-apps/api/core";
import { ladeBelegeAusJahresdatei } from "../../lib/belege";
import { normalizeFilename } from "../../helpers/appHelpers";

export async function bereinigeVerwaisteBelege(
  baseFolder: string,
  year: string
) {
  if (!baseFolder) {
    return;
  }

  const belege = await ladeBelegeAusJahresdatei(baseFolder, year);

  await Promise.all(
    belege.map(async (beleg) => {
      const filename = normalizeFilename(beleg.dateiname);

      if (!filename || !beleg.fewo) {
        return;
      }

      try {
        const exists = await invoke<boolean>("eingang_pdf_exists", {
          baseFolder,
          year: String(beleg.jahr),
          fewoName: beleg.fewo,
          filename,
        });

        if (!exists) {
          // erstmal nichts löschen
        }
      } catch (error) {
        console.warn("Beleg-Bereinigung fehlgeschlagen:", beleg.id, error);
      }
    })
  );
}
