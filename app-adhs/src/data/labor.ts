// Labor-Registry – identisch mit psychologie-tool/daten/test_typen.json (typ "labor").
// Stufen sind Orientierung aus der Literatur; der Referenzbereich des Labors hat Vorrang.
import type { LaborAchse } from "@versorgung/kern";

export const LABOR: Record<string, LaborAchse> = {
  ferritin: { label: "Ferritin", einheit: "µg/l", stufen: { mangel_unter: 30, grau_bis: 50 }, hinweis: "ADHS-Literatur diskutiert Graubereich bis 50" },
  transferrin_saettigung: { label: "Transferrinsättigung", einheit: "%", stufen: { mangel_unter: 16, grau_bis: 20 } },
  holo_tc: { label: "Holotranscobalamin (aktives B12)", einheit: "pmol/l", stufen: { mangel_unter: 35, grau_bis: 50 } },
  b12_serum: { label: "Vitamin B12 (Serum)", einheit: "ng/l", stufen: { mangel_unter: 211, grau_bis: 544 }, hinweis: "Graubereich → Holo-TC oder Homocystein klären; unter Spirulina/B-Vitamin-Gabe unzuverlässig" },
  folsaeure: { label: "Folsäure", einheit: "µg/l", stufen: { mangel_unter: 4.0, grau_bis: 5.4 } },
  vitamin_d_25oh: { label: "25-OH-Vitamin D", einheit: "ng/ml", stufen: { mangel_unter: 20, grau_bis: 30 }, hinweis: "nmol/l = ng/ml × 2,5; Jahreszeit mitschreiben" },
  zink_serum: { label: "Zink (Serum)", einheit: "µg/dl", stufen: { mangel_unter: 70, grau_bis: 80 } },
  zink_vollblut: { label: "Zink (Vollblut)", einheit: "mg/l", stufen: { mangel_unter: 4.0, grau_bis: 4.5 }, hinweis: "Referenz laborabhängig" },
  magnesium_serum: { label: "Magnesium (Serum)", einheit: "mmol/l", stufen: { mangel_unter: 0.75, grau_bis: 0.85 }, hinweis: "wenig aussagekräftig, Vollblut besser" },
  magnesium_vollblut: { label: "Magnesium (Vollblut)", einheit: "mmol/l", stufen: { mangel_unter: 1.25, grau_bis: 1.4 }, hinweis: "Referenz laborabhängig" },
  omega3_index: { label: "HS-Omega-3-Index", einheit: "%", stufen: { mangel_unter: 4, grau_bis: 8 }, hinweis: "Ziel > 8 %; Speziallabor/Trockenblut" },
  tsh: { label: "TSH basal", einheit: "mU/l", hinweis: "Ausschluss Schilddrüse; Referenz des Labors" },
  ttg_iga: { label: "Transglutaminase-IgA (Zöliakie)", einheit: "U/ml", hinweis: "Ausschluss bei Darmbeschwerden" },
  calprotectin_stuhl: { label: "Calprotectin (Stuhl)", einheit: "µg/g", stufen: { mangel_unter: 0, grau_bis: 50 }, hinweis: "hier: grau = unauffällig (<50), darüber Entzündungshinweis – Arzt" },
  kalium: { label: "Kalium", einheit: "mmol/l", hinweis: "Referenz des Labors; relevant für Kalium-Obergrenze" },
  egfr: { label: "eGFR (Niere)", einheit: "ml/min", hinweis: "Ausschlusskriterium für Ergänzungen bei < 60" },
};

export const LABOR_WICHTIG = ["ferritin", "holo_tc", "vitamin_d_25oh", "zink_serum", "omega3_index"];
