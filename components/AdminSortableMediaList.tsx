"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import { 
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaySquare, Trash2, Loader2, GripVertical, FileText, AlignLeft, AlignRight, Pencil } from "lucide-react";
import { useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { updateMediaOrderAction, deleteMediaAction, saveMediaAction } from "@/lib/actions";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface MediaItem {
  _id: string;
  title: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  order?: number;
  textContent?: string;
  imageAlignment?: "left" | "right";
  projectId?: string | { _id: string };
}

function SortableItem({ item, qc }: { item: MediaItem, qc: QueryClient }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.textContent || "");
  const [editAlignment, setEditAlignment] = useState(item.imageAlignment || "left");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  const deleteMutation = useMutation({
    mutationFn: deleteMediaAction,
    onSuccess: () => {
      toast.success("Media deleted");
      qc.invalidateQueries({ queryKey: ["adminMedia"] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<MediaItem>) => {
      const projId = typeof item.projectId === 'object' ? item.projectId?._id : item.projectId;
      
      return saveMediaAction({
        _id: item._id,
        title: data.title || item.title,
        type: (data.type || item.type) as "image" | "video" | "text-image",
        url: data.url || item.url,
        textContent: data.textContent !== undefined ? data.textContent : item.textContent,
        imageAlignment: data.imageAlignment || item.imageAlignment,
        projectId: projId
      });
    },
    onSuccess: () => {
      toast.success("Updated successfully");
      setIsEditing(false);
      qc.invalidateQueries({ queryKey: ["adminMedia"] });
    }
  });

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="overflow-hidden group border-muted shadow-sm hover:shadow-md transition-shadow relative bg-white flex flex-col"
    >
      <div className="relative aspect-video bg-muted/20">
         <Image 
            src={item.type === 'video' ? (item.thumbnailUrl || `https://img.youtube.com/vi/${item.url}/mqdefault.jpg`) : item.url} 
            alt={item.title} 
            fill 
            className="object-cover" 
            unoptimized
         />
         {item.type === 'video' && <PlaySquare className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white w-10 h-10 drop-shadow-md" />}
         {item.type === 'text-image' && (
           <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
             <FileText className="w-12 h-12 text-black/20" />
           </div>
         )}
      </div>
      
      {item.type === 'text-image' && item.textContent && (
        <div className="p-3 bg-slate-50 border-y text-xs text-slate-600 italic line-clamp-3">
          {item.textContent}
        </div>
      )}

      <div className="p-3 flex flex-col gap-2 mt-auto">
         <div className="flex items-center gap-2">
           <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing hover:bg-slate-100 p-1 rounded touch-none">
             <GripVertical className="text-slate-400 w-5 h-5"/>
           </div>
           <p className="text-sm font-medium line-clamp-1 truncate flex-1">{item.title}</p>
         </div>
         <div className="flex items-center justify-between border-t border-muted/50 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase font-semibold">{item.type}</span>
              {item.type === 'text-image' && (
                <div className="flex items-center gap-1 text-[10px] bg-white border rounded px-1.5 text-slate-500">
                  {item.imageAlignment === 'left' ? <AlignLeft className="w-3 h-3"/> : <AlignRight className="w-3 h-3"/>}
                  {item.imageAlignment}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              {item.type === 'text-image' && (
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Text-Image Content</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <textarea 
                        className="w-full h-32 p-3 border rounded-md text-sm"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className="flex gap-4 items-center justify-center">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input type="radio" checked={editAlignment === "left"} onChange={() => setEditAlignment("left")} />
                          Text Left, Image Right
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input type="radio" checked={editAlignment === "right"} onChange={() => setEditAlignment("right")} />
                          Image Left, Text Right
                        </label>
                      </div>
                      <Button 
                        className="w-full"
                        disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate({
                          title: item.title,
                          type: "text-image",
                          url: item.url,
                          textContent: editText,
                          imageAlignment: editAlignment,
                          projectId: typeof item.projectId === "object" ? item.projectId?._id : item.projectId
                        })}
                      >
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : "Save Changes"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:bg-red-50 p-0 h-8 w-8 disabled:opacity-50" 
                onClick={(e) => {
                   e.stopPropagation();
                   deleteMutation.mutate(item._id);
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
              </Button>
            </div>
         </div>
      </div>
    </Card>
  );
}

export function AdminSortableMediaList({ items }: { items: MediaItem[] }) {
  const qc = useQueryClient();
  const [localItems, setLocalItems] = useState(items);

  // Sync with prop when it changes (avoiding strict direct setState for lint)
  if (JSON.stringify(items) !== JSON.stringify(localItems)) {
    setLocalItems(items);
  }

  const updateOrderMutation = useMutation({
    mutationFn: updateMediaOrderAction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminMedia"] });
    },
    onError: () => toast.error("Failed to save order to database")
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex(i => i._id === active.id);
      const newIndex = localItems.findIndex(i => i._id === over.id);

      const newItems = arrayMove(localItems, oldIndex, newIndex);
      setLocalItems(newItems);

      // Save to database
      const updates = newItems.map((item, index) => ({
        id: item._id, order: index
      }));
      updateOrderMutation.mutate(updates);
      toast.success("Order updated!");
    }
  };

  if (localItems.length === 0) {
    return (
      <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-slate-50">
        No items in this project. Upload some above!
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={localItems.map(i => i._id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {localItems.map(item => (
            <SortableItem key={item._id} item={item} qc={qc} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
