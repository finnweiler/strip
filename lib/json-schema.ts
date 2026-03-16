export type SchemaNodeType =
  | "object"
  | "array"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "mixed";

export interface SchemaNode {
  path: string;
  key: string;
  type: SchemaNodeType;
  children?: SchemaNode[];
  occurrence?: number;
  totalParent?: number;
}

function getType(value: unknown): SchemaNodeType {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value as SchemaNodeType;
}

function mergeObjectSchemas(
  objects: Record<string, unknown>[],
  parentPath: string
): SchemaNode[] {
  const allKeys = new Map<string, unknown[]>();

  for (const obj of objects) {
    for (const key of Object.keys(obj)) {
      if (!allKeys.has(key)) allKeys.set(key, []);
      allKeys.get(key)!.push(obj[key]);
    }
  }

  const children: SchemaNode[] = [];

  for (const [key, values] of allKeys) {
    const childPath = parentPath ? `${parentPath}.${key}` : key;
    const types = new Set(values.map(getType));

    if (types.size === 1) {
      const t = types.values().next().value!;
      if (t === "object") {
        const merged = mergeObjectSchemas(
          values as Record<string, unknown>[],
          childPath
        );
        children.push({
          path: childPath,
          key,
          type: "object",
          children: merged,
          occurrence: values.length,
          totalParent: objects.length,
        });
      } else if (t === "array") {
        const allElements = (values as unknown[][]).flat();
        const arrayChild = detectSchemaInternal(allElements, childPath);
        children.push({
          path: childPath,
          key,
          type: "array",
          children: arrayChild.children,
          occurrence: values.length,
          totalParent: objects.length,
        });
      } else {
        children.push({
          path: childPath,
          key,
          type: t,
          occurrence: values.length,
          totalParent: objects.length,
        });
      }
    } else {
      // Mixed types
      children.push({
        path: childPath,
        key,
        type: "mixed",
        occurrence: values.length,
        totalParent: objects.length,
      });
    }
  }

  return children.sort((a, b) => a.key.localeCompare(b.key));
}

function detectSchemaInternal(
  data: unknown,
  path: string
): SchemaNode {
  if (data === null) {
    return { path, key: pathToKey(path), type: "null" };
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return { path, key: pathToKey(path), type: "array" };
    }

    const elementTypes = new Set(data.map(getType));

    if (elementTypes.size === 1 && elementTypes.has("object")) {
      const itemPath = `${path}[]`;
      const merged = mergeObjectSchemas(
        data as Record<string, unknown>[],
        itemPath
      );
      return {
        path,
        key: pathToKey(path),
        type: "array",
        children: merged,
      };
    }

    if (elementTypes.size === 1 && elementTypes.has("array")) {
      const allElements = (data as unknown[][]).flat();
      const inner = detectSchemaInternal(allElements, `${path}[]`);
      return {
        path,
        key: pathToKey(path),
        type: "array",
        children: inner.children,
      };
    }

    if (elementTypes.size === 1) {
      const t = elementTypes.values().next().value!;
      return {
        path,
        key: pathToKey(path),
        type: "array",
        children: [
          { path: `${path}[]`, key: "items", type: t },
        ],
      };
    }

    return {
      path,
      key: pathToKey(path),
      type: "array",
      children: [
        { path: `${path}[]`, key: "items", type: "mixed" },
      ],
    };
  }

  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const children: SchemaNode[] = Object.keys(obj)
      .sort()
      .map((key) => {
        const childPath = path ? `${path}.${key}` : key;
        return detectSchemaInternal(obj[key], childPath);
      });

    return {
      path,
      key: pathToKey(path),
      type: "object",
      children,
    };
  }

  return {
    path,
    key: pathToKey(path),
    type: getType(data),
  };
}

function pathToKey(path: string): string {
  const parts = path.split(".");
  const last = parts[parts.length - 1] || path;
  return last.replace(/\[\]$/, "");
}

export function detectSchema(data: unknown): SchemaNode {
  return detectSchemaInternal(data, "root");
}

export function getAllPaths(node: SchemaNode): string[] {
  const paths: string[] = [node.path];
  if (node.children) {
    for (const child of node.children) {
      paths.push(...getAllPaths(child));
    }
  }
  return paths;
}

export function getLeafPaths(node: SchemaNode): string[] {
  if (!node.children || node.children.length === 0) {
    return [node.path];
  }
  const paths: string[] = [];
  for (const child of node.children) {
    paths.push(...getLeafPaths(child));
  }
  return paths;
}
