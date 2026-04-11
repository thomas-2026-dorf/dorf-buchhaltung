import { join } from "@tauri-apps/api/path";
import { mkdir } from "@tauri-apps/plugin-fs";

export type StbExportFolders = {
  root: string;
  csv: string;
  belege: string;
};

export async function ensureStbExportFolders(
  baseFolder: string
): Promise<StbExportFolders> {
  const root = await join(baseFolder, "Export-STB");
  const csv = await join(root, "CSV");
  const belege = await join(root, "Belege");

  await mkdir(root, { recursive: true });
  await mkdir(csv, { recursive: true });
  await mkdir(belege, { recursive: true });

  return {
    root,
    csv,
    belege,
  };
}

export async function testStbExportFolders(baseFolder: string): Promise<string> {
  const folders = await ensureStbExportFolders(baseFolder);
  return folders.root;
}
