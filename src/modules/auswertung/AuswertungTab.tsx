import { useEffect, useState } from "react";
import {
  ladeAusgangsrechnungen,
  type Ausgangsrechnung,
} from "../../lib/ausgangsrechnungen";
import { ladeBelegeAusJahresdatei, type Beleg } from "../../lib/belege";
import {
  berechneFewoAuswertungen,
  formatEuro,
} from "./auswertungUtils";
import { cardStyle } from "../../design/styles";

type Props = {
  baseFolder: string;
  year: string;
};

export default function AuswertungTab({ baseFolder, year }: Props) {
  const [belege, setBelege] = useState<Beleg[]>([]);
  const [ausgangsrechnungen, setAusgangsrechnungen] = useState<
    Ausgangsrechnung[]
  >([]);
  const [fehler, setFehler] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setFehler("");

        let geladeneBelege: Beleg[] = [];

        try {
          geladeneBelege = await ladeBelegeAusJahresdatei(baseFolder, year);
        } catch (err) {
          console.warn("Belege konnten nicht geladen werden:", err);
        }

        const geladeneAusgangsrechnungen = ladeAusgangsrechnungen().filter(
          (eintrag) => eintrag.jahr === Number(year)
        );

        setBelege(geladeneBelege);
        setAusgangsrechnungen(geladeneAusgangsrechnungen);
      } catch (error) {
        console.error(error);
        setFehler("");
      }
    }

    if (baseFolder && year) {
      void loadData();
    }
  }, [baseFolder, year]);

  const alleDaten = berechneFewoAuswertungen(ausgangsrechnungen, belege);

  const gesamtSumme = alleDaten.reduce(
    (summe, eintrag) => ({
      erloese: summe.erloese + eintrag.erloese,
      ausgaben: summe.ausgaben + eintrag.ausgaben,
      saldo: summe.saldo + eintrag.saldo,
    }),
    {
      erloese: 0,
      ausgaben: 0,
      saldo: 0,
    }
  );

  return (
    <div style={{ padding: 20, display: "grid", gap: 16 }}>
      <h2 style={{ marginTop: 0, marginBottom: 0 }}>Auswertung</h2>

      {fehler ? (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #f0caca",
            background: "#fff5f5",
            color: "#a33",
          }}
        >
          {fehler}
        </div>
      ) : null}

      <div style={cardStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "10px 8px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Einheit
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "10px 8px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Erlöse
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "10px 8px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Ausgaben
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "10px 8px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Saldo
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  padding: "10px 8px",
                  borderBottom: "1px solid #eee",
                }}
              >
                Dorfgemeinschaft Loppersum
              </td>
              <td style={{ padding: "10px 8px", textAlign: "right" }}>
                {formatEuro(gesamtSumme.erloese)} €
              </td>
              <td style={{ padding: "10px 8px", textAlign: "right" }}>
                {formatEuro(gesamtSumme.ausgaben)} €
              </td>
              <td
                style={{
                  padding: "10px 8px",
                  textAlign: "right",
                  fontWeight: 700,
                }}
              >
                {formatEuro(gesamtSumme.saldo)} €
              </td>
            </tr>
          </tbody>
        </table>

        <div
          style={{
            ...cardStyle,
            marginTop: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ color: "#6B7280" }}>Saldo Gesamt</div>

          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: gesamtSumme.saldo >= 0 ? "#166534" : "#B91C1C",
            }}
          >
            {formatEuro(gesamtSumme.saldo)} €
          </div>
        </div>
      </div>
    </div>
  );
}
