"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { PlaySquare, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectItem {
  _id: string;
  name: string;
}

interface MediaItem {
  _id: string;
  title: string;
  type: "image" | "video";
  url: string;
  projectId?: ProjectItem;
  fileKey?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export function MediaGallery({ items }: { items: MediaItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-20 bg-muted/20 rounded-2xl border border-dashed">
        <p>No media uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div
            key={item._id}
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-shadow group flex flex-col"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
              {item.type === "image" ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative w-full h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset">
                      <Image
                        src={item.url}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <ImageIcon className="text-white w-8 h-8 drop-shadow-md" />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="p-0 bg-transparent border-none shadow-none sm:max-w-none [&>button]:hidden w-fit h-fit">
                    <DialogTitle className="sr-only">Image Preview</DialogTitle>
                    <motion.img
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={item.url}
                      alt={item.title}
                      className="max-w-[95vw] max-h-[90vh] rounded-xl object-contain drop-shadow-2xl"
                    />
                  </DialogContent>
                </Dialog>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative w-full h-full cursor-pointer bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset">
                      {(item.thumbnailUrl || item.type === 'video') ? (
                        <>
                          <Image
                            src={item.thumbnailUrl || `https://img.youtube.com/vi/${item.url}/mqdefault.jpg`}
                            alt={item.title}
                            fill
                            className="object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500 ease-out absolute inset-0"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized
                          />
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <PlaySquare className="w-16 h-16 text-white/90 group-hover:text-white group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlaySquare className="w-16 h-16 text-white/90 group-hover:text-white group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
                        </div>
                      )}
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden bg-black border-none rounded-2xl shadow-2xl [&>button]:hidden sm:max-w-4xl">
                    <DialogTitle className="sr-only">Video Preview</DialogTitle>
                    <div className="aspect-video w-full bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${item.url}?autoplay=1`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <div className="p-4 flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors" title={item.title}>{item.title}</h3>
                {item.projectId && (
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter shrink-0">
                    {item.projectId.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground capitalize mt-1 flex items-center gap-1.5 font-medium">
                {item.type === "image" ? <ImageIcon className="w-3.5 h-3.5" /> : <PlaySquare className="w-3.5 h-3.5" />}
                {item.type} <span className="opacity-50">•</span> {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
