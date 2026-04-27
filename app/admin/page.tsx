"use client";

import "@uploadthing/react/styles.css";
import { useState, ChangeEvent, useRef, useEffect } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
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
import { useUploadThing } from "@/utils/uploadthing";
import { saveMediaAction, getAdminMediaAction, deleteMediaAction, createProjectAction, getProjectsAction, deleteProjectAction, renameProjectAction } from "@/lib/actions";
import { getYouTubeID } from "@/utils/youtube";
import { toast } from "sonner";
import { Lock, Image as ImageIcon, Video, LogOut, Trash2, List, PlaySquare, FolderX, Loader2, Folder, Plus, X, Upload, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ProjectItem {
  _id: string;
  name: string;
  createdAt: string;
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

export default function AdminPage() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        refetchOnWindowFocus: true,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AdminDashboard />
    </QueryClientProvider>
  );
}

function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [videoPreviewId, setVideoPreviewId] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const activeProjectIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeProjectIdRef.current = activeProjectId;
  }, [activeProjectId]);

  const qc = useQueryClient();

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: async (res) => {
      const toastId = toast.loading("Finalizing gallery...");
      try {
        for (const file of res) {
          await saveMediaAction({
            title: file.name,
            type: "image",
            url: file.url,
            fileKey: file.key,
            projectId: activeProjectIdRef.current || undefined
          });
        }
        toast.success("All photos published!", { id: toastId });
        setSelectedFiles([]);
        setPreviews([]);
        qc.invalidateQueries({ queryKey: ["adminMedia"] });
      } catch {
        toast.error("Database sync failed", { id: toastId });
      }
    },
    onUploadError: (e) => { toast.error(`Upload error: ${e.message}`); }
  });

  // Queries
  const { data: mediaList = [], isLoading: loadingMedia, error: mediaError } = useQuery({
    queryKey: ["adminMedia"],
    queryFn: async () => {
      const res = await getAdminMediaAction();
      if (!res.success) throw new Error(res.error || "Failed to load");
      return res.data as MediaItem[];
    },
    enabled: authorized,
    staleTime: 0,
    retry: false,
  });

  const filteredMedia = Array.isArray(mediaList) ? mediaList.filter(item => {
    if (selectedProjectId === "all") return true;
    const prodId = item.projectId?._id || item.projectId;
    return prodId?.toString() === selectedProjectId?.toString();
  }) : [];

  const projectMediaCount = (pid: string) => 
    Array.isArray(mediaList) ? mediaList.filter(item => (item.projectId?._id || item.projectId)?.toString() === pid?.toString()).length : 0;


  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await getProjectsAction();
      if (!res.success) throw new Error(res.error || "Failed to load projects");
      return res.data as ProjectItem[];
    },
    enabled: authorized,
  });

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: createProjectAction,
    onSuccess: () => {
      toast.success("Project created!");
      setNewProjectName("");
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["adminMedia"] });
    },
    onError: () => toast.error("Failed to create project")
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProjectAction,
    onSuccess: () => {
      toast.success("Project deleted");
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["adminMedia"] });
    }
  });

  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState("");

  const renameProjectMutation = useMutation({
    mutationFn: ({ id, name }: { id: string, name: string }) => renameProjectAction(id, name),
    onSuccess: () => {
      toast.success("Project renamed!");
      setRenamingProjectId(null);
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => toast.error("Failed to rename project")
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMediaAction,
    onSuccess: async (res) => {
      if (res.success) {
        // We await these to ensure the UI has updated BEFORE the toast appears
        await qc.invalidateQueries({ queryKey: ["adminMedia"], refetchType: 'all' });
        await qc.refetchQueries({ queryKey: ["adminMedia"] });
        toast.success("Media deleted successfully");
      } else {
        toast.error(res.error || "Failed to delete");
      }
    },
    onError: () => toast.error("An error occurred during deletion"),
  });

  const saveVideoMutation = useMutation({
    mutationFn: saveMediaAction,
    onMutate: () => {
      toast.loading("Saving video...", { id: "save-video" });
    },
    onSuccess: () => {
      toast.success("Video posted correctly!", { id: "save-video" });
      setYtUrl("");
      setVideoPreviewId("");
      qc.invalidateQueries({ queryKey: ["adminMedia"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast.error("Failed to save video", { id: "save-video" });
    }
  });

  // Handlers
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...newFiles]);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return toast.error("No files selected");
    toast.promise(startUpload(selectedFiles), {
      loading: 'Uploading to EHAS...',
      success: 'Files sent to server!',
      error: 'Upload failed'
    });
  };

  const handleLogin = () => {
    // In production, compare against process.env.NEXT_PUBLIC_ADMIN_PASS
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASS) {
      setAuthorized(true);
      toast.success("Welcome back, Admin");
    } else {
      toast.error("Invalid credentials");
    }
  };

  const handleYtUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setYtUrl(url);
    const id = getYouTubeID(url);
    if (id) {
      setVideoPreviewId(id);
    } else {
      setVideoPreviewId("");
    }
  };



  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="shadow-lg border-0 shadow-primary/5">
            <CardHeader className="text-center pt-8 pb-4">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-105">
                <Lock className="text-primary w-8 h-8" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">Admin Portal</CardTitle>
              <CardDescription>Secure central hub</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pb-8">
              <Input
                type="password"
                placeholder="Enter Access Key"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="h-12 text-center text-lg focus-visible:ring-primary shadow-sm"
              />
              <Button className="w-full h-12 text-md transition-all active:scale-[0.98]" onClick={handleLogin}>
                Access Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <nav className="border-b sticky top-0 z-10 shadow-sm/50 backdrop-blur-md bg-white/80">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary to-primary/60">
            EHAS Admin
          </span>
          <Button variant="ghost" size="sm" onClick={() => setAuthorized(false)} className="hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 lg:px-8 py-8 md:py-12">
        <Tabs defaultValue="manage" className="w-full max-w-5xl mx-auto">
          <div className="flex justify-center w-full">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-10 h-12 bg-white border shadow-sm rounded-xl p-1">
              <TabsTrigger value="manage" className="flex items-center gap-2 rounded-lg transition-all data-[state=active]:shadow-sm">
                <List className="w-4 h-4" /> Library
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2 rounded-lg transition-all data-[state=active]:shadow-sm">
                <Folder className="w-4 h-4" /> Projects
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="w-full">
            {/* Manage Media Section */}
            <TabsContent value="manage" className="mt-0 outline-none w-full">
              <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Media Library</h2>
                  <p className="text-muted-foreground">Manage your uploaded photos and linked videos.</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm w-full md:w-auto">
                  <span className="text-xs font-semibold px-2 text-muted-foreground uppercase tracking-wider">Filter:</span>
                  <select 
                    className="bg-transparent text-sm font-medium outline-none pr-8 py-1 cursor-pointer"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                  >
                    <option value="all">All Projects</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {loadingMedia && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1,2,3,4,5,6].map((i) => (
                    <Card key={i} className="overflow-hidden border-muted shadow-sm">
                       <Skeleton className="w-full aspect-video rounded-none" />
                       <CardContent className="p-4 space-y-3">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-9 w-full mt-4" />
                       </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!loadingMedia && !mediaError && filteredMedia.length === 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed bg-white rounded-2xl">
                  <div className="w-24 h-24 bg-primary/5 flex items-center justify-center rounded-full mb-6">
                     <FolderX className="w-12 h-12 text-primary/60" />
                  </div>
                  <h3 className="text-xl font-bold">No media found</h3>
                  <p className="text-muted-foreground text-sm max-w-[280px] mt-2">No photos or videos match this selection.</p>
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredMedia.map((item: MediaItem) => (
                    <motion.div
                      layout
                      key={item._id}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="overflow-hidden group flex flex-col h-full border-muted-foreground/20 hover:border-primary/40 hover:shadow-md transition-all">
                        <div className="relative aspect-video bg-muted/30 w-full overflow-hidden flex items-center justify-center border-b">
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
                                  initial={{ opacity:0, scale: 0.95 }}
                                  animate={{ opacity:1, scale: 1 }}
                                  src={item.url} 
                                  alt={item.title} 
                                  className="max-w-[95vw] max-h-[90vh] rounded-xl object-contain drop-shadow-2xl" 
                                />
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <Dialog>
                               <DialogTrigger asChild>
                                <div className="relative w-full h-full cursor-pointer bg-slate-900 group-hover:bg-slate-800 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset overflow-hidden">
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
                                       <PlaySquare className="w-12 h-12 text-white/90 group-hover:text-white group-hover:scale-110 transition-transform duration-300 drop-shadow-lg absolute z-10" />
                                     </>
                                   ) : (
                                     <PlaySquare className="w-12 h-12 text-white/90 group-hover:text-white group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
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
                        
                        <CardContent className="p-4 flex-1 flex flex-col justify-between gap-4">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                               <p className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors" title={item.title}>{item.title}</p>
                               {item.projectId && (
                                 <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter shrink-0">
                                   {item.projectId.name}
                                 </span>
                               )}
                            </div>
                            <p className="text-xs text-muted-foreground capitalize mt-1 flex items-center gap-1.5 font-medium">
                              {item.type === "image" ? <ImageIcon className="w-3.5 h-3.5"/> : <Video className="w-3.5 h-3.5"/>}
                              {item.type} <span className="opacity-50">•</span> {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full mt-auto disabled:opacity-50 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                disabled={deleteMutation.isPending && deleteMutation.variables === item._id}
                              >
                                {deleteMutation.variables === item._id && deleteMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4 mr-2 opacity-70" /> 
                                )}
                                Delete File
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Media?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the 
                                  <span className="font-bold"> {item.title} </span> 
                                  {item.type} from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => deleteMutation.mutate(item._id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            {/* Projects Section */}
            <TabsContent value="projects" className="mt-0 outline-none w-full">
              <AnimatePresence mode="wait">
                {!activeProjectId ? (
                  <motion.div 
                    key="projects-list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <Card className="border-0 shadow-md h-fit">
                       <CardHeader>
                         <CardTitle>Create New Project</CardTitle>
                         <CardDescription>Grouping media into projects makes managing your library easier.</CardDescription>
                       </CardHeader>
                       <CardContent className="space-y-4">
                         <Input 
                           placeholder="Project Name (e.g. Summer Shoot 2024)" 
                           value={newProjectName} 
                           onChange={(e) => setNewProjectName(e.target.value)}
                           className="h-12"
                         />
                         <Button 
                           className="w-full h-12 text-md" 
                           disabled={createProjectMutation.isPending || !newProjectName.trim()}
                           onClick={() => createProjectMutation.mutate(newProjectName)}
                         >
                           {createProjectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4 mr-2" />} 
                           Create Project
                         </Button>
                       </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md">
                      <CardHeader>
                        <CardTitle>Existing Projects</CardTitle>
                        <CardDescription>Click a project to manage its media.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {projects.length === 0 && !loadingProjects && (
                            <p className="text-sm text-muted-foreground text-center py-8">No projects created yet.</p>
                          )}
                          <AnimatePresence>
                            {projects.map((p) => (
                              <motion.div 
                                key={p._id} 
                                layout 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg border hover:border-primary/40 hover:bg-white transition-all group cursor-pointer"
                                onClick={() => setActiveProjectId(p._id)}
                              >
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                                     <Folder className="w-4 h-4 text-primary" />
                                   </div>
                                   <div className="flex flex-col">
                                      <span className="font-semibold">{p.name}</span>
                                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                                        {projectMediaCount(p._id)} Items
                                      </span>
                                   </div>
                                </div>                                <div className="flex items-center gap-1">
                                  <Dialog open={renamingProjectId === p._id} onOpenChange={(open) => {
                                    if(!open) setRenamingProjectId(null);
                                  }}>
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-primary opacity-0 group-hover:opacity-100 transition-opacity p-0 h-8 w-8 hover:bg-primary/5"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setRenamingProjectId(p._id);
                                          setRenamingName(p.name);
                                        }}
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent onClick={(e) => e.stopPropagation()}>
                                      <CardHeader className="px-0">
                                        <CardTitle>Rename Project</CardTitle>
                                        <CardDescription>Enter a new name for your project collection.</CardDescription>
                                      </CardHeader>
                                      <div className="space-y-4 pt-4">
                                        <Input 
                                          value={renamingName}
                                          onChange={(e) => setRenamingName(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter" && renamingName.trim() && !renameProjectMutation.isPending) {
                                              renameProjectMutation.mutate({ id: p._id, name: renamingName });
                                            }
                                          }}
                                          placeholder="New project name..."
                                          autoFocus
                                        />
                                        <Button 
                                          className="w-full"
                                          disabled={!renamingName.trim() || renameProjectMutation.isPending}
                                          onClick={() => renameProjectMutation.mutate({ id: p._id, name: renamingName })}
                                        >
                                          {renameProjectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Changes"}
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0 h-8 w-8 hover:bg-red-50"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Project &quot;{p.name}&quot;?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will remove all media files associated with this project. This action is irreversible.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Keep Project</AlertDialogCancel>
                                        <AlertDialogAction 
                                          className="bg-red-600 hover:bg-red-700"
                                          onClick={() => deleteProjectMutation.mutate(p._id)}
                                        >
                                          Delete Everything
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="project-detail"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" className="pl-0" onClick={() => setActiveProjectId(null)}>
                        ← Back to Projects
                      </Button>
                      <h2 className="text-2xl font-bold">{projects.find(p => p._id === activeProjectId)?.name}</h2>
                    </div>

                    <Tabs defaultValue="p-photo" className="w-full">
                      <div className="flex justify-center mb-6">
                        <TabsList className="grid w-80 grid-cols-2 bg-muted/50">
                          <TabsTrigger value="p-photo">Photos</TabsTrigger>
                          <TabsTrigger value="p-video">Videos</TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="p-photo">
                        <Card className="border-0 shadow-md max-w-3xl mx-auto overflow-hidden">
                          <CardHeader className="text-center">
                            <CardTitle>Staged Image Upload</CardTitle>
                            <CardDescription>Select images to preview them before publishing.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="flex flex-col items-center">
                              <label className="w-full cursor-pointer">
                                <div className="border-2 border-dashed border-primary/20 bg-slate-50/50 hover:bg-slate-50 hover:border-primary/40 transition-all rounded-2xl py-12 flex flex-col items-center justify-center gap-3 group">
                                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ImageIcon className="w-8 h-8 text-primary" />
                                  </div>
                                  <div className="text-center">
                                    <p className="font-semibold text-lg">Click to select photos</p>
                                    <p className="text-sm text-muted-foreground">High resolution images supported</p>
                                  </div>
                                  <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleFileSelect}
                                  />
                                </div>
                              </label>

                              <AnimatePresence>
                                {previews.length > 0 && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="w-full mt-8 space-y-4"
                                  >
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Queue ({selectedFiles.length})</h4>
                                      <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:bg-red-50" onClick={() => { setSelectedFiles([]); setPreviews([]); }}>
                                        Clear All
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                      {previews.map((src, idx) => (
                                        <motion.div 
                                          key={src} 
                                          layout
                                          initial={{ scale: 0.8, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          className="relative aspect-square rounded-xl overflow-hidden border shadow-sm group bg-white"
                                        >
                                          <Image src={src} alt="preview" fill className="object-cover" />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button 
                                              variant="destructive" 
                                              size="icon-sm" 
                                              className="h-8 w-8"
                                              onClick={() => removeFile(idx)}
                                            >
                                              <X className="w-4 h-4" />
                                            </Button>
                                          </div>
                                          <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/60 text-[10px] text-white truncate text-center backdrop-blur-sm">
                                            {selectedFiles[idx]?.name}
                                          </div>
                                        </motion.div>
                                      ))}
                                    </div>
                                    <Button 
                                      className="w-full h-14 text-lg shadow-lg shadow-primary/20" 
                                      onClick={handleUploadAll}
                                      disabled={isUploading}
                                    >
                                      {isUploading ? (
                                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading...</>
                                      ) : (
                                        <><Upload className="w-5 h-5 mr-4" /> Publish All and Sync Gallery</>
                                      )}
                                    </Button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="p-video">
                        <Card className="border-0 shadow-md max-w-2xl mx-auto">
                          <CardHeader className="text-center font-bold">Link YouTube Video</CardHeader>
                          <CardContent className="space-y-6">
                            <Input
                              placeholder="YouTube URL..."
                              value={ytUrl}
                              onChange={handleYtUrlChange}
                              className="h-12"
                            />
                            
                            <AnimatePresence>
                              {videoPreviewId && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl overflow-hidden border bg-muted/20">
                                  <div className="aspect-video w-full bg-black">
                                    <iframe src={`https://www.youtube.com/embed/${videoPreviewId}`} allowFullScreen className="w-full h-full border-0" />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <Button
                              className="w-full h-12"
                              onClick={() => {
                                if (!videoPreviewId) return toast.error("Invalid YouTube URL");
                                saveVideoMutation.mutate({
                                  title: "Video Content " + new Date().toLocaleDateString(),
                                  type: "video",
                                  url: videoPreviewId,
                                  projectId: activeProjectId || undefined,
                                });
                              }}
                              disabled={saveVideoMutation.isPending || !videoPreviewId}
                            >
                              {saveVideoMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : "Post to Project"}
                            </Button>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>

                    <div className="border-t pt-8">
                       <h3 className="text-xl font-semibold mb-6">Project Content</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                         {Array.isArray(mediaList) && mediaList.filter(item => (item.projectId?._id || item.projectId)?.toString() === activeProjectId?.toString()).map(item => (
                            <Card key={item._id} className="overflow-hidden group border-muted shadow-sm hover:shadow-md transition-shadow relative">
                                <div className="relative aspect-video bg-muted/20">
                                   <Image 
                                      src={item.type === 'video' ? (item.thumbnailUrl || '') : item.url} 
                                      alt={item.title} 
                                      fill 
                                      className="object-cover" 
                                      unoptimized={item.type === 'image' && item.url.includes('utfs.io')}
                                   />
                                   {item.type === 'video' && <PlaySquare className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white w-10 h-10 drop-shadow-md" />}
                                </div>
                                <div className="p-3 flex items-center justify-between gap-4">
                                   <p className="text-sm font-medium line-clamp-1 truncate flex-1">{item.title}</p>
                                   <Button 
                                      variant="ghost" 
                                      size="icon-sm" 
                                      className="text-red-500 hover:bg-red-50 disabled:opacity-50" 
                                      onClick={() => deleteMutation.mutate(item._id)}
                                      disabled={deleteMutation.isPending && deleteMutation.variables === item._id}
                                   >
                                     {deleteMutation.isPending && deleteMutation.variables === item._id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
                                   </Button>
                                </div>
                            </Card>
                         ))}
                         {projectMediaCount(activeProjectId || '') === 0 && (
                            <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-slate-50">
                               No items in this project. Upload some above!
                            </div>
                         )}
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

          </div>
        </Tabs>
      </main>
    </div>
  );
}
