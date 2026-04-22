import { useMemo, useState } from "react";

export default function KassenTab() {
    const [neuerTitel, setNeuerTitel] = useState("");
    const [kassenEintraege, setKassenEintraege] = useState<any[]>([]);
    const [neuerTyp, setNeuerTyp] = useState<"einnahme" | "ausgabe">("einnahme");
    const [neueKassenArt, setNeueKassenArt] = useState<"bank" | "barkasse">("barkasse");
    const [neuerBetrag, setNeuerBetrag] = useState("");

    const kontostand = useMemo(() => {
        return kassenEintraege.reduce((sum: number, eintrag: any) => {
            const betrag = parseFloat(
                String(eintrag.betrag).replace(",", ".").replace("€", "")
            );

            if (isNaN(betrag)) return sum;

            return eintrag.typ === "einnahme"
                ? sum + betrag
                : sum - betrag;
        }, 0);
    }, [kassenEintraege]);

    return (
        <div>
            <h2>Kasse</h2>
            <div style={{ marginBottom: 16, fontSize: 18, fontWeight: 600 }}>
                Kontostand: {kontostand.toFixed(2)} €
            </div>
            <p>Hier entsteht die Kassenverwaltung.</p>

            <div style={{ marginTop: 16 }}>
                <strong>Einträge:</strong>

                {kassenEintraege.map((eintrag: any) => (
                    <div
                        key={eintrag.id}
                        style={{ marginTop: 12, padding: 10, border: "1px solid #ccc" }}
                    >
                        <div>
                            <strong style={{ color: eintrag.typ === "einnahme" ? "green" : "red" }}>
                                {eintrag.typ === "einnahme" ? "Einnahme" : "Ausgabe"}
                            </strong>{" "}
                            – {eintrag.kassenArt === "bank" ? "Bank" : "Barkasse"}
                        </div>
                        <div>{eintrag.titel}</div>
                        <div style={{ color: eintrag.typ === "einnahme" ? "green" : "red", fontWeight: 700 }}>
                            {eintrag.typ === "einnahme" ? "+" : "-"} {eintrag.betrag}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 10 }}>
                <select
                    value={neuerTyp}
                    onChange={(e) => setNeuerTyp(e.target.value as any)}
                    style={{ marginRight: 8 }}
                >
                    <option value="einnahme">Einnahme</option>
                    <option value="ausgabe">Ausgabe</option>
                </select>

                <select
                    value={neueKassenArt}
                    onChange={(e) => setNeueKassenArt(e.target.value as any)}
                    style={{ marginRight: 8 }}
                >
                    <option value="bank">Bank</option>
                    <option value="barkasse">Barkasse</option>
                </select>

                <input
                    type="text"
                    placeholder="Titel eingeben"
                    value={neuerTitel}
                    onChange={(e) => setNeuerTitel(e.target.value)}
                    style={{ marginRight: 8 }}
                />

                <input
                    type="text"
                    placeholder="Betrag, z. B. 25,00 €"
                    value={neuerBetrag}
                    onChange={(e) => setNeuerBetrag(e.target.value)}
                    style={{ marginRight: 8 }}
                />

                <button
                    onClick={() => {
                        if (!neuerTitel) return;

                        const neuerEintrag = {
                            id: Date.now().toString(),
                            typ: neuerTyp,
                            kassenArt: neueKassenArt,
                            titel: neuerTitel,
                            betrag: neuerBetrag || "0,00 €",
                        };

                        setKassenEintraege((prev) => [neuerEintrag, ...prev]);
                        setNeuerTitel("");
                        setNeuerBetrag("");
                    }}
                >
                    + Eintrag hinzufügen
                </button>
            </div>
        </div>
    );
}
