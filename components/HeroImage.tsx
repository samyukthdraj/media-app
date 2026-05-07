"use client";

import Image from "next/image";
import { useState } from "react";

export default function HeroImage({ src }: { src: string }) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div
      className="w-full md:w-1/2 h-[50vh] md:h-[70vh] relative bg-slate-100 overflow-hidden shadow-md border select-none"
      // Desktop: hover
      onMouseEnter={() => setIsRevealed(true)}
      onMouseLeave={() => setIsRevealed(false)}
      // Mobile/tablet: tap to toggle
      onTouchEnd={(e) => {
        e.preventDefault(); // prevent mouse event firing after touch
        setIsRevealed((prev) => !prev);
      }}
    >
      <Image
        src={src}
        alt="Hero Image"
        fill
        priority
        className={`object-contain p-8 transition-all duration-1000 ${
          isRevealed ? "grayscale-0" : "grayscale"
        }`}
      />
    </div>
  );
}
