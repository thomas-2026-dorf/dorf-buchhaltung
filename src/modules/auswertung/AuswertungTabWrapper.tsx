import AuswertungTab from "./AuswertungTab";

type Props = {
  baseFolder: string;
  year: string;
};

export default function AuswertungTabWrapper({ baseFolder, year }: Props) {
  return <AuswertungTab baseFolder={baseFolder} year={year} />;
}
