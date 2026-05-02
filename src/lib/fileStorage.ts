import { readFile, writeFile, mkdir, exists } from "@tauri-apps/plugin-fs";

export async function ensureDir(dirPath: string): Promise<void> {
  if (!(await exists(dirPath))) {
    await mkdir(dirPath, { recursive: true });
  }
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const bytes = await readFile(filePath);
    const text = new TextDecoder().decode(bytes);
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  const text = JSON.stringify(data, null, 2);
  const bytes = new TextEncoder().encode(text);
  await writeFile(filePath, bytes);
}
