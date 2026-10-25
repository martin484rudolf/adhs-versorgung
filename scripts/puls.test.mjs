// Prüft die HRV-Rechnung gegen von Hand nachrechenbare Werte.
// HRV-Zahlen kann man nicht "ansehen" – ein falscher Faktor fällt in der Oberfläche
// nicht auf, verfälscht aber jede spätere Auswertung.
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

// Node 20 kann TypeScript noch nicht selbst lesen. esbuild liegt ohnehin im Projekt
// (Vite bringt es mit), also wird die Quelle hier zur Laufzeit übersetzt und geladen –
// so testen wir genau den Code, den auch die App benutzt, ohne Build-Schritt davor.
const lade = async (pfad) => {
  const ergebnis = await build({
    entryPoints: [fileURLToPath(new URL(pfad, import.meta.url))],
    bundle: true,
    write: false,
    format: "esm",
    platform: "neutral",
  });
  const quelltext = ergebnis.outputFiles[0].text;
  return import("data:text/javascript;base64," + Buffer.from(quelltext).toString("base64"));
};

const kern = await lade("../kern/src/puls.ts");
const gurt = await lade("../kern/src/gurt.ts");
const atem = await lade("../kern/src/atem.ts");

test("RMSSD von Hand nachgerechnet", () => {
  // Differenzen: 20, -20, 20 -> Quadrate 400, 400, 400 -> Mittel 400 -> Wurzel 20
  const k = kern.kennzahlen([800, 820, 800, 820]);
  assert.equal(k.rmssd, 20);
});

test("konstanter Puls hat keine Variabilität", () => {
  const k = kern.kennzahlen([800, 800, 800, 800]);
  assert.equal(k.rmssd, 0);
  assert.equal(k.sdnn, 0);
  assert.equal(k.hf, 75); // 60000 / 800
});

test("Herzfrequenz aus dem Mittelwert", () => {
  assert.equal(kern.kennzahlen([1000, 1000, 1000]).hf, 60);
});

test("Ausreisser fliegen raus und werden gezaehlt", () => {
  // 5000 ms liegt ausserhalb des plausiblen Bereichs, 400 ist ein zu grosser Sprung
  const k = kern.kennzahlen([800, 5000, 810, 400, 805]);
  assert.equal(k.verworfen, 2);
  assert.equal(k.schlaege, 3);
});

test("zu kurze Messung gilt als nicht belastbar", () => {
  assert.equal(kern.kennzahlen([800, 820, 800]).belastbar, false);
  // 80 Schlaege a 800 ms = 64 Sekunden
  const lang = Array.from({ length: 80 }, (_, i) => (i % 2 ? 820 : 800));
  assert.equal(kern.kennzahlen(lang).belastbar, true);
});

test("zu wenige Werte ergeben keine Kennzahl statt einer falschen", () => {
  const k = kern.kennzahlen([800]);
  assert.equal(k.rmssd, null);
  assert.equal(k.hf, null);
});

test("Vergleich braucht eine Vorgeschichte", () => {
  assert.equal(kern.vergleicheMitVorgeschichte(40, [38, 42]), null);
});

test("Vergleich misst in Streuung der eigenen Messreihe", () => {
  // Mittel 40, Standardabweichung rund 1,6 -> 50 liegt weit darueber
  const hoch = kern.vergleicheMitVorgeschichte(50, [38, 40, 42, 40]);
  assert.equal(hoch.mittel, 40);
  assert.equal(hoch.abweichung, 10);
  assert.equal(hoch.richtung, "darueber");

  // Innerhalb der eigenen Schwankung ist nichts zu melden
  const normal = kern.vergleicheMitVorgeschichte(41, [38, 40, 42, 40]);
  assert.equal(normal.richtung, "wie sonst");
});

test("Vorgeschichte ohne Streuung meldet trotzdem eine Richtung", () => {
  // Ohne Streuung gibt es kein z. Ein klar abweichender Wert darf dann nicht
  // als "wie sonst" durchgehen.
  const v = kern.vergleicheMitVorgeschichte(50, [40, 40, 40, 40]);
  assert.equal(v.z, null);
  assert.equal(v.richtung, "darueber");
  assert.equal(kern.vergleicheMitVorgeschichte(40.5, [40, 40, 40, 40]).richtung, "wie sonst");
});

test("Bluetooth-Paket: Herzfrequenz als ein Byte, keine RR-Intervalle", () => {
  // Flags 0x00 -> uint8-HF, kein RR
  const d = new DataView(new Uint8Array([0x00, 60]).buffer);
  const w = gurt.deuteMesswert(d);
  assert.equal(w.hf, 60);
  assert.deepEqual(w.rr, []);
});

test("Bluetooth-Paket: RR-Intervalle werden von 1/1024 s in ms umgerechnet", () => {
  // Flags 0x10 -> RR vorhanden. 1024 Einheiten = 1000 ms
  const bytes = new Uint8Array([0x10, 60, 0x00, 0x04]); // 0x0400 = 1024
  const w = gurt.deuteMesswert(new DataView(bytes.buffer));
  assert.equal(w.hf, 60);
  assert.deepEqual(w.rr, [1000]);
});

test("Bluetooth-Paket: zwei RR-Intervalle in einem Paket", () => {
  // 0x0320 = 800 Einheiten -> 781 ms
  const bytes = new Uint8Array([0x10, 75, 0x20, 0x03, 0x20, 0x03]);
  const w = gurt.deuteMesswert(new DataView(bytes.buffer));
  assert.equal(w.rr.length, 2);
  assert.equal(w.rr[0], 781);
});

test("Bluetooth-Paket: 16-Bit-Herzfrequenz mit uebersprungenem Energiewert", () => {
  // Flags 0x19 = uint16-HF (0x01) + Energie (0x08) + RR (0x10)
  const bytes = new Uint8Array([0x19, 0xc8, 0x00, 0x11, 0x22, 0x00, 0x04]);
  const w = gurt.deuteMesswert(new DataView(bytes.buffer));
  assert.equal(w.hf, 200);
  assert.deepEqual(w.rr, [1000]);
});

// ---- Atemfuehrung ----

const muster = { key: "t", label: "Test", ein: 4, halten: 2, aus: 6 };

test("Atemzyklus laeuft durch alle Phasen", () => {
  assert.equal(atem.zykluslaenge(muster), 12);
  assert.equal(atem.atemStand(muster, 0).phase, "ein");
  assert.equal(atem.atemStand(muster, 3.9).phase, "ein");
  assert.equal(atem.atemStand(muster, 4).phase, "halten");
  assert.equal(atem.atemStand(muster, 5.9).phase, "halten");
  assert.equal(atem.atemStand(muster, 6).phase, "aus");
  assert.equal(atem.atemStand(muster, 11.9).phase, "aus");
});

test("nach einem vollen Zyklus beginnt der zweite Atemzug", () => {
  assert.equal(atem.atemStand(muster, 0).zug, 1);
  assert.equal(atem.atemStand(muster, 11.9).zug, 1);
  assert.equal(atem.atemStand(muster, 12).zug, 2);
  assert.equal(atem.atemStand(muster, 12).phase, "ein");
});

test("Fuellung steigt beim Einatmen und faellt beim Ausatmen", () => {
  assert.equal(atem.atemStand(muster, 0).fuellung, 0);
  assert.equal(atem.atemStand(muster, 2).fuellung, 0.5);
  assert.equal(atem.atemStand(muster, 4).fuellung, 1); // Beginn Halten
  assert.equal(atem.atemStand(muster, 5).fuellung, 1); // waehrend Halten
  assert.equal(atem.atemStand(muster, 9).fuellung, 0.5); // halb ausgeatmet
});

test("Restsekunden zaehlen die laufende Phase herunter", () => {
  assert.equal(atem.atemStand(muster, 0).restSekunden, 4);
  assert.equal(atem.atemStand(muster, 3.5).restSekunden, 1);
  assert.equal(atem.atemStand(muster, 6).restSekunden, 6);
});

test("Muster ohne Haltephase springt direkt ins Ausatmen", () => {
  const ohne = { key: "o", label: "ohne", ein: 5, halten: 0, aus: 5 };
  assert.equal(atem.atemStand(ohne, 5).phase, "aus");
  assert.equal(atem.atemStand(ohne, 4.9).phase, "ein");
});
