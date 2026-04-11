import { moveSonstigesHandler } from "./moveSonstigesHandler";

type Params = {
  baseFolder: string;
  year: string;
  selectedFilename: string;
  checkUnbearbeitet: () => Promise<void>;
  setSelectedPdfBytes: (value: number[] | null) => void;
  setSelectedFilename: (value: string) => void;
};

export async function runVerschiebenSonstiges({
  baseFolder,
  year,
  selectedFilename,
  checkUnbearbeitet,
  setSelectedPdfBytes,
  setSelectedFilename,
}: Params) {
  await moveSonstigesHandler({
    baseFolder,
    year,
    selectedFilename,
    checkUnbearbeitet,
    setSelectedPdfBytes,
    setSelectedFilename,
  });
}
