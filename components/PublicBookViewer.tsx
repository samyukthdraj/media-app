"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Play, X, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import OverflowTooltipText from "@/components/OverflowTooltipText";

interface MediaItem {
  _id: string;
  title: string;
  type: "image" | "video";
  url: string;
  projectId?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

interface ProjectItem {
  _id: string;
  name: string;
  createdAt: string;
  latestMediaDate?: string;
}

export function PublicBookViewer({
  projects,
  media,
}: {
  projects: ProjectItem[];
  media: MediaItem[];
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    projects.length > 0 ? projects[0]._id : null
  );
  const [userSelectedVideo, setUserSelectedVideo] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [prevActiveProject, setPrevActiveProject] = useState<string | null>(activeProjectId);
  const [direction, setDirection] = useState(0);
  const [mounted, setMounted] = useState(false);


  // Reset page and selected video on project change (React Docs recommended pattern)
  if (activeProjectId !== prevActiveProject) {
    setPrevActiveProject(activeProjectId);
    setCurrentPage(0);
    setUserSelectedVideo(null);
  }

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Layout calculations
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const activeMedia = media
    .filter((m) => m.projectId === activeProjectId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // Upload order

  const latestVideo = [...activeMedia]
    .filter((m) => m.type === "video")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const activeVideo = (() => {
    // If not mounted yet, return null to avoid hydration mismatch on video tags
    if (!mounted) return null;
    
    const v = userSelectedVideo || latestVideo?.url || null;
    if (!v) return null;
    
    const cleanV = v.trim().toLowerCase();
    // Block broken strings or placeholder words
    if (cleanV === "" || cleanV === "undefined" || cleanV === "null" || cleanV.length < 5) return null;
    
    return v;
  })();

  // Remove the active video from the "book" pages so it's not duplicated
  const bookPages = activeMedia.filter((m) => m.url !== activeVideo);

  // Group pages based on viewport
  const itemsPerPage = isMobile ? 1 : 2;
  const pageCount = Math.ceil(bookPages.length / itemsPerPage);
  const totalSpreads = pageCount + 1; // +1 for the final footer spread

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const videoId = url.split("v=")[1]?.split("&")[0] || url.split("youtu.be/")[1]?.split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const currentItems = bookPages.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

  const isFooterPage = currentPage >= pageCount;

  const handleNextPage = () => {
    if (currentPage < totalSpreads - 1) {
      setDirection(1);
      setCurrentPage((p) => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage((p) => p - 1);
    }
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-[4rem])] bg-[#f0f0f0] overflow-hidden relative font-sans">
      {/* Mobile Hamburger Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-all" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar - Acts like bookmarks */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-[calc(100vh-4rem)] w-72 bg-white border-r border-[#e5e7eb] shadow-2xl md:shadow-none transform transition-transform duration-500 ease-out flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-5 border-b border-[#e5e7eb] flex justify-between items-center bg-white z-10">
          <h2 className="font-extrabold text-xl tracking-tight text-slate-800 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary" /> Collections
          </h2>
          <Button variant="ghost" size="icon" className="md:hidden hover:bg-slate-100" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 relative scrollbar-hide">
          {/* Subtle bookmark binding visual */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none"></div>
          
          {/* Pastel Sticky Note Tabs */}
          {projects.map((p, idx) => {
            const pastelColors = [
              "bg-[#fdf3a4]", // yellow
              "bg-[#fbd3c3]", // peach
              "bg-[#d0c6c1]", // grey
              "bg-[#aee6cc]", // mint
              "bg-[#a3b8ea]", // blue
            ];
            const tabColor = pastelColors[idx % pastelColors.length];
            const isActive = activeProjectId === p._id;

            return (
              <div className="filter drop-shadow-md pb-2" key={p._id}>
                <button
                  onClick={() => {
                    setActiveProjectId(p._id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-start py-3 px-4 text-left relative group transition-all duration-300 font-medium ${
                    isActive ? "pl-6 z-10 font-bold scale-[1.02]" : "hover:pl-5 opacity-90 hover:opacity-100"
                  }`}
                  style={{
                    clipPath: "polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%)",
                  }}
                >
                  {/* The colored sticky note background */}
                  <div className={`absolute inset-0 ${tabColor} ${isActive ? '' : 'brightness-95'} transition-all`} />
                  
                  {/* Shadow indicator for active state */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/10 z-10" />
                  )}
                  
                  <span className={`z-10 text-slate-800 tracking-wide ${isActive ? 'drop-shadow-sm' : ''}`}>{p.name}</span>
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full overflow-y-auto overflow-x-hidden md:pl-0 h-[calc(100vh-4rem)] scroll-smooth bg-[#f0f0f0]">
        {/* Mobile Header extension */}
        <div className="md:hidden bg-white border-b border-[#e5e7eb] px-4 py-3 flex items-center justify-center sticky top-0 z-30 shadow-sm">
          <div className="absolute left-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-slate-800" />
            </Button>
          </div>
          <OverflowTooltipText
            text={projects.find(p => p._id === activeProjectId)?.name || "Select Project"}
            className="font-bold text-sm truncate max-w-[200px] text-slate-800 uppercase tracking-wider text-center"
          />
        </div>

        {/* Sticky Video Zone */}
        <div className="sticky top-0 z-30 w-full bg-slate-50/80 backdrop-blur-xl border-b border-slate-200 px-4 md:px-6 py-4 md:py-6 flex-none shadow-sm flex items-center justify-center">
          {activeVideo && activeVideo.trim() !== "" ? (
            <div className="w-full max-w-7xl aspect-video md:h-[40vh] lg:h-[45vh] rounded-none! overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] bg-black relative border-8 border-slate-800 flex items-center justify-center">
               {activeVideo.includes("youtube.com") || activeVideo.includes("youtu.be") || !activeVideo.startsWith("http") ? (
                  <iframe
                    key={activeVideo}
                    src={
                      activeVideo.startsWith("http") 
                        ? `${getEmbedUrl(activeVideo)}?autoplay=1&mute=1`
                        : `https://www.youtube.com/embed/${activeVideo}?autoplay=1&mute=1`
                    }
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0 absolute inset-0"
                  />
               ) : (
                  <video 
                    key={activeVideo}
                    src={activeVideo}
                    controls 
                    autoPlay 
                    muted
                    loop 
                    playsInline
                    preload="auto"
                    className="w-full h-full object-contain absolute inset-0"
                  />
               )}
            </div>
          ) : (
            /* Premium "No Video" Island */
            <div className="w-full max-w-7xl aspect-video md:h-[40vh] lg:h-[45vh] rounded-none! overflow-hidden bg-slate-900 relative shadow-2xl flex flex-col items-center justify-center group border-8 border-slate-800">
               {/* Decorative Background Elements */}
               <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-950 opacity-90" />
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
               
               {/* Glass UI Panel */}
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-10 md:p-16 flex flex-col items-center text-center max-w-md mx-6 rounded-none!"
               >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-none! flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-transform group-hover:scale-110 duration-500">
                     <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white opacity-40 shadow-glow" />
                  </div>
                  <h3 className="text-lg md:text-2xl font-bold text-white mb-3 tracking-wide uppercase">No video to be played</h3>
                  <p className="text-white/60 text-xs md:text-sm leading-relaxed font-light">
                     Select a project video from the sidebar to begin viewing.
                  </p>
                  <div className="mt-8 flex gap-2">
                     <div className="w-1 h-1 rounded-none! bg-primary animate-pulse" />
                     <div className="w-1 h-1 rounded-none! bg-primary/60 animate-pulse delay-75" />
                     <div className="w-1 h-1 rounded-none! bg-primary/30 animate-pulse delay-150" />
                  </div>
               </motion.div>
            </div>
          )}
        </div>

        {/* The Leather Book Wrapper & Viewer Zone */}
        <div className="w-full flex-1 flex flex-col items-center justify-start py-10 md:py-16">
          
          <div className="w-full max-w-7xl px-4 md:px-8 relative">
            <div className="w-full aspect-3/4 md:aspect-16/14 lg:aspect-16/15 max-h-[92vh] bg-[#3a2012] rounded-none shadow-[inset_0_0_80px_rgba(0,0,0,0.9),0_50px_100px_-20px_rgba(0,0,0,0.8)] border-4 border-[#1c0f08] p-2 md:p-5 relative flex items-stretch overflow-visible">
               
                {/* Extra spine edge left */}
                {!isMobile && <div className="absolute left-0 top-0 bottom-0 w-6 bg-[#1f1008] opacity-80 rounded-none shadow-[inset_-3px_0_10px_rgba(255,255,255,0.05)] z-0" />}

                {/* Leather Texture Overlay */}
                <div className="absolute inset-0 opacity-50 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/leather.png')] pointer-events-none rounded-none" />
                
                {/* Middle Binding for cover */}
                {!isMobile && (
                   <div className="absolute left-1/2 top-0 bottom-0 w-10 -translate-x-1/2 bg-linear-to-r from-black/80 via-black/20 to-black/80 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] z-0 rounded-none" />
                )}

                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={`${activeProjectId}-${currentPage}`}
                    custom={direction}
                    variants={{
                      initial: (d: number) => ({ 
                        opacity: 0, 
                        rotateY: d > 0 ? 90 : -90, 
                        x: d > 0 ? "50%" : "-50%" 
                      }),
                      animate: { 
                        opacity: 1, 
                        rotateY: 0, 
                        x: 0 
                      },
                      exit: (d: number) => ({ 
                        opacity: 0, 
                        rotateY: d > 0 ? -90 : 90, 
                        x: d > 0 ? "-50%" : "50%" 
                      })
                    }}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    drag={isMobile ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -50) handleNextPage();
                      if (info.offset.x > 50) handlePrevPage();
                    }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    style={{ perspective: 1000, transformStyle: "preserve-3d" }}
                    className={`w-full h-full bg-[#fdfdfc] rounded-md shadow-[inset_0_0_20px_rgba(0,0,0,0.03),0_10px_20px_rgba(0,0,0,0.4)] border-r-8 border-b-8 border-l border-t border-r-[#e2e4e8] border-b-[#e2e4e8] border-l-slate-200 border-t-slate-200 flex relative overflow-hidden z-10 ${
                      isMobile ? "flex-col overflow-y-auto" : "flex-row"
                    }`}
                  >
                 {/* Center binding visual for desktop */}
                {!isMobile && (
                  <div className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 bg-[url('https://images.unsplash.com/photo-1589998059171-989d887dda19?q=80&w=100&auto=format&fit=crop')] bg-repeat-y opacity-30 z-10 shadow-[inset_0_0_15px_rgba(0,0,0,0.3)] pointer-events-none mix-blend-overlay" />
                )}
                {!isMobile && (
                   <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300 z-10 shadow-[0_0_10px_rgba(0,0,0,0.1)] pointer-events-none" />
                )}

                {isFooterPage ? (
                   <div className={`flex w-full h-full ${isMobile ? "flex-col min-h-full" : "flex-row"}`}>
                      <div className="flex-1 p-6 md:p-16 flex flex-col justify-center items-start border-r border-slate-100 relative bg-[#fafafa]">
                          <h2 className="text-2xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4 md:mb-6 mt-2 md:mt-4">
                              Let&apos;s Connect
                          </h2>
                          <div className="w-10 md:w-12 h-1 bg-primary mb-4 md:mb-8" />
                          <p className="text-slate-600 mb-4 md:mb-8 max-w-md text-sm md:text-lg leading-relaxed">
                              Impressed by the collection? I&apos;m always open to discussing projects, ideas, or opportunities.
                          </p>
                          
                          <div className="space-y-3 md:space-y-4 w-full max-w-sm">
                              <input type="text" placeholder="Your Details" className="w-full p-3 md:p-4 bg-white border border-slate-300 rounded-md outline-none text-sm" disabled />
                              <button className="w-full py-3 md:py-4 bg-slate-900 text-white font-bold rounded-md text-xs md:text-sm uppercase tracking-wider">
                                  Contact Me
                              </button>
                          </div>
                      </div>
                      <div className="flex-1 min-h-[250px] md:min-h-full bg-slate-900 relative flex items-center justify-center p-6 overflow-hidden group">
                           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000 ease-out" />
                           <div className="z-10 text-center relative">
                               <div className="w-32 h-32 mx-auto border-[3px] border-white/20 rounded-full flex items-center justify-center mb-6 overflow-hidden shadow-2xl bg-white/5 backdrop-blur-sm p-1">
                                   <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Ehas&backgroundColor=transparent`} alt="Avatar" width={120} height={120} className="rounded-full" />
                               </div>
                               <h3 className="text-3xl font-extrabold text-white mb-2 tracking-[0.2em] uppercase">EHAS</h3>
                               <p className="text-white/60 font-medium tracking-wide uppercase text-sm">Creative Portfolio</p>
                           </div>
                      </div>
                   </div>
                ) : (
                  <div className={`flex w-full h-full ${isMobile ? "flex-col" : "flex-row"}`}>
                      {/* Left Page (Or single mobile page) */}
                      {currentItems[0] && (
                      <div className="flex-1 w-full h-full relative group p-4 md:p-8 flex items-center justify-center bg-[#fafafa]">
                          {currentItems[0].type === "image" ? (
                          <div className="w-full h-full relative overflow-hidden flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.08)] bg-white rounded-sm border border-slate-100 p-2 cursor-pointer" onClick={() => setSelectedImage(currentItems[0])}>
                               <Image
                                  src={currentItems[0].url}
                                  alt={currentItems[0].title}
                                  fill
                                  className="object-contain hover:scale-[1.02] transition-transform duration-500 ease-out p-1"
                                  unoptimized
                              />
                          </div>
                          ) : (
                          <div 
                              className="w-full relative aspect-video cursor-pointer group shadow-[0_5px_15px_rgba(0,0,0,0.1)] rounded-sm overflow-hidden hover:ring-2 ring-primary/50 transition-all bg-black flex items-center"
                              onClick={() => setUserSelectedVideo(currentItems[0].url)}
                          >
                              {currentItems[0].thumbnailUrl && (
                                  <Image
                                      src={currentItems[0].thumbnailUrl}
                                      alt={currentItems[0].title}
                                      fill
                                      className="object-cover group-hover:opacity-75 transition-all duration-300"
                                      unoptimized
                                  />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-16 h-16 bg-white/90 shadow-lg rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                      <Play className="w-8 h-8 text-black fill-black ml-1" />
                                  </div>
                              </div>
                          </div>
                          )}
                          <div className="absolute bottom-4 left-0 right-0 text-center px-4">
                               <span className="text-xs text-slate-400 font-medium bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                                   {currentItems[0].title}
                               </span>
                          </div>
                      </div>
                      )}

                      {/* Right Page (Desktop only) */}
                      {!isMobile && (
                          <div className="flex-1 w-full h-full relative group p-4 md:p-8 flex items-center justify-center bg-[#fafafa]">
                             {currentItems[1] ? (
                                  <>
                                  {currentItems[1].type === "image" ? (
                                  <div className="w-full h-full relative overflow-hidden flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.08)] bg-white rounded-sm border border-slate-100 p-2 cursor-pointer" onClick={() => setSelectedImage(currentItems[1])}>
                                       <Image
                                          src={currentItems[1].url}
                                          alt={currentItems[1].title}
                                          fill
                                          className="object-contain hover:scale-[1.02] transition-transform duration-500 ease-out p-1"
                                          unoptimized
                                      />
                                  </div>
                                  ) : (
                                  <div 
                                      className="w-full relative aspect-video cursor-pointer group shadow-[0_5px_15px_rgba(0,0,0,0.1)] rounded-sm overflow-hidden hover:ring-2 ring-primary/50 transition-all bg-black flex items-center"
                                      onClick={() => setUserSelectedVideo(currentItems[1].url)}
                                  >
                                      {currentItems[1].thumbnailUrl && (
                                          <Image
                                              src={currentItems[1].thumbnailUrl}
                                              alt={currentItems[1].title}
                                              fill
                                              className="object-cover group-hover:opacity-75 transition-all duration-300"
                                              unoptimized
                                          />
                                      )}
                                      <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="w-16 h-16 bg-white/90 shadow-lg rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                              <Play className="w-8 h-8 text-black fill-black ml-1" />
                                          </div>
                                      </div>
                                  </div>
                                  )}
                                  <div className="absolute bottom-4 left-0 right-0 text-center px-4">
                                       <span className="text-xs text-slate-400 font-medium bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                                           {currentItems[1].title}
                                       </span>
                                  </div>
                                  </>
                              ) : (
                                  <div className="flex flex-col items-center justify-center h-full opacity-40">
                                     <div className="w-16 h-16 rounded-full border-2 border-slate-300 flex items-center justify-center mb-4">
                                          <div className="w-8 h-px bg-slate-300" />
                                     </div>
                                     <p className="text-slate-400 font-medium text-sm tracking-widest uppercase">End of Chapter</p>
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
                )}

                {/* Interaction Overlay: clickable sides with highly visible hover arrows */}
                {currentPage > 0 && (
                   <div onClick={handlePrevPage} className="absolute inset-y-0 left-0 w-1/5 md:w-1/4 cursor-[url('/cursor-left.png'),w-resize] z-20 group/left hover:bg-black/5 transition-colors duration-300 flex items-center pl-2 md:pl-6 overflow-hidden max-sm:hidden">
                       <div className="bg-black/50 backdrop-blur-md text-white p-3 md:p-4 rounded-full opacity-50 md:opacity-0 group-hover/left:opacity-100 transition-all transform -translate-x-8 group-hover/left:translate-x-0 shadow-2xl">
                           <ChevronLeft className="w-8 h-8 md:w-12 md:h-12 ml-[-2px]" />
                       </div>
                   </div>
                )}
                {currentPage < totalSpreads - 1 && (
                   <div onClick={handleNextPage} className="absolute inset-y-0 right-0 w-1/5 md:w-1/4 cursor-[url('/cursor-right.png'),e-resize] z-20 group/right hover:bg-black/5 transition-colors duration-300 flex items-center justify-end pr-2 md:pr-6 overflow-hidden max-sm:hidden">
                       <div className="bg-black/50 backdrop-blur-md text-white p-3 md:p-4 rounded-full opacity-50 md:opacity-0 group-hover/right:opacity-100 transition-all transform translate-x-8 group-hover/right:translate-x-0 shadow-2xl">
                           <ChevronRight className="w-8 h-8 md:w-12 md:h-12 mr-[-2px]" />
                       </div>
                   </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Prominent Book Navigation Underneath */}
            <div className="absolute left-0 right-0 -bottom-24 md:-bottom-28 flex justify-center items-center gap-6">
                <Button variant="outline" size="lg" onClick={handlePrevPage} disabled={currentPage === 0} className="rounded-full shadow-lg bg-white border-slate-300 w-14 h-14 hover:bg-slate-50 transition-all active:scale-95">
                    <ChevronLeft className="w-8 h-8 text-slate-800 ml-[-2px]" />
                </Button>
               <div className="flex gap-3 p-4 bg-white/95 backdrop-blur-sm shadow-xl rounded-full border border-slate-300">
                   {Array.from({ length: totalSpreads }).map((_, idx) => (
                       <div 
                          key={idx} 
                          className={`h-3 rounded-full transition-all duration-300 ${currentPage === idx ? 'bg-primary w-10 shadow-[0_0_10px_rgba(var(--primary),0.5)]' : 'bg-slate-300 w-3'}`}
                       />
                   ))}
               </div>
               <Button variant="outline" size="lg" onClick={handleNextPage} disabled={currentPage >= totalSpreads - 1} className="rounded-full shadow-lg bg-white border-slate-300 w-14 h-14 hover:bg-slate-50 transition-all active:scale-95">
                    <ChevronRight className="w-8 h-8 text-slate-800 mr-[-2px]" />
                </Button>
            </div>
          </div>

        </div>
        </div>
      </main>

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="absolute top-6 right-6 text-white hover:text-primary transition-colors z-110"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <X className="w-10 h-10" />
            </motion.button>
            
            <motion.div
              layoutId={selectedImage._id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage.url}
                alt={selectedImage.title}
                width={1600}
                height={1200}
                className="w-full h-full object-contain rounded-lg shadow-2xl shadow-primary/20"
                unoptimized
              />
              <div className="absolute bottom-[-40px] left-0 right-0 text-center">
                <p className="text-white font-medium text-lg tracking-wide uppercase">{selectedImage.title}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
