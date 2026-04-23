import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import KassenAuswertung from "./KassenAuswertung";
import {
    erstelleUmbuchung,
    type UmbuchungsRichtung,
} from "./kassenUmbuchungen";
import {
    ladeKassenEintraege,
    speichereKassenEintraege,
    type BuchungsTyp,
    type KassenEintrag,
} from "./kassenStorage";

type Props = {
    baseFolder: string;
    year: string;
};

export default function KassenTab({ baseFolder, year }: Props) {
    const [neuerTitel, setNeuerTitel] = useState("");
    const [neueBeschreibung, setNeueBeschreibung] = useState("");
    const [kassenEintraege, setKassenEintraege] = useState<KassenEintrag[]>(() =>
        ladeKassenEintraege()
    );
    const [neuerTyp, setNeuerTyp] = useState<BuchungsTyp>("einnahme");
    const [neuerBetrag, setNeuerBetrag] = useState("");
    const [neuesDatum, setNeuesDatum] = useState(() => {
        return new Date().toISOString().slice(0, 10);
    });
    const [neuerBarbelegVorhanden, setNeuerBarbelegVorhanden] = useState(true);

    const [umbuchungsDatum, setUmbuchungsDatum] = useState(() => {
        return new Date().toISOString().slice(0, 10);
    });
    const [umbuchungsBetrag, setUmbuchungsBetrag] = useState("");
    const [umbuchungsRichtung, setUmbuchungsRichtung] =
        useState<UmbuchungsRichtung>("bank-zu-barkasse");

    useEffect(() => {
        speichereKassenEintraege(kassenEintraege);
    }, [kassenEintraege]);

    const parseBetrag = (wert: unknown) => {
        const betrag = parseFloat(
            String(wert).replace(",", ".").replace("€", "").trim()
        );

        return isNaN(betrag) ? 0 : betrag;
    };

    const formatEuro = (wert: number) => {
        return `${wert.toFixed(2).replace(".", ",")} €`;
    };

    const kontostand = useMemo(() => {
        return kassenEintraege.reduce((sum, eintrag) => {
            const betrag = parseBetrag(eintrag.betrag);

            return eintrag.typ === "einnahme"
                ? sum + betrag
                : sum - betrag;
        }, 0);
    }, [kassenEintraege]);

    const bankKontostand = useMemo(() => {
        return kassenEintraege.reduce((sum, eintrag) => {
            if (eintrag.kassenArt !== "bank") return sum;

            const betrag = parseBetrag(eintrag.betrag);

            return eintrag.typ === "einnahme"
                ? sum + betrag
                : sum - betrag;
        }, 0);
    }, [kassenEintraege]);

    const barkassenKontostand = useMemo(() => {
        return kassenEintraege.reduce((sum, eintrag) => {
            if (eintrag.kassenArt !== "barkasse") return sum;

            const betrag = parseBetrag(eintrag.betrag);

            return eintrag.typ === "einnahme"
                ? sum + betrag
                : sum - betrag;
        }, 0);
    }, [kassenEintraege]);

    const formularZuruecksetzen = () => {
        setNeuerTitel("");
        setNeueBeschreibung("");
        setNeuerBetrag("");
        setNeuerTyp("einnahme");
        setNeuesDatum(new Date().toISOString().slice(0, 10));
        setNeuerBarbelegVorhanden(true);
    };

    const umbuchungZuruecksetzen = () => {
        setUmbuchungsDatum(new Date().toISOString().slice(0, 10));
        setUmbuchungsBetrag("");
        setUmbuchungsRichtung("bank-zu-barkasse");
    };

    const eintragHinzufuegen = () => {
        if (!neuerTitel.trim()) return;
        if (!neuesDatum) return;

        const betragAlsZahl = parseBetrag(neuerBetrag);
        if (betragAlsZahl <= 0) return;

        const neuerEintrag: KassenEintrag = {
            id: Date.now().toString(),
            datum: neuesDatum,
            typ: neuerTyp,
            kassenArt: "barkasse",
            titel: neuerTitel.trim(),
            beschreibung: neueBeschreibung.trim(),
            betrag: formatEuro(betragAlsZahl),
            barbelegVorhanden: neuerBarbelegVorhanden,
        };

        setKassenEintraege((prev) => [neuerEintrag, ...prev]);
        formularZuruecksetzen();
    };

    const eintragLoeschen = (id: string) => {
        if (!confirm("Buchung wirklich löschen?")) return;

        setKassenEintraege((prev) =>
            prev.filter((eintrag) => eintrag.id !== id)
        );
    };

    const umbuchungHinzufuegen = () => {
        if (!umbuchungsDatum) return;

        const betragAlsZahl = parseBetrag(umbuchungsBetrag);
        if (betragAlsZahl <= 0) return;

        const neueUmbuchungen = erstelleUmbuchung({
            datum: umbuchungsDatum,
            betrag: betragAlsZahl,
            richtung: umbuchungsRichtung,
        });

        setKassenEintraege((prev) => [...neueUmbuchungen, ...prev]);
        umbuchungZuruecksetzen();
    };

    const belegOeffnen = async (relpath: string) => {
        try {
            await invoke("pdf_im_system_oeffnen", {
                baseFolder,
                year,
                relpath,
            });
        } catch (error) {
            alert("Beleg konnte nicht geöffnet werden: " + String(error));
        }
    };

    return (
        <div>
            <h2>Kasse</h2>

            <div
                style={{
                    display: "grid",
                    gap: 8,
                    marginBottom: 20,
                    padding: 12,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    background: "#f9f9f9",
                }}
            >
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                    Barkasse: {formatEuro(barkassenKontostand)}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                    Bank: {formatEuro(bankKontostand)}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                    Gesamt: {formatEuro(kontostand)}
                </div>
            </div>

            <div
                style={{
                    padding: 12,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    marginBottom: 24,
                    background: "#fff",
                }}
            >
                <h3 style={{ marginTop: 0 }}>Neue Buchung</h3>

                <div style={{ display: "grid", gap: 10 }}>
                    <div>
                        <label style={{ display: "block", marginBottom: 4 }}>Datum</label>
                        <input
                            type="date"
                            value={neuesDatum}
                            onChange={(e) => setNeuesDatum(e.target.value)}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: 4 }}>Typ</label>
                        <select
                            value={neuerTyp}
                            onChange={(e) => setNeuerTyp(e.target.value as BuchungsTyp)}
                        >
                            <option value="einnahme">Einnahme</option>
                            <option value="ausgabe">Ausgabe</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: 4 }}>Kasse</label>
                        <div
                            style={{
                                padding: "8px 10px",
                                border: "1px solid #ccc",
                                borderRadius: 6,
                                background: "#f3f4f6",
                                fontWeight: 500,
                            }}
                        >
                            Barkasse
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: 4 }}>Titel</label>
                        <input
                            type="text"
                            placeholder="z. B. Getränkeeinkauf"
                            value={neuerTitel}
                            onChange={(e) => setNeuerTitel(e.target.value)}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: 4 }}>
                            Beschreibung
                        </label>
                        <input
                            type="text"
                            placeholder="optionale Notiz"
                            value={neueBeschreibung}
                            onChange={(e) => setNeueBeschreibung(e.target.value)}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: 4 }}>Betrag</label>
                        <input
                            type="text"
                            placeholder="z. B. 25,00"
                            value={neuerBetrag}
                            onChange={(e) => setNeuerBetrag(e.target.value)}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginTop: 4,
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={neuerBarbelegVorhanden}
                            onChange={(e) => setNeuerBarbelegVorhanden(e.target.checked)}
                        />
                        Barbeleg vorhanden
                    </label>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button onClick={eintragHinzufuegen}>+ Buchung hinzufügen</button>
                        <button type="button" onClick={formularZuruecksetzen}>
                            Formular leeren
                        </button>
                    </div>
                </div>
            </div>

            <div
                style={{
                    padding: 12,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    marginBottom: 24,
                    background: "#fff",
                }}
            >
                <h3 style={{ marginTop: 0 }}>Umbuchung zwischen Bank und Barkasse</h3>

                <div style={{ display: "grid", gap: 10 }}>
                    <div>
                        <label style={{ display: "block", marginBottom: 4 }}>Datum</label>
                        <input
                            type="date"
                            value={umbuchungsDatum}
                            onChange={(e) => setUmbuchungsDatum(e.target.value)}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: 4 }}>Richtung</label>
                        <select
                            value={umbuchungsRichtung}
                            onChange={(e) =>
                                setUmbuchungsRichtung(e.target.value as UmbuchungsRichtung)
                            }
                        >
                            <option value="bank-zu-barkasse">Bank → Barkasse</option>
                            <option value="barkasse-zu-bank">Barkasse → Bank</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: 4 }}>Betrag</label>
                        <input
                            type="text"
                            placeholder="z. B. 200,00"
                            value={umbuchungsBetrag}
                            onChange={(e) => setUmbuchungsBetrag(e.target.value)}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <div
                        style={{
                            fontSize: 14,
                            color: "#555",
                            background: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            borderRadius: 8,
                            padding: 10,
                        }}
                    >
                        Titel wird automatisch gesetzt:
                        <br />
                        {umbuchungsRichtung === "bank-zu-barkasse"
                            ? "Umbuchung Bank an Barkasse"
                            : "Umbuchung Barkasse an Bank"}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button onClick={umbuchungHinzufuegen}>+ Umbuchung hinzufügen</button>
                        <button type="button" onClick={umbuchungZuruecksetzen}>
                            Formular leeren
                        </button>
                    </div>
                </div>
            </div>

            <KassenAuswertung
                kassenEintraege={kassenEintraege}
                onEintragLoeschen={eintragLoeschen}
                onBelegOeffnen={belegOeffnen}
            />
        </div>
    );
}