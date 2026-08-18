import fs from "fs";
import path from "path";

export function resolvePdfImage(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const relativePath = url.startsWith("/") ? url.slice(1) : url;
  const localPath = path.join(process.cwd(), "public", relativePath);
  try {
    if (fs.existsSync(localPath)) {
      return localPath;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Collects a pdfkit stream into a real Buffer.
 * In @react-pdf/renderer 4.x, `pdf().toBuffer()` returns the underlying pdfkit
 * *stream* (`fileStream`), not bytes, so it must be drained before sending as a
 * response body.
 */
export async function collectPdfBuffer(
  fileStream: unknown,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of fileStream as AsyncIterable<unknown>) {
    chunks.push(Buffer.from(chunk as Uint8Array));
  }
  return Buffer.concat(chunks);
}
