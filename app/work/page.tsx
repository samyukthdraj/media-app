import { getPublicGalleryAction } from "@/lib/actions";
import { Navbar, Footer } from "@/components/PublicLayout";
import Image from "next/image";
import Link from "next/link";

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
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 lg:px-12 py-8 lg:py-12">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {projects.map((project: any) => (
            <Link href={`/work/${project._id}`} key={project._id} className="group flex flex-col gap-4">
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
              <div className="text-center">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 uppercase tracking-wide group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
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
