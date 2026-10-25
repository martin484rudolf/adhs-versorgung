// Brustgurt über Web Bluetooth.
//
// Ein Herzfrequenzgurt spricht einen standardisierten Bluetooth-Dienst (Heart Rate, 0x180D).
// Chrome kann den direkt ansprechen – damit misst die Web-App ohne Server, ohne Cloud und
// ohne App-Store, und die Rohdaten entstehen im Browser und bleiben dort.
//
// Grenzen, die man kennen muss:
// - Safari und damit jedes iPhone unterstützen Web Bluetooth nicht. Android Chrome ja.
// - Die Geräteauswahl muss aus einem Klick heraus passieren, sonst blockt der Browser.
// - Solange der Bildschirm aus ist, läuft nichts weiter. Messen heißt: App offen lassen.
import type { RR } from "./puls";

/** Was am Gurt anliegt, so wie es hereinkommt. */
export interface Messwert {
  /** Herzfrequenz in Schlägen pro Minute, wie vom Gerät gemeldet. */
  hf: number;
  /** RR-Intervalle in ms. Manche Pakete enthalten keine, manche mehrere. */
  rr: RR[];
  /** Kontaktstatus, falls das Gerät ihn meldet. */
  kontakt?: boolean;
}

export interface Verbindung {
  /** Gerätename, wie ihn der Browser meldet. */
  name: string;
  trennen: () => Promise<void>;
}

const HEART_RATE = "heart_rate";
const HEART_RATE_MEASUREMENT = "heart_rate_measurement";

/**
 * Steht Web Bluetooth überhaupt zur Verfügung? Die Oberfläche soll das sagen können,
 * bevor jemand vergeblich auf einen Knopf drückt.
 */
export function bluetoothVerfuegbar(): boolean {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

/**
 * Deutet ein Paket der Heart-Rate-Measurement-Characteristic.
 *
 * Aufbau laut Bluetooth-Spezifikation: ein Flags-Byte, dann die Herzfrequenz
 * (ein oder zwei Byte, je nach Bit 0), optional der Energieverbrauch (Bit 3),
 * danach die RR-Intervalle (Bit 4). RR kommt in Einheiten von 1/1024 Sekunde –
 * die Umrechnung auf Millisekunden wird gern vergessen und macht die HRV um
 * gut zwei Prozent falsch.
 */
export function deuteMesswert(data: DataView): Messwert {
  const flags = data.getUint8(0);
  const hf16 = (flags & 0x01) !== 0;
  const kontaktErkannt = (flags & 0x02) !== 0;
  const kontaktUnterstuetzt = (flags & 0x04) !== 0;
  const energie = (flags & 0x08) !== 0;
  const rrVorhanden = (flags & 0x10) !== 0;

  let i = 1;
  const hf = hf16 ? data.getUint16(i, true) : data.getUint8(i);
  i += hf16 ? 2 : 1;
  if (energie) i += 2;

  const rr: RR[] = [];
  if (rrVorhanden) {
    for (; i + 1 < data.byteLength; i += 2) {
      rr.push(Math.round((data.getUint16(i, true) * 1000) / 1024));
    }
  }

  return { hf, rr, ...(kontaktUnterstuetzt ? { kontakt: kontaktErkannt } : {}) };
}

/**
 * Fragt den Browser nach einem Gerät und liefert fortan Messwerte an `onWert`.
 * Muss aus einem Klick heraus aufgerufen werden.
 */
export async function verbindeGurt(
  onWert: (w: Messwert) => void,
  onTrennung?: () => void,
): Promise<Verbindung> {
  if (!bluetoothVerfuegbar()) {
    throw new Error("Dieser Browser kann kein Bluetooth. Auf dem iPhone geht es nicht, auf Android mit Chrome schon.");
  }

  const bt = (navigator as Navigator & { bluetooth: BluetoothBridge }).bluetooth;
  const geraet = await bt.requestDevice({ filters: [{ services: [HEART_RATE] }] });
  const server = await geraet.gatt.connect();
  const dienst = await server.getPrimaryService(HEART_RATE);
  const merkmal = await dienst.getCharacteristic(HEART_RATE_MEASUREMENT);

  const beiWert = (ev: Event) => {
    const ziel = ev.target as unknown as { value?: DataView };
    if (ziel.value) onWert(deuteMesswert(ziel.value));
  };
  merkmal.addEventListener("characteristicvaluechanged", beiWert);
  await merkmal.startNotifications();

  const beiTrennung = () => onTrennung?.();
  geraet.addEventListener("gattserverdisconnected", beiTrennung);

  return {
    name: geraet.name || "Gurt",
    trennen: async () => {
      geraet.removeEventListener("gattserverdisconnected", beiTrennung);
      merkmal.removeEventListener("characteristicvaluechanged", beiWert);
      try {
        await merkmal.stopNotifications();
      } catch {
        /* Gerät schon weg – dann ist ohnehin nichts mehr zu stoppen */
      }
      if (server.connected) server.disconnect();
    },
  };
}

/**
 * Ein Gurt zum Ausprobieren, wenn keiner da ist.
 *
 * Erzeugt einen Ruhepuls mit Atemmodulation: Beim Einatmen wird der Herzschlag
 * schneller, beim Ausatmen langsamer – genau diese Schwankung ist das, was HRV misst.
 * Damit lässt sich die Oberfläche prüfen, ohne sich einen Gurt umzuschnallen.
 */
export function simuliereGurt(onWert: (w: Messwert) => void, opt: { hf?: number; amplitude?: number } = {}): Verbindung {
  const basis = opt.hf ?? 62;
  const amplitude = opt.amplitude ?? 60; // ms Schwankung über den Atemzyklus
  let laeuft = true;
  let t = 0;

  const naechster = () => {
    if (!laeuft) return;
    // Atemzyklus von etwa 10 Sekunden
    const rr = Math.round(60000 / basis + Math.sin((t / 10) * 2 * Math.PI) * amplitude + (Math.random() - 0.5) * 12);
    t += rr / 1000;
    onWert({ hf: Math.round(60000 / rr), rr: [rr], kontakt: true });
    setTimeout(naechster, rr);
  };
  setTimeout(naechster, 300);

  return {
    name: "Simulation",
    trennen: async () => {
      laeuft = false;
    },
  };
}

// Minimale Beschreibung dessen, was wir von Web Bluetooth benutzen – die vollen
// Typen stecken in @types/web-bluetooth, und dafür lohnt die Abhängigkeit nicht.
interface BluetoothBridge {
  requestDevice(opt: { filters: { services: string[] }[] }): Promise<BluetoothGeraet>;
}
interface BluetoothGeraet extends EventTarget {
  name?: string;
  gatt: { connect(): Promise<BluetoothServer> };
}
interface BluetoothServer {
  connected: boolean;
  disconnect(): void;
  getPrimaryService(uuid: string): Promise<BluetoothDienst>;
}
interface BluetoothDienst {
  getCharacteristic(uuid: string): Promise<BluetoothMerkmal>;
}
interface BluetoothMerkmal extends EventTarget {
  startNotifications(): Promise<void>;
  stopNotifications(): Promise<void>;
}
