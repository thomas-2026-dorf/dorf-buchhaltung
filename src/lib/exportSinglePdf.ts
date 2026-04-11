import { readFile } from "@tauri-apps/plugin-fs";
import { savePdfToExport, savePdfToStbExport } from "./exportFolder";
import { stampPdfBytes, type PdfStampData } from "./pdfStamp";

type ExportStampedPdfOptions = {
    stbExport?: {
        baseFolder: string;
        fewoLabel: string;
        kontoDatev: string;
        fileName: string;
    };
};

export async function exportStampedPdf(
    sourcePath: string,
    stamp: PdfStampData,
    options?: ExportStampedPdfOptions
) {
    const originalBytes = await readFile(sourcePath);

    console.log("EXPORT STAMP FINAL:", stamp);

    const stampedBytes = await stampPdfBytes(originalBytes, {
        ...stamp,
        splitTextLines: stamp.splitTextLines ?? [],
    });

    if (options?.stbExport) {
        const targetPath = await savePdfToStbExport(
            options.stbExport.baseFolder,
            options.stbExport.fewoLabel,
            options.stbExport.kontoDatev,
            options.stbExport.fileName,
            stampedBytes
        );

        return targetPath;
    }

    const targetPath = await savePdfToExport(sourcePath, stampedBytes);
    return targetPath;
}