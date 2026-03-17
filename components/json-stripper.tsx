"use client";

import { useJsonStripper } from "@/hooks/use-json-stripper";
import { JsonInput } from "@/components/json-input";
import { SchemaTree } from "@/components/schema-tree";
import { JsonPreview } from "@/components/json-preview";
import { ThemeToggle } from "@/components/theme-toggle";
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
    <main className="min-h-screen bg-background bg-dot-grid">
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
            <div className="flex items-center gap-1 border-l border-border pl-3 ml-1">
              <a
                href="https://github.com/finnweiler/strip"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 h-7 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="View on GitHub"
              >
                <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <ThemeToggle />
            </div>
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
    </main>
  );
}
