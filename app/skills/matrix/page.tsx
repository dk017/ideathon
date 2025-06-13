"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const skillCategories = [
  "PROGRAMMING",
  "DESIGN",
  "BUSINESS",
  "MARKETING",
  "OTHER",
];
const skillLevels = ["BEGINNER", "INTERMEDIATE", "EXPERT"];

export default function SkillMatrixPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [skill, setSkill] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (skill) params.append("skill", skill);
    if (category) params.append("category", category);
    if (level) params.append("level", level);
    fetch(`/api/skill-matrix?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .finally(() => setLoading(false));
  }, [skill, category, level]);

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-4">Skill Matrix</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Search by skill name..."
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="md:w-1/3"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="md:w-40 w-full">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {skillCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="md:w-40 w-full">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Levels</SelectItem>
            {skillLevels.map((lvl) => (
              <SelectItem key={lvl} value={lvl}>
                {lvl}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {loading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : users.length === 0 ? (
        <div className="text-center text-muted-foreground">No users found.</div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback>{user.name?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg font-semibold leading-tight">
                    {user.name}
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((userSkill: any) => (
                    <Badge
                      key={userSkill.skill.id}
                      variant="outline"
                      className="text-xs"
                    >
                      {userSkill.skill.name}
                      <span className="ml-1 text-muted-foreground">
                        ({userSkill.level.toLowerCase()})
                      </span>
                      <span className="ml-1 text-muted-foreground">
                        [{userSkill.skill.category}]
                      </span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
