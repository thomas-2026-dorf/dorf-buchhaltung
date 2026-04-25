import type { Mitglied } from "../types/mitglieder";
import FamilienmitgliederFelder from "./FamilienmitgliederFelder";
import SelectFeld from "./SelectFeld";
import TextFeld from "./TextFeld";

type MitgliedFormularProps = {
  formular: Mitglied;
  setFormular: (mitglied: Mitglied) => void;
  onSpeichern: () => void;
  onZuruecksetzen: () => void;
  onMitgliedsantrag: () => void;
  onAntragEinlesenOcr: () => void;
};

export default function MitgliedFormular({
  formular,
  setFormular,
  onSpeichern,
  onZuruecksetzen,
  onMitgliedsantrag,
  onAntragEinlesenOcr,
}: MitgliedFormularProps) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        background: "#ffffff",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>Neues Mitglied / Antrag</h2>

      {formular.status === "aktiv" && (
        <div
          style={{
            marginBottom: 16,
            padding: 10,
            borderRadius: 8,
            background: "#f1f5f9",
            color: "#334155",
            fontWeight: 600,
          }}
        >
          Mitgliedsnummer: {formular.mitgliedsnummer || "wird beim Speichern vergeben"}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 180px", gap: 12 }}>
        <SelectFeld
          label="Status"
          value={formular.status}
          onChange={(value) => setFormular({ ...formular, status: value as Mitglied["status"] })}
          optionen={[
            { value: "antrag-offen", label: "Antrag offen" },
            { value: "aktiv", label: "Aktiv" },
            { value: "inaktiv", label: "Inaktiv" },
          ]}
        />

        <SelectFeld
          label="Mitgliedsart"
          value={formular.mitgliedsart}
          onChange={(value) =>
            setFormular({ ...formular, mitgliedsart: value as Mitglied["mitgliedsart"] })
          }
          optionen={[
            { value: "aktiv", label: "Aktives Mitglied" },
            { value: "foerder", label: "Fördermitglied" },
          ]}
        />

        <SelectFeld
          label="Aufnahmeart"
          value={formular.aufnahmeart}
          onChange={(value) =>
            setFormular({ ...formular, aufnahmeart: value as Mitglied["aufnahmeart"] })
          }
          optionen={[
            { value: "einzel", label: "Einzelmitglied" },
            { value: "familie", label: "Familie" },
          ]}
        />

        <TextFeld
          label="Eintrittsdatum"
          type="date"
          value={formular.eintrittsdatum}
          onChange={(value) => setFormular({ ...formular, eintrittsdatum: value })}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }}>
        <TextFeld
          label="Vorname"
          value={formular.vorname}
          onChange={(value) => setFormular({ ...formular, vorname: value })}
        />

        <TextFeld
          label="Nachname"
          value={formular.nachname}
          onChange={(value) => setFormular({ ...formular, nachname: value })}
        />

        <TextFeld
          label="Geburtsdatum"
          type="date"
          value={formular.geburtsdatum}
          onChange={(value) => setFormular({ ...formular, geburtsdatum: value })}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: 12, marginTop: 12 }}>
        <TextFeld
          label="Straße"
          value={formular.strasse}
          onChange={(value) => setFormular({ ...formular, strasse: value })}
        />

        <TextFeld
          label="PLZ"
          value={formular.plz}
          onChange={(value) => setFormular({ ...formular, plz: value })}
        />

        <TextFeld
          label="Wohnort"
          value={formular.wohnort}
          onChange={(value) => setFormular({ ...formular, wohnort: value })}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <TextFeld
          label="Telefon"
          value={formular.telefon}
          onChange={(value) => setFormular({ ...formular, telefon: value })}
        />

        <TextFeld
          label="E-Mail"
          type="email"
          value={formular.email}
          onChange={(value) => setFormular({ ...formular, email: value })}
        />
      </div>

      {formular.aufnahmeart === "familie" && (
        <FamilienmitgliederFelder
          familienmitglieder={formular.familienmitglieder}
          onChange={(familienmitglieder) =>
            setFormular({ ...formular, familienmitglieder })
          }
        />
      )}

      <h3 style={{ marginTop: 24, marginBottom: 12 }}>SEPA-Daten</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <TextFeld
          label="Mandatsreferenz"
          value={formular.sepa.mandatsreferenz}
          onChange={(value) =>
            setFormular({
              ...formular,
              sepa: { ...formular.sepa, mandatsreferenz: value },
            })
          }
        />

        <TextFeld
          label="Kontoinhaber"
          value={formular.sepa.kontoinhaber}
          onChange={(value) =>
            setFormular({
              ...formular,
              sepa: { ...formular.sepa, kontoinhaber: value },
            })
          }
        />

        <TextFeld
          label="IBAN"
          value={formular.sepa.iban}
          onChange={(value) =>
            setFormular({
              ...formular,
              sepa: { ...formular.sepa, iban: value },
            })
          }
        />

        <TextFeld
          label="BIC"
          value={formular.sepa.bic}
          onChange={(value) =>
            setFormular({
              ...formular,
              sepa: { ...formular.sepa, bic: value },
            })
          }
        />

        <TextFeld
          label="Kreditinstitut"
          value={formular.sepa.kreditinstitut}
          onChange={(value) =>
            setFormular({
              ...formular,
              sepa: { ...formular.sepa, kreditinstitut: value },
            })
          }
        />

        <TextFeld
          label="Mandat-Datum"
          type="date"
          value={formular.sepa.mandatDatum}
          onChange={(value) =>
            setFormular({
              ...formular,
              sepa: { ...formular.sepa, mandatDatum: value },
            })
          }
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Notiz</label>
        <textarea
          value={formular.notiz}
          onChange={(event) => setFormular({ ...formular, notiz: event.target.value })}
          rows={4}
          style={{
            width: "100%",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            padding: 10,
            font: "inherit",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        <button type="button" onClick={onSpeichern}>
          Mitglied speichern
        </button>
        <button type="button" onClick={onMitgliedsantrag}>
          Mitgliedsantrag erstellen
        </button>
        <button type="button" onClick={onAntragEinlesenOcr}>
          Antrag einlesen (OCR)
        </button>
        <button type="button" onClick={onZuruecksetzen}>
          Formular leeren
        </button>
      </div>
    </div>
  );
}