import AusgangTab from "./AusgangTab";

type Props = {
  baseFolder: string;
  year: string;
};

export default function AusgangTabWrapper({ baseFolder, year }: Props) {
  return <AusgangTab baseFolder={baseFolder} year={year} />;
}
