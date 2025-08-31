import { CFG } from "./config";

export function isAdmin(userId?: number): boolean {
  if (!userId) return false;
  return CFG.adminUserIds.includes(userId);
}
