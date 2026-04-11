export function normalizeBaseFolderPath(path: string): string {
    const cleaned = path.replace(/\\/g, "/").replace(/\/+$/, "");

    const appDataMatch = cleaned.match(/^(.*\/\d{4})\/_AppData\/\d{4}$/);
    if (appDataMatch) {
        return appDataMatch[1];
    }

    if (cleaned.endsWith("/Unbearbeitet")) {
        return cleaned.replace(/\/Unbearbeitet$/, "");
    }

    if (cleaned.endsWith("/Eingang")) {
        return cleaned.replace(/\/Eingang$/, "");
    }

    if (cleaned.endsWith("/Bank")) {
        return cleaned.replace(/\/Bank$/, "");
    }

    return cleaned;
}