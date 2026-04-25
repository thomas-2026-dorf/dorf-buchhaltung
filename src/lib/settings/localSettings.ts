export type LocalSettings = {
    baseFolder: string;
    glaeubigerId: string;
};

const KEY = "local-settings-v1";

const DEFAULT_LOCAL_SETTINGS: LocalSettings = {
    baseFolder: "",
    glaeubigerId: "",
};

export function ladeLocalSettings(): LocalSettings {
    const raw = localStorage.getItem(KEY);

    if (!raw) return DEFAULT_LOCAL_SETTINGS;

    try {
        return { ...DEFAULT_LOCAL_SETTINGS, ...JSON.parse(raw) };
    } catch {
        return DEFAULT_LOCAL_SETTINGS;
    }
}

export function speichereLocalSettings(settings: LocalSettings) {
    localStorage.setItem(KEY, JSON.stringify(settings));
}

export function setzeLocalBaseFolder(baseFolder: string) {
    const aktuell = ladeLocalSettings();
    speichereLocalSettings({
        ...aktuell,
        baseFolder,
    });
}

export type LieferantDatevKontoRegel = {
    lieferant: string;
    konto: string;
    gespeichertAm: string;
};

const LIEFERANT_DATEV_KONTEN_KEY = "fewo_lieferant_datev_konten_v1";

function normalizeLieferantFuerRegel(value: string): string {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

export function loadLieferantDatevKonten(): LieferantDatevKontoRegel[] {
    try {
        const raw = localStorage.getItem(LIEFERANT_DATEV_KONTEN_KEY);
        if (!raw) return [];

        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter(
                (item): item is LieferantDatevKontoRegel =>
                    !!item &&
                    typeof item.lieferant === "string" &&
                    typeof item.konto === "string" &&
                    typeof item.gespeichertAm === "string"
            )
            .map((item) => ({
                lieferant: String(item.lieferant || "").trim(),
                konto: String(item.konto || "").trim(),
                gespeichertAm: String(item.gespeichertAm || ""),
            }))
            .filter((item) => item.lieferant.length > 0 && item.konto.length > 0);
    } catch (error) {
        console.error("Fehler beim Laden der Lieferant-DATEV-Konten:", error);
        return [];
    }
}

export function saveLieferantDatevKonto(lieferant: string, konto: string): void {
    const lieferantClean = String(lieferant || "").trim();
    const kontoClean = String(konto || "").trim();

    if (!lieferantClean || !kontoClean) return;

    const normalized = normalizeLieferantFuerRegel(lieferantClean);
    const bestehend = loadLieferantDatevKonten();

    const ohneAltenEintrag = bestehend.filter(
        (item) => normalizeLieferantFuerRegel(item.lieferant) !== normalized
    );

    const neuerEintrag: LieferantDatevKontoRegel = {
        lieferant: lieferantClean,
        konto: kontoClean,
        gespeichertAm: new Date().toISOString(),
    };

    try {
        localStorage.setItem(
            LIEFERANT_DATEV_KONTEN_KEY,
            JSON.stringify([neuerEintrag, ...ohneAltenEintrag])
        );
    } catch (error) {
        console.error("Fehler beim Speichern der Lieferant-DATEV-Konten:", error);
    }
}

export function findeDatevKontoZuLieferant(lieferant: string): string {
    const normalized = normalizeLieferantFuerRegel(lieferant);
    if (!normalized) return "";

    const regeln = loadLieferantDatevKonten();

    const treffer = regeln.find(
        (item) => normalizeLieferantFuerRegel(item.lieferant) === normalized
    );

    return treffer?.konto ?? "";
}