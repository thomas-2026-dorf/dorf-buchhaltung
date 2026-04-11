import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type PdfStampData = {
    fewoLabel: string;
    objektNr: string;
    identNr: string;
    kontoDatev: string;
    zahlungsart?: string;
    zahlungsText?: string;
    splitTextLines?: string[];
};

function sanitizeStampText(value: string): string {
    return String(value ?? "")
        .replace(/Ä/g, "Ae")
        .replace(/Ö/g, "Oe")
        .replace(/Ü/g, "Ue")
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\x20-\x7E]/g, " ");
}

export async function stampPdfBytes(
    inputBytes: Uint8Array,
    stamp: PdfStampData
) {
    const pdfDoc = await PDFDocument.load(inputBytes, {
        ignoreEncryption: true,
    });

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const page = pdfDoc.getPages()[0];
    if (!page) {
        return await pdfDoc.save();
    }

    const { width, height } = page.getSize();

    const splitLines = (stamp.splitTextLines ?? []).filter(
        (line) =>
            typeof line === "string" &&
            line.trim().length > 0 &&
            line.trim() !== "SPLIT:"
    );

    const line1 = sanitizeStampText(
        `${stamp.fewoLabel} | ${stamp.objektNr} | ${stamp.identNr}`
    );

    const normalizedZahlungsText = sanitizeStampText(
        (stamp.zahlungsText || "")
            .replace("ZAHLUNGEN:", "Zahlungen:")
            .replace("ZAHLUNG:", "Zahlung:")
            .trim()
    );

    const line2Parts = [
        stamp.kontoDatev ? sanitizeStampText(`Konto ${stamp.kontoDatev}`) : "",
        normalizedZahlungsText,
    ].filter(Boolean);

    const line2 = sanitizeStampText(line2Parts.join(" | "));

    const splitCompact = splitLines
        .map((line) =>
            sanitizeStampText(
                line
                    .replace(/\(\d+\)/g, "")
                    .replace(":", "")
                    .replace(/\s+/g, " ")
                    .trim()
            )
        )
        .filter(Boolean);

    const line3 =
        splitCompact.length > 0 ? sanitizeStampText(`Split: ${splitCompact.join(" | ")}`) : "";

    const lines = [line1, line2, ...(line3 ? [line3] : [])];

    console.log("STAMP KOMPAKT LINES:", lines);

    const fontSize = 10;
    const lineHeight = 14;
    const paddingX = 12;
    const paddingY = 8;

    const bandX = 18;
    const bandWidth = width - 36;
    const bandHeight = lines.length * lineHeight + paddingY * 2;
    const bandY = height - bandHeight - 18;

    page.drawRectangle({
        x: bandX,
        y: bandY,
        width: bandWidth,
        height: bandHeight,
        borderWidth: 1.5,
        borderColor: rgb(0.75, 0, 0),
        color: rgb(1, 1, 1),
        opacity: 0.96,
        borderOpacity: 1,
    });

    let currentY = bandY + bandHeight - paddingY - fontSize;

    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];

        page.drawText(line, {
            x: bandX + paddingX,
            y: currentY,
            size: fontSize,
            font: index === 0 ? fontBold : fontNormal,
            color: rgb(0.75, 0, 0),
            maxWidth: bandWidth - paddingX * 2,
        });

        currentY -= lineHeight;
    }

    return await pdfDoc.save();
}