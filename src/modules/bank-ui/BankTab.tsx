import BankImportPanel from "./BankImportPanel";

type Props = {
  baseFolder: string;
  year: string;
};

export default function BankTab({
  baseFolder,
  year,
}: Props) {
  return (
    <div
      style={{
        display: "grid",
        gap: 16,
      }}
    >
      <BankImportPanel
        baseFolder={baseFolder}
        year={year}
      />
    </div>
  );
}
