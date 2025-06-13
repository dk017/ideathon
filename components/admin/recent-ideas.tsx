"use client";

import { Idea, User } from "@prisma/client";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RecentIdeasProps {
  ideas: (Idea & {
    owner: Pick<User, "name" | "image">;
    _count: {
      members: number;
    };
  })[];
}

export function RecentIdeas({ ideas }: RecentIdeasProps) {
  if (ideas.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent ideas</p>;
  }

  return (
    <div className="space-y-4">
      {ideas.map((idea) => (
        <Link key={idea.id} href={`/admin/ideas/${idea.id}`} className="block">
          <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors">
            <div className="space-y-1">
              <p className="font-medium leading-none">{idea.title}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={idea.owner.image || undefined} />
                  <AvatarFallback>
                    {idea.owner.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <span>{idea.owner.name}</span>
                <span>•</span>
                <span>{idea._count.members} members</span>
                <span>•</span>
                <span>{format(new Date(idea.createdAt), "MMM d, yyyy")}</span>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "capitalize",
                idea.status === "ACTIVE" && "bg-green-500/10 text-green-500",
                idea.status === "DRAFT" && "bg-yellow-500/10 text-yellow-500",
                idea.status === "ARCHIVED" && "bg-gray-500/10 text-gray-500"
              )}
            >
              {idea.status.toLowerCase()}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}
