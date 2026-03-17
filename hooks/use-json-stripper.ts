"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { detectSchema, getAllPaths, type SchemaNode } from "@/lib/json-schema";
import {
  tryParseJson,
  formatBytes,
  calculatePathSizes,
  type ParseResult,
} from "@/lib/json-strip";
import type { WorkerRequest, WorkerResponse } from "@/lib/strip-worker";
import { estimateTokenCount } from "tokenx";

export type CheckState = "checked" | "unchecked" | "indeterminate";

function buildCheckStates(
  schema: SchemaNode,
  excludedPaths: Set<string>
): Map<string, CheckState> {
  const result = new Map<string, CheckState>();

  function walk(node: SchemaNode): { total: number; excluded: number } {
    if (!node.children || node.children.length === 0) {
      const ex = excludedPaths.has(node.path) ? 1 : 0;
      result.set(node.path, ex === 1 ? "unchecked" : "checked");
      return { total: 1, excluded: ex };
    }

    let total = 1;
    let excluded = excludedPaths.has(node.path) ? 1 : 0;

    for (const child of node.children) {
      const c = walk(child);
      total += c.total;
      excluded += c.excluded;
    }

    const state: CheckState =
      excluded === 0 ? "checked" : excluded === total ? "unchecked" : "indeterminate";
    result.set(node.path, state);
    return { total, excluded };
  }

  walk(schema);
  return result;
}

export function useJsonStripper() {
  const [rawInput, setRawInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");
  const [excludedPaths, setExcludedPaths] = useState<Set<string>>(new Set());
  const [copiedState, setCopiedState] = useState<"none" | "minified" | "formatted">("none");

  // Worker output state
  const [processing, setProcessing] = useState(false);
  const [minified, setMinified] = useState("");
  const [formatted, setFormatted] = useState("");
  const [stats, setStats] = useState<{
    originalSize: string;
    minifiedSize: string;
    formattedSize: string;
    savedPercent: number;
    formattedTokens: number;
    minifiedTokens: number;
  } | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const pendingRafRef = useRef(0);

  // Initialize worker
  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../lib/strip-worker.ts", import.meta.url)
    );
    workerRef.current.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { id, minified, formatted, minifiedSize, formattedSize, originalSize } = e.data;
      if (id !== requestIdRef.current) return;

      setProcessing(false);
      setMinified(minified);
      setFormatted(formatted);

      const savedPercent =
        originalSize > 0 ? Math.round((1 - minifiedSize / originalSize) * 100) : 0;
      setStats({
        originalSize: formatBytes(originalSize),
        minifiedSize: formatBytes(minifiedSize),
        formattedSize: formatBytes(formattedSize),
        savedPercent: Math.max(0, savedPercent),
        formattedTokens: estimateTokenCount(formatted),
        minifiedTokens: estimateTokenCount(minified),
      });
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Debounce parsing
  useEffect(() => {
    const id = setTimeout(() => setDebouncedInput(rawInput), 200);
    return () => clearTimeout(id);
  }, [rawInput]);

  const parseResult: ParseResult = useMemo(
    () => tryParseJson(debouncedInput),
    [debouncedInput]
  );

  const schema: SchemaNode | null = useMemo(
    () => (parseResult.ok ? detectSchema(parseResult.data) : null),
    [parseResult]
  );

  const checkStates: Map<string, CheckState> = useMemo(() => {
    if (!schema) return new Map();
    return buildCheckStates(schema, excludedPaths);
  }, [schema, excludedPaths]);

  const pathSizes: Map<string, number> = useMemo(() => {
    if (!parseResult.ok) return new Map();
    return calculatePathSizes(parseResult.data);
  }, [parseResult]);

  // Send data to worker only when input changes
  useEffect(() => {
    if (!parseResult.ok || !workerRef.current) return;
    const msg: WorkerRequest = { type: "setData", rawJson: debouncedInput.trim() };
    workerRef.current.postMessage(msg);
  }, [parseResult, debouncedInput]);

  // Send strip on initial parse
  useEffect(() => {
    if (!parseResult.ok || !workerRef.current) {
      setProcessing(false);
      setMinified("");
      setFormatted("");
      setStats(null);
      return;
    }
    setProcessing(true);
    const id = ++requestIdRef.current;
    const msg: WorkerRequest = {
      type: "strip",
      id,
      excludedPaths: Array.from(excludedPaths),
    };
    workerRef.current.postMessage(msg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parseResult]);

  // Defer worker message to next frame so checkbox paint happens first
  const scheduleStripRequest = useCallback((excluded: Set<string>) => {
    cancelAnimationFrame(pendingRafRef.current);
    pendingRafRef.current = requestAnimationFrame(() => {
      if (!workerRef.current) return;
      setProcessing(true);
      const id = ++requestIdRef.current;
      workerRef.current.postMessage({
        type: "strip",
        id,
        excludedPaths: Array.from(excluded),
      } satisfies WorkerRequest);
    });
  }, []);

  const togglePath = useCallback((path: string) => {
    setExcludedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
    // Read the new set after React processes the update — use a microtask
    // to get the committed value, but schedule worker on next frame
    setExcludedPaths((current) => {
      scheduleStripRequest(current);
      return current; // no change, just reading
    });
  }, [scheduleStripRequest]);

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
      setExcludedPaths((current) => {
        scheduleStripRequest(current);
        return current;
      });
    },
    [scheduleStripRequest]
  );

  const reset = useCallback(() => {
    cancelAnimationFrame(pendingRafRef.current);
    setRawInput("");
    setDebouncedInput("");
    setExcludedPaths(new Set());
    setProcessing(false);
    setMinified("");
    setFormatted("");
    setStats(null);
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
    checkStates,
    pathSizes,
    processing,
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
