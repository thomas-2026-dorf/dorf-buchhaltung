import { mkdir, writeFile } from "@tauri-apps/plugin-fs";

export function buildExportPath(sourcePath: string) {
    if (!sourcePath.includes("/Tresorit/")) {
        throw new Error("Pfad liegt nicht im Tresorit-Ordner.");
    }

    if (!sourcePath.includes("/Eingang/")) {
        throw new Error("Pfad enthält keinen Eingang-Ordner.");
    }

    return sourcePath.replace("/Eingang/", "/Export/");
}

export function getParentFolder(filePath: string) {
    const lastSlash = filePath.lastIndexOf("/");

    if (lastSlash === -1) {
        return "";
    }

    return filePath.slice(0, lastSlash);
}

export async function savePdfToExport(sourcePath: string, pdfBytes: Uint8Array) {
    const targetPath = buildExportPath(sourcePath);
    const targetFolder = getParentFolder(targetPath);

    if (!targetFolder) {
        throw new Error("Export-Zielordner konnte nicht ermittelt werden.");
    }

    await mkdir(targetFolder, { recursive: true });
    await writeFile(targetPath, pdfBytes);

    return targetPath;
}

export function sanitizePathPart(value: string) {
    return String(value || "")
        .trim()
        .replace(/[\\/:*?"<>|]/g, "_")
        .replace(/\s+/g, " ");
}

export async function savePdfToStbExport(
    baseFolder: string,
    _fewoLabel: string,
    _kontoDatev: string,
    fileName: string,
    pdfBytes: Uint8Array
) {
    const safeFileName = sanitizePathPart(fileName || "beleg.pdf");

    const targetFolder = `${baseFolder}/Export-STB/Belege`;
    const targetPath = `${targetFolder}/${safeFileName}`;

    await mkdir(targetFolder, { recursive: true });
    await writeFile(targetPath, pdfBytes);

    return targetPath;
}