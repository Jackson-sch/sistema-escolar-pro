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
