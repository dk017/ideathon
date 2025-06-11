'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Plus, X, Calendar, Lightbulb, Users } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface UserProfileProps {
  user: any;
  isOwnProfile: boolean;
}

export function UserProfile({ user, isOwnProfile }: UserProfileProps) {
  const [editing, setEditing] = useState(false);
  const [showSkillDialog, setShowSkillDialog] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    department: user.department || '',
    bio: user.bio || '',
  });

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills');
      const skills = await response.json();
      setAvailableSkills(skills);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Profile updated successfully!');
      setEditing(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkill || !selectedLevel) {
      toast.error('Please select both skill and level');
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skillId: selectedSkill,
          level: selectedLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add skill');
      }

      toast.success('Skill added successfully!');
      setShowSkillDialog(false);
      setSelectedSkill('');
      setSelectedLevel('');
      window.location.reload();
    } catch (error) {
      console.error('Error adding skill:', error);
      toast.error('Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      const response = await fetch(`/api/users/${user.id}/skills/${skillId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove skill');
      }

      toast.success('Skill removed successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error removing skill:', error);
      toast.error('Failed to remove skill');
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.image ?? ''} />
                <AvatarFallback className="text-2xl">
                  {user.name?.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                {editing ? (
                  <div className="space-y-2">
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Full name"
                    />
                    <Input
                      value={profileData.department}
                      onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                      placeholder="Department"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <p className="text-muted-foreground">{user.department || 'No department specified'}</p>
                  </>
                )}
              </div>
            </div>
            
            {isOwnProfile && (
              <div className="flex space-x-2">
                {editing ? (
                  <>
                    <Button onClick={handleSaveProfile}>Save</Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>
          ) : (
            <p className="text-muted-foreground">
              {user.bio || 'No bio provided.'}
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="skills" className="space-y-6">
        <TabsList>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Skills & Expertise</CardTitle>
                {isOwnProfile && (
                  <Dialog open={showSkillDialog} onOpenChange={setShowSkillDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={fetchSkills}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Skill</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Skill</Label>
                          <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a skill" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSkills.map((skill: any) => (
                                <SelectItem key={skill.id} value={skill.id}>
                                  {skill.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Level</Label>
                          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BEGINNER">Beginner</SelectItem>
                              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                              <SelectItem value="EXPERT">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowSkillDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddSkill}>
                            Add Skill
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((userSkill: any) => (
                  <Badge
                    key={userSkill.skill.id}
                    variant={
                      userSkill.level === 'EXPERT' ? 'default' :
                      userSkill.level === 'INTERMEDIATE' ? 'secondary' : 'outline'
                    }
                    className="flex items-center gap-1"
                  >
                    {userSkill.skill.name} ({userSkill.level.toLowerCase()})
                    {isOwnProfile && (
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveSkill(userSkill.skill.id)}
                      />
                    )}
                  </Badge>
                ))}
                {user.skills.length === 0 && (
                  <p className="text-muted-foreground">No skills added yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ideas">
          <div className="space-y-4">
            {user.ideasOwned.map((idea: any) => (
              <Card key={idea.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{idea.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {idea.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(idea.createdAt))} ago</span>
                        </div>
                        <Badge variant="secondary">
                          {idea.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {user.ideasOwned.length === 0 && (
              <div className="text-center py-8">
                <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No ideas created yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <div className="space-y-4">
            {user.memberships.map((membership: any) => (
              <Card key={membership.idea.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{membership.idea.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {membership.idea.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Joined {formatDistanceToNow(new Date(membership.joinedAt))} ago</span>
                        </div>
                        <Badge variant="outline">
                          {membership.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {user.memberships.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No project memberships yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}