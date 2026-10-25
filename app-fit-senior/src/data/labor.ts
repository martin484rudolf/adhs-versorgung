// Labor-Registry für Fit Senior. Andere Marker als bei ADHS: hier zählt, was im Alter
// häufig kippt – Vitamin B12 und D, Eisen, Eiweißversorgung, Niere, Natrium.
//
// Die Stufen sind Orientierung aus der Literatur, kein Befund. Der Referenzbereich des
// Labors hat immer Vorrang, und die Einordnung macht die Ärztin.
// ZU PRÜFEN: Schwellen gegen eine benannte Leitlinie (DGE / DGIM / Hausarzt) absichern.
import type { LaborAchse } from "@versorgung/kern";

export const LABOR: Record<string, LaborAchse> = {
  vitamin_d_25oh: {
    label: "25-OH-Vitamin D",
    einheit: "ng/ml",
    stufen: { mangel_unter: 20, grau_bis: 30 },
    hinweis: "Im Alter bildet die Haut weniger; Sturzrisiko und Knochen hängen daran. nmol/l = ng/ml × 2,5",
  },
  holo_tc: {
    label: "Holotranscobalamin (aktives B12)",
    einheit: "pmol/l",
    stufen: { mangel_unter: 35, grau_bis: 50 },
    hinweis: "Aussagekräftiger als B12 im Serum, besonders unter Magensäureblockern oder Metformin",
  },
  b12_serum: {
    label: "Vitamin B12 (Serum)",
    einheit: "ng/l",
    stufen: { mangel_unter: 211, grau_bis: 544 },
    hinweis: "Graubereich → Holo-TC oder Homocystein klären",
  },
  folsaeure: { label: "Folsäure", einheit: "µg/l", stufen: { mangel_unter: 4.0, grau_bis: 5.4 } },
  ferritin: {
    label: "Ferritin",
    einheit: "µg/l",
    stufen: { mangel_unter: 30, grau_bis: 50 },
    hinweis: "Bei Entzündung falsch hoch – zusammen mit CRP lesen",
  },
  haemoglobin: {
    label: "Hämoglobin",
    einheit: "g/dl",
    stufen: { mangel_unter: 12, grau_bis: 13 },
    hinweis: "Blässe, Luftnot, Schwäche; Referenz unterscheidet sich nach Geschlecht",
  },
  albumin: {
    label: "Albumin",
    einheit: "g/l",
    stufen: { mangel_unter: 35, grau_bis: 38 },
    hinweis: "Marker der Eiweißversorgung – niedrig heißt oft: zu wenig gegessen",
  },
  egfr: {
    label: "eGFR (Nierenleistung)",
    einheit: "ml/min",
    stufen: { mangel_unter: 30, grau_bis: 60 },
    hinweis: "Unter 60 sind viele Ergänzungen und Medikamentendosen zu prüfen – ärztliche Sache",
  },
  natrium: {
    label: "Natrium",
    einheit: "mmol/l",
    hinweis: "Zu niedrig kommt im Alter oft von Medikamenten (Entwässerung, Antidepressiva) – Verwirrtheit, Stürze",
  },
  kalium: { label: "Kalium", einheit: "mmol/l", hinweis: "Referenz des Labors; relevant für Kalium-Obergrenzen" },
  calcium: { label: "Calcium", einheit: "mmol/l", hinweis: "Zusammen mit Vitamin D lesen" },
  tsh: { label: "TSH basal", einheit: "mU/l", hinweis: "Schilddrüse als Ursache von Müdigkeit oder Unruhe ausschließen" },
  hba1c: { label: "HbA1c", einheit: "%", hinweis: "Im Alter gelten weniger strenge Ziele als bei Jüngeren – ärztlich festlegen" },
  crp: { label: "CRP", einheit: "mg/l", hinweis: "Entzündungszeichen; verfälscht Ferritin nach oben" },
  vitamin_b6: { label: "Vitamin B6", einheit: "µg/l", hinweis: "Auch Überdosierung schadet (Nerven) – Obergrenze beachten" },
};

/** Was zuerst fehlt, wenn man nur ein Blutbild bekommt. */
export const LABOR_WICHTIG = ["vitamin_d_25oh", "holo_tc", "ferritin", "albumin", "egfr", "haemoglobin"];
