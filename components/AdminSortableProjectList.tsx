"use client";

import { useState, useEffect, useRef } from "react";
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
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import OverflowTooltipText from "@/components/OverflowTooltipText";
import { Trash2, Loader2, GripVertical, Folder, Pencil } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProjectOrderAction, deleteProjectAction } from "@/lib/actions";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProjectItem {
  _id: string;
  name: string;
  thumbnailUrl?: string;
  createdAt: string;
  order?: number;
}

interface SortableItemProps {
  project: ProjectItem;
  onEdit: (id: string, name: string) => void;
  onSelect: (id: string) => void;
  mediaCount: number;
}

function SortableItem({ project, onEdit, onSelect, mediaCount }: SortableItemProps) {
  const qc = useQueryClient();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: project._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  const deleteMutation = useMutation({
    mutationFn: deleteProjectAction,
    onSuccess: () => {
      toast.success("Project deleted");
      qc.invalidateQueries({ queryKey: ["adminProjects"] });
      qc.invalidateQueries({ queryKey: ["adminMedia"] });
    }
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer gap-3 min-w-0"
      onClick={() => onSelect(project._id)}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing hover:bg-slate-100 p-1 rounded touch-none shrink-0" onClick={(e) => e.stopPropagation()}>
          <GripVertical className="text-slate-400 w-5 h-5"/>
        </div>
        <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
          {project.thumbnailUrl ? (
            <Image
              src={project.thumbnailUrl}
              alt={project.name}
              width={48}
              height={48}
              className="object-contain h-full w-full p-1"
              unoptimized
            />
          ) : (
            <Folder className="w-6 h-6 text-slate-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <OverflowTooltipText
            as="p"
            text={project.name}
            className="font-bold truncate"
          />
          <p className="text-xs text-slate-400 uppercase font-bold tracking-tight">
            {mediaCount} Items
          </p>
        </div>
      </div>
      <div
        className="flex items-center gap-2 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onEdit(project._id, project.name)}
        >
          <Pencil className="w-4 h-4 text-slate-400" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the project and all its media.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(project._id)}
                className="bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export function AdminSortableProjectList({ 
  projects, 
  projectMediaCount, 
  onEdit, 
  onSelect 
}: { 
  projects: ProjectItem[];
  projectMediaCount: (id: string) => number;
  onEdit: (id: string, name: string) => void;
  onSelect: (id: string) => void;
}) {
  const qc = useQueryClient();
  const [localProjects, setLocalProjects] = useState(projects);
  const isDraggingRef = useRef(false);

  const updateOrderMutation = useMutation({
    mutationFn: updateProjectOrderAction,
    onMutate: async (newUpdates) => {
      await qc.cancelQueries({ queryKey: ["adminProjects"] });
      const previousProjects = qc.getQueryData<{ success: boolean; data: ProjectItem[] }>(["adminProjects"]);

      if (previousProjects?.data) {
        const newProjects = [...previousProjects.data].sort((a, b) => {
          const orderA = newUpdates.find(u => u.id === a._id)?.order ?? 0;
          const orderB = newUpdates.find(u => u.id === b._id)?.order ?? 0;
          return orderA - orderB;
        });
        qc.setQueryData(["adminProjects"], { ...previousProjects, data: newProjects });
      }

      return { previousProjects };
    },
    onError: (err, newUpdates, context) => {
      if (context?.previousProjects) {
        qc.setQueryData(["adminProjects"], context.previousProjects);
        setLocalProjects(context.previousProjects.data);
      }
      toast.error("Failed to save order to database");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["adminProjects"] });
    },
  });

  const lastProjectsStrRef = useRef(JSON.stringify(projects));

  useEffect(() => {
    const projectsStr = JSON.stringify(projects);
    if (projectsStr !== lastProjectsStrRef.current) {
      setLocalProjects(projects);
      lastProjectsStrRef.current = projectsStr;
    }
  }, [projects]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    isDraggingRef.current = false;
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localProjects.findIndex(p => p._id === active.id);
      const newIndex = localProjects.findIndex(p => p._id === over.id);

      const newProjects = arrayMove(localProjects, oldIndex, newIndex);
      setLocalProjects(newProjects);
      lastProjectsStrRef.current = JSON.stringify(newProjects);

      const updates = newProjects.map((p, index) => ({
        id: p._id, order: index
      }));
      updateOrderMutation.mutate(updates);
      toast.success("Order updated!");
    }
  };

  if (localProjects.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-slate-50">
        No projects yet. Create one on the left!
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={() => {
        isDraggingRef.current = true;
      }}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={localProjects.map(p => p._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {localProjects.map(project => (
            <SortableItem 
              key={project._id} 
              project={project} 
              mediaCount={projectMediaCount(project._id)}
              onEdit={onEdit}
              onSelect={onSelect}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
