import Link from "next/link";
import Image from "next/image";

import {
  MapPin,
  Search,
  Zap,
  Battery,
  Star,
} from "lucide-react";

import hero1 from "../image/hero1.png";
import hero2 from "../image/hero2.png";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-900 pb-24 pt-40 sm:pb-32 sm:pt-48 lg:pt-36">
      
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-[#0066FF]/25 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[#FFB800]/15 blur-[120px]" />

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(#334155 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        
        {/* LEFT SIDE */}
        <div>
          
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#0066FF]/30 bg-[#0066FF]/10 px-3 py-1.5 text-xs font-medium text-blue-300 backdrop-blur">
            
            <Zap
              className="h-3.5 w-3.5"
              fill="currentColor"
            />

            10,000+ stations nationwide
          </div>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            
            Find &amp; book{" "}

            <span className="relative whitespace-nowrap">
              
              <span className="relative z-10">
                EV charging
              </span>

              <span className="absolute bottom-1 left-0 right-0 -z-0 h-3 bg-[#FFB800]/50" />
            </span>{" "}

            in seconds.
          </h1>

          <p className="mt-5 max-w-lg text-lg text-slate-400">
            The marketplace for EV drivers and charging
            station hosts. Search nearby stations,
            reserve a slot, and charge on your schedule.
          </p>

          {/* Search bar */}
          <div className="mt-8 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:flex-row sm:items-center">
            
            <div className="flex flex-1 items-center gap-2 px-3 py-2">
              
              <MapPin className="h-5 w-5 text-slate-400" />

              <input
                type="text"
                placeholder="Enter city or postal code"
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>

            <button className="flex items-center justify-center gap-2 rounded-xl bg-[#0066FF] px-6 py-3 text-sm font-medium text-white shadow-[0_0_32px_rgba(0,102,255,0.4)] transition-colors hover:bg-[#0052CC]">
              
              <Search className="h-4 w-4" />

              Find stations
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            
            <div>
              <p className="text-2xl font-bold text-white">
                50k+
              </p>

              <p className="text-xs text-slate-400">
                Active drivers
              </p>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div>
              <p className="text-2xl font-bold text-white">
                2,500+
              </p>

              <p className="text-xs text-slate-400">
                Verified hosts
              </p>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div>
              <p className="text-2xl font-bold text-white">
                4.9
              </p>

              <p className="text-xs text-slate-400">
                Avg rating
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative hidden h-[520px] lg:block">
          
          {/* BACK IMAGE CARD */}
          <div className="absolute right-0 top-8 h-[360px] w-[300px] rotate-6 overflow-hidden rounded-[32px] border border-white/10 shadow-2xl">
            
            <Image
              src={hero2}
              alt="EV charging"
              fill
              className="object-cover"
            />

            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* FRONT CARD */}
          <div className="absolute left-0 top-0 w-[380px] -rotate-3 overflow-hidden rounded-[32px] border border-white/10 bg-white/10 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            
            {/* IMAGE */}
            <div className="relative h-52 w-full overflow-hidden">
              
              <Image
                src={hero1}
                alt="Charging station"
                fill
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-emerald-700 backdrop-blur">
                
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                Available
              </div>
            </div>

            {/* BODY */}
            <div className="p-5">
              
              <div className="flex items-start justify-between gap-3">
                
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Downtown PowerHub
                  </h3>

                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-300">
                    
                    <MapPin className="h-3 w-3" />

                    Market St · 0.8 mi
                  </p>
                </div>

                <div className="flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1">
                  
                  <Star className="h-3 w-3 fill-[#FFB800] text-[#FFB800]" />

                  <span className="text-xs font-semibold text-[#FFB800]">
                    4.9
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="my-5 flex flex-wrap gap-2">
                
                {["CCS", "Type 2", "CHAdeMO"].map(
                  (c) => (
                    <span
                      key={c}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300"
                    >
                      {c}
                    </span>
                  )
                )}
              </div>

              {/* Footer */}
              <div className="flex items-end justify-between border-t border-white/10 pt-4">
                
                <div>
                  <p className="text-xs text-slate-400">
                    From
                  </p>

                  <p className="text-2xl font-bold text-white">
                    $0.32

                    <span className="text-sm font-normal text-slate-400">
                      /kWh
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
                  
                  <Battery className="h-4 w-4" />

                  150 kW
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </section>
  );
}