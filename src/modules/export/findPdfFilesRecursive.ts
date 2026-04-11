import { readDir } from "@tauri-apps/plugin-fs";

export async function findPdfFilesRecursive(
  path: string,
  normalizePath: (value: string) => string
): Promise<string[]> {
  const entries = await readDir(path);
  let result: string[] = [];

  for (const entry of entries) {
    const entryPath = normalizePath(`${path}/${entry.name}`);

    if (entry.isDirectory) {
      const subFiles = await findPdfFilesRecursive(entryPath, normalizePath);
      result = result.concat(subFiles);
    } else if (entryPath.toLowerCase().endsWith(".pdf")) {
      result.push(entryPath);
    }
  }

  return result;
}
