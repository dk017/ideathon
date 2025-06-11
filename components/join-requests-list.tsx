import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Clock, Eye } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface JoinRequestsListProps {
  requests: any[];
}

export function JoinRequestsList({ requests }: JoinRequestsListProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <Eye className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No join requests found. Start exploring ideas to collaborate on!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{request.idea.title}</CardTitle>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={request.idea.owner.image ?? ''} />
                    <AvatarFallback>
                      {request.idea.owner.name?.charAt(0) ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span>by {request.idea.owner.name}</span>
                  <span>•</span>
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(request.createdAt))} ago</span>
                </div>
              </div>
              <Badge 
                variant={
                  request.status === 'PENDING' ? 'secondary' :
                  request.status === 'ACCEPTED' ? 'default' : 'destructive'
                }
              >
                {request.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {request.idea.description}
            </p>
            
            {request.message && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Your message:</p>
                <p className="text-sm">{request.message}</p>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {request.idea.skillsNeeded.slice(0, 3).map((skillNeeded: any) => (
                  <Badge key={skillNeeded.skill.id} variant="outline" className="text-xs">
                    {skillNeeded.skill.name}
                  </Badge>
                ))}
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/idea/${request.idea.id}`}>
                  View Idea
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}