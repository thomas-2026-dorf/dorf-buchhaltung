import SettingsAppInfo from "./components/SettingsAppInfo";
import SettingsEinheitenPanel from "./components/SettingsEinheitenPanel";
import SettingsKontenPanel from "./components/SettingsKontenPanel";
import SettingsLocalPanel from "./components/SettingsLocalPanel";
import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import {
    ladeAppSettings,
    speichereAppSettings,
} from "../../lib/settings/appSettingsStorage";
import {
    ladeLocalSettings,
    setzeLocalBaseFolder,
    getGlobalVereinsdatenDir,
} from "../../lib/settings/localSettings";
import { normalizeBaseFolderPath } from "../../lib/settings/pathUtils";
import { getEinheiten } from "../../lib/settings/einheiten";
import SettingsVereinsdatenPanel from "./components/SettingsVereinsdatenPanel";
import SettingsCsvImportPanel from "./components/SettingsCsvImportPanel";
import { ladeVereinsdaten, speichereVereinsdaten } from "../../lib/settings/vereinsdaten";
import { cardStyle } from "../../design/styles";
import { readJsonFile, writeJsonFile, ensureDir } from "../../lib/fileStorage";
import {
    ladeCsvFeldZuordnung,
    speichereCsvFeldZuordnung,
    CSV_FELD_DEFAULT,
    type CsvFeldZuordnung,
} from "../../lib/settings/csvFeldZuordnung";

const LS_KEY_BEITRAEGE = "dorf-buchhaltung-settings-v1";
type BeitraegeSettings = { standardBeitrag: number; familienBeitrag: number };
const BEITRAEGE_DEFAULT: BeitraegeSettings = { standardBeitrag: 50, familienBeitrag: 30 };

async function ladeBeitraegeSettings(): Promise<BeitraegeSettings> {
    const dir = getGlobalVereinsdatenDir();
    if (!dir) {
        try {
            const raw = localStorage.getItem(LS_KEY_BEITRAEGE);
            return raw ? { ...BEITRAEGE_DEFAULT, ...JSON.parse(raw) } : { ...BEITRAEGE_DEFAULT };
        } catch { return { ...BEITRAEGE_DEFAULT }; }
    }

    try {
        await ensureDir(dir);

        const legacy = localStorage.getItem(LS_KEY_BEITRAEGE);
        if (legacy) {
            try {
                const parsed = JSON.parse(legacy);
                const daten: BeitraegeSettings = {
                    standardBeitrag: typeof parsed.standardBeitrag === "number" ? parsed.standardBeitrag : 50,
                    familienBeitrag: typeof parsed.familienBeitrag === "number" ? parsed.familienBeitrag : 30,
                };
                await writeJsonFile(`${dir}/beitraege-einstellungen.json`, daten);
                localStorage.removeItem(LS_KEY_BEITRAEGE);
                return daten;
            } catch { /* ignore */ }
            localStorage.removeItem(LS_KEY_BEITRAEGE);
        }

        return readJsonFile<BeitraegeSettings>(`${dir}/beitraege-einstellungen.json`, { ...BEITRAEGE_DEFAULT });
    } catch {
        try {
            const raw = localStorage.getItem(LS_KEY_BEITRAEGE);
            return raw ? { ...BEITRAEGE_DEFAULT, ...JSON.parse(raw) } : { ...BEITRAEGE_DEFAULT };
        } catch { return { ...BEITRAEGE_DEFAULT }; }
    }
}

async function speichereBeitraegeSettings(settings: BeitraegeSettings): Promise<void> {
    const dir = getGlobalVereinsdatenDir();
    if (!dir) {
        localStorage.setItem(LS_KEY_BEITRAEGE, JSON.stringify(settings));
        return;
    }
    try {
        await ensureDir(dir);
        await writeJsonFile(`${dir}/beitraege-einstellungen.json`, settings);
    } catch {
        localStorage.setItem(LS_KEY_BEITRAEGE, JSON.stringify(settings));
    }
}

type SettingsSection = "lokal" | "vereinsdaten" | "einheiten" | "datev" | "bank" | "mitgliedsbeitrag" | "csv-import";

const sectionButtonStyle = (active: boolean) => ({
    padding: "10px 14px",
    borderRadius: 8,
    border: active ? "1px solid #1F5FA8" : "1px solid #d0d7de",
    background: active ? "#1F5FA8" : "#fff",
    color: active ? "#fff" : "#22364a",
    cursor: "pointer",
    fontWeight: 600 as const,
});

export default function SettingsTab({
    year,
    onTestbetriebStatusChanged,
}: {
    year: string;
    onTestbetriebStatusChanged?: (aktiv: boolean) => void;
}) {
    const [appSettings, setAppSettings] = useState(() => {
        const saved = ladeAppSettings();

        return {
            ...saved,
            einheiten: getEinheiten(saved),
        };
    });
    const [localSettings, setLocalSettings] = useState(ladeLocalSettings());
    const [vereinsdaten, setVereinsdaten] = useState<import("../../lib/settings/vereinsdaten").Vereinsdaten>({
        name: "", strasse: "", plz: "", ort: "", telefon: "", email: "",
        iban: "", bic: "", kreditinstitut: "", glaeubigerId: "", logoPfad: "",
    });
    const [standardBeitrag, setStandardBeitrag] = useState(50);
    const [familienBeitrag, setFamilienBeitrag] = useState(30);
    const [csvZuordnung, setCsvZuordnung] = useState<CsvFeldZuordnung>({ ...CSV_FELD_DEFAULT });
    const [status, setStatus] = useState("");
    const [testAktiv, setTestAktiv] = useState(false);
    const [activeSection, setActiveSection] = useState<SettingsSection>("lokal");

    useEffect(() => {
        ladeVereinsdaten().then(setVereinsdaten);
        ladeBeitraegeSettings().then((s) => {
            setStandardBeitrag(s.standardBeitrag);
            setFamilienBeitrag(s.familienBeitrag);
        });
        ladeCsvFeldZuordnung().then(setCsvZuordnung);
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function checkTestStatus() {
            if (!localSettings.baseFolder || !year) {
                if (isMounted) setTestAktiv(false);
                return;
            }

            try {
                const aktiv = await invoke<boolean>("jahresdatei_backup_status", {
                    baseFolder: localSettings.baseFolder,
                    year,
                });

                if (isMounted) {
                    setTestAktiv(aktiv);
                }
            } catch {
                if (isMounted) {
                    setTestAktiv(false);
                }
            }
        }

        checkTestStatus();

        return () => {
            isMounted = false;
        };
    }, [localSettings.baseFolder, year, status]);

    async function handleBackup() {
        try {
            await invoke("jahresdatei_backup_erstellen", {
                baseFolder: localSettings.baseFolder,
                year,
            });

            setTestAktiv(true);
            setStatus("Backup erfolgreich erstellt");
            onTestbetriebStatusChanged?.(true);
        } catch (err) {
            setStatus("Backup fehlgeschlagen: " + String(err));
        }
    }

    async function handleRestore() {
        if (!confirm("Wirklich auf Testbeginn zurücksetzen? Alle Änderungen gehen verloren!")) {
            return;
        }

        try {
            await invoke("jahresdatei_backup_restore", {
                baseFolder: localSettings.baseFolder,
                year,
            });

            setTestAktiv(false);
            setStatus("Daten erfolgreich zurückgesetzt");
            onTestbetriebStatusChanged?.(false);
        } catch (err) {
            setStatus("Restore fehlgeschlagen: " + String(err));
        }
    }

    async function handleChooseBaseFolder() {
        try {
            setStatus("");

            const selected = await open({
                directory: true,
                multiple: false,
            });

            if (typeof selected !== "string" || !selected) {
                return;
            }

            const normalized = normalizeBaseFolderPath(selected);
            setzeLocalBaseFolder(normalized);
            setLocalSettings(ladeLocalSettings());
            setStatus("Basisordner lokal gespeichert.");
        } catch (error) {
            setStatus(
                error instanceof Error
                    ? `Fehler: ${error.message}`
                    : `Fehler: ${String(error)}`
            );
        }
    }

    function handleEinheitNameChange(id: string, value: string) {
        setAppSettings((prev) => ({
            ...prev,
            einheiten: prev.einheiten.map((einheit) =>
                einheit.id === id ? { ...einheit, name: value } : einheit
            ),
        }));
    }

    function handleNeueEinheit() {
        const nummer = appSettings.einheiten.length + 1;

        setAppSettings((prev) => ({
            ...prev,
            einheiten: [
                ...prev.einheiten,
                {
                    id: `einheit_${nummer}` as never,
                    name: `Neue Einheit ${nummer}`,
                    anzeigename: `Neue Einheit ${nummer}`,
                    typ: "sonstige",
                    aktiv: true,
                    steuerExport: true,

                },
            ],
        }));
    }

    function handleEinheitLoeschen(id: string) {
        const ok = window.confirm("Einheit wirklich löschen?");
        if (!ok) return;

        setAppSettings((prev) => ({
            ...prev,
            einheiten: prev.einheiten.filter((einheit) => einheit.id !== id),
        }));
    }

    function handleSpeichernEinheiten() {
        speichereAppSettings(appSettings);
        setStatus("Einheiten gespeichert.");
    }

    function handleKontoChange(
        id: string,
        field: "nummer" | "name" | "typ",
        value: string
    ) {
        setAppSettings((prev) => ({
            ...prev,
            konten: prev.konten.map((konto) =>
                konto.id === id
                    ? {
                        ...konto,
                        [field]: value,
                    }
                    : konto
            ),
        }));
    }

    function handleNeuesKonto() {
        const nummer = appSettings.konten.length + 1;

        setAppSettings((prev) => ({
            ...prev,
            konten: [
                ...prev.konten,
                {
                    id: `konto_${nummer}`,
                    nummer: "",
                    name: `Neues Konto ${nummer}`,
                    typ: "aufwand",
                },
            ],
        }));
    }

    function handleKontoLoeschen(id: string) {
        const ok = window.confirm("Konto wirklich löschen?");
        if (!ok) return;

        setAppSettings((prev) => ({
            ...prev,
            konten: prev.konten.filter((konto) => konto.id !== id),
        }));
    }

    function handleSpeichernKonten() {
        speichereAppSettings(appSettings);
        setStatus("Konten gespeichert.");
    }

    function handleBankkontoChange(
        id: string,
        field: "bezeichnung" | "kontonummer" | "typ",
        value: string
    ) {
        setAppSettings((prev) => ({
            ...prev,
            bankkonten: prev.bankkonten.map((konto) =>
                konto.id === id
                    ? {
                        ...konto,
                        [field]: value,
                    }
                    : konto
            ),
        }));
    }

    function handleNeuesBankkonto() {
        const nummer = appSettings.bankkonten.length + 1;

        setAppSettings((prev) => ({
            ...prev,
            bankkonten: [
                ...prev.bankkonten,
                {
                    id: `bank_${nummer}`,
                    bezeichnung: `Neues Bankkonto ${nummer}`,
                    kontonummer: "",
                    typ: "bank",
                },
            ],
        }));
    }

    function handleBankkontoLoeschen(id: string) {
        const ok = window.confirm("Bankkonto wirklich löschen?");
        if (!ok) return;

        setAppSettings((prev) => ({
            ...prev,
            bankkonten: prev.bankkonten.filter((konto) => konto.id !== id),
        }));
    }

    function handleSpeichernBankkonten() {
        speichereAppSettings(appSettings);
        setStatus("Bankkonten gespeichert.");
    }

    return (
        <div style={{ padding: 20, display: "grid", gap: 16 }}>
            {testAktiv && (
                <div
                    style={{
                        background: "#ffcc00",
                        color: "#000",
                        padding: "10px 14px",
                        borderRadius: 8,
                        fontWeight: 700,
                        border: "1px solid #d4a300",
                    }}
                >
                    TESTBETRIEB AKTIV – vor dem Beenden bitte zurücksetzen oder bewusst weiterarbeiten
                </div>
            )}

            <h2 style={{ marginTop: 0, marginBottom: 0 }}>Einstellungen</h2>

            <SettingsAppInfo
                appType={appSettings.appInfo.appType}
                appName={appSettings.appInfo.appName}
            />

            <div
                style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "center",
                }}
            >
                <button
                    type="button"
                    onClick={() => setActiveSection("lokal")}
                    style={sectionButtonStyle(activeSection === "lokal")}
                >
                    Lokal
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSection("vereinsdaten")}
                    style={sectionButtonStyle(activeSection === "vereinsdaten")}
                >
                    Vereinsdaten
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSection("einheiten")}
                    style={sectionButtonStyle(activeSection === "einheiten")}
                >
                    Einheiten
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSection("datev")}
                    style={sectionButtonStyle(activeSection === "datev")}
                >
                    DATEV
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSection("bank")}
                    style={sectionButtonStyle(activeSection === "bank")}
                >
                    Bank
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSection("mitgliedsbeitrag")}
                    style={sectionButtonStyle(activeSection === "mitgliedsbeitrag")}
                >
                    Mitgliedsbeitrag
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSection("csv-import")}
                    style={sectionButtonStyle(activeSection === "csv-import")}
                >
                    CSV-Import
                </button>
            </div>

            {status ? (
                <div
                    style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid #b7eb8f",
                        background: "#f6ffed",
                        color: "#135200",
                        fontWeight: 600,
                    }}
                >
                    {status}
                </div>
            ) : null}

            {activeSection === "lokal" && (
                <SettingsLocalPanel
                    baseFolder={localSettings.baseFolder}
                    status={status}
                    onBackup={handleBackup}
                    onRestore={handleRestore}
                    onChooseBaseFolder={handleChooseBaseFolder}
                />
            )}

            {activeSection === "vereinsdaten" && (
                <SettingsVereinsdatenPanel
                    vereinsdaten={vereinsdaten}
                    baseFolder={localSettings.baseFolder}
                    onChange={async (neueVereinsdaten) => {
                        await speichereVereinsdaten(neueVereinsdaten);
                        setVereinsdaten(neueVereinsdaten);
                        setStatus("Vereinsdaten gespeichert.");
                    }}
                />
            )}

            {activeSection === "einheiten" && (
                <SettingsEinheitenPanel
                    einheiten={appSettings.einheiten}
                    onNeueEinheit={handleNeueEinheit}
                    onSpeichernEinheiten={handleSpeichernEinheiten}
                    onEinheitNameChange={handleEinheitNameChange}
                    onEinheitLoeschen={handleEinheitLoeschen}
                />
            )}

            {activeSection === "datev" && (
                <SettingsKontenPanel
                    mode="datev"
                    konten={appSettings.konten}
                    bankkonten={[]}
                    onNeuesKonto={handleNeuesKonto}
                    onSpeichernKonten={handleSpeichernKonten}
                    onKontoChange={handleKontoChange}
                    onKontoLoeschen={handleKontoLoeschen}
                    onNeuesBankkonto={() => { }}
                    onSpeichernBankkonten={() => { }}
                    onBankkontoChange={() => { }}
                    onBankkontoLoeschen={() => { }}
                />
            )}

            {activeSection === "mitgliedsbeitrag" && (
                <div style={cardStyle}>
                    <div style={{ fontWeight: 700, marginBottom: 12 }}>Mitgliedsbeitrag</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 560 }}>
                        <label>
                            Standard Jahresbeitrag (€)
                            <input
                                type="number"
                                value={standardBeitrag}
                                onChange={async (e) => {
                                    const wert = Number(e.target.value);
                                    setStandardBeitrag(wert);
                                    await speichereBeitraegeSettings({ standardBeitrag: wert, familienBeitrag });
                                    setStatus("Mitgliedsbeitrag gespeichert.");
                                }}
                                style={{
                                    width: "100%",
                                    padding: 10,
                                    marginTop: 4,
                                    border: "1px solid #d0d7de",
                                    borderRadius: 8,
                                    boxSizing: "border-box",
                                    fontSize: 16,
                                }}
                            />
                        </label>
                        <label>
                            Familienmitglied Beitrag (€)
                            <input
                                type="number"
                                value={familienBeitrag}
                                onChange={async (e) => {
                                    const wert = Number(e.target.value);
                                    setFamilienBeitrag(wert);
                                    await speichereBeitraegeSettings({ standardBeitrag, familienBeitrag: wert });
                                    setStatus("Mitgliedsbeitrag gespeichert.");
                                }}
                                style={{
                                    width: "100%",
                                    padding: 10,
                                    marginTop: 4,
                                    border: "1px solid #d0d7de",
                                    borderRadius: 8,
                                    boxSizing: "border-box",
                                    fontSize: 16,
                                }}
                            />
                        </label>
                    </div>
                </div>
            )}

            {activeSection === "bank" && (
                <SettingsKontenPanel
                    mode="bank"
                    konten={[]}
                    bankkonten={appSettings.bankkonten}
                    onNeuesKonto={() => { }}
                    onSpeichernKonten={() => { }}
                    onKontoChange={() => { }}
                    onKontoLoeschen={() => { }}
                    onNeuesBankkonto={handleNeuesBankkonto}
                    onSpeichernBankkonten={handleSpeichernBankkonten}
                    onBankkontoChange={handleBankkontoChange}
                    onBankkontoLoeschen={handleBankkontoLoeschen}
                />
            )}

            {activeSection === "csv-import" && (
                <SettingsCsvImportPanel
                    zuordnung={csvZuordnung}
                    onSpeichern={async (z) => {
                        await speichereCsvFeldZuordnung(z);
                        setCsvZuordnung(z);
                        setStatus("CSV-Feldzuordnung gespeichert.");
                    }}
                />
            )}
        </div>
    );
}
