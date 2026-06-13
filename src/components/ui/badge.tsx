import { cn } from "@/lib/utils";

const toneMap = {
  neutral: "border-[#d9d2c2] bg-white text-[#514d43]",
  green: "border-[#a7d8c9] bg-[#e2f1eb] text-[#235744]",
  amber: "border-[#e8c572] bg-[#fbf0cc] text-[#6e5417]",
  red: "border-[#efb0a4] bg-[#f8dfda] text-[#843d33]",
  blue: "border-[#9fc4df] bg-[#e3f0f8] text-[#2f526e]",
};

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: keyof typeof toneMap; className?: string }) {
  return <span className={cn("inline-flex h-7 items-center rounded-lg border px-2.5 text-xs font-semibold", toneMap[tone], className)}>{children}</span>;
}
