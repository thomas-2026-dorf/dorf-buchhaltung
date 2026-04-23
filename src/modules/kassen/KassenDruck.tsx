export type DruckTabellenZeile = {
    datum: string;
    titel: string;
    beschreibung?: string;
    einnahme: number;
    ausgabe: number;
    laufenderBestand: number;
};

type DruckDaten = {
    titel: string;
    anfangsbestand: number;
    endbestand: number;
    zeilen: DruckTabellenZeile[];
};

function formatEuro(wert: number) {
    return `${wert.toFixed(2).replace(".", ",")} €`;
}

function escapeHtml(wert: string) {
    return wert
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function baueDateiname(titel: string) {
    const sauber = titel
        .toLowerCase()
        .replaceAll("ä", "ae")
        .replaceAll("ö", "oe")
        .replaceAll("ü", "ue")
        .replaceAll("ß", "ss")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return `${sauber || "kassenblatt"}.html`;
}

export function exportiereKassenblattHtml({
    titel,
    anfangsbestand,
    endbestand,
    zeilen,
}: DruckDaten) {
    const heute = new Date().toLocaleDateString("de-DE");

    const zeilenHtml =
        zeilen.length === 0
            ? `
                <tr>
                    <td colspan="5" class="leerzeile">
                        Keine Buchungen im gewählten Filter vorhanden.
                    </td>
                </tr>
            `
            : zeilen
                .map((zeile) => {
                    const titelBlock = zeile.beschreibung
                        ? `
                            <div class="titel">${escapeHtml(zeile.titel)}</div>
                            <div class="beschreibung">${escapeHtml(zeile.beschreibung)}</div>
                        `
                        : `
                            <div class="titel">${escapeHtml(zeile.titel)}</div>
                        `;

                    return `
                        <tr>
                            <td>${escapeHtml(zeile.datum)}</td>
                            <td>${titelBlock}</td>
                            <td class="zahl einnahme">
                                ${zeile.einnahme > 0 ? formatEuro(zeile.einnahme) : "—"}
                            </td>
                            <td class="zahl ausgabe">
                                ${zeile.ausgabe > 0 ? formatEuro(zeile.ausgabe) : "—"}
                            </td>
                            <td class="zahl bestand">${formatEuro(zeile.laufenderBestand)}</td>
                        </tr>
                    `;
                })
                .join("");

    const html = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(titel)}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 14mm 12mm 14mm 12mm;
        }

        * {
            box-sizing: border-box;
        }

        html, body {
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
            color: #111827;
            background: #ffffff;
            font-size: 12px;
            line-height: 1.35;
        }

        body {
            padding: 20px;
        }

        .seite {
            width: 100%;
            max-width: 1100px;
            margin: 0 auto;
        }

        .kopf {
            margin-bottom: 14px;
            page-break-inside: avoid;
        }

        .kopf h1 {
            margin: 0 0 8px 0;
            font-size: 20px;
        }

        .kopfzeile {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 8px;
        }

        .meta {
            font-size: 11px;
            color: #4b5563;
        }

        .anfangsbestand-box {
            display: inline-block;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 10px 12px;
            min-width: 240px;
            page-break-inside: avoid;
        }

        .label {
            font-size: 11px;
            color: #4b5563;
            margin-bottom: 4px;
        }

        .wert-gross {
            font-size: 22px;
            font-weight: 700;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        thead {
            display: table-header-group;
        }

        th, td {
            border: 1px solid #d1d5db;
            padding: 8px;
            vertical-align: top;
        }

        th {
            background: #f3f4f6;
            text-align: left;
            font-size: 12px;
        }

        th:nth-child(1),
        td:nth-child(1) {
            width: 90px;
        }

        th:nth-child(3),
        td:nth-child(3),
        th:nth-child(4),
        td:nth-child(4),
        th:nth-child(5),
        td:nth-child(5) {
            width: 120px;
        }

        .zahl {
            text-align: right;
            white-space: nowrap;
        }

        .einnahme {
            color: #166534;
            font-weight: 700;
        }

        .ausgabe {
            color: #b91c1c;
            font-weight: 700;
        }

        .bestand {
            font-weight: 700;
        }

        .titel {
            font-weight: 700;
        }

        .beschreibung {
            margin-top: 4px;
            color: #4b5563;
            font-size: 11px;
        }

        .leerzeile {
            text-align: center;
            color: #6b7280;
            padding: 18px 8px;
        }

        .endbereich {
            margin-top: 16px;
            display: flex;
            justify-content: flex-end;
            page-break-inside: avoid;
        }

        .endbestand-box {
            min-width: 240px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 10px 12px;
            text-align: right;
        }

        .hinweis {
            margin-top: 10px;
            font-size: 10px;
            color: #6b7280;
        }

        @media print {
            body {
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="seite">
        <div class="kopf">
            <div class="kopfzeile">
                <div>
                    <h1>${escapeHtml(titel)}</h1>
                    <div class="meta">Exportdatum: ${escapeHtml(heute)}</div>
                </div>
            </div>

            <div class="anfangsbestand-box">
                <div class="label">Anfangsbestand</div>
                <div class="wert-gross">${formatEuro(anfangsbestand)}</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Datum</th>
                    <th>Titel</th>
                    <th style="text-align:right;">Einnahme</th>
                    <th style="text-align:right;">Ausgabe</th>
                    <th style="text-align:right;">Laufender Bestand</th>
                </tr>
            </thead>
            <tbody>
                ${zeilenHtml}
            </tbody>
        </table>

        <div class="endbereich">
            <div class="endbestand-box">
                <div class="label">Endbestand</div>
                <div class="wert-gross">${formatEuro(endbestand)}</div>
            </div>
        </div>

        <div class="hinweis">
            Diese Datei wurde aus der Dorf-Buchhaltung exportiert.
            Zum Drucken bitte im Browser öffnen und dort „Drucken“ oder „Als PDF speichern“ wählen.
        </div>
    </div>
</body>
</html>
    `.trim();

    try {
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = baueDateiname(titel);
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 2000);
    } catch (error) {
        alert("HTML-Export konnte nicht erstellt werden: " + String(error));
    }
}