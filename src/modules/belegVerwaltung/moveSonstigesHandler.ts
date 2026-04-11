import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

type MoveSonstigesHandlerParams = {
    baseFolder: string;
    year: string;
    selectedFilename: string;
    checkUnbearbeitet: () => Promise<void>;
    setSelectedPdfBytes: (value: number[] | null) => void;
    setSelectedFilename: (value: string) => void;
};

export async function moveSonstigesHandler({
    baseFolder,
    year,
    selectedFilename,
    checkUnbearbeitet,
    setSelectedPdfBytes,
    setSelectedFilename,
}: MoveSonstigesHandlerParams) {

    if (!selectedFilename) {
        window.alert("Keine Datei ausgewählt.");
        return;
    }

    const targetDir = await open({
        directory: true,
        multiple: false,
        defaultPath: baseFolder || undefined,
    });

    if (!targetDir || Array.isArray(targetDir)) {
        return;
    }

    try {
        console.log("MOVE TEST", {
            baseFolder,
            year,
            selectedFilename,
            targetDir,
        });

        await invoke("move_to_custom_folder", {
            sourceBaseFolder: baseFolder,
            year,
            filename: selectedFilename,
            targetDir,
        });

        setSelectedPdfBytes(null);
        setSelectedFilename("");
        await checkUnbearbeitet();
        window.alert(`Verschoben nach:\n${targetDir}`);
    } catch (error) {
        console.error("move_to_custom_folder FEHLER:", error);
        window.alert(`Verschieben fehlgeschlagen:\n${String(error)}`);
    }
}