import type { ReactNode } from "react";

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4 ${className}`}>{children}</div>
);
export const H2 = ({ children }: { children: ReactNode }) => <h2 className="mt-6 mb-2 text-lg font-semibold text-sky-300">{children}</h2>;
export const Muted = ({ children }: { children: ReactNode }) => <p className="text-sm text-slate-400">{children}</p>;
export const Pill = ({ children, kind = "n" }: { children: ReactNode; kind?: "n" | "gut" | "warn" | "rot" }) => {
  const c = { n: "bg-slate-700 text-slate-200", gut: "bg-emerald-900/70 text-emerald-200", warn: "bg-amber-900/70 text-amber-200", rot: "bg-rose-900/70 text-rose-200" }[kind];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${c}`}>{children}</span>;
};
export const Btn = ({ children, onClick, kind = "p", type = "button", disabled }: { children: ReactNode; onClick?: () => void; kind?: "p" | "s" | "ghost"; type?: "button" | "submit"; disabled?: boolean }) => {
  const c = { p: "bg-sky-700 hover:bg-sky-600 text-white", s: "bg-slate-700 hover:bg-slate-600 text-slate-100", ghost: "bg-transparent text-sky-300 hover:bg-slate-800" }[kind];
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-40 ${c}`}>
      {children}
    </button>
  );
};
export const Chip = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) => (
  <button type="button" onClick={onClick} className={`rounded-full border px-3 py-1.5 text-sm ${on ? "border-sky-400 bg-sky-900/60 text-sky-100" : "border-slate-600 bg-slate-800 text-slate-300"}`}>
    {children}
  </button>
);
export const Label = ({ children }: { children: ReactNode }) => <label className="mt-3 block text-sm text-slate-300">{children}</label>;
export const inputCls = "mt-1 w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-sky-400";

/** 1–10-Skala als Tipp-Reihe – ein Tipper statt Tippen. */
export const Skala = ({ value, onChange, min = 1, max = 10 }: { value?: number; onChange: (v: number | undefined) => void; min?: number; max?: number }) => (
  <div className="mt-1 flex flex-wrap gap-1">
    {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => (
      <button key={n} type="button" onClick={() => onChange(value === n ? undefined : n)} className={`h-9 w-9 rounded-lg text-sm ${value === n ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
        {n}
      </button>
    ))}
  </div>
);
