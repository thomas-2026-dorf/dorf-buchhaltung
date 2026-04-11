import { useEffect, useMemo, useRef, useState } from "react";
import AusgangListe from "./AusgangListe";
import {
    importiereJournalText,
    ladeAusgangsrechnungen,
    speichereVieleAusgangsrechnungen,
    type Ausgangsrechnung,
} from "../../lib/ausgangsrechnungen";
import type { FewoName } from "../../lib/belege"

type Props = {
    baseFolder: string;
    year: string;
};

const STORAGE_KEY = "fewo-ausgangsrechnungen";

export default function AusgangTab({ baseFolder, year }: Props) {
    const [alleDaten, setAlleDaten] = useState<Ausgangsrechnung[]>([]);
    const [status, setStatus] = useState("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const geladeneDaten = ladeAusgangsrechnungen();
        setAlleDaten(geladeneDaten);
    }, []);

    const daten = useMemo(() => {
        const jahrNummer = Number(year);
        return alleDaten.filter((eintrag) => eintrag.jahr === jahrNummer);
    }, [alleDaten, year]);

    function handleUpdateFewo(id: string, value: FewoName | "") {
        const aktualisiert = alleDaten.map((eintrag) =>
            eintrag.id === id ? { ...eintrag, fewo: value } : eintrag
        );

        localStorage.setItem(STORAGE_KEY, JSON.stringify(aktualisiert));
        setAlleDaten(aktualisiert);
    }

    function handleOpenFileDialog() {
        fileInputRef.current?.click();
    }

    async function handleJournalDatei(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setStatus("Journal wird eingelesen ...");

            const text = await file.text();
            const importierteDaten = importiereJournalText(text, Number(year));
            const anzahlNeu = speichereVieleAusgangsrechnungen(importierteDaten);
            const neuGeladen = ladeAusgangsrechnungen();

            setAlleDaten(neuGeladen);
            setStatus(`${anzahlNeu} neue Journal-Einträge importiert.`);
        } catch (error) {
            console.error(error);
            setStatus(
                error instanceof Error
                    ? `Fehler: ${error.message}`
                    : "Fehler beim Journal-Import."
            );
        } finally {
            event.target.value = "";
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0 }}>Ausgangsrechnungen</h2>

            <div
                style={{
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                }}
            >
                <div style={{ marginBottom: 8 }}>
                    <strong>Status:</strong> Ausgangsmodul stabilisiert
                </div>
                <div style={{ marginBottom: 8 }}>
                    <strong>Jahr:</strong> {year}
                </div>
                <div style={{ marginBottom: 8 }}>
                    <strong>Basisordner:</strong> {baseFolder || "—"}
                </div>
                <div style={{ marginBottom: 12 }}>
                    <strong>Einträge:</strong> {daten.length}
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                        type="button"
                        onClick={handleOpenFileDialog}
                        style={{
                            padding: "10px 14px",
                            borderRadius: 8,
                            border: "1px solid #1F5FA8",
                            background: "#1F5FA8",
                            color: "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
                    >
                        Journal holen
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".tsv,.csv,.txt"
                        onChange={handleJournalDatei}
                        style={{ display: "none" }}
                    />
                </div>

                {status ? (
                    <div
                        style={{
                            marginTop: 12,
                            padding: 10,
                            background: "#f7f7f7",
                            border: "1px solid #e5e5e5",
                            borderRadius: 8,
                            color: "#333",
                        }}
                    >
                        {status}
                    </div>
                ) : null}
            </div>

            <AusgangListe daten={daten} onUpdateFewo={handleUpdateFewo} />
        </div>
    );
}