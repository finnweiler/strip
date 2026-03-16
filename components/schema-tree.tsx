"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { SchemaTreeNode } from "@/components/schema-tree-node";
import { getAllPaths, type SchemaNode } from "@/lib/json-schema";

interface SchemaTreeProps {
  schema: SchemaNode;
  excludedPaths: Set<string>;
  onToggle: (path: string) => void;
  onToggleWithChildren: (node: SchemaNode, exclude: boolean) => void;
}

export function SchemaTree({
  schema,
  excludedPaths,
  onToggle,
  onToggleWithChildren,
}: SchemaTreeProps) {
  const allPaths = getAllPaths(schema);
  const excludedCount = allPaths.filter((p) => excludedPaths.has(p)).length;
  const allExcluded = excludedCount === allPaths.length;

  const handleSelectAll = () => {
    onToggleWithChildren(schema, !allExcluded);
  };

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
      <ScrollArea className="max-h-[450px]">
        <div className="pr-3">
          <SchemaTreeNode
            node={schema}
            excludedPaths={excludedPaths}
            onToggle={onToggle}
            onToggleWithChildren={onToggleWithChildren}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
