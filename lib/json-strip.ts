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

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Estimate minified JSON byte size of a value without creating strings */
function estimateJsonSize(value: unknown): number {
  if (value === null) return 4;
  switch (typeof value) {
    case "string":
      // Account for quotes + basic escapes (rough estimate)
      return (value as string).length + 2;
    case "number":
      return String(value).length;
    case "boolean":
      return value ? 4 : 5;
    case "undefined":
      return 0;
    default:
      break;
  }
  if (Array.isArray(value)) {
    let size = 2; // []
    for (let i = 0; i < value.length; i++) {
      if (i > 0) size += 1; // comma
      size += estimateJsonSize(value[i]);
    }
    return size;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj);
  let size = 2; // {}
  for (let i = 0; i < keys.length; i++) {
    if (i > 0) size += 1; // comma
    size += keys[i].length + 3; // "key":
    size += estimateJsonSize(obj[keys[i]]);
  }
  return size;
}

/**
 * Calculate the minified byte size contribution of each schema path.
 * Uses O(N) size estimation — no JSON.stringify calls.
 */
export function calculatePathSizes(
  data: unknown,
  currentPath: string = "root"
): Map<string, number> {
  const sizes = new Map<string, number>();

  function walk(value: unknown, path: string) {
    if (value === null || typeof value !== "object") {
      return;
    }

    if (Array.isArray(value)) {
      const itemPath = `${path}[]`;
      for (const item of value) {
        walk(item, itemPath);
      }
      return;
    }

    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);

    for (const key of keys) {
      const childPath = `${path}.${key}`;
      const childValue = obj[key];
      // "key":value + comma ≈ key.length + 3 + valueSize + 1
      const fieldSize = key.length + 4 + estimateJsonSize(childValue);
      sizes.set(childPath, (sizes.get(childPath) || 0) + fieldSize);
      walk(childValue, childPath);
    }
  }

  walk(data, currentPath);
  return sizes;
}
