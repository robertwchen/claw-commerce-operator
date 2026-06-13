import { cn } from "@/lib/utils";

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-lg border border-[#d9d2c2] bg-white shadow-sm", className)}>{children}</section>;
}

export function PanelHeader({ title, action, kicker }: { title: string; action?: React.ReactNode; kicker?: string }) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-3 border-b border-[#ebe6d8] px-5 py-4">
      <div>
        {kicker ? <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7c7467]">{kicker}</p> : null}
        <h2 className="text-base font-bold text-[#262521]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function PanelBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
