import { useEffect, useMemo, useState } from "react";
import { type KassenEintrag } from "./kassenStorage";

type Props = {
    kassenEintraege: KassenEintrag[];
    onEintragLoeschen: (id: string) => void;
    onBelegOeffnen: (relpath: string) => void;
};

function parseBetrag(wert: unknown) {
    const betrag = parseFloat(
        String(wert).replace(",", ".").replace("€", "").trim()
    );

    return isNaN(betrag) ? 0 : betrag;
}

function formatEuro(wert: number) {
    return `${wert.toFixed(2).replace(".", ",")} €`;
}

function leseDatumsteile(datum: string | undefined) {
    if (!datum) {
        return { jahr: "", monat: "", tag: "", sortierwert: "" };
    }

    const wert = datum.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(wert)) {
        const [jahr, monat, tag] = wert.split("-");
        return {
            jahr,
            monat,
            tag,
            sortierwert: `${jahr}-${monat}-${tag}`,
        };
    }

    if (/^\d{2}\.\d{2}\.\d{4}$/.test(wert)) {
        const [tag, monat, jahr] = wert.split(".");
        return {
            jahr,
            monat,
            tag,
            sortierwert: `${jahr}-${monat}-${tag}`,
        };
    }

    return { jahr: "", monat: "", tag: "", sortierwert: "" };
}

function formatiereDatumAnzeige(datum: string | undefined) {
    const teile = leseDatumsteile(datum);
    if (!teile.jahr || !teile.monat || !teile.tag) {
        return datum || "-";
    }

    return `${teile.tag}.${teile.monat}.${teile.jahr}`;
}

function sortiereNeuNachAlt(eintraege: KassenEintrag[]) {
    return [...eintraege].sort((a, b) => {
        const datumA = leseDatumsteile(a.datum).sortierwert;
        const datumB = leseDatumsteile(b.datum).sortierwert;

        const datumVergleich = datumB.localeCompare(datumA);
        if (datumVergleich !== 0) return datumVergleich;

        return Number(b.id) - Number(a.id);
    });
}

export default function KassenAuswertung({
    kassenEintraege,
    onEintragLoeschen,
    onBelegOeffnen,
}: Props) {
    const barkassenEintraege = useMemo(() => {
        return kassenEintraege.filter((eintrag) => eintrag.kassenArt === "barkasse");
    }, [kassenEintraege]);

    const verfuegbareJahre = useMemo(() => {
        const jahre = Array.from(
            new Set(
                barkassenEintraege
                    .map((eintrag) => leseDatumsteile(eintrag.datum).jahr)
                    .filter(Boolean)
            )
        ) as string[];

        return jahre.sort((a, b) => b.localeCompare(a));
    }, [barkassenEintraege]);

    const aktuellesJahr = new Date().getFullYear().toString();

    const [gewaehltesJahr, setGewaehhltesJahr] = useState<string>(aktuellesJahr);
    const [gewaehlterMonat, setGewaehhltenMonat] = useState<string>("alle");

    useEffect(() => {
        if (verfuegbareJahre.length === 0) return;

        if (!verfuegbareJahre.includes(gewaehltesJahr)) {
            setGewaehhltesJahr(verfuegbareJahre[0]);
        }
    }, [verfuegbareJahre, gewaehltesJahr]);

    const gefilterteEintraege = useMemo(() => {
        let daten = barkassenEintraege.filter((eintrag) => {
            const teile = leseDatumsteile(eintrag.datum);
            return teile.jahr === gewaehltesJahr;
        });

        if (gewaehlterMonat !== "alle") {
            daten = daten.filter((eintrag) => {
                const teile = leseDatumsteile(eintrag.datum);
                return teile.monat === gewaehlterMonat;
            });
        }

        return sortiereNeuNachAlt(daten);
    }, [barkassenEintraege, gewaehltesJahr, gewaehlterMonat]);

    const einnahmenImFilter = useMemo(() => {
        return gefilterteEintraege.reduce((summe, eintrag) => {
            if (eintrag.typ !== "einnahme") return summe;
            return summe + parseBetrag(eintrag.betrag);
        }, 0);
    }, [gefilterteEintraege]);

    const ausgabenImFilter = useMemo(() => {
        return gefilterteEintraege.reduce((summe, eintrag) => {
            if (eintrag.typ !== "ausgabe") return summe;
            return summe + parseBetrag(eintrag.betrag);
        }, 0);
    }, [gefilterteEintraege]);

    const barkassenBestandGesamt = useMemo(() => {
        return barkassenEintraege.reduce((summe, eintrag) => {
            const betrag = parseBetrag(eintrag.betrag);
            return eintrag.typ === "einnahme" ? summe + betrag : summe - betrag;
        }, 0);
    }, [barkassenEintraege]);

    const monate = [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
    ];

    return (
        <div
            style={{
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 8,
                marginBottom: 24,
                background: "#fff",
            }}
        >
            <h3 style={{ marginTop: 0 }}>Kassen-Auswertung</h3>

            <div
                style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    alignItems: "center",
                    marginBottom: 16,
                }}
            >
                <select
                    value={gewaehltesJahr}
                    onChange={(e) => setGewaehhltesJahr(e.target.value)}
                    style={{
                        padding: "8px 10px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        fontWeight: 600,
                    }}
                >
                    {verfuegbareJahre.length === 0 ? (
                        <option value={aktuellesJahr}>{aktuellesJahr}</option>
                    ) : (
                        verfuegbareJahre.map((jahr) => (
                            <option key={jahr} value={jahr}>
                                {jahr}
                            </option>
                        ))
                    )}
                </select>

                <button
                    type="button"
                    onClick={() => setGewaehhltenMonat("alle")}
                    style={{
                        padding: "8px 10px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        cursor: "pointer",
                        background: gewaehlterMonat === "alle" ? "#dbeafe" : "#fff",
                        fontWeight: gewaehlterMonat === "alle" ? 700 : 500,
                    }}
                >
                    Alle
                </button>

                {monate.map((monat) => (
                    <button
                        key={monat}
                        type="button"
                        onClick={() => setGewaehhltenMonat(monat)}
                        style={{
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "1px solid #ccc",
                            cursor: "pointer",
                            background:
                                gewaehlterMonat === monat ? "#dbeafe" : "#fff",
                            fontWeight: gewaehlterMonat === monat ? 700 : 500,
                            minWidth: 48,
                        }}
                    >
                        {monat}
                    </button>
                ))}
            </div>

            <div
                style={{
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    marginBottom: 20,
                }}
            >
                <div
                    style={{
                        padding: 12,
                        border: "1px solid #E5E7EB",
                        borderRadius: 8,
                        background: "#F9FAFB",
                    }}
                >
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>
                        Bewegungen im Filter
                    </div>
                    <div>Einnahmen: {formatEuro(einnahmenImFilter)}</div>
                    <div>Ausgaben: {formatEuro(ausgabenImFilter)}</div>
                    <div style={{ marginTop: 8, fontWeight: 700 }}>
                        Saldo: {formatEuro(einnahmenImFilter - ausgabenImFilter)}
                    </div>
                </div>

                <div
                    style={{
                        padding: 12,
                        border: "1px solid #E5E7EB",
                        borderRadius: 8,
                        background: "#F9FAFB",
                    }}
                >
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>
                        Barkassenbestand gesamt
                    </div>
                    <div>{formatEuro(barkassenBestandGesamt)}</div>
                </div>
            </div>

            <div style={{ marginTop: 24 }}>
                <h4 style={{ marginBottom: 8 }}>Buchungen</h4>

                {gefilterteEintraege.length === 0 ? (
                    <p>Keine Barkassen-Buchungen im gewählten Filter vorhanden.</p>
                ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                        {gefilterteEintraege.map((eintrag) => {
                            const istEinnahme = eintrag.typ === "einnahme";

                            return (
                                <div
                                    key={eintrag.id}
                                    style={{
                                        border: "1px solid #E5E7EB",
                                        borderRadius: 8,
                                        padding: 10,
                                        background: "#fff",
                                    }}
                                >
                                    <div style={{ fontWeight: 700 }}>{eintrag.titel}</div>

                                    {eintrag.beschreibung ? (
                                        <div style={{ marginTop: 4, color: "#555" }}>
                                            {eintrag.beschreibung}
                                        </div>
                                    ) : null}

                                    <div
                                        style={{
                                            marginTop: 6,
                                            fontSize: 14,
                                            color: "#666",
                                        }}
                                    >
                                        Datum: {formatiereDatumAnzeige(eintrag.datum)}
                                    </div>

                                    <div
                                        style={{
                                            marginTop: 6,
                                            fontWeight: 700,
                                            color: istEinnahme ? "green" : "red",
                                        }}
                                    >
                                        {istEinnahme ? "+" : "-"} {eintrag.betrag}
                                    </div>

                                    <div
                                        style={{
                                            marginTop: 10,
                                            display: "flex",
                                            gap: 8,
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        {eintrag.belegPfad ? (
                                            <button
                                                type="button"
                                                onClick={() => onBelegOeffnen(eintrag.belegPfad!)}
                                                style={{
                                                    background: "#dbeafe",
                                                    border: "1px solid #3b82f6",
                                                    color: "#1d4ed8",
                                                    padding: "4px 8px",
                                                    borderRadius: 6,
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Beleg öffnen
                                            </button>
                                        ) : null}

                                        <button
                                            type="button"
                                            onClick={() => onEintragLoeschen(eintrag.id)}
                                            style={{
                                                background: "#fee2e2",
                                                border: "1px solid #ef4444",
                                                color: "#991b1b",
                                                padding: "4px 8px",
                                                borderRadius: 6,
                                                cursor: "pointer",
                                            }}
                                        >
                                            Löschen
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}