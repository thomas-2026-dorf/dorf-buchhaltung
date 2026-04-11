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
} from "../../lib/settings/localSettings";
import { normalizeBaseFolderPath } from "../../lib/settings/pathUtils";
import { getEinheiten } from "../../lib/settings/einheiten";

type SettingsSection = "lokal" | "einheiten" | "datev" | "bank";

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
    const [status, setStatus] = useState("");
    const [testAktiv, setTestAktiv] = useState(false);
    const [activeSection, setActiveSection] = useState<SettingsSection>("lokal");

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
        </div>
    );
}
