import { getPublicGalleryAction } from "@/lib/actions";
import ProjectDetailViewer from "@/components/ProjectDetailViewer";
import { IProject, IMedia } from "@/lib/models";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const res = await getPublicGalleryAction();
  
  if (!res.success || !res.data) return { title: "Project Not Found" };
  
  const project = (res.data.projects as IProject[]).find((p: IProject) => p._id === id);
  if (!project) return { title: "Project Not Found" };
  
  return {
    title: `${project.name} | Neha Sreejith`,
    description: `View details for the project "${project.name}" by Neha Sreejith.`,
    openGraph: {
      images: project.thumbnailUrl ? [project.thumbnailUrl] : [],
    },
  };
}

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

  const project = (res.data.projects as IProject[]).find((p: IProject) => p._id === id);
  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white border border-red-500">
        <p className="text-red-500 font-medium text-4xl">Project not found.</p>
      </div>
    );
  }

  const projectMedia = (res.data.media as IMedia[]).filter((m: IMedia) => {
    const pId = m.projectId;
    const matchesId = typeof pId === 'string' ? pId === id : pId?._id === id;
    return (matchesId && !!m.url) || (matchesId && m.type === 'text-image');
  });



  return <ProjectDetailViewer project={project} media={projectMedia} />;
}
