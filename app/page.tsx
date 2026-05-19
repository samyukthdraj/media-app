import { Navbar, Footer } from "@/components/PublicLayout";
import { PageTransition } from "@/components/PageTransition";
import HeroImage from "@/components/HeroImage";
import { Metadata } from "next";
import { getHomePageSettingsAction } from "@/lib/actions";

export const metadata: Metadata = {
  title: "EHAS | Neha Sreejith's Portfolio",
  description:
    "Welcome to the official portfolio of EHAS by Neha Sreejith. Explore high-end visual showcases, including professional photography and videography projects.",
};

export default async function Home() {
  const settingsRes = await getHomePageSettingsAction();
  const settings = settingsRes.success ? settingsRes.data : null;

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <PageTransition />
      <Navbar settings={settings} />

      <main className="flex-1 w-full flex items-center py-8 lg:py-12">
        <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-12 flex flex-col-reverse md:flex-row gap-8 lg:gap-16 items-center">
          {/* Left Side Text */}
          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-8">
            <div className="flex flex-col space-y-4 border-b border-slate-100 pb-6">
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-slate-400">
                About Me
              </p>
              <h1 className="text-4xl lg:text-7xl font-bold tracking-tighter text-slate-900 leading-none">
                {settings?.name || "NEHA SREEJITH"}
              </h1>
            </div>

            <div className="space-y-4">
              {settings?.title && (
                <p className="text-sm sm:text-base lg:text-xl font-bold text-slate-900 uppercase tracking-wider whitespace-nowrap">
                  {settings.title}
                </p>
              )}

              <p className="text-base lg:text-xl text-slate-600 font-light leading-relaxed max-w-lg whitespace-pre-wrap text-justify">
                {settings?.bio || "Welcome to my portfolio."}
              </p>
            </div>
          </div>

          <HeroImage
            src={
              settings?.heroImageUrl ||
              "https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?q=80&w=2000&auto=format&fit=crop"
            }
          />
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
