import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SkillMatrix } from "@/components/skill-matrix";

export default async function SkillsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return <SkillMatrix />;
}
