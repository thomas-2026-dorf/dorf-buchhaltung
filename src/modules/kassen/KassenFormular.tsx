import { type UmbuchungsRichtung } from "./kassenUmbuchungen";
import { type BuchungsTyp } from "./kassenStorage";

type Props = {
    neuerTitel: string;
    setNeuerTitel: (v: string) => void;

    neueBeschreibung: string;
    setNeueBeschreibung: (v: string) => void;

    neuerTyp: BuchungsTyp;
    setNeuerTyp: (v: BuchungsTyp) => void;

    neuerBetrag: string;
    setNeuerBetrag: (v: string) => void;

    neuesDatum: string;
    setNeuesDatum: (v: string) => void;

    neuerBarbelegVorhanden: boolean;
    setNeuerBarbelegVorhanden: (v: boolean) => void;

    eintragHinzufuegen: () => void;
    formularZuruecksetzen: () => void;

    // Umbuchung
    umbuchungsDatum: string;
    setUmbuchungsDatum: (v: string) => void;

    umbuchungsBetrag: string;
    setUmbuchungsBetrag: (v: string) => void;

    umbuchungsRichtung: UmbuchungsRichtung;
    setUmbuchungsRichtung: (v: UmbuchungsRichtung) => void;

    umbuchungHinzufuegen: () => void;
    umbuchungZuruecksetzen: () => void;
};

export default function KassenFormular({
    neuerTitel,
    setNeuerTitel,
    neueBeschreibung,
    setNeueBeschreibung,
    neuerTyp,
    setNeuerTyp,
    neuerBetrag,
    setNeuerBetrag,
    neuesDatum,
    setNeuesDatum,
    neuerBarbelegVorhanden,
    setNeuerBarbelegVorhanden,
    eintragHinzufuegen,
    formularZuruecksetzen,
    umbuchungsDatum,
    setUmbuchungsDatum,
    umbuchungsBetrag,
    setUmbuchungsBetrag,
    umbuchungsRichtung,
    setUmbuchungsRichtung,
    umbuchungHinzufuegen,
    umbuchungZuruecksetzen,
}: Props) {
    return (
        <>
            {/* Neue Buchung */}
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
                    <input type="date" value={neuesDatum} onChange={(e) => setNeuesDatum(e.target.value)} />

                    <select value={neuerTyp} onChange={(e) => setNeuerTyp(e.target.value as BuchungsTyp)}>
                        <option value="einnahme">Einnahme</option>
                        <option value="ausgabe">Ausgabe</option>
                    </select>

                    <div style={{ padding: 8, background: "#f3f4f6", borderRadius: 6 }}>
                        Barkasse
                    </div>

                    <input
                        type="text"
                        placeholder="Titel"
                        value={neuerTitel}
                        onChange={(e) => setNeuerTitel(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Beschreibung"
                        value={neueBeschreibung}
                        onChange={(e) => setNeueBeschreibung(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Betrag"
                        value={neuerBetrag}
                        onChange={(e) => setNeuerBetrag(e.target.value)}
                    />

                    <label>
                        <input
                            type="checkbox"
                            checked={neuerBarbelegVorhanden}
                            onChange={(e) => setNeuerBarbelegVorhanden(e.target.checked)}
                        />
                        Barbeleg vorhanden
                    </label>

                    <div>
                        <button onClick={eintragHinzufuegen}>+ Buchung</button>
                        <button onClick={formularZuruecksetzen}>Leeren</button>
                    </div>
                </div>
            </div>

            {/* Umbuchung */}
            <div
                style={{
                    padding: 12,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    marginBottom: 24,
                    background: "#fff",
                }}
            >
                <h3 style={{ marginTop: 0 }}>Umbuchung Bank ↔ Barkasse</h3>

                <div style={{ display: "grid", gap: 10 }}>
                    <input type="date" value={umbuchungsDatum} onChange={(e) => setUmbuchungsDatum(e.target.value)} />

                    <select
                        value={umbuchungsRichtung}
                        onChange={(e) =>
                            setUmbuchungsRichtung(e.target.value as UmbuchungsRichtung)
                        }
                    >
                        <option value="bank-zu-barkasse">Bank → Barkasse</option>
                        <option value="barkasse-zu-bank">Barkasse → Bank</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Betrag"
                        value={umbuchungsBetrag}
                        onChange={(e) => setUmbuchungsBetrag(e.target.value)}
                    />

                    <div>
                        <button onClick={umbuchungHinzufuegen}>+ Umbuchung</button>
                        <button onClick={umbuchungZuruecksetzen}>Leeren</button>
                    </div>
                </div>
            </div>
        </>
    );
}