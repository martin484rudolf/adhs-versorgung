// Smoke-Test beider Apps: startet die Vorschau-Server, klickt durch, sammelt Konsolenfehler.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

// fileURLToPath, nicht .pathname: der Projektpfad enthält ein Leerzeichen ("Code Projekte").
const ROOT = fileURLToPath(new URL("..", import.meta.url));

const server = (name, port) =>
  spawn("npm", ["run", "preview", "-w", name, "--", "--port", String(port), "--strictPort"], {
    cwd: ROOT,
    shell: true,
    stdio: "ignore",
  });

const warte = async (url, versuche = 60) => {
  for (let i = 0; i < versuche; i++) {
    try {
      if ((await fetch(url)).ok) return true;
    } catch {
      /* noch nicht da */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
};

const procs = [server("adhs-versorgung", 4173), server("fit-senior", 4174)];
const browser = await chromium.launch();
let fehler = 0;
const melde = (ok, text) => {
  console.log(`   ${ok ? "ok " : "FEHLER "} ${text}`);
  if (!ok) fehler++;
};

try {
  // ---- ADHS-Versorgung: Reiterleiste ----
  {
    const url = "http://localhost:4173/";
    if (!(await warte(url))) throw new Error("adhs-versorgung nicht erreichbar");
    const page = await browser.newPage();
    const konsole = [];
    page.on("console", (m) => m.type() === "error" && konsole.push(m.text()));
    page.on("pageerror", (e) => konsole.push("pageerror: " + e.message));
    await page.goto(url, { waitUntil: "networkidle" });
    console.log(`\n== adhs-versorgung == h1: "${await page.locator("h1").first().innerText()}"`);
    for (const tab of ["Essen", "Einnahmen", "Labor", "Stoffe", "Daten", "Heute"]) {
      await page.getByRole("button", { name: tab, exact: false }).first().click();
      await page.waitForTimeout(200);
      const h2 = await page.locator("h2").allInnerTexts();
      console.log(`   ${tab}: ${h2.slice(0, 3).join(" | ") || "(keine h2)"}`);
    }
    melde(konsole.length === 0, konsole.length ? `Konsolenfehler: ${konsole.join(" / ")}` : "Konsole sauber");
    await page.close();
  }

  // ---- Fit Senior: Startbildschirm, eine Ebene tief, immer zurück ----
  {
    const url = "http://localhost:4174/";
    if (!(await warte(url))) throw new Error("fit-senior nicht erreichbar");
    const page = await browser.newPage();
    const konsole = [];
    page.on("console", (m) => m.type() === "error" && konsole.push(m.text()));
    page.on("pageerror", (e) => konsole.push("pageerror: " + e.message));
    await page.goto(url, { waitUntil: "networkidle" });
    console.log(`\n== fit-senior == h1: "${await page.locator("h1").first().innerText()}"`);

    // Trinken direkt vom Start, ohne Umweg, und es überlebt den Neuladen.
    // Drei einzelne Tipper hintereinander müssen als 3 ankommen – nicht dreimal derselbe Wert
    // (wer unsicher tippt, drückt zur Sicherheit nochmal).
    // Kein clickCount: 3 – das wäre ein Dreifachklick, also ein einziges Ereignis.
    for (let i = 0; i < 3; i++) await page.getByLabel("Ein Glas mehr").click();
    await page.waitForTimeout(200);
    await page.reload({ waitUntil: "networkidle" });
    const gespeichert = await page.evaluate(() => localStorage.getItem("fit-senior.v1"));
    melde(/"getrunken":3/.test(gespeichert ?? ""), "Trinken speichert sofort und überlebt Neuladen");

    // Jede Kachel öffnen und über "Zurück zum Anfang" wieder herauskommen
    for (const [kachel, erwartet] of [
      ["Gegessen", "Was gab es?"],
      ["Wie war der Tag?", "Wie war der Tag?"],
      ["Meine Werte", "Ihre Werte"],
      ["Hilfe & Unterstützung", "Was ich brauche"],
      ["Meine Daten", "Ihre Daten"],
    ]) {
      await page.getByRole("button", { name: kachel, exact: false }).first().click();
      await page.waitForTimeout(250);
      const h2 = await page.locator("h2").allInnerTexts();
      melde(h2.some((t) => t.includes(erwartet)), `${kachel} → ${h2.slice(0, 2).join(" | ") || "(leer)"}`);
      await page.getByRole("button", { name: "Zurück zum Anfang" }).first().click();
      await page.waitForTimeout(200);
      const zurueck = await page.locator("h1").first().innerText();
      melde(zurueck === "Fit Senior", `zurück vom ${kachel}`);
    }

    // Tagesfrage speichert ohne Knopf
    await page.getByRole("button", { name: "Wie war der Tag?", exact: false }).first().click();
    await page.waitForTimeout(250);
    await page.getByRole("button", { name: "Nein", exact: true }).first().click();
    await page.waitForTimeout(250);
    const nachFrage = await page.evaluate(() => localStorage.getItem("fit-senior.v1"));
    melde(/"draussen":false/.test(nachFrage ?? ""), "Tagesfrage speichert ohne Speichern-Knopf");

    // Mahlzeit-Rückmeldung: Vorschlag, keine Note
    await page.getByRole("button", { name: "Zurück zum Anfang" }).first().click();
    await page.getByRole("button", { name: "Gegessen", exact: false }).first().click();
    await page.waitForTimeout(250);
    await page.getByRole("button", { name: "Gemüse", exact: false }).first().click();
    await page.getByRole("button", { name: "Mahlzeit eintragen" }).first().click();
    await page.waitForTimeout(300);
    const text = await page.locator("body").innerText();
    melde(/Quark|Glas Wasser|Muskeln/.test(text), "Rückmeldung erscheint als Vorschlag");
    melde(!/Eher Bremse|Gute Mahlzeit|Okay\./.test(text), "keine Benotung im Text");

    melde(konsole.length === 0, konsole.length ? `Konsolenfehler: ${konsole.join(" / ")}` : "Konsole sauber");
    await page.close();
  }
} finally {
  await browser.close();
  procs.forEach((p) => p.kill());
}

console.log(fehler === 0 ? "\nERGEBNIS: alles grün" : `\nERGEBNIS: ${fehler} Problem(e)`);
process.exit(fehler === 0 ? 0 : 1);
