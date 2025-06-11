"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search, Filter, User } from "lucide-react";
import Link from "next/link";

interface Skill {
  id: string;
  name: string;
}

interface UserSkill {
  skill: Skill;
  level: "BEGINNER" | "INTERMEDIATE" | "EXPERT";
}

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  department: string | null;
  bio: string | null;
  skills: UserSkill[];
}

export function SkillMatrix() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, skillsRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/skills"),
        ]);

        if (!usersRes.ok || !skillsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [usersData, skillsData] = await Promise.all([
          usersRes.json(),
          skillsRes.json(),
        ]);

        setUsers(usersData);
        setFilteredUsers(usersData);
        setSkills(skillsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (skillFilter) {
      filtered = filtered.filter((user) =>
        user.skills.some((userSkill) => userSkill.skill.name === skillFilter)
      );
    }

    if (levelFilter) {
      filtered = filtered.filter((user) =>
        user.skills.some((userSkill) => userSkill.level === levelFilter)
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, skillFilter, levelFilter]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={skillFilter} onValueChange={setSkillFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All skills</SelectItem>
            {skills.map((skill) => (
              <SelectItem key={skill.id} value={skill.name}>
                {skill.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All levels</SelectItem>
            <SelectItem value="BEGINNER">Beginner</SelectItem>
            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
            <SelectItem value="EXPERT">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.image ?? ""} />
                  <AvatarFallback>{user.name?.charAt(0) ?? "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {user.name || "Anonymous"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {user.department || user.email}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {user.bio && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {user.bio}
                </p>
              )}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {user.skills.map((userSkill) => (
                      <Badge
                        key={userSkill.skill.id}
                        variant={
                          userSkill.level === "EXPERT"
                            ? "default"
                            : userSkill.level === "INTERMEDIATE"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {userSkill.skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href={`/profile/${user.id}`}>
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <Filter className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No users found matching your criteria.</p>
          </div>
        </div>
      )}
    </div>
  );
}
