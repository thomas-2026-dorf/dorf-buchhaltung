type Props = {
    rechnungsdatum: string
    setRechnungsdatum: (value: string) => void

    rechnungsnummer: string
    setRechnungsnummer: (value: string) => void

    kundennummer: string
    setKundennummer: (value: string) => void

    gastname: string
    setGastname: (value: string) => void

    fewo: string
    setFewo: (value: string) => void

    bruttobetrag: string
    setBruttobetrag: (value: string) => void

    anzahlungEingangDatum: string
    setAnzahlungEingangDatum: (value: string) => void

    anzahlungEingangBetrag: string
    setAnzahlungEingangBetrag: (value: string) => void

    restzahlungEingangDatum: string
    setRestzahlungEingangDatum: (value: string) => void

    restzahlungEingangBetrag: string
    setRestzahlungEingangBetrag: (value: string) => void

    onSpeichern: () => void
}

export default function AusgangFormular({
    rechnungsdatum,
    setRechnungsdatum,
    rechnungsnummer,
    setRechnungsnummer,
    kundennummer,
    setKundennummer,
    gastname,
    setGastname,
    fewo,
    setFewo,
    bruttobetrag,
    setBruttobetrag,
    anzahlungEingangDatum,
    setAnzahlungEingangDatum,
    anzahlungEingangBetrag,
    setAnzahlungEingangBetrag,
    restzahlungEingangDatum,
    setRestzahlungEingangDatum,
    restzahlungEingangBetrag,
    setRestzahlungEingangBetrag,
    onSpeichern,
}: Props) {
    const disabled =
        !kundennummer ||
        !gastname ||
        !bruttobetrag

    return (
        <div
            style={{
                padding: 16,
                border: "1px solid #ddd",
                borderRadius: 10,
                background: "#fff",
                width: "100%",
                boxSizing: "border-box",
            }}
        >
            <h3 style={{ marginTop: 0 }}>Neue Ausgangsrechnung</h3>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 10,
                }}
            >
                <div>
                    <label style={{ display: "block", marginBottom: 2, fontSize: 12 }}>Einheit</label>
                    <select
                        value={fewo}
                        onChange={(e) => setFewo(e.target.value)}
                        style={{ width: "100%", padding: "6px 8px", fontSize: 13 }}
                    >
                        <option value="">Bitte wählen</option>
                        <option value="dorf">Dorf</option>
                        <option value="veranstaltungen">Veranstaltungen</option>
                        <option value="kasse">Kasse</option>
                        <option value="RS">Vermietung RS</option>
                        <option value="Privat">Privat</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: 2, fontSize: 12 }}>Rechnungsdatum</label>
                    <input
                        value={rechnungsdatum}
                        onChange={(e) => setRechnungsdatum(e.target.value)}
                        placeholder="z.B. 19.03.2026"
                        style={{ width: "100%", padding: "8px 10px" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: 2, fontSize: 12 }}>Rechnungsnummer</label>
                    <input
                        value={rechnungsnummer}
                        onChange={(e) => setRechnungsnummer(e.target.value)}
                        placeholder="optional"
                        style={{ width: "100%", padding: "8px 10px" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: 2, fontSize: 12 }}>Kundennummer</label>
                    <input
                        value={kundennummer}
                        onChange={(e) => setKundennummer(e.target.value)}
                        style={{ width: "100%", padding: "8px 10px" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: 2, fontSize: 12 }}>Name des Gastes</label>
                    <input
                        value={gastname}
                        onChange={(e) => setGastname(e.target.value)}
                        style={{ width: "100%", padding: "8px 10px" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: 2, fontSize: 12 }}>Bruttobetrag</label>
                    <input
                        value={bruttobetrag}
                        onChange={(e) => setBruttobetrag(e.target.value)}
                        placeholder="z.B. 420,00"
                        style={{ width: "100%", padding: "8px 10px" }}
                    />
                </div>

                <div />

                <div>
                    <label style={{ display: "block", marginBottom: 2, fontSize: 12 }}>Anzahlung Eingang Datum</label>
                    <input
                        value={anzahlungEingangDatum}
                        onChange={(e) => setAnzahlungEingangDatum(e.target.value)}
                        placeholder="optional"
                        style={{ width: "100%", padding: "8px 10px" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: 2, fontSize: 12 }}>Anzahlung Eingang Betrag</label>
                    <input
                        value={anzahlungEingangBetrag}
                        onChange={(e) => setAnzahlungEingangBetrag(e.target.value)}
                        placeholder="optional"
                        style={{ width: "100%", padding: "8px 10px" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: 2, fontSize: 12 }}>Restzahlung Eingang Datum</label>
                    <input
                        value={restzahlungEingangDatum}
                        onChange={(e) => setRestzahlungEingangDatum(e.target.value)}
                        placeholder="optional"
                        style={{ width: "100%", padding: "8px 10px" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: 2, fontSize: 12 }}>Restzahlung Eingang Betrag</label>
                    <input
                        value={restzahlungEingangBetrag}
                        onChange={(e) => setRestzahlungEingangBetrag(e.target.value)}
                        placeholder="optional"
                        style={{ width: "100%", padding: "8px 10px" }}
                    />
                </div>
            </div>

            <button
                onClick={onSpeichern}
                disabled={disabled}
                style={{
                    marginTop: 14,
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #1F5FA8",
                    background: "#1F5FA8",
                    color: "white",
                    cursor: "pointer",
                    opacity: disabled ? 0.5 : 1,
                }}
            >
                Speichern
            </button>
        </div>
    )
}