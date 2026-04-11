type Params = {
  selectedFilename: string;
  runOcrForFilename: (filename: string) => Promise<void>;
};

export async function runOcrTestAction({
  selectedFilename,
  runOcrForFilename,
}: Params) {
  await runOcrForFilename(selectedFilename);
}
