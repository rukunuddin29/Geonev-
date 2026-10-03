import Link from "next/link";
import {
  Zap,
  ArrowRight,
  Mail,
} from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { name: "Find stations", href: "/stations" },
      { name: "How it works", href: "/how-it-works" },
      { name: "Pricing", href: "/pricing" },
      { name: "Mobile app", href: "/app" },
    ],
  },
  {
    title: "Hosts",
    links: [
      { name: "Become a host", href: "/become-host" },
      { name: "Calculator", href: "/calculator" },
      { name: "Resources", href: "/host-resources" },
      { name: "Insurance", href: "/insurance" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
      { name: "Contact", href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-slate-900 text-white">
      
      {/* Top CTA Banner */}
      <div className="relative border-b border-white/10 bg-slate-900">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#FFB800]/10 to-transparent" />

        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 lg:flex-row lg:items-center">
          
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#FFB800] shadow-[0_0_32px_rgba(255,184,0,0.4)]">
              <Zap
                className="h-6 w-6 text-[#0052CC]"
                fill="currentColor"
              />
            </div>

            <div>
              <h3 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                Ready to plug in?
              </h3>

              <p className="mt-1 text-sm text-white/70">
                Join thousands of EV drivers charging smarter every day.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0066FF] transition-transform hover:scale-[1.02]"
            >
              Find a station
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/become-host"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
            >
              Become a host
            </Link>
          </div>
        </div>
      </div>

      {/* Dotted Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Ambient Glow */}
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#FFB800]/15 blur-[120px]" />

      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-[120px]" />

      {/* Main Content */}
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-8">
        
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
          
          {/* Brand Section */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                <Zap
                  className="h-5 w-5 text-white"
                  fill="currentColor"
                />
              </div>

              <span className="text-xl font-bold tracking-tight">
                Geo<span className="text-[#FFB800]">NEV</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              The marketplace connecting EV drivers with
              charging station hosts. Cleaner roads, faster
              charging.
            </p>

            {/* Newsletter */}
            <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
              
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFB800]/20">
                  <Mail className="h-3.5 w-3.5 text-[#FFB800]" />
                </div>

                <h4 className="text-sm font-semibold">
                  Stay charged
                </h4>
              </div>

              <p className="mb-3 text-xs text-white/60">
                Monthly updates, EV tips, and new charging
                stations.
              </p>

              <form className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 backdrop-blur outline-none transition-colors focus:border-[#FFB800]"
                />

                <button
                  type="submit"
                  className="rounded-lg bg-[#FFB800] px-4 py-2 text-sm font-semibold text-[#0052CC] transition-transform hover:scale-[1.02]"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#FFB800]">
                  {col.title}
                </h4>

                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/70 transition-colors hover:text-white"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Giant Branding */}
        <div className="mt-20 select-none">
          <div className="flex items-end justify-center gap-2 sm:gap-4">
            
            <span
              className="font-black leading-[0.85] tracking-tighter text-white/[0.08]"
              style={{
                fontSize: "clamp(4rem, 18vw, 16rem)",
              }}
            >
              GEO
            </span>

            <span
              className="font-black leading-[0.85] tracking-tighter text-[#FFB800]/[0.18]"
              style={{
                fontSize: "clamp(4rem, 18vw, 16rem)",
              }}
            >
              NEV
            </span>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-white/10 pt-6">
          
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            
            <p className="text-xs text-white/60">
              © {new Date().getFullYear()} GeoNEV · All
              rights reserved.
            </p>

            <div className="flex items-center gap-2">
              
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <span className="text-xs text-white/60">
                Platform online
              </span>

            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}