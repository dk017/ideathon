"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Trash2, Plus } from "lucide-react";
import { EventFormModal } from "@/components/admin/event-form-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editEvent, setEditEvent] = useState<any | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch events
  useEffect(() => {
    setLoading(true);
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch(() => setError("Failed to load events."))
      .finally(() => setLoading(false));
  }, []);

  // Create event handler
  const handleCreateEvent = async (data: any) => {
    setModalLoading(true);
    setError("");
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create event");
      }

      const newEvent = await res.json();
      setEvents([newEvent, ...events]);
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to create event");
    } finally {
      setModalLoading(false);
    }
  };

  // Edit event handler
  const handleEditEvent = async (data: any) => {
    if (!editEvent) return;
    setModalLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/events/${editEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setEvents(events.map((ev) => (ev.id === updated.id ? updated : ev)));
      setEditEvent(null);
    } catch {
      setError("Failed to update event.");
    } finally {
      setModalLoading(false);
    }
  };

  // Delete event handler
  const handleDeleteEvent = async () => {
    if (!deleteEvent) return;
    setDeleteLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/events/${deleteEvent.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setEvents(events.filter((ev) => ev.id !== deleteEvent.id));
      setDeleteEvent(null);
    } catch {
      setError("Failed to delete event.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Manage Events</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Create Event
        </Button>
      </div>
      <EventFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleCreateEvent}
        loading={modalLoading}
      />
      <EventFormModal
        open={!!editEvent}
        onOpenChange={(open) => !open && setEditEvent(null)}
        onSubmit={handleEditEvent}
        initialData={editEvent}
        loading={modalLoading}
      />
      <Dialog
        open={!!deleteEvent}
        onOpenChange={(open) => !open && setDeleteEvent(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete <b>{deleteEvent?.title}</b>? This
            action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteEvent(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEvent}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {error && <div className="text-destructive mb-4">{error}</div>}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <div className="col-span-full text-center">Loading events...</div>
        )}
        {!loading && events.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground">
            No events found.
          </div>
        )}
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-lg border bg-card p-6 shadow-sm flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold line-clamp-1">
                {event.title}
              </h2>
              <Badge className="capitalize">{event.status.toLowerCase()}</Badge>
            </div>
            <p className="text-muted-foreground line-clamp-2">
              {event.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(event.startDate).toLocaleDateString()} -{" "}
                {new Date(event.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditEvent(event)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeleteEvent(event)}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
