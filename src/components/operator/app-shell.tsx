import Link from "next/link";
import {
  BarChart3,
  Bot,
  CalendarClock,
  FileText,
  Gauge,
  ImageIcon,
  LayoutDashboard,
  Link2,
  ListChecks,
  PackageSearch,
  Radar,
  Settings,
  Sparkles,
} from "lucide-react";
import type { CommerceState } from "@/lib/domain";
import { Badge } from "@/components/ui/badge";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: PackageSearch },
  { href: "/trends", label: "Trends", icon: Radar },
  { href: "/angles", label: "Viral Angles", icon: Sparkles },
  { href: "/content", label: "Content", icon: FileText },
  { href: "/assets", label: "Assets", icon: ImageIcon },
  { href: "/scheduler", label: "Scheduler", icon: CalendarClock },
  { href: "/landing", label: "Landing Pages", icon: Link2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/autopilot", label: "Autopilot", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/logs", label: "Logs", icon: ListChecks },
];

export function AppShell({ children, state, title }: { children: React.ReactNode; state: CommerceState; title: string }) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#d9d2c2] bg-[#fdfbf6] p-4 lg:block">
        <Link href="/" className="flex h-12 items-center gap-3 rounded-lg px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#262521] text-white">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.1em] text-[#262521]">Claw</p>
            <p className="text-xs font-semibold text-[#7c7467]">Commerce Operator</p>
          </div>
        </Link>
        <nav className="mt-6 grid gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#514d43] hover:bg-[#ebe6d8] hover:text-[#262521]">
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-[#d9d2c2] bg-[#f6f4ef]/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#7c7467]">OpenClaw workspace</p>
              <h1 className="text-2xl font-black text-[#262521]">{title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={state.settings.demoMode ? "green" : "amber"}>{state.settings.demoMode ? "Demo mode" : "Live mode"}</Badge>
              <Badge tone="blue">{state.content.length} content</Badge>
              <Badge tone="amber">{state.assets.length} assets</Badge>
              <Badge tone="neutral">{state.logs.length} logs</Badge>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-[#d9d2c2] bg-white px-3 text-xs font-bold text-[#514d43]">
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
