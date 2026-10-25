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
    // ---- Puls: der Simulator, weil hier kein Gurt liegt ----
    // Die echte Bluetooth-Verbindung kann dieser Test nicht pruefen - nur den Weg davor
    // und danach: messen, rechnen, speichern, wiederfinden.
    await page.getByRole("button", { name: "Gurt", exact: false }).first().click();
    await page.waitForTimeout(200);
    await page.getByRole("button", { name: "Ohne Gurt ausprobieren" }).click();
    await page.waitForTimeout(1500);
    let pulsText = await page.locator("body").innerText();
    melde(/Simulation/.test(pulsText), "Simulator verbindet sich");
    melde(/Schläge\/min/.test(pulsText), "Live-Puls erscheint");

    await page.getByRole("button", { name: "Messung starten" }).click();
    await page.waitForTimeout(4000);
    await page.getByRole("button", { name: "Messung beenden" }).click();
    await page.waitForTimeout(300);
    pulsText = await page.locator("body").innerText();
    melde(/RMSSD/.test(pulsText), "Kennzahlen werden gerechnet");
    melde(/Anhaltspunkt, kein Messwert/.test(pulsText), "kurze Messung wird als unsicher gekennzeichnet");

    await page.getByRole("button", { name: "Messung speichern" }).click();
    await page.waitForTimeout(300);
    const nachMessung = await page.evaluate(() => localStorage.getItem("adhs-versorgung.v1"));
    melde(/"typ":"hrv-session"/.test(nachMessung ?? ""), "Messung wird gespeichert");
    melde(/"rr":\[\d/.test(nachMessung ?? ""), "Rohdaten bleiben erhalten, nicht nur die Kennzahl");
    melde(/Gespeichert: RMSSD/.test(await page.locator("body").innerText()), "Rueckmeldung nach dem Speichern");

    // Atemuebung: dieselbe Verbindung, andere Anwendung
    await page.getByRole("button", { name: "Atmen", exact: true }).click();
    await page.waitForTimeout(300);
    melde(/bereit/.test(await page.locator("body").innerText()), "Atemuebung ist bereit, ohne neu zu koppeln");
    // Erst kurz: darunter soll gar nichts gespeichert werden.
    await page.getByRole("button", { name: "Übung starten" }).click();
    await page.waitForTimeout(2500);
    const atemText = await page.locator("body").innerText();
    melde(/Einatmen|Ausatmen/.test(atemText), "Atemtakt laeuft");
    melde(/Atemzug/.test(atemText), "Atemzuege werden gezaehlt");
    melde(/Schlag für Schlag/.test(atemText), "Pulskurve erscheint");
    await page.getByRole("button", { name: "Beenden" }).click();
    await page.waitForTimeout(300);
    melde(/Zu kurz zum Speichern/.test(await page.locator("body").innerText()), "zu kurze Uebung wird nicht gespeichert");

    // Dann lang genug, damit ein voller Atemzug drin ist.
    await page.getByRole("button", { name: "Übung starten" }).click();
    await page.waitForTimeout(13000);
    await page.getByRole("button", { name: "Beenden" }).click();
    await page.waitForTimeout(300);
    const nachAtem = await page.evaluate(() => localStorage.getItem("adhs-versorgung.v1"));
    melde(/"bedingung":"atemuebung"/.test(nachAtem ?? ""), "Atemuebung wird als eigene Bedingung gespeichert");

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

    // Wadenumfang: eintragen, Verlauf erscheint, Wert überlebt den Neuladen
    await page.getByRole("button", { name: "Zurück zum Anfang" }).first().click();
    await page.getByRole("button", { name: "Wie war der Tag?", exact: false }).first().click();
    await page.waitForTimeout(250);
    const wadeFeld = page.locator('input[placeholder="z. B. 34"]');
    await wadeFeld.fill("29.5");
    await wadeFeld.blur();
    await page.waitForTimeout(250);
    const nachWade = await page.evaluate(() => localStorage.getItem("fit-senior.v1"));
    melde(/"wade_cm":29\.5/.test(nachWade ?? ""), "Wadenumfang wird gespeichert");
    const wadeText = await page.locator("body").innerText();
    melde(/29\.5 cm|29,5 cm/.test(wadeText), "Wadenverlauf erscheint");
    melde(/Arztbesuch/.test(wadeText), "unter dem Richtwert kommt ein Hinweis – als Gesprächsanlass, nicht als Befund");

    // Hilfe: solange kein Pflegegrad gesetzt ist, heißt es "Was es gibt"
    await page.getByRole("button", { name: "Zurück zum Anfang" }).first().click();
    await page.getByRole("button", { name: "Hilfe & Unterstützung", exact: false }).first().click();
    await page.waitForTimeout(250);
    await page.getByRole("button", { name: "Was es gibt", exact: true }).click();
    await page.waitForTimeout(250);
    let h2 = await page.locator("h2").allInnerTexts();
    melde(h2.includes("Was es gibt") && !h2.includes("Das steht Ihnen schon zu"), "ohne Pflegegrad: Überblick");

    // Pflegegrad auf "bewilligt" setzen -> die Seite dreht sich um
    // Pflegegrad ist die erste Leistung der Liste, also gehört der erste "bewilligt"-Knopf zu ihr.
    await page.getByRole("button", { name: "bewilligt", exact: true }).first().click();
    await page.waitForTimeout(300);
    h2 = await page.locator("h2").allInnerTexts();
    melde(h2.includes("Das steht Ihnen schon zu"), "mit Pflegegrad: was zusteht kommt zuerst");
    const hilfeText = await page.locator("body").innerText();
    const posEntlastung = hilfeText.indexOf("Entlastungsbetrag");
    const posWohngeld = hilfeText.indexOf("Wohngeld");
    melde(posEntlastung > -1 && posEntlastung < posWohngeld, "Entlastungsbetrag steht vor dem Selteneren");
    melde(/jeden Monat neu/.test(hilfeText), "was monatlich verfällt, ist als solches markiert");
    melde((hilfeText.match(/Entlastungsbetrag/g) ?? []).length === 1, "keine Leistung doppelt gelistet");
    melde(!/geprueft/.test(hilfeText), "keine Datenschlüssel auf den Knöpfen");

    melde(konsole.length === 0, konsole.length ? `Konsolenfehler: ${konsole.join(" / ")}` : "Konsole sauber");
    await page.close();
  }
} finally {
  await browser.close();
  procs.forEach((p) => p.kill());
}

console.log(fehler === 0 ? "\nERGEBNIS: alles grün" : `\nERGEBNIS: ${fehler} Problem(e)`);
process.exit(fehler === 0 ? 0 : 1);
