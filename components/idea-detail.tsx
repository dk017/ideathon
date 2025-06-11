'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { KanbanBoard } from '@/components/kanban-board';
import { Users, Calendar, MessageSquare, Star, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface IdeaDetailProps {
  idea: any;
  currentUserId: string;
}

export function IdeaDetail({ idea, currentUserId }: IdeaDetailProps) {
  const [joinMessage, setJoinMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const isOwner = idea.ownerId === currentUserId;
  const isMember = idea.members.some((member: any) => member.userId === currentUserId);
  const hasRequestedToJoin = idea.joinRequests.some(
    (request: any) => request.userId === currentUserId && request.status === 'PENDING'
  );

  const handleJoinRequest = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/ideas/${idea.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: joinMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to send join request');
      }

      toast.success('Join request sent successfully!');
      setShowJoinDialog(false);
      setJoinMessage('');
      // Refresh the page or update state
      window.location.reload();
    } catch (error) {
      console.error('Error sending join request:', error);
      toast.error('Failed to send join request');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('Failed to update request');
      }

      toast.success(`Request ${action}ed successfully!`);
      window.location.reload();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{idea.title}</h1>
            <Badge variant={idea.status === 'PITCH' ? 'secondary' : 'default'}>
              {idea.status}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4 text-muted-foreground mb-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={idea.owner.image ?? ''} />
                <AvatarFallback>
                  {idea.owner.name?.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <span>by {idea.owner.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(idea.createdAt))} ago</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>{idea.members.length} members</span>
            </div>
          </div>
        </div>

        {!isOwner && !isMember && !hasRequestedToJoin && (
          <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Request to Join
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request to Join</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="join-message">Message (optional)</Label>
                  <Textarea
                    id="join-message"
                    placeholder="Tell the team why you'd like to join this idea..."
                    value={joinMessage}
                    onChange={(e) => setJoinMessage(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleJoinRequest} disabled={loading}>
                    {loading ? 'Sending...' : 'Send Request'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {hasRequestedToJoin && (
          <Badge variant="secondary">Request Pending</Badge>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          {isOwner && <TabsTrigger value="requests">Join Requests</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {idea.description}
              </p>
            </CardContent>
          </Card>

          {idea.skillsNeeded.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills Needed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {idea.skillsNeeded.map((skillNeeded: any) => (
                    <Badge key={skillNeeded.skill.id} variant="outline" className="text-sm">
                      {skillNeeded.skill.name}
                      {skillNeeded.level && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({skillNeeded.level.toLowerCase()})
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="team">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {idea.members.map((member: any) => (
              <Card key={member.user.id}>
                <CardContent className="p-4 flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.user.image ?? ''} />
                    <AvatarFallback>
                      {member.user.name?.charAt(0) ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{member.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.role === 'OWNER' ? 'Owner' : 'Contributor'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="kanban">
          <KanbanBoard ideaId={idea.id} cards={idea.kanbanCards} />
        </TabsContent>

        {isOwner && (
          <TabsContent value="requests">
            <div className="space-y-4">
              {idea.joinRequests
                .filter((request: any) => request.status === 'PENDING')
                .map((request: any) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={request.user.image ?? ''} />
                            <AvatarFallback>
                              {request.user.name?.charAt(0) ?? 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(request.createdAt))} ago
                            </p>
                            {request.message && (
                              <p className="text-sm mt-2 p-2 bg-muted rounded">
                                {request.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleRequestAction(request.id, 'accept')}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRequestAction(request.id, 'reject')}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              
              {idea.joinRequests.filter((request: any) => request.status === 'PENDING').length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No pending join requests</p>
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}