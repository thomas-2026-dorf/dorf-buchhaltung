import type { Ausgangsrechnung } from "../../lib/ausgangsrechnungen";
import type { FewoName } from "../../lib/belege"

type Props = {
    daten: Ausgangsrechnung[];
    onUpdateFewo: (id: string, value: FewoName | "") => void;
};

export default function AusgangListe({ daten, onUpdateFewo }: Props) {
    return (
        <div
            style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                background: "#fff",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    padding: 12,
                    fontWeight: 700,
                    borderBottom: "1px solid #ddd",
                    background: "#f7f7f7",
                }}
            >
                Ausgangsrechnungen ({daten.length})
            </div>

            {daten.length === 0 ? (
                <div style={{ padding: 12, color: "#666" }}>
                    Noch keine Ausgangsrechnungen vorhanden.
                </div>
            ) : (
                <div
                    style={{
                        maxHeight: "70vh",
                        overflowY: "auto",
                        overflowX: "auto",
                    }}
                >
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: 14,
                            minWidth: 1400,
                        }}
                    >
                        <thead>
                            <tr style={{ background: "#fafafa", position: "sticky", top: 0, zIndex: 1 }}>
                                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>
                                    ID
                                </th>
                                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>
                                    Kundennr.
                                </th>
                                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>
                                    Gast
                                </th>
                                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>
                                    Einheit
                                </th>
                                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>
                                    Rechnungsdatum
                                </th>
                                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>
                                    Rechnungsnr.
                                </th>
                                <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #eee" }}>
                                    Bruttobetrag
                                </th>
                                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>
                                    Anzahlung Datum
                                </th>
                                <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #eee" }}>
                                    Anzahlung Betrag
                                </th>
                                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>
                                    Restzahlung Datum
                                </th>
                                <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #eee" }}>
                                    Restzahlung Betrag
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {daten.map((eintrag) => (
                                <tr key={eintrag.id}>
                                    <td style={{ padding: 8, borderBottom: "1px solid #f1f1f1" }}>
                                        {eintrag.id}
                                    </td>
                                    <td style={{ padding: 8, borderBottom: "1px solid #f1f1f1" }}>
                                        {eintrag.kundennummer || "-"}
                                    </td>
                                    <td style={{ padding: 8, borderBottom: "1px solid #f1f1f1" }}>
                                        {eintrag.gastname || "-"}
                                    </td>
                                    <td style={{ padding: 8, borderBottom: "1px solid #f1f1f1" }}>
                                        <select
                                            value={eintrag.fewo || ""}
                                            onChange={(e) => onUpdateFewo(eintrag.id, e.target.value as FewoName | "")}
                                            style={{ padding: "4px 6px" }}
                                        >
                                            <option value="">-</option>
                                            <option value="Tina">Tina</option>
                                            <option value="Harmony">Harmony</option>
                                            <option value="Tinchen">Tinchen</option>
                                            <option value="RS">RS</option>
                                            <option value="Privat">Privat</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: 8, borderBottom: "1px solid #f1f1f1" }}>
                                        {eintrag.rechnungsdatum || "-"}
                                    </td>
                                    <td style={{ padding: 8, borderBottom: "1px solid #f1f1f1" }}>
                                        {eintrag.rechnungsnummer || "-"}
                                    </td>
                                    <td
                                        style={{
                                            padding: 8,
                                            borderBottom: "1px solid #f1f1f1",
                                            textAlign: "right",
                                        }}
                                    >
                                        {eintrag.bruttobetrag || "-"}
                                    </td>
                                    <td style={{ padding: 8, borderBottom: "1px solid #f1f1f1" }}>
                                        {eintrag.anzahlungEingangDatum || "-"}
                                    </td>
                                    <td
                                        style={{
                                            padding: 8,
                                            borderBottom: "1px solid #f1f1f1",
                                            textAlign: "right",
                                        }}
                                    >
                                        {eintrag.anzahlungEingangBetrag || "-"}
                                    </td>
                                    <td style={{ padding: 8, borderBottom: "1px solid #f1f1f1" }}>
                                        {eintrag.restzahlungEingangDatum || "-"}
                                    </td>
                                    <td
                                        style={{
                                            padding: 8,
                                            borderBottom: "1px solid #f1f1f1",
                                            textAlign: "right",
                                        }}
                                    >
                                        {eintrag.restzahlungEingangBetrag || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}