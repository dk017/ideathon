"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageCard } from "./ui/PageCard";

function getCountdown(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "00:00:00";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function EventTile({
  event,
  showAction = true,
}: {
  event: any;
  showAction?: boolean;
}) {
  const [countdown, setCountdown] = useState("");
  const isUpcoming = event.status === "UPCOMING";
  const isOngoing = event.status === "ONGOING";
  const isCompleted = event.status === "COMPLETED";
  const isLongRunning = event.isLongRunning;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUpcoming || isOngoing) {
      const target = isUpcoming
        ? new Date(event.startDate)
        : new Date(event.endDate);
      setCountdown(getCountdown(target));
      interval = setInterval(() => {
        setCountdown(getCountdown(target));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [event.startDate, event.endDate, isUpcoming, isOngoing]);

  return (
    <PageCard>
      <Card
        className={`flex flex-col h-full ${
          isLongRunning ? "border-yellow-500" : ""
        }`}
      >
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {event.title}
            </CardTitle>
            <Badge
              className="capitalize"
              variant={
                isUpcoming
                  ? "secondary"
                  : isOngoing
                  ? "default"
                  : isCompleted
                  ? "outline"
                  : "destructive"
              }
            >
              {event.status.toLowerCase()}
            </Badge>
            {isLongRunning && (
              <Badge
                variant="outline"
                className="border-yellow-500 text-yellow-600"
              >
                Long-Running
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground mb-1">
            {new Date(event.startDate).toLocaleDateString()} -{" "}
            {new Date(event.endDate).toLocaleDateString()}
          </div>
          {(isUpcoming || isOngoing) && (
            <div className="text-sm font-mono text-primary">
              {isUpcoming ? "Starts in: " : "Ends in: "}
              <span>{countdown}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <p className="text-muted-foreground line-clamp-3 mb-4">
            {event.description}
          </p>
          {showAction && (
            <Button asChild className="w-full mt-auto">
              <Link href={`/events/${event.id}`}>
                {isUpcoming ? "Register" : "View Details"}
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </PageCard>
  );
}
