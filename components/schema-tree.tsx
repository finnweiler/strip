"use client";

import { memo, useCallback } from "react";
import { SchemaTreeNode } from "@/components/schema-tree-node";
import type { SchemaNode } from "@/lib/json-schema";
import type { CheckState } from "@/hooks/use-json-stripper";

interface SchemaTreeProps {
  schema: SchemaNode;
  checkStates: Map<string, CheckState>;
  pathSizes: Map<string, number>;
  excludedCount: number;
  onToggle: (path: string) => void;
  onToggleWithChildren: (node: SchemaNode, exclude: boolean) => void;
}

export const SchemaTree = memo(function SchemaTree({
  schema,
  checkStates,
  pathSizes,
  excludedCount,
  onToggle,
  onToggleWithChildren,
}: SchemaTreeProps) {
  const rootState = checkStates.get(schema.path) ?? "checked";
  const allExcluded = rootState === "unchecked";

  const handleSelectAll = useCallback(() => {
    onToggleWithChildren(schema, !allExcluded);
  }, [onToggleWithChildren, schema, allExcluded]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-purple-400/60" />
          <span className="text-xs font-medium font-mono uppercase tracking-wider text-muted-foreground">
            Structure
          </span>
          {excludedCount > 0 && (
            <span className="text-[10px] font-mono text-teal tabular-nums">
              {excludedCount} removed
            </span>
          )}
        </div>
        <button
          onClick={handleSelectAll}
          className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          {allExcluded ? "select all" : "deselect all"}
        </button>
      </div>
      <div className="max-h-[450px] overflow-auto">
        <div className="pr-3">
          <SchemaTreeNode
            node={schema}
            checkStates={checkStates}
            pathSizes={pathSizes}
            onToggle={onToggle}
            onToggleWithChildren={onToggleWithChildren}
          />
        </div>
      </div>
    </div>
  );
});
