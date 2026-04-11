import ExportTab from "./ExportTab";

type Props = {
  onBelegExport: () => Promise<void>;
  onPdfExport: () => Promise<void>;
  onKontoExport: () => Promise<void>;
  onStbExport: () => Promise<void>;
  pdfExportLoading: boolean;
};

export default function ExportTabWrapper({
  onBelegExport,
  onPdfExport,
  onKontoExport,
  onStbExport,
  pdfExportLoading,
}: Props) {
  return (
    <ExportTab
      onBelegExport={onBelegExport}
      onPdfExport={onPdfExport}
      onKontoExport={onKontoExport}
      onStbExport={onStbExport}
      pdfExportLoading={pdfExportLoading}
    />
  );
}
