import { cardStyle } from "../../design/styles";
import type { Beleg } from "../../lib/belege";
import BelegSuchePanel from "./BelegSuchePanel";

type Props = {
  baseFolder: string;
  year: string;
  loadGespeichertenBeleg: (beleg: Beleg) => void | Promise<void>;
};

export default function SucheTab({
  baseFolder,
  year,
  loadGespeichertenBeleg,
}: Props) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          ...cardStyle,
          maxWidth: 760,
        }}
      >
        <BelegSuchePanel
          loadGespeichertenBeleg={loadGespeichertenBeleg}
          baseFolder={baseFolder}
          year={year}
        />
      </div>
    </div>
  );
}
