import { getPublicGalleryAction } from "@/lib/actions";
import { Navbar, Footer } from "@/components/PublicLayout";
import OverflowTooltipText from "@/components/OverflowTooltipText";
import Image from "next/image";
import Link from "next/link";
import { IProject } from "@/lib/models";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work | Neha Sreejith - Creative Media Portfolio",
  description: "Browse the creative projects and media showcases by Neha Sreejith. Featuring a curated collection of professional photography and video production.",
};

export default async function WorkPage() {
  const res = await getPublicGalleryAction();

  if (!res.success || !res.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-red-500 font-medium">Failed to load projects.</p>
      </div>
    );
  }

  const { projects } = res.data;

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 lg:px-12 py-8 lg:py-12">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {(projects as IProject[]).map((project: IProject) => (

            <Link href={`/work/${project._id}`} key={project._id} className="group flex flex-col gap-4 min-w-0">
              <div className="w-full aspect-square md:aspect-4/3 relative bg-slate-100 overflow-hidden border border-slate-200">
                {project.thumbnailUrl ? (
                  <Image 
                    src={project.thumbnailUrl} 
                    alt={project.name} 
                    fill 
                    className="object-cover group-hover:scale-105 group-hover:opacity-90 transition-all duration-700 ease-in-out cursor-pointer"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-semibold uppercase tracking-widest text-sm bg-slate-50 group-hover:bg-slate-100 transition-colors">
                    No Cover Available
                  </div>
                )}
              </div>
              <div className="text-center w-full min-w-0">
                <OverflowTooltipText
                  as="h3"
                  text={project.name}
                  className="block w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-lg md:text-xl font-bold text-slate-900 uppercase tracking-wide group-hover:text-primary transition-colors"
                />
              </div>
            </Link>
          ))}
          {projects.length === 0 && (
             <div className="col-span-full py-24 text-center text-slate-500 font-medium tracking-wide">
                No projects published yet.
             </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
