import { getPublicGalleryAction } from "@/lib/actions";
import ProjectDetailViewer from "@/components/ProjectDetailViewer";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  const res = await getPublicGalleryAction();

  if (!res.success || !res.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-red-500 font-medium">Failed to load project.</p>
      </div>
    );
  }

  const project = res.data.projects.find((p: any) => p._id === id);
  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white border border-red-500">
        <p className="text-red-500 font-medium text-4xl">Project not found.</p>
      </div>
    );
  }

  const projectMedia = res.data.media.filter((m: any) => m.projectId?.toString() === id || (m.projectId && m.projectId._id === id));

  return <ProjectDetailViewer project={project} media={projectMedia} />;
}
