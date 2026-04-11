import { appStyles as styles } from "../../styles/appStyles";

type Props = {
  files: string[];
  onSelectFile: (filename: string) => void;
};

export default function BelegListe({ files, onSelectFile }: Props) {
  if (files.length === 0) {
    return null;
  }

  return (
    <>
      <p style={{ marginTop: 10, fontWeight: 700 }}>
        Gefunden: {files.length} Datei(en)
      </p>

      <ul style={styles.list}>
        {files.map((file) => (
          <li
            key={file}
            style={{ ...styles.mono, cursor: "pointer", color: "#000" }}
            onClick={() => onSelectFile(file)}
          >
            {file}
          </li>
        ))}
      </ul>
    </>
  );
}