"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "react-beautiful-dnd";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type { Board, Card as CardType, ColumnId } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppHeader } from "@/components/app-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const COLUMNS: { id: ColumnId; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

function sortByPosition(cards: CardType[]) {
  return [...cards].sort((a, b) => a.position - b.position);
}

export function BoardClient({
  board,
  initialCards,
  userEmail,
}: {
  board: Board;
  initialCards: CardType[];
  userEmail: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [cards, setCards] = useState<CardType[]>(sortByPosition(initialCards));

  // Create / edit dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CardType | null>(null);
  const [formColumn, setFormColumn] = useState<ColumnId>("todo");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<CardType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const byColumn = useMemo(() => {
    const map: Record<ColumnId, CardType[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };
    for (const card of cards) {
      map[card.column].push(card);
    }
    for (const col of COLUMNS) {
      map[col.id] = sortByPosition(map[col.id]);
    }
    return map;
  }, [cards]);

  function openCreate(column: ColumnId) {
    setEditing(null);
    setFormColumn(column);
    setFormTitle("");
    setFormDesc("");
    setFormOpen(true);
  }

  function openEdit(card: CardType) {
    setEditing(card);
    setFormColumn(card.column);
    setFormTitle(card.title);
    setFormDesc(card.description ?? "");
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = formTitle.trim();
    if (!title) {
      toast.error("Card title is required.");
      return;
    }
    const description = formDesc.trim() || null;
    setSaving(true);

    if (editing) {
      const { data, error } = await supabase
        .from("cards")
        .update({ title, description })
        .eq("id", editing.id)
        .select()
        .single();
      setSaving(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      setCards((prev) =>
        prev.map((c) => (c.id === editing.id ? (data as CardType) : c))
      );
      toast.success("Card updated.");
    } else {
      const position = byColumn[formColumn].length;
      const { data, error } = await supabase
        .from("cards")
        .insert({
          board_id: board.id,
          column: formColumn,
          title,
          description,
          position,
        })
        .select()
        .single();
      setSaving(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      setCards((prev) => [...prev, data as CardType]);
      toast.success("Card created.");
    }
    setFormOpen(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("id", deleteTarget.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setCards((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast.success("Card deleted.");
  }

  async function persist(updated: CardType[]) {
    const rows = updated.map((c) => ({
      id: c.id,
      board_id: c.board_id,
      column: c.column,
      title: c.title,
      description: c.description,
      position: c.position,
    }));
    const { error } = await supabase.from("cards").upsert(rows);
    if (error) {
      toast.error("Failed to save changes. Reloading.");
      router.refresh();
    }
  }

  function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceCol = source.droppableId as ColumnId;
    const destCol = destination.droppableId as ColumnId;

    // Build mutable column lists from current state.
    const columns: Record<ColumnId, CardType[]> = {
      todo: [...byColumn.todo],
      in_progress: [...byColumn.in_progress],
      done: [...byColumn.done],
    };

    const movingIdx = columns[sourceCol].findIndex((c) => c.id === draggableId);
    if (movingIdx === -1) return;
    const [moving] = columns[sourceCol].splice(movingIdx, 1);
    const movedCard: CardType = { ...moving, column: destCol };
    columns[destCol].splice(destination.index, 0, movedCard);

    // Reassign positions for affected columns.
    const affected: CardType[] = [];
    const touched: ColumnId[] =
      sourceCol === destCol ? [sourceCol] : [sourceCol, destCol];
    for (const col of touched) {
      columns[col] = columns[col].map((c, idx) => {
        const next = { ...c, position: idx, column: col };
        affected.push(next);
        return next;
      });
    }

    const merged = [
      ...columns.todo,
      ...columns.in_progress,
      ...columns.done,
    ];
    setCards(merged);
    void persist(affected);
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AppHeader userEmail={userEmail}>
        <span className="hidden text-muted-foreground sm:inline">/</span>
        <span className="truncate font-medium">{board.title}</span>
      </AppHeader>

      <main className="container flex-1 px-4 py-6">
        <div className="mb-6 flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Boards
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight">{board.title}</h1>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {COLUMNS.map((col) => {
              const colCards = byColumn[col.id];
              return (
                <div
                  key={col.id}
                  className="flex flex-col rounded-lg border bg-muted/40"
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold">{col.label}</h2>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {colCards.length}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openCreate(col.id)}
                      aria-label={`Add card to ${col.label}`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex min-h-[120px] flex-1 flex-col gap-2 p-2 transition-colors ${
                          snapshot.isDraggingOver ? "bg-muted" : ""
                        }`}
                      >
                        {colCards.map((card, index) => (
                          <Draggable
                            key={card.id}
                            draggableId={card.id}
                            index={index}
                          >
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                style={
                                  dragProvided.draggableProps
                                    .style as React.CSSProperties
                                }
                                className={`group rounded-md border bg-background p-3 shadow-sm transition-shadow ${
                                  dragSnapshot.isDragging
                                    ? "shadow-md ring-2 ring-primary/30"
                                    : ""
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="break-words text-sm font-medium">
                                    {card.title}
                                  </p>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                                        aria-label="Card actions"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => openEdit(card)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => setDeleteTarget(card)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                {card.description && (
                                  <p className="mt-1 whitespace-pre-wrap break-words text-xs text-muted-foreground">
                                    {card.description}
                                  </p>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {colCards.length === 0 && !snapshot.isDraggingOver && (
                          <button
                            onClick={() => openCreate(col.id)}
                            className="rounded-md border border-dashed py-6 text-xs text-muted-foreground transition-colors hover:bg-muted"
                          >
                            Add a card
                          </button>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </main>

      {/* Create / edit card dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit card" : "New card"}</DialogTitle>
              <DialogDescription>
                {editing
                  ? "Update the card details."
                  : `Add a card to ${
                      COLUMNS.find((c) => c.id === formColumn)?.label
                    }.`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="card-title">Title</Label>
                <Input
                  id="card-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Design the landing page"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-desc">Description (optional)</Label>
                <Textarea
                  id="card-desc"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Add more detail..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete card confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete card?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium">{deleteTarget?.title}</span>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
