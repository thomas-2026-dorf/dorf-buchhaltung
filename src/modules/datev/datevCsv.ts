export type DatevSourceBeleg = {
    id?: string;
    datum?: string;
    betrag?: number | string;
    konto?: string | number;
    gegenkonto?: string | number;
    lieferant?: string;
    notiz?: string;
    fewo?: string;
    typ?: "erloes" | "eingang" | string;
};

type DatevRow = {
    umsatz: string;
    sollHaben: "S" | "H";
    wkz: string;
    konto: string;
    gegenkonto: string;
    belegdatum: string;
    buchungstext: string;
    belegfeld1: string;
};

function escapeCsv(value: string): string {
    const safe = String(value ?? "").replace(/"/g, '""');
    return `"${safe}"`;
}

function formatAmount(value: number | string | undefined): string {
    const num =
        typeof value === "number"
            ? value
            : Number(String(value ?? "0").replace(",", "."));

    if (!Number.isFinite(num)) return "0,00";

    return num.toFixed(2).replace(".", ",");
}

function pad2(value: string | number): string {
    return String(value).padStart(2, "0");
}

function formatDate(value?: string): string {
    if (!value) return "";

    const raw = String(value).trim();

    // Format: 2025-03-21
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const [y, m, d] = raw.split("-");
        return `${pad2(d)}${pad2(m)}${y}`;
    }

    // Format: 2025-3-2
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(raw)) {
        const [y, m, d] = raw.split("-");
        return `${pad2(d)}${pad2(m)}${y}`;
    }

    // Format: 21.03.2025 oder 5.6.2024
    if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(raw)) {
        const [d, m, y] = raw.split(".");
        return `${pad2(d)}${pad2(m)}${y}`;
    }

    // Fallback für ISO mit Uhrzeit
    const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T/);
    if (isoMatch) {
        const [, y, m, d] = isoMatch;
        return `${pad2(d)}${pad2(m)}${y}`;
    }

    return raw;
}

function buildBuchungstext(beleg: DatevSourceBeleg): string {
    const parts = [
        beleg.lieferant?.trim(),
        beleg.notiz?.trim(),
        beleg.fewo ? `FeWo ${beleg.fewo}` : "",
    ].filter(Boolean);

    return parts.join(" - ").slice(0, 60);
}

function isErloesKonto(konto: string): boolean {
    const cleaned = konto.trim();

    if (!cleaned) return false;

    // einfache erste Logik:
    // klassische Erlöskonten wie 8xxx => Erlös
    return /^8\d{3,}$/.test(cleaned) || /^8\d{2,}$/.test(cleaned);
}

function getSollHaben(beleg: DatevSourceBeleg): "S" | "H" {
    const typ = String(beleg.typ ?? "").trim().toLowerCase();
    const konto = String(beleg.konto ?? "").trim();

    if (typ === "erloes") return "H";
    if (typ === "eingang") return "S";

    if (isErloesKonto(konto)) return "H";

    return "S";
}

function getGegenkonto(beleg: DatevSourceBeleg): string {
    const typ = String(beleg.typ ?? "").trim().toLowerCase();
    const konto = String(beleg.konto ?? "").trim();

    // wenn manuell gesetzt → IMMER verwenden
    if (beleg.gegenkonto) {
        return String(beleg.gegenkonto).trim();
    }

    // Erlös → Bank
    if (typ === "erloes" || /^8\d+/.test(konto)) {
        return "1200";
    }

    // Eingangsrechnung → Verbindlichkeiten
    if (typ === "eingang") {
        return "1600";
    }

    // fallback
    return "1200";
}

function mapBelegToDatevRow(beleg: DatevSourceBeleg): DatevRow | null {
    const konto = String(beleg.konto ?? "").trim();
    if (!konto) return null;

    const gegenkonto = getGegenkonto(beleg);

    return {
        umsatz: formatAmount(beleg.betrag),
        sollHaben: getSollHaben(beleg),
        wkz: "EUR",
        konto,
        gegenkonto,
        belegdatum: formatDate(beleg.datum),
        buchungstext: buildBuchungstext(beleg),
        belegfeld1: String(beleg.id ?? "").trim(),
    };
}

export function buildDatevCsv(belege: DatevSourceBeleg[]): string {
    const rows = belege
        .map(mapBelegToDatevRow)
        .filter((row): row is DatevRow => row !== null);

    const header = [
        "Umsatz (ohne Soll/Haben-Kz)",
        "Soll/Haben-Kennzeichen",
        "WKZ Umsatz",
        "Konto",
        "Gegenkonto (ohne BU-Schlüssel)",
        "Belegdatum",
        "Buchungstext",
        "Belegfeld 1",
    ];

    const lines = [
        header.map(escapeCsv).join(";"),
        ...rows.map((row) =>
            [
                row.umsatz,
                row.sollHaben,
                row.wkz,
                row.konto,
                row.gegenkonto,
                row.belegdatum,
                row.buchungstext,
                row.belegfeld1,
            ]
                .map(escapeCsv)
                .join(";")
        ),
    ];

    return lines.join("\n");
}

export function downloadDatevCsv(filename: string, csvContent: string) {
    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 1000);
}