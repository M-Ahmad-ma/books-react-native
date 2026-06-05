import * as FileSystem from 'expo-file-system/legacy';

const CACHE_DIR = `${FileSystem.documentDirectory}reader-cache/`;

async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

export function getCachePath(gutenbergId: string): string {
  return `${CACHE_DIR}${gutenbergId}.html`;
}

export async function isCached(gutenbergId: string): Promise<boolean> {
  const info = await FileSystem.getInfoAsync(getCachePath(gutenbergId));
  return info.exists;
}

export async function getCachedUri(gutenbergId: string): Promise<string | null> {
  const path = getCachePath(gutenbergId);
  const info = await FileSystem.getInfoAsync(path);
  return info.exists ? path : null;
}

export async function getCachedContent(gutenbergId: string): Promise<string | null> {
  const path = getCachePath(gutenbergId);
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) return null;
  return await FileSystem.readAsStringAsync(path, { encoding: FileSystem.EncodingType.UTF8 });
}

export async function saveContent(gutenbergId: string, content: string): Promise<string> {
  await ensureDir();
  const path = getCachePath(gutenbergId);
  await FileSystem.writeAsStringAsync(path, content, { encoding: FileSystem.EncodingType.UTF8 });
  return path;
}

export async function downloadToCache(remoteUrl: string, gutenbergId: string): Promise<string> {
  await ensureDir();
  const path = getCachePath(gutenbergId);
  const result = await FileSystem.downloadAsync(remoteUrl, path);
  return result.uri;
}

export async function clearCache(): Promise<void> {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (info.exists) {
    await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
  }
}
