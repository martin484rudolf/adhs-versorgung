// Wandelt data/stoffe.yaml (Quelle = psychologie-tool/module_versorgung/stoffe.yaml) in src/data/stoffe.json.
// Aufruf: npm run stoffe   (nach jeder Aenderung der YAML)
import fs from "node:fs";
import yaml from "js-yaml";
const src = fs.readFileSync("data/stoffe.yaml", "utf8");
const doc = yaml.load(src);
const stoffe = Object.entries(doc.stoffe).map(([key, v]) => ({ key, ...v }));
fs.writeFileSync("src/data/stoffe.json", JSON.stringify({ meta: doc.meta, stoffe }, null, 1));
console.log("stoffe.json:", stoffe.length, "Stoffe");
