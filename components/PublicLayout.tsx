"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isWorkPage = pathname.startsWith('/work');

  return (
    <>
      <nav className="h-20 lg:h-24 w-full border-b border-slate-200 flex items-center justify-between px-6 lg:px-12 bg-white sticky top-0 z-50">
        
        {/* Left Side: Mobile Back or Desktop Links */}
        <div className="flex-1 flex items-center">
          {isWorkPage && (
            <button 
              onClick={() => window.history.back()} 
              className="md:hidden text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
            >
              ← Back
            </button>
          )}

          <div className="hidden md:flex gap-6 items-center text-xs lg:text-sm font-semibold tracking-widest uppercase">
            <Link href="/" className={`hover:text-primary transition-colors ${pathname === '/' ? 'text-primary' : 'text-slate-500'}`}>Home</Link>
            <Link href="/work" className={`hover:text-primary transition-colors ${pathname === '/work' ? 'text-primary' : 'text-slate-500'}`}>Work</Link>
          </div>
        </div>

        {/* Center: Logo */}
        <Link href="/" className="font-extrabold text-2xl md:text-3xl tracking-[0.3em] uppercase text-slate-900 absolute left-1/2 -translate-x-1/2 z-50">
          Ehas
        </Link>
        
        {/* Right Side: Mobile Hamburger or Desktop Placeholder */}
        <div className="flex-1 flex justify-end items-center">
          <button className="md:hidden p-2 text-slate-800" onClick={() => setIsOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden md:block w-20"></div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-100 bg-white flex flex-col md:hidden">
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200">
            <button className="p-2 -ml-2 text-slate-800" onClick={() => setIsOpen(false)}>
              <X className="w-6 h-6" />
            </button>
            <Link href="/" onClick={() => setIsOpen(false)} className="font-extrabold text-2xl tracking-[0.2em] uppercase text-slate-900 absolute left-1/2 -translate-x-1/2">
              Ehas
            </Link>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-12 text-2xl font-bold tracking-widest uppercase">
            <Link href="/" onClick={() => setIsOpen(false)} className={`${pathname === '/' ? 'text-primary' : 'text-slate-800'}`}>Home</Link>
            <Link href="/work" onClick={() => setIsOpen(false)} className={`${pathname === '/work' ? 'text-primary' : 'text-slate-800'}`}>Work</Link>
          </div>
        </div>
      )}
    </>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 py-12 px-6 lg:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-sm font-medium text-slate-600 order-2 md:order-1">
          © {new Date().getFullYear()} EHAS. All rights reserved.
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm font-semibold tracking-widest uppercase order-1 md:order-2">
          <span className="text-slate-400 mr-0 md:mr-2 w-full md:w-auto text-center md:text-left">Contact me at:</span>
          <a href="#" className="hover:text-primary transition-colors text-slate-800">Behance</a>
          <a href="#" className="hover:text-primary transition-colors text-slate-800">WhatsApp</a>
          <a href="#" className="hover:text-primary transition-colors text-slate-800">Instagram</a>
        </div>
      </div>
    </footer>
  );
}
