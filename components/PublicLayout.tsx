"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Mail } from "lucide-react";
import { usePathname } from "next/navigation";
import { IHomePageSettings, ISocialLink } from "@/lib/models";


export function Navbar({ settings }: { settings?: IHomePageSettings | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isWorkPage = pathname.startsWith("/work");
  const brandName = "EHAS";

  return (
    <>
      <nav className="h-20 lg:h-24 w-full border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between px-6 lg:px-12 relative">
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
              <Link
                href="/"
                className={`hover:text-primary transition-colors ${pathname === "/" ? "text-primary" : "text-slate-500"}`}
              >
                Home
              </Link>
              <Link
                href="/work"
                className={`hover:text-primary transition-colors ${pathname === "/work" ? "text-primary" : "text-slate-500"}`}
              >
                Work
              </Link>
            </div>
          </div>

          {/* Center: Logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 z-50 flex flex-col items-center group transition-transform hover:scale-105 active:scale-95"
          >
            {settings?.logoUrl ? (
              <div className="relative h-10 md:h-14 w-32 md:w-48">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.logoUrl}
                  alt={brandName}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <span className="font-black text-2xl md:text-4xl tracking-[0.4em] uppercase text-slate-900 leading-none mr-[-0.4em]">
                {brandName}
              </span>
            )}
          </Link>

          {/* Right Side: Mobile Hamburger or Desktop Placeholder */}
          <div className="flex-1 flex justify-end items-center">
            <button
              className="md:hidden p-2 text-slate-800"
              onClick={() => setIsOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:block w-20"></div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-100 bg-white flex flex-col md:hidden">
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200">
            <button
              className="p-2 -ml-2 text-slate-800"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
            >
              {settings?.logoUrl ? (
                <div className="relative h-8 w-24">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.logoUrl}
                    alt={brandName}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <span className="font-black text-2xl tracking-[0.3em] uppercase text-slate-900 leading-none mr-[-0.3em]">
                  {brandName}
                </span>
              )}
            </Link>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-12 text-2xl font-bold tracking-widest uppercase">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={`${pathname === "/" ? "text-primary" : "text-slate-800"}`}
            >
              Home
            </Link>
            <Link
              href="/work"
              onClick={() => setIsOpen(false)}
              className={`${pathname === "/work" ? "text-primary" : "text-slate-800"}`}
            >
              Work
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export function Footer({ settings }: { settings?: IHomePageSettings | null }) {
  const brandName = "EHAS";
  const name = settings?.name || "NEHA SREEJITH";
  const socialLinks: ISocialLink[] = settings?.socialLinks || [
    {
      platform: "Behance",
      url: "https://www.behance.net/nehasreejith2",
      displayStyle: "both",
    },
    {
      platform: "WhatsApp",
      url: "https://wa.me/919074020290",
      displayStyle: "both",
    },
    {
      platform: "Instagram",
      url: "https://www.instagram.com/neh4xo?igsh=dHRxanR6dHBrdXhv",
      displayStyle: "both",
    },
  ];

  return (
    <footer className="w-full bg-white border-t border-slate-200 py-6 px-6 lg:px-12 mt-auto">
      {/* Mobile: stack vertically. md+: single row */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Copyright — appears last on mobile */}
        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider text-center md:text-left order-3 md:order-1">
          © {new Date().getFullYear()} {brandName} by {name}.
        </div>

        {/* Contact + Links — appear first on mobile */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 order-1 md:order-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap shrink-0">
            Contact me at:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-5">
            {settings?.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="hover:text-primary transition-colors text-slate-800 flex items-center gap-1.5 group text-[10px] font-bold tracking-widest uppercase"
                title="Email"
              >
                <Mail className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                <span>Mail</span>
              </a>
            )}
            {socialLinks.map((link: ISocialLink, idx: number) => {
              const showIcon =
                link.displayStyle === "icon" || link.displayStyle === "both";
              const showName =
                link.displayStyle === "name" ||
                link.displayStyle === "both" ||
                !link.displayStyle;

              return (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors text-slate-800 flex items-center gap-1.5 group text-[10px] font-bold tracking-widest uppercase"
                  title={link.platform}
                >
                  {showIcon && link.iconUrl && (
                    <span
                      style={{ width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                      className="opacity-70 group-hover:opacity-100 transition-opacity"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={link.iconUrl}
                        alt={link.platform}
                        style={{ width: 18, height: 18, objectFit: "contain", display: "block" }}
                      />
                    </span>
                  )}
                  {showName && <span>{link.platform}</span>}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
