import { useEffect, useMemo, useState } from "react";
type DruckTabellenZeile = {
    datum: string;
    titel: string;
    beschreibung?: string;
    einnahme: number;
    ausgabe: number;
    laufenderBestand: number;
};
import { type KassenEintrag } from "./kassenStorage";
import { exportiereKassenblattExcel } from "./KassenExportExcel";

type Props = {
    kassenEintraege: KassenEintrag[];
    onEintragLoeschen: (id: string) => void;
    onBelegOeffnen: (relpath: string) => void;
};

type TabellenZeile = {
    eintrag: KassenEintrag;
    einnahme: number;
    ausgabe: number;
    laufenderBestand: number;
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

function sortiereAltNachNeu(eintraege: KassenEintrag[]) {
    return [...eintraege].sort((a, b) => {
        const datumA = leseDatumsteile(a.datum).sortierwert;
        const datumB = leseDatumsteile(b.datum).sortierwert;

        const datumVergleich = datumA.localeCompare(datumB);
        if (datumVergleich !== 0) return datumVergleich;

        return Number(a.id) - Number(b.id);
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

    const [gewaehltesJahr, setGewaehltesJahr] = useState<string>(aktuellesJahr);
    const [gewaehlterMonat, setGewaehltenMonat] = useState<string>("alle");

    useEffect(() => {
        if (verfuegbareJahre.length === 0) return;

        if (!verfuegbareJahre.includes(gewaehltesJahr)) {
            setGewaehltesJahr(verfuegbareJahre[0]);
        }
    }, [verfuegbareJahre, gewaehltesJahr]);

    const eintraegeImJahr = useMemo(() => {
        return barkassenEintraege.filter((eintrag) => {
            const teile = leseDatumsteile(eintrag.datum);
            return teile.jahr === gewaehltesJahr;
        });
    }, [barkassenEintraege, gewaehltesJahr]);

    const gefilterteEintraege = useMemo(() => {
        let daten = eintraegeImJahr;

        if (gewaehlterMonat !== "alle") {
            daten = daten.filter((eintrag) => {
                const teile = leseDatumsteile(eintrag.datum);
                return teile.monat === gewaehlterMonat;
            });
        }

        return sortiereNeuNachAlt(daten);
    }, [eintraegeImJahr, gewaehlterMonat]);

    const anfangsbestand = useMemo(() => {
        if (gewaehlterMonat === "alle") {
            return 0;
        }

        return barkassenEintraege.reduce((summe, eintrag) => {
            const teile = leseDatumsteile(eintrag.datum);

            const liegtVorGewaehltemMonat =
                teile.jahr < gewaehltesJahr ||
                (teile.jahr === gewaehltesJahr && teile.monat < gewaehlterMonat);

            if (!liegtVorGewaehltemMonat) return summe;

            const betrag = parseBetrag(eintrag.betrag);
            return eintrag.typ === "einnahme" ? summe + betrag : summe - betrag;
        }, 0);
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

    const endbestand = useMemo(() => {
        return anfangsbestand + einnahmenImFilter - ausgabenImFilter;
    }, [anfangsbestand, einnahmenImFilter, ausgabenImFilter]);

    const barkassenBestandGesamt = useMemo(() => {
        return barkassenEintraege.reduce((summe, eintrag) => {
            const betrag = parseBetrag(eintrag.betrag);
            return eintrag.typ === "einnahme" ? summe + betrag : summe - betrag;
        }, 0);
    }, [barkassenEintraege]);

    const tabellenZeilen = useMemo(() => {
        const altNachNeu = sortiereAltNachNeu(gefilterteEintraege);
        let laufenderBestand = anfangsbestand;

        const zeilen: TabellenZeile[] = altNachNeu.map((eintrag) => {
            const betrag = parseBetrag(eintrag.betrag);
            const einnahme = eintrag.typ === "einnahme" ? betrag : 0;
            const ausgabe = eintrag.typ === "ausgabe" ? betrag : 0;

            laufenderBestand =
                eintrag.typ === "einnahme"
                    ? laufenderBestand + betrag
                    : laufenderBestand - betrag;

            return {
                eintrag,
                einnahme,
                ausgabe,
                laufenderBestand,
            };
        });

        return zeilen.reverse();
    }, [gefilterteEintraege, anfangsbestand]);

    const druckZeilen = useMemo(() => {
        return [...tabellenZeilen]
            .reverse()
            .map((zeile): DruckTabellenZeile => ({
                datum: formatiereDatumAnzeige(zeile.eintrag.datum),
                titel: zeile.eintrag.titel,
                beschreibung: zeile.eintrag.beschreibung,
                einnahme: zeile.einnahme,
                ausgabe: zeile.ausgabe,
                laufenderBestand: zeile.laufenderBestand,
            }));
    }, [tabellenZeilen]);

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

    const monatsTitel =
        gewaehlterMonat === "alle"
            ? `Kassenblatt ${gewaehltesJahr}`
            : `Kassenblatt ${gewaehlterMonat}.${gewaehltesJahr}`;

    const handleExport = () => {
        if (gewaehlterMonat === "alle") {
            alert("Bitte zuerst einen Monat auswählen. Es soll immer nur 1 Kassenblatt pro Monat exportiert werden.");
            return;
        }

        exportiereKassenblattExcel({
            titel: monatsTitel,
            anfangsbestand,
            endbestand,
            zeilen: druckZeilen.map((z) => ({
                datum: z.datum,
                titel: z.titel,
                einnahme: z.einnahme,
                ausgabe: z.ausgabe,
                bestand: z.laufenderBestand,
            })),
        });
    };

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
                    onChange={(e) => setGewaehltesJahr(e.target.value)}
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
                    onClick={() => setGewaehltenMonat("alle")}
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
                        onClick={() => setGewaehltenMonat(monat)}
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

                <button
                    type="button"
                    onClick={handleExport}
                    style={{
                        marginLeft: "auto",
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: "1px solid #2563eb",
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    Monats-Kassenblatt Excel
                </button>
            </div>

            <div
                style={{
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    padding: 12,
                    background: "#F9FAFB",
                    marginBottom: 16,
                }}
            >
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{monatsTitel}</div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <div style={{ fontSize: 14, color: "#555" }}>Anfangsbestand</div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>
                            {formatEuro(anfangsbestand)}
                        </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, color: "#555" }}>
                            Barkassenbestand gesamt
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>
                            {formatEuro(barkassenBestandGesamt)}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 24 }}>
                <h4 style={{ marginBottom: 8 }}>Buchungen</h4>

                {tabellenZeilen.length === 0 ? (
                    <p>Keine Barkassen-Buchungen im gewählten Filter vorhanden.</p>
                ) : (
                    <div
                        style={{
                            overflowX: "auto",
                            border: "1px solid #E5E7EB",
                            borderRadius: 8,
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                minWidth: 900,
                                background: "#fff",
                            }}
                        >
                            <thead>
                                <tr style={{ background: "#F9FAFB" }}>
                                    <th
                                        style={{
                                            textAlign: "left",
                                            padding: 10,
                                            borderBottom: "1px solid #E5E7EB",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Datum
                                    </th>
                                    <th
                                        style={{
                                            textAlign: "left",
                                            padding: 10,
                                            borderBottom: "1px solid #E5E7EB",
                                        }}
                                    >
                                        Titel
                                    </th>
                                    <th
                                        style={{
                                            textAlign: "right",
                                            padding: 10,
                                            borderBottom: "1px solid #E5E7EB",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Einnahme
                                    </th>
                                    <th
                                        style={{
                                            textAlign: "right",
                                            padding: 10,
                                            borderBottom: "1px solid #E5E7EB",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Ausgabe
                                    </th>
                                    <th
                                        style={{
                                            textAlign: "right",
                                            padding: 10,
                                            borderBottom: "1px solid #E5E7EB",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Laufender Bestand
                                    </th>
                                    <th
                                        style={{
                                            textAlign: "left",
                                            padding: 10,
                                            borderBottom: "1px solid #E5E7EB",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Aktionen
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {tabellenZeilen.map((zeile) => {
                                    const { eintrag, einnahme, ausgabe, laufenderBestand } = zeile;

                                    return (
                                        <tr key={eintrag.id}>
                                            <td
                                                style={{
                                                    padding: 10,
                                                    borderBottom: "1px solid #E5E7EB",
                                                    whiteSpace: "nowrap",
                                                    verticalAlign: "top",
                                                }}
                                            >
                                                {formatiereDatumAnzeige(eintrag.datum)}
                                            </td>

                                            <td
                                                style={{
                                                    padding: 10,
                                                    borderBottom: "1px solid #E5E7EB",
                                                    verticalAlign: "top",
                                                }}
                                            >
                                                <div style={{ fontWeight: 700 }}>
                                                    {eintrag.titel}
                                                </div>
                                                {eintrag.beschreibung ? (
                                                    <div
                                                        style={{
                                                            marginTop: 4,
                                                            color: "#555",
                                                            fontSize: 14,
                                                        }}
                                                    >
                                                        {eintrag.beschreibung}
                                                    </div>
                                                ) : null}
                                            </td>

                                            <td
                                                style={{
                                                    padding: 10,
                                                    borderBottom: "1px solid #E5E7EB",
                                                    textAlign: "right",
                                                    whiteSpace: "nowrap",
                                                    verticalAlign: "top",
                                                    color: einnahme > 0 ? "green" : "#999",
                                                    fontWeight: einnahme > 0 ? 700 : 400,
                                                }}
                                            >
                                                {einnahme > 0 ? formatEuro(einnahme) : "—"}
                                            </td>

                                            <td
                                                style={{
                                                    padding: 10,
                                                    borderBottom: "1px solid #E5E7EB",
                                                    textAlign: "right",
                                                    whiteSpace: "nowrap",
                                                    verticalAlign: "top",
                                                    color: ausgabe > 0 ? "red" : "#999",
                                                    fontWeight: ausgabe > 0 ? 700 : 400,
                                                }}
                                            >
                                                {ausgabe > 0 ? formatEuro(ausgabe) : "—"}
                                            </td>

                                            <td
                                                style={{
                                                    padding: 10,
                                                    borderBottom: "1px solid #E5E7EB",
                                                    textAlign: "right",
                                                    whiteSpace: "nowrap",
                                                    verticalAlign: "top",
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {formatEuro(laufenderBestand)}
                                            </td>

                                            <td
                                                style={{
                                                    padding: 10,
                                                    borderBottom: "1px solid #E5E7EB",
                                                    whiteSpace: "nowrap",
                                                    verticalAlign: "top",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 8,
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    {eintrag.belegPfad ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onBelegOeffnen(eintrag.belegPfad!)
                                                            }
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
                                                        onClick={() =>
                                                            onEintragLoeschen(eintrag.id)
                                                        }
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
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div
                style={{
                    marginTop: 16,
                    display: "flex",
                    justifyContent: "flex-end",
                }}
            >
                <div
                    style={{
                        minWidth: 260,
                        border: "1px solid #E5E7EB",
                        borderRadius: 8,
                        padding: 12,
                        background: "#F9FAFB",
                        textAlign: "right",
                    }}
                >
                    <div style={{ fontSize: 14, color: "#555", marginBottom: 4 }}>
                        Endbestand
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>
                        {formatEuro(endbestand)}
                    </div>
                </div>
            </div>
        </div>
    );
}