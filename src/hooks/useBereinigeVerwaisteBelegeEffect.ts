import { useEffect } from "react";
import { bereinigeVerwaisteBelege } from "../modules/belegVerwaltung/bereinigeVerwaisteBelege";

type Params = {
  baseFolder: string;
  year: string;
};

export function useBereinigeVerwaisteBelegeEffect({
  baseFolder,
  year,
}: Params) {
  useEffect(() => {
    if (!baseFolder || !year) return;
    bereinigeVerwaisteBelege(baseFolder, year);
  }, [baseFolder, year]);
}
