import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Lightbulb, Clock } from "lucide-react";
import Link from "next/link";
import { RecentEvents } from "@/components/admin/recent-events";
import { RecentIdeas } from "@/components/admin/recent-ideas";

export default async function AdminDashboard() {
  // Fetch statistics
  const [totalUsers, totalEvents, totalIdeas, activeEvents] = await Promise.all(
    [
      prisma.user.count(),
      prisma.event.count(),
      prisma.idea.count(),
      prisma.event.count({
        where: {
          status: "ONGOING",
        },
      }),
    ]
  );

  // Fetch recent events and ideas
  const [recentEvents, recentIdeas] = await Promise.all([
    prisma.event.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.idea.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        owner: {
          select: {
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/admin/events/new">Create Event</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/ideas/new">Create Idea</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {activeEvents} active events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ideas</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIdeas}</div>
            <p className="text-xs text-muted-foreground">Submitted ideas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEvents}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentEvents events={recentEvents} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentIdeas ideas={recentIdeas} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
