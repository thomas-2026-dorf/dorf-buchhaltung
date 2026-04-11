import KorrekturTab from "./KorrekturTab";

type Props = {
  baseFolder: string;
};

export default function KorrekturTabWrapper({ baseFolder }: Props) {
  return <KorrekturTab baseFolder={baseFolder} />;
}
