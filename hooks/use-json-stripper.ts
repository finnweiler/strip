"use client";

import { useState, useMemo, useCallback } from "react";
import { detectSchema, getAllPaths, type SchemaNode } from "@/lib/json-schema";
import {
  tryParseJson,
  stripJson,
  byteSize,
  formatBytes,
  type ParseResult,
} from "@/lib/json-strip";

export function useJsonStripper() {
  const [rawInput, setRawInput] = useState("");
  const [excludedPaths, setExcludedPaths] = useState<Set<string>>(new Set());
  const [copiedState, setCopiedState] = useState<
    "none" | "minified" | "formatted"
  >("none");

  const parseResult: ParseResult = useMemo(
    () => tryParseJson(rawInput),
    [rawInput]
  );

  const schema: SchemaNode | null = useMemo(
    () => (parseResult.ok ? detectSchema(parseResult.data) : null),
    [parseResult]
  );

  const strippedData = useMemo(() => {
    if (!parseResult.ok) return null;
    return stripJson(parseResult.data, excludedPaths);
  }, [parseResult, excludedPaths]);

  const minified = useMemo(
    () => (strippedData !== null ? JSON.stringify(strippedData) : ""),
    [strippedData]
  );

  const formatted = useMemo(
    () => (strippedData !== null ? JSON.stringify(strippedData, null, 2) : ""),
    [strippedData]
  );

  const stats = useMemo(() => {
    if (!parseResult.ok || strippedData === null) return null;
    const originalSize = byteSize(rawInput.trim());
    const minifiedSize = byteSize(minified);
    const formattedSize = byteSize(formatted);
    const savedPercent =
      originalSize > 0
        ? Math.round((1 - minifiedSize / originalSize) * 100)
        : 0;
    return {
      originalSize: formatBytes(originalSize),
      minifiedSize: formatBytes(minifiedSize),
      formattedSize: formatBytes(formattedSize),
      savedPercent: Math.max(0, savedPercent),
    };
  }, [rawInput, parseResult, strippedData, minified, formatted]);

  const togglePath = useCallback(
    (path: string) => {
      setExcludedPaths((prev) => {
        const next = new Set(prev);
        if (next.has(path)) {
          next.delete(path);
        } else {
          next.add(path);
        }
        return next;
      });
    },
    []
  );

  const togglePathWithChildren = useCallback(
    (node: SchemaNode, exclude: boolean) => {
      const paths = getAllPaths(node);
      setExcludedPaths((prev) => {
        const next = new Set(prev);
        for (const p of paths) {
          if (exclude) {
            next.add(p);
          } else {
            next.delete(p);
          }
        }
        return next;
      });
    },
    []
  );

  const reset = useCallback(() => {
    setRawInput("");
    setExcludedPaths(new Set());
  }, []);

  const copyToClipboard = useCallback(
    async (type: "minified" | "formatted") => {
      const text = type === "minified" ? minified : formatted;
      await navigator.clipboard.writeText(text);
      setCopiedState(type);
      setTimeout(() => setCopiedState("none"), 2000);
    },
    [minified, formatted]
  );

  return {
    rawInput,
    setRawInput,
    parseResult,
    schema,
    excludedPaths,
    strippedData,
    minified,
    formatted,
    stats,
    togglePath,
    togglePathWithChildren,
    reset,
    copyToClipboard,
    copiedState,
  };
}
