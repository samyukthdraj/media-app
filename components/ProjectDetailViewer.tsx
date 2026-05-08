"use client";

import { useState } from "react";
import Image from "next/image";
import { Navbar, Footer } from "@/components/PublicLayout";
import OverflowTooltipText from "@/components/OverflowTooltipText";
import { motion, AnimatePresence } from "framer-motion";
import RichTextRenderer from "@/components/RichTextRenderer";

import { IProject, IMedia, IHomePageSettings } from "@/lib/models";

interface GroupedBlock {
  type: string;
  items?: IMedia[];
  item?: IMedia;
}

function buildGroupedBlocks(sortedMedia: IMedia[]): GroupedBlock[] {
  const groupedBlocks: GroupedBlock[] = [];
  let i = 0;

  while (i < sortedMedia.length) {
    const item = sortedMedia[i];

    if (item.type === "image") {
      if (item.displaySize === "full") {
        groupedBlocks.push({ type: "image", item });
        i++;
      } else if (item.displaySize === "quarter") {
        // Quarter images: check if the next item is also quarter
        const quarterItems: IMedia[] = [item];
        if (i + 1 < sortedMedia.length && sortedMedia[i + 1].type === "image" && sortedMedia[i + 1].displaySize === "quarter") {
          quarterItems.push(sortedMedia[i + 1]);
          i += 2;
        } else {
          i++;
        }

        // Check if next item is a 50% (half) image to pair on the right
        let pairItem: IMedia | undefined;
        if (i < sortedMedia.length && sortedMedia[i].type === "image" && sortedMedia[i].displaySize !== "full" && sortedMedia[i].displaySize !== "quarter") {
          pairItem = sortedMedia[i];
          i++;
        }

        groupedBlocks.push({ type: "quarter-group", items: [...quarterItems, ...(pairItem ? [pairItem] : [])] });
      } else {
        // Half (50%) images — pair two side by side
        const halfItems: IMedia[] = [item];
        if (i + 1 < sortedMedia.length && sortedMedia[i + 1].type === "image" && sortedMedia[i + 1].displaySize !== "full" && sortedMedia[i + 1].displaySize !== "quarter") {
          halfItems.push(sortedMedia[i + 1]);
          i += 2;
        } else {
          i++;
        }
        groupedBlocks.push({ type: "image-group", items: halfItems });
      }
    } else {
      groupedBlocks.push({ type: item.type, item });
      i++;
    }
  }

  return groupedBlocks;
}

export default function ProjectDetailViewer({
  project,
  media,
  designProcessMedia = [],
  settings,
}: {
  project: IProject;
  media: IMedia[];
  designProcessMedia?: IMedia[];
  settings?: IHomePageSettings | null;
}) {
  const [showDesignProcess, setShowDesignProcess] = useState(false);

  const activeMedia = showDesignProcess ? designProcessMedia : media;
  const sortedMedia = [...activeMedia].sort((a, b) => (a.order || 0) - (b.order || 0));
  const groupedBlocks = buildGroupedBlocks(sortedMedia);

  const hasDesignProcess = designProcessMedia.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto pb-24 pt-8 lg:pt-12">
        
        {/* Project Title Indicator + Design Process Toggle */}
        <div className="px-6 lg:px-12 mb-8 flex items-start justify-between gap-4">
           <div className="min-w-0 flex-1">
             <OverflowTooltipText
               as="h2"
               text={project?.name}
               className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-slate-400 truncate"
             />
             <p className="text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] text-slate-400 mt-1">
               Neha Sreejith
             </p>
           </div>
           {hasDesignProcess && (
             <button
               onClick={() => setShowDesignProcess((prev) => !prev)}
               className="shrink-0 px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 border border-slate-300 rounded-full hover:bg-slate-50 hover:text-slate-900 hover:border-slate-500 transition-all duration-300"
             >
               {showDesignProcess ? `View ${project?.name || "Project"}` : "View Design Process"}
             </button>
           )}
        </div>

        {/* Media Layout with smooth transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={showDesignProcess ? "design-process" : "project"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex flex-col gap-12 lg:gap-24"
          >
            {groupedBlocks.map((block, idx) => {

              if (block.type === "quarter-group") {
                const items = block.items!;
                // First 1-2 items are quarters (stack vertically on left), optional 3rd is a half (right)
                const quarters = items.filter((m) => m.displaySize === "quarter");
                const halfPair = items.find((m) => m.displaySize !== "quarter");

                return (
                  <div key={`quarter-grp-${idx}`} className="w-full px-6 lg:px-12 flex flex-row gap-4 lg:gap-12 items-start">
                    <div className="w-1/2 flex flex-col gap-4 lg:gap-12">
                      {quarters.map((q) => (
                        <div key={q._id} className="w-full">
                          <div className="w-full relative bg-white shadow-sm border border-slate-100">
                            <Image
                              src={q.url!}
                              alt={q.title}
                              width={1200}
                              height={400}
                              className="w-full h-auto object-contain"
                              unoptimized
                            />
                          </div>
                          {q.caption && (
                            <RichTextRenderer
                              content={q.caption}
                              className="mt-2 text-[11px] md:text-sm lg:text-xl text-slate-700 leading-snug lg:leading-relaxed font-medium space-y-1"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    {halfPair ? (
                      <div className="w-1/2">
                        <div className="relative bg-white shadow-sm border border-slate-100">
                          <Image
                            src={halfPair.url!}
                            alt={halfPair.title}
                            width={1200}
                            height={800}
                            className="w-full h-auto object-contain"
                            unoptimized
                          />
                        </div>
                        {halfPair.caption && (
                          <RichTextRenderer
                            content={halfPair.caption}
                            className="mt-2 text-[11px] md:text-sm lg:text-xl text-slate-700 leading-snug lg:leading-relaxed font-medium space-y-1"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="w-1/2"></div>
                    )}
                  </div>
                );
              }

              if (block.type === "image-group") {
                const [img1, img2] = block.items!;
                return (
                  <div key={`img-grp-${idx}`} className="w-full px-6 lg:px-12 flex flex-row gap-4 lg:gap-12 items-start">
                     <div className="w-1/2">
                        <div className="relative bg-white shadow-sm border border-slate-100">
                          <Image 
                             src={img1.url!} 
                             alt={img1.title} 
                             width={1200}
                             height={800}
                             className="w-full h-auto object-contain" 
                             unoptimized
                          />
                        </div>
                        {img1.caption && (
                          <RichTextRenderer
                            content={img1.caption}
                            className="mt-2 text-[11px] md:text-sm lg:text-xl text-slate-700 leading-snug lg:leading-relaxed font-medium space-y-1"
                          />
                        )}
                     </div>
                     {img2 ? (
                        <div className="w-1/2">
                          <div className="relative bg-white shadow-sm border border-slate-100">
                            <Image 
                               src={img2.url!} 
                               alt={img2.title} 
                               width={1200}
                               height={800}
                               className="w-full h-auto object-contain" 
                               unoptimized
                            />
                          </div>
                          {img2.caption && (
                            <RichTextRenderer
                              content={img2.caption}
                              className="mt-2 text-[11px] md:text-sm lg:text-xl text-slate-700 leading-snug lg:leading-relaxed font-medium space-y-1"
                            />
                          )}
                        </div>
                     ) : (
                        <div className="w-1/2"></div>
                     )}
                  </div>
                );
              }

              if (block.type === "image") {
                const m: IMedia = block.item!;
                return (
                  <div key={m._id} className="w-full px-6 lg:px-12">
                    <div className="w-full relative bg-white shadow-sm border border-slate-100">
                      <Image 
                        src={m.url!} 
                        alt={m.title} 
                        width={2400}
                        height={1200}
                        className="w-full h-auto object-contain" 
                        unoptimized
                      />
                    </div>
                  </div>
                );
              }

              if (block.type === "video") {
                const m: IMedia = block.item!;
                const isYoutube = m.url && (m.url.includes("youtube") || m.url.includes("youtu.be") || !m.url.startsWith("http"));
                const embedUrl = isYoutube 
                   ? (m.url!.startsWith("http") ? m.url : `https://www.youtube.com/embed/${m.url}?autoplay=1&mute=1&loop=1&playlist=${m.url}`)
                   : m.url!;
                   
                return (
                  <div key={m._id} className="w-full px-6 lg:px-12">
                    <div className="w-full relative aspect-video bg-black shadow-xl border-2 lg:border-4 border-slate-900">
                      {isYoutube ? (
                         <iframe
                           src={embedUrl}
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                           allowFullScreen
                           className="w-full h-full absolute inset-0 border-0"
                         />
                      ) : (
                         <video 
                           src={m.url}
                           autoPlay
                           muted
                           loop
                           playsInline
                           className="w-full h-full absolute inset-0 object-contain"
                         />
                      )}
                    </div>
                  </div>
                );
              }

              if (block.type === "text-image") {
                const m: IMedia = block.item!;
                const isLeft = m.imageAlignment === "left";
                
                return (
                  <div key={m._id} className="w-full px-6 lg:px-12 flex flex-row items-center gap-4 lg:gap-12 relative min-h-[25vh] lg:min-h-[50vh] min-w-0">
                     {isLeft ? (
                        <>
                          <div className="w-1/2 relative bg-white shadow-md border border-slate-100">
                             {m.url && (
                               <Image 
                                 src={m.url} 
                                 alt={m.title} 
                                 width={1200}
                                 height={1600}
                                 className="w-full h-auto object-contain" 
                                 unoptimized 
                               />
                             )}
                          </div>
                          <div className="w-1/2 min-w-0 flex flex-col justify-center pl-2 lg:pl-0 max-w-xl mx-auto">
                             <RichTextRenderer
                               content={m.textContent || ""}
                               className="text-[11px] md:text-sm lg:text-xl text-slate-700 leading-snug lg:leading-relaxed font-medium space-y-2"
                             />
                          </div>
                        </>
                     ) : (
                        <>
                          <div className="w-1/2 min-w-0 flex flex-col justify-center pr-2 lg:pr-0 max-w-xl mx-auto">
                             <RichTextRenderer
                               content={m.textContent || ""}
                               className="text-[11px] md:text-sm lg:text-xl text-slate-700 leading-snug lg:leading-relaxed font-medium space-y-2"
                             />
                          </div>
                          <div className="w-1/2 relative bg-white shadow-md border border-slate-100">
                             {m.url && (
                               <Image 
                                 src={m.url} 
                                 alt={m.title} 
                                 width={1200}
                                 height={1600}
                                 className="w-full h-auto object-contain" 
                                 unoptimized 
                               />
                             )}
                          </div>
                        </>
                     )}
                  </div>
                );
              }

              return null;
            })}

            {sortedMedia.length === 0 && (
               <div className="text-center py-24 text-slate-500 uppercase tracking-widest font-semibold">
                  {showDesignProcess ? "No design process content yet." : "This project has no content yet."}
               </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
