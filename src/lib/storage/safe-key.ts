import crypto from "node:crypto";

export function sanitizeFileName(name: string) {
  const base = name.split(/[/\\]/).pop() ?? "file";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "file";
}

export function mediaObjectKey(workspaceId: string, originalName: string) {
  return `workspaces/${workspaceId}/${crypto.randomUUID()}-${sanitizeFileName(originalName)}`;
}
