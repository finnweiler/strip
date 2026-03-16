"use client";

import { memo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Trash2 } from "lucide-react";
import type { ParseResult } from "@/lib/json-strip";

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
  parseResult: ParseResult;
  onReset: () => void;
}

export const JsonInput = memo(function JsonInput({
  value,
  onChange,
  parseResult,
  onReset,
}: JsonInputProps) {
  const showError = !parseResult.ok && parseResult.error !== "";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-teal/60" />
          <span className="text-xs font-medium font-mono uppercase tracking-wider text-muted-foreground">
            Input
          </span>
        </div>
        {value && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
          >
            <Trash2 className="size-3" />
            clear
          </button>
        )}
      </div>
      <div className="relative">
        <textarea
          placeholder='{"paste": "your JSON here"}'
          className="w-full min-h-[220px] rounded-lg border border-border bg-background/60 px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground placeholder:text-muted-foreground/40 resize-y focus:outline-none focus:glow-teal focus:border-teal/30 transition-shadow"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
        {!value && (
          <div className="absolute bottom-3 right-3 text-[10px] font-mono text-muted-foreground/30 pointer-events-none">
            ⌘V to paste
          </div>
        )}
      </div>
      {showError && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
          <AlertCircle className="size-3.5" />
          <AlertDescription className="text-xs font-mono">
            {parseResult.error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
});
