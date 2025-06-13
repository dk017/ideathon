import { auth } from "@/lib/auth";
import { UserRole } from "@/types";

export async function getUserRole(): Promise<UserRole | null> {
  const session = await auth();
  return session?.user?.role || null;
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === UserRole.ADMIN;
}

export async function requireAdmin() {
  const isUserAdmin = await isAdmin();
  if (!isUserAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }
}

export function hasRequiredRole(userRole: UserRole | null, requiredRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
} 