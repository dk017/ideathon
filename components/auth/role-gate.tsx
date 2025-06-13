"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@/types";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGate({ children, allowedRoles }: RoleGateProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}
