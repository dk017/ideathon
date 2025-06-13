import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { IdeaDetail } from "@/components/idea-detail";

interface IdeaPageProps {
  params: {
    id: string;
  };
}

export default async function IdeaPage({ params }: IdeaPageProps) {
  const session = await auth();

  if (!session?.user) {
    notFound();
  }

  // Ensure user exists in database
  const user = await prisma.user.upsert({
    where: { email: session.user.email! },
    create: {
      email: session.user.email!,
      name: session.user.name || null,
      image: session.user.image || null,
    },
    update: {
      name: session.user.name || undefined,
      image: session.user.image || undefined,
    },
  });

  const ideaId = params.id;
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    include: {
      owner: true,
      skillsNeeded: {
        include: {
          skill: true,
        },
      },
      members: {
        include: {
          user: true,
        },
      },
      joinRequests: {
        include: {
          user: true,
        },
      },
      kanbanCards: {
        include: {
          assignee: true,
        },
      },
    },
  });

  if (!idea) {
    notFound();
  }

  return <IdeaDetail idea={idea} currentUserId={user.id} />;
}
