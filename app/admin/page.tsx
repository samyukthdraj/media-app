"use client";

import "@uploadthing/react/styles.css";
import { AdminSortableMediaList } from "@/components/AdminSortableMediaList";
import { useState, ChangeEvent } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import OverflowTooltipText from "@/components/OverflowTooltipText";
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
import { 
  saveMediaAction, 
  getAdminMediaAction, 
  deleteMediaAction, 
  createProjectAction, 
  getProjectsAction, 
  deleteProjectAction, 
  renameProjectAction, 
  updateProjectAction 
} from "@/lib/actions";
import { getYouTubeID } from "@/utils/youtube";
import { toast } from "sonner";
import { Lock, Image as ImageIcon, LogOut, Trash2, List, PlaySquare, Loader2, Folder, X, Upload, Pencil, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ProjectItem {
  _id: string;
  name: string;
  thumbnailUrl?: string;
  createdAt: string;
}

interface MediaItem {
  _id: string;
  title: string;
  type: "image" | "video" | "text-image";
  textContent?: string;
  imageAlignment?: "left" | "right";
  order?: number;
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
  const [textContent, setTextContent] = useState("");
  const [imageAlignment, setImageAlignment] = useState<"left" | "right">("left");
  const [textImageUrl, setTextImageUrl] = useState("");
  const [videoPreviewId, setVideoPreviewId] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectThumbnail, setNewProjectThumbnail] = useState("");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState("");
  
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
            projectId: activeProjectId || undefined,
          });
        }
        toast.success("All images published!", { id: toastId });
        setSelectedFiles([]);
        setPreviews([]);
        qc.invalidateQueries({ queryKey: ["adminMedia"] });
      } catch {
        toast.error("Error saving some files", { id: toastId });
      }
    },
    onUploadError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const { startUpload: startTiUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        setTextImageUrl(res[0].url);
        toast.success("Section image uploaded");
      }
    }
  });

  const { startUpload: startProjectThumbUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        setNewProjectThumbnail(res[0].url);
        toast.success("Thumbnail uploaded");
      }
    }
  });

  const { data: mediaResponse, isLoading: isLoadingMedia } = useQuery({
    queryKey: ["adminMedia"],
    queryFn: getAdminMediaAction,
  });

  const { data: projectsResponse } = useQuery({
    queryKey: ["adminProjects"],
    queryFn: getProjectsAction,
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: { name: string, thumbnailUrl?: string }) => createProjectAction(data.name, data.thumbnailUrl),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Project created!");
        setNewProjectName("");
        setNewProjectThumbnail("");
        qc.invalidateQueries({ queryKey: ["adminProjects"] });
      } else {
        toast.error(res.error || "Failed to create project");
      }
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProjectAction,
    onSuccess: () => {
      toast.success("Project deleted");
      setActiveProjectId(null);
      qc.invalidateQueries({ queryKey: ["adminProjects"] });
      qc.invalidateQueries({ queryKey: ["adminMedia"] });
    }
  });

  const deleteMediaMutation = useMutation({
    mutationFn: deleteMediaAction,
    onSuccess: () => {
      toast.success("Media deleted");
      qc.invalidateQueries({ queryKey: ["adminMedia"] });
    }
  });

  const renameProjectMutation = useMutation({
    mutationFn: (data: { id: string, name: string }) => renameProjectAction(data.id, data.name),
    onSuccess: () => {
      toast.success("Project renamed");
      setRenamingProjectId(null);
      qc.invalidateQueries({ queryKey: ["adminProjects"] });
    }
  });

  const updateProjectDetailsMutation = useMutation({
    mutationFn: (data: { id: string, updates: { name?: string, thumbnailUrl?: string } }) => updateProjectAction(data.id, data.updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminProjects"] });
    }
  });

  const saveVideoMutation = useMutation({
    mutationFn: saveMediaAction,
    onSuccess: () => {
      toast.success("Video added!");
      setYtUrl("");
      setVideoPreviewId("");
      qc.invalidateQueries({ queryKey: ["adminMedia"] });
    }
  });

  const saveTextImageMutation = useMutation({
    mutationFn: saveMediaAction,
    onSuccess: () => {
      toast.success("Section added!");
      setTextContent("");
      setTextImageUrl("");
      qc.invalidateQueries({ queryKey: ["adminMedia"] });
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASS || "admin123";
    if (password === adminPass) {
      setAuthorized(true);
      toast.success("Welcome, Admin");
    } else {
      toast.error("Incorrect Password");
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAll = () => {
    if (selectedFiles.length > 0) {
      startUpload(selectedFiles);
    }
  };

  const handleYtUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setYtUrl(url);
    const id = getYouTubeID(url);
    setVideoPreviewId(id || "");
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden rounded-2xl">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="space-y-1 text-center pt-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
              <CardDescription>Enter your credentials to manage your portfolio</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input 
                  type="password" 
                  placeholder="Password" 
                  className="h-12 text-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                <Button type="submit" className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20">
                  Secure Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const mediaList = mediaResponse?.data || [];
  const projects = projectsResponse?.data || [];
  const projectMediaCount = (id: string) => mediaList.filter((m: MediaItem) => (m.projectId?._id || m.projectId)?.toString() === id.toString()).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      <nav className="h-20 bg-white border-b border-slate-200 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">EHAS Admin</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setAuthorized(false)} className="text-slate-500 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-12">
        <Tabs defaultValue="library" className="w-full space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-white border shadow-sm p-1 h-14 rounded-2xl w-full max-w-lg">
              <TabsTrigger value="library" className="rounded-xl h-full flex-1 data-[state=active]:bg-slate-50">
                <List className="w-4 h-4 mr-2" /> Library
              </TabsTrigger>
              <TabsTrigger value="projects" className="rounded-xl h-full flex-1 data-[state=active]:bg-slate-50">
                <Folder className="w-4 h-4 mr-2" /> Projects
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="projects" className="mt-0 outline-none w-full">
            <AnimatePresence mode="wait">
              {!activeProjectId ? (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <CardTitle>Create New Project</CardTitle>
                      <CardDescription>Grouping media into projects makes managing your library easier.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (newProjectName.trim()) createProjectMutation.mutate({ name: newProjectName, thumbnailUrl: newProjectThumbnail });
                        }}
                        className="space-y-4"
                      >
                        <Input placeholder="Project Name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
                        <div className="space-y-2">
                           <p className="text-sm font-medium text-muted-foreground">Project Thumbnail (Optional)</p>
                           {newProjectThumbnail ? (
                             <div className="relative w-full aspect-video rounded-xl overflow-hidden border">
                               <Image src={newProjectThumbnail} alt="preview" fill className="object-cover" />
                               <Button type="button" size="icon-sm" variant="destructive" className="absolute top-2 right-2" onClick={() => setNewProjectThumbnail("")}><Trash2 className="w-4 h-4"/></Button>
                             </div>
                           ) : (
                             <label className="w-full h-32 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                               <span className="text-sm text-slate-500">+ Upload Thumbnail</span>
                               <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                 if(e.target.files?.[0]) startProjectThumbUpload([e.target.files[0]]);
                               }} />
                             </label>
                           )}
                        </div>
                        <Button type="submit" className="w-full h-12" disabled={!newProjectName.trim() || createProjectMutation.isPending}>
                          {createProjectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : "Create Project"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md">
                    <CardHeader><CardTitle>Existing Projects</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {projects.map((p: ProjectItem) => (
                        <div key={p._id} onClick={() => setActiveProjectId(p._id)} className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer gap-3 min-w-0">
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                              {p.thumbnailUrl ? <Image src={p.thumbnailUrl} alt={p.name} width={48} height={48} className="object-cover h-full w-full" /> : <Folder className="w-6 h-6 text-slate-400" />}
                            </div>
                            <div className="min-w-0 flex-1">
                               <OverflowTooltipText as="p" text={p.name} className="font-bold truncate" />
                               <p className="text-xs text-slate-400 uppercase font-bold tracking-tight">{projectMediaCount(p._id)} Items</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setRenamingProjectId(p._id); setRenamingName(p.name); }}>
                              <Pencil className="w-4 h-4 text-slate-400" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500"><Trash2 className="w-4 h-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                                  <AlertDialogDescription>This will remove the project and all its media.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteProjectMutation.mutate(p._id)} className="bg-red-600">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="flex items-center justify-between gap-4 min-w-0">
                    <Button variant="ghost" className="pl-0" onClick={() => setActiveProjectId(null)}>← Back to Projects</Button>
                    <OverflowTooltipText
                      as="h2"
                      text={projects.find((p: ProjectItem) => p._id === activeProjectId)?.name}
                      className="text-2xl font-bold min-w-0 flex-1 text-right truncate"
                    />
                  </div>

                  <Tabs defaultValue="p-photo" className="w-full">
                    <div className="flex justify-center mb-6">
                      <TabsList className="grid w-full max-w-xl grid-cols-4 bg-muted/50">
                        <TabsTrigger value="p-thumbnail">Thumbnail</TabsTrigger>
                        <TabsTrigger value="p-photo">Photos</TabsTrigger>
                        <TabsTrigger value="p-video">Videos</TabsTrigger>
                        <TabsTrigger value="p-textimage">Text-Image</TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="p-thumbnail">
                        <Card className="border-0 shadow-md max-w-2xl mx-auto">
                          <CardHeader className="text-center font-bold">Project Cover Thumbnail</CardHeader>
                          <CardContent className="space-y-6">
                            <div className="flex flex-col items-center gap-4">
                              {projects.find((p: ProjectItem) => p._id === activeProjectId)?.thumbnailUrl ? (
                                <div className="relative w-full aspect-video border rounded-xl overflow-hidden shadow-sm">
                                  <Image src={projects.find((p: ProjectItem) => p._id === activeProjectId)!.thumbnailUrl!} alt="Cover" fill className="object-cover" />
                                  <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    className="absolute top-2 right-2"
                                    onClick={() => updateProjectDetailsMutation.mutate({ id: activeProjectId!, updates: { thumbnailUrl: '' } })}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <label className="w-full h-48 border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-slate-50 rounded-xl transition-colors">
                                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <ImageIcon className="w-8 h-8" />
                                    <span>Upload Project Cover Photo</span>
                                  </div>
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                    if(e.target.files?.[0]) {
                                      toast.loading("Uploading cover...", { id: "p-thumb" });
                                      startProjectThumbUpload([e.target.files[0]]).then(res => {
                                        if(res?.[0]) {
                                          updateProjectDetailsMutation.mutate({ id: activeProjectId!, updates: { thumbnailUrl: res[0].url } });
                                          toast.success("Cover updated", { id: "p-thumb" });
                                        }
                                      }).catch(() => toast.error("Upload failed", { id: "p-thumb" }));
                                    }
                                  }} />
                                </label>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="p-photo">
                      <Card className="border-0 shadow-md max-w-3xl mx-auto p-8 text-center space-y-6">
                         <CardTitle>Staged Image Upload</CardTitle>
                         <label className="border-2 border-dashed py-12 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors">
                           <ImageIcon className="w-12 h-12 text-primary" />
                           <span className="font-semibold text-lg">Click to select photos</span>
                           <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileSelect} />
                         </label>
                         {previews.length > 0 && (
                           <div className="grid grid-cols-3 gap-4">
                             {previews.map((src, i) => (
                               <div key={i} className="relative aspect-square border rounded-xl overflow-hidden group">
                                 <Image src={src} alt="preview" fill className="object-cover" />
                                 <Button variant="destructive" size="icon-sm" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100" onClick={() => removeFile(i)}><X className="w-4 h-4"/></Button>
                               </div>
                             ))}
                             <Button className="col-span-full h-12" size="lg" onClick={handleUploadAll} disabled={isUploading}>{isUploading ? <Loader2 className="animate-spin mr-2"/> : <Upload className="mr-2"/>} Publish {selectedFiles.length} Photos</Button>
                           </div>
                         )}
                      </Card>
                    </TabsContent>

                    <TabsContent value="p-video">
                      <Card className="border-0 shadow-md max-w-2xl mx-auto p-8">
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (videoPreviewId) saveVideoMutation.mutate({ title: "Video " + Date.now(), type: "video", url: videoPreviewId, projectId: activeProjectId! });
                          }}
                          className="space-y-6"
                        >
                          <Input placeholder="YouTube URL..." value={ytUrl} onChange={handleYtUrlChange} />
                          {videoPreviewId && (
                            <div className="aspect-video rounded-xl overflow-hidden border">
                              <iframe src={`https://www.youtube.com/embed/${videoPreviewId}`} className="w-full h-full border-0" allowFullScreen />
                            </div>
                          )}
                          <Button type="submit" className="w-full h-12" disabled={!videoPreviewId}>Link Video</Button>
                        </form>
                      </Card>
                    </TabsContent>

                    <TabsContent value="p-textimage">
                      <Card className="border-0 shadow-md max-w-2xl mx-auto p-8 space-y-6">
                        <textarea className="w-full h-32 p-4 border rounded-xl focus:ring-2 ring-primary outline-none" placeholder="Text content..." value={textContent} onChange={e => setTextContent(e.target.value)} />
                        <div className="flex gap-8 justify-center">
                           <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="align" checked={imageAlignment==='left'} onChange={()=>setImageAlignment('left')}/> Text Left</label>
                           <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="align" checked={imageAlignment==='right'} onChange={()=>setImageAlignment('right')}/> Image Left</label>
                        </div>
                        {textImageUrl ? (
                          <div className="relative aspect-video rounded-xl overflow-hidden border mx-auto w-48">
                            <Image src={textImageUrl} alt="section" fill className="object-cover" />
                            <Button size="icon-sm" variant="destructive" className="absolute top-1 right-1" onClick={()=>setTextImageUrl("")}><Trash2 className="w-4 h-4"/></Button>
                          </div>
                        ) : (
                          <label className="h-24 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                            <span>Upload Section Image</span>
                            <input type="file" className="hidden" accept="image/*" onChange={e => {if(e.target.files?.[0]) startTiUpload([e.target.files[0]])}} />
                          </label>
                        )}
                        <Button className="w-full h-12" disabled={!textContent || !textImageUrl} onClick={() => saveTextImageMutation.mutate({ title: "Section "+Date.now(), type: "text-image", url: textImageUrl, textContent, imageAlignment, projectId: activeProjectId! })}>Add Text-Image Section</Button>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  <div className="border-t pt-8">
                    <OverflowTooltipText
                      as="h3"
                      text={`${projects.find((p: ProjectItem)=>p._id === activeProjectId)?.name || ""} Content`}
                      className="text-xl font-semibold mb-6 truncate"
                    />
                    <AdminSortableMediaList key={activeProjectId || 'none'} items={mediaList.filter((m: MediaItem) => m.projectId?._id?.toString() === activeProjectId?.toString())} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="library">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoadingMedia ? Array.from({length:8}).map((_,i)=><Skeleton key={i} className="aspect-square rounded-2xl" />) : 
                mediaList.map((item: MediaItem) => (
                  <Card key={item._id} className="group border-muted shadow-sm hover:shadow-md transition-all relative rounded-2xl bg-white aspect-square flex flex-col">
                    <div className="relative flex-1 bg-muted/20 rounded-t-2xl overflow-hidden">

                      <Image src={item.type === 'video' ? (item.thumbnailUrl || `https://img.youtube.com/vi/${item.url}/mqdefault.jpg`) : item.url} alt={item.title} fill className="object-cover" unoptimized/>
                      {item.type === 'video' && <PlaySquare className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white w-10 h-10 drop-shadow-md" />}
                      {item.type === 'text-image' && <FileText className="absolute top-2 left-2 text-white/50 w-5 h-5"/>}
                    </div>
                    <div className="p-3 border-t flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <OverflowTooltipText
                            as="p"
                            text={item.projectId?.name || "Unassigned"}
                            className="text-xs font-bold text-slate-400 uppercase tracking-tighter truncate"
                          />
                        </div>
                        <span className="text-[10px] text-slate-300 font-medium whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <OverflowTooltipText 
                            as="p" 
                            text={item.title} 
                            className="text-sm font-semibold truncate" 
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:bg-red-50 hover:text-red-600 h-7 w-7 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Permanently delete "${item.title}" from library?`)) {
                              deleteMediaMutation.mutate(item._id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                  </Card>
                ))
              }
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!renamingProjectId} onOpenChange={(open) => !open && setRenamingProjectId(null)}>
        <DialogContent>
          <CardHeader className="px-0"><CardTitle>Rename Project</CardTitle></CardHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (renamingProjectId && renamingName.trim()) renameProjectMutation.mutate({ id: renamingProjectId, name: renamingName });
            }}
            className="space-y-4 pt-4"
          >
            <Input value={renamingName} onChange={e => setRenamingName(e.target.value)} />
            <Button type="submit" className="w-full">Save Name</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
