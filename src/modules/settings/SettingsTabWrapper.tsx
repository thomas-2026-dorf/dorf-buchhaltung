import SettingsTab from "./SettingsTab";

type Props = {
  year: string;
  onTestbetriebStatusChanged: (aktiv: boolean) => void;
};

export default function SettingsTabWrapper({
  year,
  onTestbetriebStatusChanged,
}: Props) {
  return (
    <SettingsTab
      year={year}
      onTestbetriebStatusChanged={onTestbetriebStatusChanged}
    />
  );
}
