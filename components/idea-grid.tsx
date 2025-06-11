import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface IdeaGridProps {
  ideas: any[];
  currentUserId: string;
}

export function IdeaGrid({ ideas, currentUserId }: IdeaGridProps) {
  if (ideas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <Star className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No ideas found. Be the first to share your innovative concept!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ideas.map((idea) => (
        <Card key={idea.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{idea.title}</CardTitle>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={idea.owner.image ?? ''} />
                    <AvatarFallback>
                      {idea.owner.name?.charAt(0) ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span>{idea.owner.name}</span>
                  <span>•</span>
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(idea.createdAt))} ago</span>
                </div>
              </div>
              <Badge variant={idea.status === 'PITCH' ? 'secondary' : 'default'}>
                {idea.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {idea.description}
            </p>
            
            {idea.skillsNeeded.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium mb-2">Skills Needed:</p>
                <div className="flex flex-wrap gap-1">
                  {idea.skillsNeeded.slice(0, 3).map((skillNeeded: any) => (
                    <Badge key={skillNeeded.skill.id} variant="outline" className="text-xs">
                      {skillNeeded.skill.name}
                    </Badge>
                  ))}
                  {idea.skillsNeeded.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{idea.skillsNeeded.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{idea.members.length} members</span>
              </div>
              <Button asChild size="sm">
                <Link href={`/idea/${idea.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}