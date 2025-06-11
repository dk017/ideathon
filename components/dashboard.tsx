import { prisma } from '@/lib/prisma';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IdeaGrid } from '@/components/idea-grid';
import { JoinRequestsList } from '@/components/join-requests-list';
import { SkillMatrixPreview } from '@/components/skill-matrix-preview';

interface DashboardProps {
  userId: string;
}

export async function Dashboard({ userId }: DashboardProps) {
  const [ideas, myRequests, allIdeas] = await Promise.all([
    // User's ideas and memberships
    prisma.idea.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        owner: true,
        skillsNeeded: {
          include: { skill: true }
        },
        members: {
          include: { user: true }
        },
        _count: {
          select: { joinRequests: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    
    // User's join requests
    prisma.joinRequest.findMany({
      where: { userId },
      include: {
        idea: {
          include: {
            owner: true,
            skillsNeeded: {
              include: { skill: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    
    // All ideas for discovery
    prisma.idea.findMany({
      where: {
        status: 'PITCH',
        ownerId: { not: userId },
        members: { none: { userId } }
      },
      include: {
        owner: true,
        skillsNeeded: {
          include: { skill: true }
        },
        members: {
          include: { user: true }
        },
        _count: {
          select: { joinRequests: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 6
    })
  ]);

  return (
    <Tabs defaultValue="ideas" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="ideas">Ideas</TabsTrigger>
        <TabsTrigger value="requests">My Requests</TabsTrigger>
        <TabsTrigger value="skills">Skill Matrix</TabsTrigger>
      </TabsList>
      
      <TabsContent value="ideas" className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">My Ideas & Projects</h2>
          <IdeaGrid ideas={ideas} currentUserId={userId} />
        </div>
        
        {allIdeas.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Discover Ideas</h2>
            <IdeaGrid ideas={allIdeas} currentUserId={userId} />
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="requests">
        <JoinRequestsList requests={myRequests} />
      </TabsContent>
      
      <TabsContent value="skills">
        <SkillMatrixPreview />
      </TabsContent>
    </Tabs>
  );
}