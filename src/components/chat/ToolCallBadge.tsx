"use client";

import { Loader2 } from "lucide-react";

interface ToolCallBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: string;
}

function getLabel(toolName: string, args: Record<string, unknown>): string {
  const path = typeof args.path === "string" ? args.path : null;
  const filename = path ? path.split("/").pop() ?? path : null;

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return filename ? `Creating ${filename}` : "Creating file";
      case "str_replace":
      case "insert":
        return filename ? `Editing ${filename}` : "Editing file";
      case "view":
        return filename ? `Reading ${filename}` : "Reading file";
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "delete":
        return filename ? `Deleting ${filename}` : "Deleting file";
      case "rename": {
        const newPath = typeof args.new_path === "string" ? args.new_path : null;
        const newFilename = newPath ? newPath.split("/").pop() ?? newPath : null;
        return filename && newFilename
          ? `Renaming ${filename} to ${newFilename}`
          : "Renaming file";
      }
    }
  }

  return toolName;
}

export function ToolCallBadge({ toolName, args, state }: ToolCallBadgeProps) {
  const done = state === "result";
  const label = getLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {done ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 shrink-0" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
