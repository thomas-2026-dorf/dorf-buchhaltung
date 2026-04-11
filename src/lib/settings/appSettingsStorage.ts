import type { AppSettings, Einheit, Konto, Bankkonto } from "./appSettings";
import { DEFAULT_APP_SETTINGS } from "./appSettings";

const KEY = "app-settings-v1";

function mergeEinheiten(einheiten?: Einheit[]): Einheit[] {
    if (!Array.isArray(einheiten) || einheiten.length === 0) {
        return DEFAULT_APP_SETTINGS.einheiten;
    }
    return einheiten;
}

function mergeKonten(konten?: Konto[]): Konto[] {
    if (!Array.isArray(konten) || konten.length === 0) {
        return DEFAULT_APP_SETTINGS.konten;
    }
    return konten;
}

function mergeBankkonten(bankkonten?: Bankkonto[]): Bankkonto[] {
    if (!Array.isArray(bankkonten) || bankkonten.length === 0) {
        return DEFAULT_APP_SETTINGS.bankkonten;
    }
    return bankkonten;
}

export function ladeAppSettings(): AppSettings {
    const raw = localStorage.getItem(KEY);

    if (!raw) return DEFAULT_APP_SETTINGS;

    try {
        const parsed = JSON.parse(raw) as Partial<AppSettings>;

        return {
            appInfo: {
                ...DEFAULT_APP_SETTINGS.appInfo,
                ...(parsed.appInfo || {}),
            },
            einheiten: mergeEinheiten(parsed.einheiten),
            konten: mergeKonten(parsed.konten),
            bankkonten: mergeBankkonten(parsed.bankkonten),
        };
    } catch {
        return DEFAULT_APP_SETTINGS;
    }
}

export function speichereAppSettings(settings: AppSettings) {
    localStorage.setItem(KEY, JSON.stringify(settings));
}
