type Params = {
  handleKontoExport: () => Promise<void>;
  handleBelegExport: () => Promise<void>;
  handlePdfExport: () => Promise<void>;
};

export async function runStbGesamtExport({
  handleKontoExport,
  handleBelegExport,
  handlePdfExport,
}: Params) {
  await handleKontoExport();
  await handleBelegExport();
  await handlePdfExport();
}
