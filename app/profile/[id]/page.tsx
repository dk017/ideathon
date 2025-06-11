import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserProfile } from '@/components/user-profile';

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
      memberships: {
        include: {
          idea: true,
        },
      },
      ideasOwned: true,
    },
  });

  if (!user) {
    notFound();
  }

  const isOwnProfile = session.user?.id === params.id;

  return <UserProfile user={user} isOwnProfile={isOwnProfile} />;
}