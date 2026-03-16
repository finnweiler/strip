// Web Worker for expensive JSON strip + stringify operations.
// Receives data once, then only gets lightweight excludedPaths updates on toggles.

import { stripJson } from "./json-strip";

export type WorkerRequest =
  | { type: "setData"; rawJson: string }
  | { type: "strip"; id: number; excludedPaths: string[] };

export interface WorkerResponse {
  id: number;
  minified: string;
  formatted: string;
  minifiedSize: number;
  formattedSize: number;
  originalSize: number;
}

const ctx = self as unknown as Worker;

let cachedData: unknown = null;
let cachedRawLength = 0;

ctx.addEventListener("message", (e: MessageEvent<WorkerRequest>) => {
  const msg = e.data;

  if (msg.type === "setData") {
    cachedData = JSON.parse(msg.rawJson);
    cachedRawLength = msg.rawJson.length;
    return;
  }

  // msg.type === "strip"
  if (cachedData === null) return;

  const excluded = new Set(msg.excludedPaths);
  const stripped = stripJson(cachedData, excluded);
  const minified = JSON.stringify(stripped);
  const formatted = JSON.stringify(stripped, null, 2);

  const response: WorkerResponse = {
    id: msg.id,
    minified,
    formatted,
    minifiedSize: minified.length,
    formattedSize: formatted.length,
    originalSize: cachedRawLength,
  };
  ctx.postMessage(response);
});
