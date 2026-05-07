"use client";

import Image from "next/image";
import { Navbar, Footer } from "@/components/PublicLayout";
import OverflowTooltipText from "@/components/OverflowTooltipText";

import { IProject, IMedia, IHomePageSettings } from "@/lib/models";

export default function ProjectDetailViewer({ project, media, settings }: { project: IProject, media: IMedia[], settings?: IHomePageSettings | null }) {

  // Sort media by order
  const sortedMedia = [...media].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Group images together in pairs of two for 50/50 layout, unless they are full-width
  const groupedBlocks = [];
  let currentImageGroup: IMedia[] = [];

  for (const item of sortedMedia) {
    if (item.type === "image") {
      if (item.displaySize === "full") {
        // Flush existing group first
        if (currentImageGroup.length > 0) {
          groupedBlocks.push({ type: "image-group", items: currentImageGroup });
          currentImageGroup = [];
        }
        groupedBlocks.push({ type: "image", item });
      } else {
        currentImageGroup.push(item);
        if (currentImageGroup.length === 2) {
          groupedBlocks.push({ type: "image-group", items: currentImageGroup });
          currentImageGroup = [];
        }
      }
    } else {
      if (currentImageGroup.length > 0) {
        groupedBlocks.push({ type: "image-group", items: currentImageGroup });
        currentImageGroup = [];
      }
      groupedBlocks.push({ type: item.type, item });
    }
  }
  // Flush remaining images
  if (currentImageGroup.length > 0) {
    groupedBlocks.push({ type: "image-group", items: currentImageGroup });
  }

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto pb-24 pt-8 lg:pt-12">
        
        {/* Project Title Indicator */}
        <div className="px-6 lg:px-12 mb-8">
           <OverflowTooltipText
             as="h2"
             text={project?.name}
             className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-slate-400 truncate"
           />
        </div>

        {/* Media Layout */}
        <div className="flex flex-col gap-12 lg:gap-24">
          {groupedBlocks.map((block: { type: string; items?: IMedia[]; item?: IMedia; }, idx) => {
            
            if (block.type === "image-group") {
              const [img1, img2] = block.items!;
              return (
                <div key={`img-grp-${idx}`} className="w-full px-6 lg:px-12 flex flex-row gap-4 lg:gap-12 items-start">

                   <div className="w-1/2 relative bg-white shadow-sm border border-slate-100">
                      <Image 
                         src={img1.url!} 
                         alt={img1.title} 
                         width={1200}
                         height={800}
                         className="w-full h-auto object-contain" 
                         unoptimized
                      />
                   </div>
                   {img2 ? (
                      <div className="w-1/2 relative bg-white shadow-sm border border-slate-100">
                        <Image 
                           src={img2.url!} 
                           alt={img2.title} 
                           width={1200}
                           height={800}
                           className="w-full h-auto object-contain" 
                           unoptimized
                        />
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
              const isLeft = m.imageAlignment === "left"; // Text left, Image right
              
              return (
                <div key={m._id} className="w-full px-6 lg:px-12 flex flex-row items-center gap-4 lg:gap-12 relative min-h-[25vh] lg:min-h-[50vh] min-w-0">
                   {isLeft ? (
                      <>
                        <div className="w-1/2 min-w-0 flex flex-col justify-center pr-2 lg:pr-0 max-w-xl mx-auto">
                           <p className="text-[11px] md:text-sm lg:text-xl text-slate-700 leading-snug lg:leading-relaxed font-medium whitespace-pre-wrap wrap-anywhere">
                              {m.textContent}
                           </p>
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
                   ) : (
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
                           <p className="text-[11px] md:text-sm lg:text-xl text-slate-700 leading-snug lg:leading-relaxed font-medium whitespace-pre-wrap wrap-anywhere">
                              {m.textContent}
                           </p>
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
                This project has no content yet.
             </div>
          )}
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
