"use client";

import { Event } from "@prisma/client";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RecentEventsProps {
  events: Event[];
}

export function RecentEvents({ events }: RecentEventsProps) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent events</p>;
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Link
          key={event.id}
          href={`/admin/events/${event.id}`}
          className="block"
        >
          <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors">
            <div className="space-y-1">
              <p className="font-medium leading-none">{event.title}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(event.startDate), "MMM d, yyyy")} -{" "}
                {format(new Date(event.endDate), "MMM d, yyyy")}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "capitalize",
                event.status === "ONGOING" && "bg-green-500/10 text-green-500",
                event.status === "UPCOMING" && "bg-blue-500/10 text-blue-500",
                event.status === "COMPLETED" && "bg-gray-500/10 text-gray-500"
              )}
            >
              {event.status.toLowerCase()}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}
