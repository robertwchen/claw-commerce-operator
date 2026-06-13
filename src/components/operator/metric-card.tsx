import type { LucideIcon } from "lucide-react";
import { Panel } from "@/components/ui/panel";

export function MetricCard({ label, value, detail, icon: Icon, tone = "green" }: { label: string; value: string; detail: string; icon: LucideIcon; tone?: "green" | "amber" | "blue" | "red" }) {
  const tones = {
    green: "bg-[#e2f1eb] text-[#235744]",
    amber: "bg-[#fbf0cc] text-[#6e5417]",
    blue: "bg-[#e3f0f8] text-[#2f526e]",
    red: "bg-[#f8dfda] text-[#843d33]",
  };

  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#7c7467]">{label}</p>
          <p className="mt-2 text-3xl font-black text-[#262521]">{value}</p>
          <p className="mt-1 text-sm font-medium text-[#7c7467]">{detail}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Panel>
  );
}
