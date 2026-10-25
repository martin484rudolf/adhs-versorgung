import { useState } from "react";
import Heute from "./screens/Heute";
import Ernaehrung from "./screens/Ernaehrung";
import Einnahmen from "./screens/Einnahmen";
import Labor from "./screens/Labor";
import Stoffe from "./screens/Stoffe";
import Gurt from "./screens/Gurt";
import Daten from "./screens/Daten";

type Tab = "heute" | "essen" | "einnahmen" | "labor" | "puls" | "stoffe" | "daten";
const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "heute", label: "Heute", icon: "☀" },
  { key: "essen", label: "Essen", icon: "🥗" },
  { key: "einnahmen", label: "Einnahmen", icon: "💊" },
  { key: "labor", label: "Labor", icon: "🧪" },
  { key: "puls", label: "Gurt", icon: "💓" },
  { key: "stoffe", label: "Stoffe", icon: "📚" },
  { key: "daten", label: "Daten", icon: "💾" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("heute");
  const [vorwahl, setVorwahl] = useState<string | undefined>();
  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-4 pb-24 pt-4">
      <header className="mb-2 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold text-white">ADHS-Versorgung</h1>
        <span className="text-xs text-slate-500">lokal · beratend</span>
      </header>
      {tab === "heute" && <Heute />}
      {tab === "essen" && <Ernaehrung />}
      {tab === "einnahmen" && <Einnahmen key={vorwahl ?? "-"} vorwahl={vorwahl} />}
      {tab === "labor" && <Labor />}
      {tab === "puls" && <Gurt />}
      {tab === "stoffe" && <Stoffe onEinnahme={(k) => { setVorwahl(k); setTab("einnahmen"); }} />}
      {tab === "daten" && <Daten />}
      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="mx-auto flex max-w-2xl justify-around">
          {TABS.map((t) => (
            <button key={t.key} type="button" onClick={() => { setTab(t.key); if (t.key !== "einnahmen") setVorwahl(undefined); }} className={`flex flex-1 flex-col items-center py-2 text-xs ${tab === t.key ? "text-sky-300" : "text-slate-400"}`}>
              <span className="text-lg leading-none">{t.icon}</span>
              <span className="mt-1">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
