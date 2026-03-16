"use client";

import { useJsonStripper } from "@/hooks/use-json-stripper";
import { JsonInput } from "@/components/json-input";
import { SchemaTree } from "@/components/schema-tree";
import { JsonPreview } from "@/components/json-preview";
import { Scissors, Loader2 } from "lucide-react";

export function JsonStripper() {
  const {
    rawInput,
    setRawInput,
    parseResult,
    schema,
    excludedPaths,
    checkStates,
    pathSizes,
    processing,
    formatted,
    minified,
    stats,
    togglePath,
    togglePathWithChildren,
    reset,
    copyToClipboard,
    copiedState,
  } = useJsonStripper();

  return (
    <div className="min-h-screen bg-background bg-dot-grid">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        {/* Header */}
        <header className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-teal-muted border border-teal/20">
                <Scissors className="size-4 text-teal" />
              </div>
              <h1 className="text-lg font-medium tracking-tight font-mono">
                json<span className="text-teal">strip</span>
              </h1>
            </div>
            <p className="text-[13px] text-muted-foreground mt-2 ml-[42px] font-mono">
              Paste JSON, remove fields you don&apos;t need, copy the result.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground font-mono">
            {processing && (
              <Loader2 className="size-3.5 text-teal animate-spin" />
            )}
            {stats && (
              <>
                <span>{stats.originalSize} in</span>
                <span className="text-teal">→</span>
                <span>{stats.minifiedSize} out</span>
                {stats.savedPercent > 0 && (
                  <span className="text-teal font-medium">
                    -{stats.savedPercent}%
                  </span>
                )}
              </>
            )}
          </div>
        </header>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5">
          {/* Left: Input + Schema */}
          <div className="flex flex-col gap-5">
            <div className="rounded-xl border border-border bg-card p-4">
              <JsonInput
                value={rawInput}
                onChange={setRawInput}
                parseResult={parseResult}
                onReset={reset}
              />
            </div>

            {schema && (
              <div className="rounded-xl border border-border bg-card p-4">
                <SchemaTree
                  schema={schema}
                  checkStates={checkStates}
                  pathSizes={pathSizes}
                  excludedCount={excludedPaths.size}
                  onToggle={togglePath}
                  onToggleWithChildren={togglePathWithChildren}
                />
              </div>
            )}
          </div>

          {/* Right: Preview */}
          <div className="lg:sticky lg:top-6 lg:self-start min-w-0">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <JsonPreview
                formatted={formatted}
                minified={minified}
                stats={stats}
                processing={processing}
                copiedState={copiedState}
                onCopy={copyToClipboard}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
