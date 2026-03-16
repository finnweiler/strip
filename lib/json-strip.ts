export type ParseResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

export function tryParseJson(input: string): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "" };
  try {
    return { ok: true, data: JSON.parse(trimmed) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function stripJson(
  data: unknown,
  excludedPaths: Set<string>,
  currentPath: string = "root"
): unknown {
  if (data === null || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    const itemPath = `${currentPath}[]`;
    return data.map((item) => stripJson(item, excludedPaths, itemPath));
  }

  const obj = data as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(obj)) {
    const childPath = `${currentPath}.${key}`;
    if (excludedPaths.has(childPath)) continue;
    result[key] = stripJson(obj[key], excludedPaths, childPath);
  }

  return result;
}

export function byteSize(str: string): number {
  return new TextEncoder().encode(str).length;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
