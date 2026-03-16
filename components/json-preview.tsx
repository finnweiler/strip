"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, Minimize2, Code2, FileJson } from "lucide-react";

interface JsonPreviewProps {
  formatted: string;
  minified: string;
  stats: {
    originalSize: string;
    minifiedSize: string;
    formattedSize: string;
    savedPercent: number;
  } | null;
  copiedState: "none" | "minified" | "formatted";
  onCopy: (type: "minified" | "formatted") => void;
}

export function JsonPreview({
  formatted,
  minified,
  stats,
  copiedState,
  onCopy,
}: JsonPreviewProps) {
  const hasOutput = formatted.length > 0;
  const [activeTab, setActiveTab] = useState<"formatted" | "minified">("formatted");

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
        {stats && (
          <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
            {activeTab === "formatted" ? stats.formattedSize : stats.minifiedSize}
          </span>
        )}
      </div>

      {/* Code area */}
      {!hasOutput ? (
        <div className="flex flex-col items-center justify-center h-[320px] text-muted-foreground/40 gap-3">
          <FileJson className="size-10 stroke-[1]" />
          <span className="text-xs font-mono">Paste JSON to see output</span>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="code-surface p-4">
            <pre className="text-[12px] font-mono leading-[1.7] text-foreground/85">
              {activeTab === "formatted" ? formatted : (
                <span className="break-all whitespace-pre-wrap">{minified}</span>
              )}
            </pre>
          </div>
        </ScrollArea>
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
}
