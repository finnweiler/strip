"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Minus, Check } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getAllPaths, type SchemaNode } from "@/lib/json-schema";

interface SchemaTreeNodeProps {
  node: SchemaNode;
  excludedPaths: Set<string>;
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

function getCheckState(
  node: SchemaNode,
  excludedPaths: Set<string>
): "checked" | "unchecked" | "indeterminate" {
  const allPaths = getAllPaths(node);
  const excludedCount = allPaths.filter((p) => excludedPaths.has(p)).length;
  if (excludedCount === 0) return "checked";
  if (excludedCount === allPaths.length) return "unchecked";
  return "indeterminate";
}

export function SchemaTreeNode({
  node,
  excludedPaths,
  onToggle,
  onToggleWithChildren,
  depth = 0,
}: SchemaTreeNodeProps) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const checkState = getCheckState(node, excludedPaths);
  const isRoot = node.path === "root";

  const displayKey = isRoot ? "root" : node.key.replace(/\[\]$/, "");

  const handleCheck = () => {
    if (hasChildren) {
      onToggleWithChildren(node, checkState !== "unchecked");
    } else {
      onToggle(node.path);
    }
  };

  const isExcluded = checkState === "unchecked";

  return (
    <div
      className={hasChildren && !isRoot ? "tree-line" : ""}
      style={{ marginLeft: isRoot ? 0 : 16 }}
    >
      <Collapsible open={hasChildren ? open : false} onOpenChange={setOpen}>
        <div className="flex items-center gap-1.5 h-7 group hover:bg-accent/40 rounded px-1.5 -mx-1.5 transition-colors">
          {/* Expand/collapse */}
          {hasChildren ? (
            <CollapsibleTrigger className="p-0.5 hover:bg-accent rounded shrink-0 transition-colors">
              {open ? (
                <ChevronDown className="size-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-3 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
          ) : (
            <span className="w-4 shrink-0" />
          )}

          {/* Checkbox */}
          <button
            onClick={handleCheck}
            className="flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-all duration-150 data-[state=checked]:border-teal data-[state=checked]:bg-teal data-[state=checked]:text-background data-[state=indeterminate]:border-teal/60 data-[state=indeterminate]:bg-teal/20 data-[state=indeterminate]:text-teal data-[state=unchecked]:border-border data-[state=unchecked]:bg-transparent"
            data-state={checkState}
          >
            {checkState === "checked" && <Check className="size-2.5" strokeWidth={3} />}
            {checkState === "indeterminate" && <Minus className="size-2.5" strokeWidth={3} />}
          </button>

          {/* Field name */}
          <span
            className={`text-[13px] font-mono truncate transition-colors ${
              isExcluded ? "text-muted-foreground/40 line-through decoration-muted-foreground/20" : "text-foreground"
            }`}
          >
            {displayKey}
          </span>

          {/* Type indicator */}
          <span
            className={`text-[10px] font-mono ${TYPE_COLORS[node.type] || "text-muted-foreground"} ${
              isExcluded ? "opacity-30" : "opacity-60"
            }`}
          >
            {node.type === "array" ? `${node.type}[]` : node.type}
          </span>

          {/* Occurrence count */}
          {node.occurrence !== undefined &&
            node.totalParent !== undefined &&
            node.occurrence < node.totalParent && (
              <span className="text-[10px] text-muted-foreground/50 ml-auto shrink-0 font-mono tabular-nums">
                {node.occurrence}/{node.totalParent}
              </span>
            )}
        </div>

        {hasChildren && (
          <CollapsibleContent>
            {node.children!.map((child) => (
              <SchemaTreeNode
                key={child.path}
                node={child}
                excludedPaths={excludedPaths}
                onToggle={onToggle}
                onToggleWithChildren={onToggleWithChildren}
                depth={depth + 1}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}
