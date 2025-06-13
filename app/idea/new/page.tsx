import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { IdeaCreationWizard } from "@/components/idea-creation-wizard";

export default async function NewIdeaPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Idea</h1>
        <p className="text-muted-foreground">
          Share your innovative concept and find the perfect team to bring it to
          life
        </p>
      </div>

      <IdeaCreationWizard userId={session.user?.id} />
    </div>
  );
}
