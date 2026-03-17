"use client";

import { memo, useState, useMemo } from "react";
import { Copy, Check, Minimize2, Code2, FileJson, Loader2 } from "lucide-react";

const MAX_DISPLAY_LINES = 500;

interface JsonPreviewProps {
  formatted: string;
  minified: string;
  stats: {
    originalSize: string;
    minifiedSize: string;
    formattedSize: string;
    savedPercent: number;
    formattedTokens: number;
    minifiedTokens: number;
  } | null;
  processing: boolean;
  copiedState: "none" | "minified" | "formatted";
  onCopy: (type: "minified" | "formatted") => void;
}

export const JsonPreview = memo(function JsonPreview({
  formatted,
  minified,
  stats,
  processing,
  copiedState,
  onCopy,
}: JsonPreviewProps) {
  const hasOutput = formatted.length > 0;
  const [activeTab, setActiveTab] = useState<"formatted" | "minified">("formatted");

  // Truncate display for large outputs — copy still gets the full content
  const { displayText, isTruncated, totalLines } = useMemo(() => {
    const text = activeTab === "formatted" ? formatted : minified;
    if (activeTab === "minified") {
      const truncated = text.length > 100_000;
      return {
        displayText: truncated ? text.slice(0, 100_000) : text,
        isTruncated: truncated,
        totalLines: 1,
      };
    }
    const lines = text.split("\n");
    if (lines.length <= MAX_DISPLAY_LINES) {
      return { displayText: text, isTruncated: false, totalLines: lines.length };
    }
    return {
      displayText: lines.slice(0, MAX_DISPLAY_LINES).join("\n"),
      isTruncated: true,
      totalLines: lines.length,
    };
  }, [activeTab, formatted, minified]);

  return (
    <div className="flex flex-col">
      {/* Tab bar header */}
      <div className="flex items-center justify-between border-b border-border px-4 h-11">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("formatted")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono rounded transition-colors ${
              activeTab === "formatted"
                ? "text-foreground bg-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="size-3" />
            Formatted
          </button>
          <button
            onClick={() => setActiveTab("minified")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono rounded transition-colors ${
              activeTab === "minified"
                ? "text-foreground bg-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Minimize2 className="size-3" />
            Minified
          </button>
        </div>
        <div className="flex items-center gap-2">
          {processing && (
            <Loader2 className="size-3 text-teal animate-spin" />
          )}
          {stats && (
            <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
              {activeTab === "formatted" ? stats.formattedSize : stats.minifiedSize}
              {" · "}
              {(activeTab === "formatted" ? stats.formattedTokens : stats.minifiedTokens).toLocaleString()} tokens
            </span>
          )}
        </div>
      </div>

      {/* Code area */}
      {!hasOutput ? (
        <div className="flex flex-col items-center justify-center h-[320px] text-muted-foreground/40 gap-3">
          {processing ? (
            <>
              <Loader2 className="size-8 stroke-[1] text-teal/40 animate-spin" />
              <span className="text-xs font-mono">Processing...</span>
            </>
          ) : (
            <>
              <FileJson className="size-10 stroke-[1]" />
              <span className="text-xs font-mono">Paste JSON to see output</span>
            </>
          )}
        </div>
      ) : (
        <div className="relative">
          {processing && (
            <div className="absolute inset-0 z-10 bg-card/60 backdrop-blur-[1px] flex items-center justify-center">
              <Loader2 className="size-5 text-teal animate-spin" />
            </div>
          )}
          <div className="h-[400px] overflow-auto">
            <div className="code-surface p-4 min-w-0">
              <pre className="text-[12px] font-mono leading-[1.7] text-foreground/85 overflow-x-auto">
                {activeTab === "minified" ? (
                  <span className="break-all whitespace-pre-wrap">{displayText}</span>
                ) : (
                  displayText
                )}
              </pre>
              {isTruncated && (
                <div className="mt-3 pt-3 border-t border-border text-[11px] font-mono text-muted-foreground/50 text-center">
                  Showing {MAX_DISPLAY_LINES} of {totalLines.toLocaleString()} lines — full content available via copy
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action bar */}
      {hasOutput && (
        <div className="flex border-t border-border">
          <button
            onClick={() => onCopy("formatted")}
            className="flex-1 flex items-center justify-center gap-2 h-10 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors border-r border-border"
          >
            {copiedState === "formatted" ? (
              <>
                <Check className="size-3 text-teal" />
                <span className="text-teal">copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                copy formatted
              </>
            )}
          </button>
          <button
            onClick={() => onCopy("minified")}
            className="flex-1 flex items-center justify-center gap-2 h-10 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
          >
            {copiedState === "minified" ? (
              <>
                <Check className="size-3 text-teal" />
                <span className="text-teal">copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                copy minified
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
});
