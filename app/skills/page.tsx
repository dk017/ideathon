import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SkillMatrix } from "@/components/skill-matrix";

export default async function SkillsPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Skill Matrix</h1>
      <SkillMatrix userId={session.user.id} />
    </div>
  );
}
