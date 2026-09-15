import type { MemberRole } from "@/generated/prisma/client";

const rank: Record<MemberRole, number> = {
  VIEWER: 1,
  EDITOR: 2,
  MARKETER: 3,
  ADMIN: 4,
  OWNER: 5,
};

export function hasRole(role: MemberRole, minimum: MemberRole) {
  return rank[role] >= rank[minimum];
}

export const roleLabels: Record<MemberRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MARKETER: "Marketer",
  EDITOR: "Editor",
  VIEWER: "Viewer",
};
