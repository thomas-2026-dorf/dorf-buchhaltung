import { readDir } from "@tauri-apps/plugin-fs";

function normalizePath(value: string) {
  return value.replace(/\\/g, "/").replace(/\/+$/, "");
}

export async function findPdfsRecursive(path: string): Promise<string[]> {
  const entries = await readDir(path);
  let result: string[] = [];

  for (const entry of entries) {
    const entryPath = normalizePath(path + "/" + entry.name);

    if (entry.isDirectory) {
      const subFiles = await findPdfsRecursive(entryPath);
      result = result.concat(subFiles);
    } else if (entryPath.toLowerCase().endsWith(".pdf")) {
      result.push(entryPath);
    }
  }

  return result;
}
