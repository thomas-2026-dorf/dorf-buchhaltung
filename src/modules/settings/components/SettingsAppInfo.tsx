import { cardStyle } from "../../../design/styles";

export default function SettingsAppInfo({
  appType,
  appName,
}: {
  appType: string;
  appName: string;
}) {
  return (
    <div style={cardStyle}>
      <div style={{ fontWeight: 700, marginBottom: 12 }}>App</div>

      <div style={{ display: "grid", gap: 8 }}>
        <div>
          <strong>App-Typ:</strong> {appType}
        </div>
        <div>
          <strong>App-Name:</strong> {appName}
        </div>
      </div>
    </div>
  );
}
