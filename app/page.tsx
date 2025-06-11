import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session.user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Discover ideas, collaborate with teammates, and bring innovations to
          life.
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard userId={session.user?.id as string} />
      </Suspense>
    </div>
  );
}
