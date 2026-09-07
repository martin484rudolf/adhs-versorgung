// Gemeinsame Bausteine der Oberfläche. Zwei Größen: "normal" und "gross".
// "gross" ist nicht nur größere Schrift, sondern auch größere Tippflächen –
// dafür ist die Fit-Senior-App gebaut, und dafür genügt ein Schalter oben in der App.
import { createContext, useContext, type ReactNode } from "react";

export type Groesse = "normal" | "gross";

const GroesseCtx = createContext<Groesse>("normal");
export const useGroesse = () => useContext(GroesseCtx);

export const Darstellung = ({ groesse, children }: { groesse: Groesse; children: ReactNode }) => (
  <GroesseCtx.Provider value={groesse}>{children}</GroesseCtx.Provider>
);

/** Wählt je nach Größe – so steht jede Entscheidung an einer Stelle. */
function w<T>(g: Groesse, normal: T, gross: T): T {
  return g === "gross" ? gross : normal;
}

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const g = useGroesse();
  return (
    <div className={`rounded-2xl border border-slate-700/60 bg-slate-900/70 ${w(g, "p-4", "p-5")} ${className}`}>
      {children}
    </div>
  );
};

export const H2 = ({ children }: { children: ReactNode }) => {
  const g = useGroesse();
  return <h2 className={`mt-6 mb-2 font-semibold text-sky-300 ${w(g, "text-lg", "text-2xl")}`}>{children}</h2>;
};

export const Muted = ({ children }: { children: ReactNode }) => {
  const g = useGroesse();
  return <p className={`text-slate-400 ${w(g, "text-sm", "text-lg")}`}>{children}</p>;
};

export const Pill = ({ children, kind = "n" }: { children: ReactNode; kind?: "n" | "gut" | "warn" | "rot" }) => {
  const g = useGroesse();
  const c = {
    n: "bg-slate-700 text-slate-200",
    gut: "bg-emerald-900/70 text-emerald-200",
    warn: "bg-amber-900/70 text-amber-200",
    rot: "bg-rose-900/70 text-rose-200",
  }[kind];
  return <span className={`inline-block rounded-full ${w(g, "px-2.5 py-0.5 text-xs", "px-3 py-1 text-base")} ${c}`}>{children}</span>;
};

export const Btn = ({
  children,
  onClick,
  kind = "p",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: "p" | "s" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
}) => {
  const g = useGroesse();
  const c = {
    p: "bg-sky-700 hover:bg-sky-600 text-white",
    s: "bg-slate-700 hover:bg-slate-600 text-slate-100",
    ghost: "bg-transparent text-sky-300 hover:bg-slate-800",
  }[kind];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-medium disabled:opacity-40 ${w(g, "px-4 py-2.5 text-sm", "px-6 py-4 text-lg")} ${c}`}
    >
      {children}
    </button>
  );
};

export const Chip = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) => {
  const g = useGroesse();
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border ${w(g, "px-3 py-1.5 text-sm", "px-5 py-3 text-lg")} ${
        on ? "border-sky-400 bg-sky-900/60 text-sky-100" : "border-slate-600 bg-slate-800 text-slate-300"
      }`}
    >
      {children}
    </button>
  );
};

export const Label = ({ children }: { children: ReactNode }) => {
  const g = useGroesse();
  return <label className={`mt-3 block text-slate-300 ${w(g, "text-sm", "text-lg")}`}>{children}</label>;
};

export const inputCls =
  "mt-1 w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-sky-400";
export const inputClsGross =
  "mt-1 w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3.5 text-lg text-slate-100 outline-none focus:border-sky-400";
export const useInputCls = () => w(useGroesse(), inputCls, inputClsGross);

/** 1–10-Skala als Tipp-Reihe – ein Tipper statt Tippen. */
export const Skala = ({
  value,
  onChange,
  min = 1,
  max = 10,
}: {
  value?: number;
  onChange: (v: number | undefined) => void;
  min?: number;
  max?: number;
}) => {
  const g = useGroesse();
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? undefined : n)}
          className={`shrink-0 rounded-lg ${w(g, "h-9 w-9 text-sm", "h-14 w-14 text-lg")} ${
            value === n ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
};
