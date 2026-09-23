// Datum und Zeit – alles als ISO-String, keine Zeitzonen-Überraschungen.

export const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const heute = () => iso(new Date());
export const jetztHHMM = () => new Date().toTimeString().slice(0, 5);

export function addTage(datum: string, n: number) {
  const d = new Date(datum + "T00:00:00");
  d.setDate(d.getDate() + n);
  return iso(d);
}

export function tageZwischen(a: string, b: string) {
  return Math.round((new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 86400000);
}

/** 2026-09-07 -> 07.09.2026 */
export const fmt = (d: string) => {
  const [y, m, t] = d.split("-");
  return `${t}.${m}.${y}`;
};

/** Stunden zwischen zwei HH:MM. */
export function stundenZwischen(a: HHMMLike, b: HHMMLike) {
  const [h1, m1] = a.split(":").map(Number);
  const [h2, m2] = b.split(":").map(Number);
  return (h2 * 60 + m2 - h1 * 60 - m1) / 60;
}
type HHMMLike = string;
