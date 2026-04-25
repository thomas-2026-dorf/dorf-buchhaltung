import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { cardStyle } from "../../../design/styles";
import type { Vereinsdaten } from "../../../lib/settings/vereinsdaten";

type Props = {
    vereinsdaten: Vereinsdaten;
    baseFolder: string;
    onChange: (vereinsdaten: Vereinsdaten) => void;
};

const inputStyle = {
    width: "100%",
    padding: 10,
    marginTop: 4,
    border: "1px solid #d0d7de",
    borderRadius: 8,
    boxSizing: "border-box" as const,
};

export default function SettingsVereinsdatenPanel({
    vereinsdaten,
    baseFolder,
    onChange,
}: Props) {

    return (
        <div style={cardStyle}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Vereinsdaten</div>

            <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
                <label>
                    Vereinsname
                    <input
                        value={vereinsdaten.name}
                        onChange={(e) => onChange({ ...vereinsdaten, name: e.target.value })}
                        style={inputStyle}
                    />
                </label>

                <label>
                    Straße
                    <input
                        value={vereinsdaten.strasse}
                        onChange={(e) => onChange({ ...vereinsdaten, strasse: e.target.value })}
                        style={inputStyle}
                    />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12 }}>
                    <label>
                        PLZ
                        <input
                            value={vereinsdaten.plz}
                            onChange={(e) => onChange({ ...vereinsdaten, plz: e.target.value })}
                            style={inputStyle}
                        />
                    </label>

                    <label>
                        Ort
                        <input
                            value={vereinsdaten.ort}
                            onChange={(e) => onChange({ ...vereinsdaten, ort: e.target.value })}
                            style={inputStyle}
                        />
                    </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label>
                        Telefon
                        <input
                            value={vereinsdaten.telefon}
                            onChange={(e) => onChange({ ...vereinsdaten, telefon: e.target.value })}
                            style={inputStyle}
                        />
                    </label>

                    <label>
                        E-Mail
                        <input
                            value={vereinsdaten.email}
                            onChange={(e) => onChange({ ...vereinsdaten, email: e.target.value })}
                            style={inputStyle}
                        />
                    </label>
                </div>

                <label>
                    Gläubiger-ID
                    <input
                        value={vereinsdaten.glaeubigerId}
                        onChange={(e) =>
                            onChange({ ...vereinsdaten, glaeubigerId: e.target.value })
                        }
                        style={inputStyle}
                    />
                </label>

                <label>
                    IBAN
                    <input
                        value={vereinsdaten.iban}
                        onChange={(e) => onChange({ ...vereinsdaten, iban: e.target.value })}
                        style={inputStyle}
                    />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label>
                        BIC
                        <input
                            value={vereinsdaten.bic}
                            onChange={(e) => onChange({ ...vereinsdaten, bic: e.target.value })}
                            style={inputStyle}
                        />
                    </label>

                    <label>
                        Kreditinstitut
                        <input
                            value={vereinsdaten.kreditinstitut}
                            onChange={(e) =>
                                onChange({ ...vereinsdaten, kreditinstitut: e.target.value })
                            }
                            style={inputStyle}
                        />
                    </label>
                </div>

                <div>
                    <strong>Logo</strong>

                    <div style={{ marginTop: 6, color: "#475467", fontSize: 14 }}>
                        {vereinsdaten.logoPfad || "Noch kein Logo gewählt"}
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            const selected = await open({
                                multiple: false,
                                filters: [
                                    { name: "Bilder", extensions: ["png", "jpg", "jpeg"] },
                                ],
                            });

                            if (!selected || Array.isArray(selected)) return;

                            if (!baseFolder) {
                                alert("Bitte zuerst einen Basisordner wählen.");
                                return;
                            }

                            try {
                                const gespeicherterPfad = await invoke<string>(
                                    "vereinslogo_in_basisordner_kopieren",
                                    {
                                        baseFolder,
                                        quellPfad: selected,
                                    }
                                );

                                onChange({
                                    ...vereinsdaten,
                                    logoPfad: gespeicherterPfad,
                                });

                            } catch (err) {
                                alert("Fehler beim Speichern des Logos: " + err);
                            }
                        }}
                        style={{
                            marginTop: 8,
                            padding: "10px 14px",
                            borderRadius: 8,
                            border: "1px solid #1F5FA8",
                            background: "#1F5FA8",
                            color: "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
                    >
                        Logo auswählen
                    </button>
                </div>
            </div>
        </div>
    );
}