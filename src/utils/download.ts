// Helper utilities to download images, copy assets and export SVG/Canvas

export async function downloadImageByUrl(url: string, filename: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    return true;
  } catch (err) {
    console.error('Download error:', err);
    // Fallback: direct anchor trigger
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.click();
    return false;
  }
}

export function downloadSvgContent(svgString: string, filename: string) {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}

export async function copySvgToClipboard(svgString: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(svgString);
    return true;
  } catch {
    return false;
  }
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function downloadAllGameLogos(
  games: { coverImage: string; originalVercelPath: string; shortName: string }[],
  useVercelNames: boolean = true
) {
  for (let i = 0; i < games.length; i++) {
    const g = games[i];
    const filename = useVercelNames
      ? g.originalVercelPath
      : `${g.shortName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_logo.jpg`;
    await downloadImageByUrl(g.coverImage, filename);
    // Slight delay so the browser doesn't block multiple downloads
    await new Promise((r) => setTimeout(r, 350));
  }
}
