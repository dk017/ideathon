'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface KanbanBoardProps {
  ideaId: string;
  cards: any[];
}

interface KanbanCardProps {
  card: any;
  isDragging?: boolean;
}

function KanbanCard({ card, isDragging }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="mb-3 cursor-grab active:cursor-grabbing">
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-sm">{card.title}</h4>
            <div {...listeners}>
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          {card.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {card.description}
            </p>
          )}
          {card.assignee && (
            <div className="flex items-center space-x-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={card.assignee.image ?? ''} />
                <AvatarFallback className="text-xs">
                  {card.assignee.name?.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {card.assignee.name}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function KanbanBoard({ ideaId, cards: initialCards }: KanbanBoardProps) {
  const [cards, setCards] = useState(initialCards);
  const [showNewCardDialog, setShowNewCardDialog] = useState(false);
  const [newCardColumn, setNewCardColumn] = useState('');
  const [newCardData, setNewCardData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const columns = [
    { id: 'BACKLOG', title: 'Backlog', color: 'bg-gray-100' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'DONE', title: 'Done', color: 'bg-green-100' },
  ];

  const getCardsForColumn = (columnId: string) => {
    return cards.filter(card => card.column === columnId);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const activeCard = cards.find(card => card.id === active.id);
    const overCard = cards.find(card => card.id === over.id);
    
    if (!activeCard) return;

    // Determine the new column
    let newColumn = activeCard.column;
    
    if (overCard) {
      newColumn = overCard.column;
    } else {
      // Check if dropped on a column
      const columnId = over.id as string;
      if (columns.some(col => col.id === columnId)) {
        newColumn = columnId;
      }
    }

    // Update local state
    const updatedCards = cards.map(card => 
      card.id === active.id ? { ...card, column: newColumn } : card
    );
    setCards(updatedCards);

    // Update on server
    try {
      await fetch(`/api/kanban/${active.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ column: newColumn }),
      });
    } catch (error) {
      console.error('Error updating card:', error);
      toast.error('Failed to update card');
      // Revert local state on error
      setCards(cards);
    }
  };

  const handleCreateCard = async () => {
    if (!newCardData.title.trim()) {
      toast.error('Please enter a card title');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/kanban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ideaId,
          title: newCardData.title,
          description: newCardData.description,
          column: newCardColumn,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create card');
      }

      const newCard = await response.json();
      setCards([...cards, newCard]);
      setShowNewCardDialog(false);
      setNewCardData({ title: '', description: '' });
      toast.success('Card created successfully!');
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error('Failed to create card');
    } finally {
      setLoading(false);
    }
  };

  const openNewCardDialog = (columnId: string) => {
    setNewCardColumn(columnId);
    setShowNewCardDialog(true);
  };

  return (
    <div className="space-y-6">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => {
            const columnCards = getCardsForColumn(column.id);
            
            return (
              <div key={column.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${column.color}`} />
                    <h3 className="font-semibold">{column.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {columnCards.length}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openNewCardDialog(column.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="min-h-[400px] p-2 border-2 border-dashed border-muted rounded-lg">
                  <SortableContext
                    items={columnCards.map(card => card.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {columnCards.map((card) => (
                      <KanbanCard key={card.id} card={card} />
                    ))}
                  </SortableContext>
                </div>
              </div>
            );
          })}
        </div>
      </DndContext>

      <Dialog open={showNewCardDialog} onOpenChange={setShowNewCardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-title">Title *</Label>
              <Input
                id="card-title"
                placeholder="Enter card title"
                value={newCardData.title}
                onChange={(e) => setNewCardData({ ...newCardData, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="card-description">Description</Label>
              <Textarea
                id="card-description"
                placeholder="Enter card description"
                value={newCardData.description}
                onChange={(e) => setNewCardData({ ...newCardData, description: e.target.value })}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNewCardDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCard} disabled={loading}>
                {loading ? 'Creating...' : 'Create Card'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}