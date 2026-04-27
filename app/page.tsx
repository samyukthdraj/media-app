import { getPublicGalleryAction } from "@/lib/actions";
import { PublicBookViewer } from "@/components/PublicBookViewer";

export default async function Home() {
  const res = await getPublicGalleryAction();

  if (!res.success || !res.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-red-100">
          <p className="text-red-500 font-medium">Failed to load portfolio data.</p>
        </div>
      </div>
    );
  }

  const { projects, media } = res.data;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <nav className="h-16 border-b border-slate-200 flex items-center justify-center px-6 bg-white sticky top-0 z-50 shadow-sm">
        <span className="font-extrabold text-2xl tracking-[0.2em] uppercase text-slate-900 text-center">Ehas</span>
      </nav>
      <PublicBookViewer projects={projects} media={media} />
    </div>
  );
}
