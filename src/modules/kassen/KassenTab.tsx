import { useMemo, useState } from "react";

type BuchungsTyp = "einnahme" | "ausgabe";
type KassenArt = "bank" | "barkasse";

type KassenEintrag = {
    id: string;
    datum: string;
    typ: BuchungsTyp;
    kassenArt: KassenArt;
    titel: string;
    beschreibung: string;
    betrag: string;
    barbelegVorhanden: boolean;
};

export default function KassenTab() {
    const [neuerTitel, setNeuerTitel] = useState("");
    const [neueBeschreibung, setNeueBeschreibung] = useState("");
    const [kassenEintraege, setKassenEintraege] = useState<KassenEintrag[]>([]);
    const [neuerTyp, setNeuerTyp] = useState<BuchungsTyp>("einnahme");
    const [neueKassenArt, setNeueKassenArt] = useState<KassenArt>("barkasse");
    const [neuerBetrag, setNeuerBetrag] = useState("");
    const [neuesDatum, setNeuesDatum] = useState(() => {
        return new Date().toISOString().slice(0, 10);
    });
    const [neuerBarbelegVorhanden, setNeuerBarbelegVorhanden] = useState(true);

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

    const bankEintraege = useMemo(() => {
        return kassenEintraege.filter((eintrag) => eintrag.kassenArt === "bank");
    }, [kassenEintraege]);

    const barkassenEintraege = useMemo(() => {
        return kassenEintraege.filter((eintrag) => eintrag.kassenArt === "barkasse");
    }, [kassenEintraege]);

    const formularZuruecksetzen = () => {
        setNeuerTitel("");
        setNeueBeschreibung("");
        setNeuerBetrag("");
        setNeuerTyp("einnahme");
        setNeueKassenArt("barkasse");
        setNeuesDatum(new Date().toISOString().slice(0, 10));
        setNeuerBarbelegVorhanden(true);
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
            kassenArt: neueKassenArt,
            titel: neuerTitel.trim(),
            beschreibung: neueBeschreibung.trim(),
            betrag: formatEuro(betragAlsZahl),
            barbelegVorhanden:
                neueKassenArt === "barkasse" ? neuerBarbelegVorhanden : false,
        };

        setKassenEintraege((prev) => [neuerEintrag, ...prev]);
        formularZuruecksetzen();
    };

    const renderEintrag = (eintrag: KassenEintrag) => {
        const istEinnahme = eintrag.typ === "einnahme";
        const istBarkasse = eintrag.kassenArt === "barkasse";

        return (
            <div
                key={eintrag.id}
                style={{
                    marginTop: 12,
                    padding: 12,
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    background: "#fff",
                }}
            >
                <div style={{ marginBottom: 6 }}>
                    <strong style={{ color: istEinnahme ? "green" : "red" }}>
                        {istEinnahme ? "Einnahme" : "Ausgabe"}
                    </strong>{" "}
                    – {istBarkasse ? "Barkasse" : "Bank"}
                </div>

                <div style={{ fontWeight: 700 }}>{eintrag.titel}</div>

                {eintrag.beschreibung ? (
                    <div style={{ marginTop: 4, color: "#444" }}>{eintrag.beschreibung}</div>
                ) : null}

                <div style={{ marginTop: 6, fontSize: 14, color: "#666" }}>
                    Datum: {eintrag.datum}
                </div>

                <div
                    style={{
                        marginTop: 6,
                        color: istEinnahme ? "green" : "red",
                        fontWeight: 700,
                    }}
                >
                    {istEinnahme ? "+" : "-"} {eintrag.betrag}
                </div>

                {istBarkasse ? (
                    <div style={{ marginTop: 6, fontSize: 14 }}>
                        Barbeleg: {eintrag.barbelegVorhanden ? "vorhanden" : "fehlt"}
                    </div>
                ) : null}
            </div>
        );
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
                    Gesamt: {formatEuro(kontostand)}
                </div>
                <div style={{ fontSize: 16 }}>Bank: {formatEuro(bankKontostand)}</div>
                <div style={{ fontSize: 16 }}>Barkasse: {formatEuro(barkassenKontostand)}</div>
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
                        <select
                            value={neueKassenArt}
                            onChange={(e) => setNeueKassenArt(e.target.value as KassenArt)}
                        >
                            <option value="bank">Bank</option>
                            <option value="barkasse">Barkasse</option>
                        </select>
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

                    {neueKassenArt === "barkasse" ? (
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
                    ) : null}

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button onClick={eintragHinzufuegen}>+ Buchung hinzufügen</button>
                        <button type="button" onClick={formularZuruecksetzen}>
                            Formular leeren
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 24 }}>
                <h3>Alle Buchungen</h3>
                {kassenEintraege.length === 0 ? (
                    <p>Noch keine Buchungen vorhanden.</p>
                ) : (
                    kassenEintraege.map(renderEintrag)
                )}
            </div>

            <div style={{ marginTop: 32 }}>
                <h3>Nur Bank</h3>
                {bankEintraege.length === 0 ? (
                    <p>Keine Bank-Buchungen vorhanden.</p>
                ) : (
                    bankEintraege.map(renderEintrag)
                )}
            </div>

            <div style={{ marginTop: 32 }}>
                <h3>Nur Barkasse</h3>
                {barkassenEintraege.length === 0 ? (
                    <p>Keine Barkassen-Buchungen vorhanden.</p>
                ) : (
                    barkassenEintraege.map(renderEintrag)
                )}
            </div>
        </div>
    );
}