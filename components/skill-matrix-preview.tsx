import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import Link from 'next/link';

export async function SkillMatrixPreview() {
  const skills = await prisma.skill.findMany({
    include: {
      users: {
        include: {
          user: true,
        },
        take: 5,
      },
      _count: {
        select: { users: true },
      },
    },
    orderBy: {
      users: {
        _count: 'desc',
      },
    },
    take: 6,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Popular Skills</h2>
        <Button asChild variant="outline">
          <Link href="/skills">
            <Users className="h-4 w-4 mr-2" />
            View Full Matrix
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <Card key={skill.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{skill.name}</CardTitle>
                <Badge variant="secondary">
                  {skill._count.users} experts
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex -space-x-2">
                {skill.users.map((userSkill) => (
                  <Avatar key={userSkill.user.id} className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={userSkill.user.image ?? ''} />
                    <AvatarFallback className="text-xs">
                      {userSkill.user.name?.charAt(0) ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {skill._count.users > 5 && (
                  <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs font-medium">
                      +{skill._count.users - 5}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}