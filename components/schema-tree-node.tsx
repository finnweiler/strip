"use client";

import { memo, useState, useCallback } from "react";
import type { SchemaNode } from "@/lib/json-schema";
import { formatBytes } from "@/lib/json-strip";
import type { CheckState } from "@/hooks/use-json-stripper";

interface SchemaTreeNodeProps {
  node: SchemaNode;
  checkStates: Map<string, CheckState>;
  pathSizes: Map<string, number>;
  onToggle: (path: string) => void;
  onToggleWithChildren: (node: SchemaNode, exclude: boolean) => void;
  depth?: number;
}

const TYPE_COLORS: Record<string, string> = {
  string: "text-green-400",
  number: "text-blue-400",
  boolean: "text-yellow-400",
  null: "text-gray-500",
  object: "text-purple-400",
  array: "text-orange-400",
  mixed: "text-red-400",
};

function SchemaTreeNodeInner({
  node,
  checkStates,
  pathSizes,
  onToggle,
  onToggleWithChildren,
  depth = 0,
}: SchemaTreeNodeProps) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const checkState = checkStates.get(node.path) ?? "checked";
  const isRoot = node.path === "root";

  const displayKey = isRoot ? "root" : node.key.replace(/\[\]$/, "");

  const handleCheck = useCallback(() => {
    if (hasChildren) {
      onToggleWithChildren(node, checkState !== "unchecked");
    } else {
      onToggle(node.path);
    }
  }, [hasChildren, node, checkState, onToggle, onToggleWithChildren]);

  const handleToggleOpen = useCallback(() => {
    setOpen((o) => !o);
  }, []);

  const isExcluded = checkState === "unchecked";

  return (
    <div
      className={hasChildren && !isRoot ? "tree-line" : ""}
      style={{ marginLeft: isRoot ? 0 : 16 }}
    >
      <div className="flex items-center gap-1.5 h-7 group hover:bg-accent/40 rounded px-1.5 -mx-1.5 transition-colors">
        {hasChildren ? (
          <button
            onClick={handleToggleOpen}
            className="p-0.5 hover:bg-accent rounded shrink-0 transition-colors flex items-center justify-center w-4 h-4"
          >
            <svg
              className="size-3 text-muted-foreground transition-transform duration-150"
              style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        <button
          onClick={handleCheck}
          className="flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-all duration-150 data-[state=checked]:border-teal data-[state=checked]:bg-teal data-[state=checked]:text-background data-[state=indeterminate]:border-teal/60 data-[state=indeterminate]:bg-teal/20 data-[state=indeterminate]:text-teal data-[state=unchecked]:border-border data-[state=unchecked]:bg-transparent"
          data-state={checkState}
        >
          {checkState === "checked" && (
            <svg className="size-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
          {checkState === "indeterminate" && (
            <svg className="size-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
            </svg>
          )}
        </button>

        <span
          className={`text-[13px] font-mono truncate transition-colors ${
            isExcluded ? "text-muted-foreground/40 line-through decoration-muted-foreground/20" : "text-foreground"
          }`}
        >
          {displayKey}
        </span>

        <span
          className={`text-[10px] font-mono ${TYPE_COLORS[node.type] || "text-muted-foreground"} ${
            isExcluded ? "opacity-30" : "opacity-60"
          }`}
        >
          {node.type === "array" ? `${node.type}[]` : node.type}
        </span>

        <span className="ml-auto shrink-0 flex items-center gap-2">
          {node.occurrence !== undefined &&
            node.totalParent !== undefined &&
            node.occurrence < node.totalParent && (
              <span className="text-[10px] text-muted-foreground/50 font-mono tabular-nums">
                {node.occurrence}/{node.totalParent}
              </span>
            )}
          {pathSizes.has(node.path) && (
            <span className={`text-[10px] font-mono tabular-nums ${isExcluded ? "text-teal/40" : "text-muted-foreground/50"}`}>
              {formatBytes(pathSizes.get(node.path)!)}
            </span>
          )}
        </span>
      </div>

      {hasChildren && open && node.children!.map((child) => (
        <SchemaTreeNode
          key={child.path}
          node={child}
          checkStates={checkStates}
          pathSizes={pathSizes}
          onToggle={onToggle}
          onToggleWithChildren={onToggleWithChildren}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export const SchemaTreeNode = memo(SchemaTreeNodeInner, (prev, next) => {
  if (prev.node !== next.node) return false;
  if (prev.onToggle !== next.onToggle) return false;
  if (prev.onToggleWithChildren !== next.onToggleWithChildren) return false;
  if (prev.pathSizes !== next.pathSizes) return false;
  if (prev.depth !== next.depth) return false;

  const prevState = prev.checkStates.get(prev.node.path);
  const nextState = next.checkStates.get(next.node.path);
  if (prevState !== nextState) return false;

  if (nextState === "indeterminate") {
    return !hasDescendantChange(prev.node, prev.checkStates, next.checkStates);
  }

  return true;
});

SchemaTreeNode.displayName = "SchemaTreeNode";

function hasDescendantChange(
  node: SchemaNode,
  prevMap: Map<string, CheckState>,
  nextMap: Map<string, CheckState>
): boolean {
  if (!node.children) return false;
  for (const child of node.children) {
    if (prevMap.get(child.path) !== nextMap.get(child.path)) return true;
    if (hasDescendantChange(child, prevMap, nextMap)) return true;
  }
  return false;
}
