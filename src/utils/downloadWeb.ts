const CORS_PROXY = 'https://corsproxy.io/?';

export async function downloadBlob(url: string, filename: string): Promise<void> {
  const tryFetch = async (fetchUrl: string): Promise<Blob> => {
    const response = await fetch(fetchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 14) Books/1.0' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.blob();
  };

  const triggerDownload = (blob: Blob, name: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
  };

  try {
    const blob = await tryFetch(url);
    triggerDownload(blob, filename);
  } catch {
    try {
      const proxyUrl = CORS_PROXY + encodeURIComponent(url);
      const blob = await tryFetch(proxyUrl);
      triggerDownload(blob, filename);
    } catch {
      window.open(url, '_blank');
    }
  }
}
