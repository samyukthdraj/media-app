import { Navbar, Footer } from "@/components/PublicLayout";
import { PageTransition } from "@/components/PageTransition";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <PageTransition />
      <Navbar />
      
      <main className="flex-1 w-full flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-7xl mx-auto flex flex-col-reverse md:flex-row gap-8 lg:gap-16 items-center">
          {/* Left Side Text */}
          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-8 px-4 lg:px-12">
             <div className="space-y-4">
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-slate-400">About Me</p>
                <h1 className="text-4xl lg:text-7xl font-bold tracking-tighter text-slate-900 leading-[1.1]">
                   EHAS<br/>PORTFOLIO.
                </h1>
             </div>
            <p className="text-base lg:text-xl text-slate-600 font-light leading-relaxed max-w-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec ac odio tempor orci dapibus ultrices in. Volutpat commodo sed egestas egestas fringilla phasellus.
            </p>
          </div>

          {/* Right Side Image */}
          <div className="w-full md:w-1/2 h-[50vh] md:h-[70vh] relative bg-slate-100 overflow-hidden shadow-md border">
            <Image 
              src="https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?q=80&w=2000&auto=format&fit=crop" 
              alt="EHAS Portfolio Hero" 
              fill 
              className="object-cover object-center grayscale hover:grayscale-0 transition-all duration-1000"
              priority
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
