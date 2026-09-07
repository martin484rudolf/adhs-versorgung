// Was es an Unterstützung gibt und wo man sie holt.
//
// ACHTUNG – Stand ungeprüft. Diese Liste ist ein Gerüst aus Grundwissen, KEINE
// Rechtsauskunft. Beträge stehen bewusst nirgends: sie ändern sich und gehören
// aus der Quelle gelesen, nicht aus einer App. Vor dem ersten echten Einsatz jede
// Zeile gegen die angegebene Quelle prüfen (Muster: ZU_PRUEFEN im Patent-Projekt).

export interface Leistungsdef {
  key: string;
  name: string;
  /** Ein Satz in Alltagssprache: wofür ist das gut? */
  wofuer: string;
  /** Wo wird es beantragt? */
  wo: string;
  /** Was muss erfüllt sein? */
  voraussetzung: string;
  hinweis?: string;
  /** Zum Nachprüfen – für die Pflege dieser Datei, nicht für die Oberfläche. */
  quelle: string;
  bereich: "pflege" | "gesundheit" | "geld" | "wohnen" | "vorsorge";
}

export const LEISTUNGEN: Leistungsdef[] = [
  {
    key: "pflegegrad",
    name: "Pflegegrad",
    wofuer: "Der Schlüssel zu fast allem anderen. Ohne Pflegegrad gibt es die meisten Pflegeleistungen nicht.",
    wo: "Formlos bei der Pflegekasse der eigenen Krankenkasse – ein Anruf genügt, das Datum zählt.",
    voraussetzung: "Selbstständigkeit im Alltag ist beeinträchtigt; der Medizinische Dienst begutachtet.",
    hinweis:
      "Vor dem Begutachtungstermin ein paar Tage mitschreiben, was schwerfällt – genau dafür ist die Bedarfsliste dieser App da.",
    quelle: "SGB XI · Pflegekasse der eigenen Krankenkasse · Verbraucherzentrale",
    bereich: "pflege",
  },
  {
    key: "pflegegeld",
    name: "Pflegegeld",
    wofuer: "Geld an die pflegebedürftige Person, wenn Angehörige oder Bekannte pflegen.",
    wo: "Pflegekasse, zusammen mit dem Pflegegrad.",
    voraussetzung: "Pflegegrad 2 oder höher, Pflege zu Hause.",
    quelle: "SGB XI",
    bereich: "pflege",
  },
  {
    key: "pflegesachleistung",
    name: "Pflegesachleistung (Pflegedienst)",
    wofuer: "Ein ambulanter Pflegedienst kommt ins Haus; die Kasse zahlt direkt an den Dienst.",
    wo: "Pflegekasse; den Dienst sucht man sich selbst.",
    voraussetzung: "Pflegegrad 2 oder höher.",
    hinweis: "Lässt sich mit Pflegegeld kombinieren (Kombinationsleistung).",
    quelle: "SGB XI",
    bereich: "pflege",
  },
  {
    key: "entlastungsbetrag",
    name: "Entlastungsbetrag",
    wofuer: "Monatlicher Betrag für Alltagshilfe: Haushaltshilfe, Betreuung, Begleitung.",
    wo: "Pflegekasse; wird gegen Rechnung erstattet.",
    voraussetzung: "Ab Pflegegrad 1 – die einzige Geldleistung, die es schon bei Pflegegrad 1 gibt.",
    hinweis: "Verfällt, wenn er nicht genutzt wird. Wird oft übersehen.",
    quelle: "SGB XI § 45b",
    bereich: "pflege",
  },
  {
    key: "verhinderungspflege",
    name: "Verhinderungspflege",
    wofuer: "Vertretung, wenn die pflegende Person Urlaub, Krankheit oder einfach eine Pause braucht.",
    wo: "Pflegekasse.",
    voraussetzung: "Pflegegrad 2 oder höher.",
    quelle: "SGB XI",
    bereich: "pflege",
  },
  {
    key: "kurzzeitpflege",
    name: "Kurzzeitpflege",
    wofuer: "Vorübergehend stationär – etwa nach einem Krankenhausaufenthalt.",
    wo: "Pflegekasse; den Platz sucht man selbst.",
    voraussetzung: "Pflegegrad 2 oder höher.",
    quelle: "SGB XI",
    bereich: "pflege",
  },
  {
    key: "tagespflege",
    name: "Tages- oder Nachtpflege",
    wofuer: "Tagsüber betreut außer Haus, abends zu Hause. Hilft oft auch gegen Vereinsamung.",
    wo: "Pflegekasse.",
    voraussetzung: "Pflegegrad 2 oder höher.",
    quelle: "SGB XI",
    bereich: "pflege",
  },
  {
    key: "pflegehilfsmittel",
    name: "Pflegehilfsmittel zum Verbrauch",
    wofuer: "Handschuhe, Betteinlagen, Desinfektion – monatlich, unkompliziert.",
    wo: "Pflegekasse; viele Sanitätshäuser übernehmen den Antrag.",
    voraussetzung: "Pflegegrad 1 oder höher, Pflege zu Hause.",
    quelle: "SGB XI § 40",
    bereich: "pflege",
  },
  {
    key: "wohnumfeld",
    name: "Wohnumfeldverbessernde Maßnahmen",
    wofuer: "Umbau: bodengleiche Dusche, Haltegriffe, Treppenlift, breitere Türen.",
    wo: "Pflegekasse – vor dem Umbau beantragen, sonst gibt es nichts.",
    voraussetzung: "Pflegegrad 1 oder höher.",
    hinweis: "Der häufigste Fehler: erst bauen, dann fragen.",
    quelle: "SGB XI § 40 Abs. 4",
    bereich: "wohnen",
  },
  {
    key: "hausnotruf",
    name: "Hausnotruf",
    wofuer: "Knopf am Handgelenk, der im Notfall Hilfe ruft.",
    wo: "Pflegekasse (als Pflegehilfsmittel) oder direkt beim Anbieter.",
    voraussetzung: "Pflegegrad und überwiegend allein lebend.",
    quelle: "SGB XI § 40",
    bereich: "wohnen",
  },
  {
    key: "haeusliche_krankenpflege",
    name: "Häusliche Krankenpflege",
    wofuer: "Medizinische Pflege zu Hause: Verbände, Spritzen, Medikamentengabe.",
    wo: "Ärztliche Verordnung, dann Krankenkasse – nicht Pflegekasse.",
    voraussetzung: "Ärztlich verordnet; ein Pflegegrad ist dafür nicht nötig.",
    hinweis: "Wird oft mit Pflegeleistungen verwechselt. Andere Kasse, anderer Weg.",
    quelle: "SGB V § 37",
    bereich: "gesundheit",
  },
  {
    key: "heilmittel",
    name: "Heilmittel (Physio, Ergo, Logopädie)",
    wofuer: "Beweglichkeit halten, nach Sturz oder Schlaganfall wieder aufbauen.",
    wo: "Ärztliche Verordnung.",
    voraussetzung: "Ärztlich verordnet; bei Dauerdiagnosen ist eine langfristige Verordnung möglich.",
    quelle: "SGB V · Heilmittel-Richtlinie",
    bereich: "gesundheit",
  },
  {
    key: "schwerbehindertenausweis",
    name: "Schwerbehindertenausweis",
    wofuer: "Nachteilsausgleiche: Steuerfreibetrag, Parkerleichterung, günstigerer Nahverkehr.",
    wo: "Versorgungsamt beziehungsweise Landratsamt.",
    voraussetzung: "Grad der Behinderung ab 50; Merkzeichen je nach Einschränkung.",
    quelle: "SGB IX",
    bereich: "geld",
  },
  {
    key: "grundsicherung_alter",
    name: "Grundsicherung im Alter",
    wofuer: "Wenn die Rente nicht reicht.",
    wo: "Sozialamt der Stadt oder des Kreises.",
    voraussetzung: "Regelaltersgrenze erreicht, Einkommen und Vermögen unter der Grenze.",
    hinweis:
      "Kinder werden erst ab einem hohen Jahreseinkommen herangezogen – die Sorge davor hält viele unnötig davon ab.",
    quelle: "SGB XII Kapitel 4",
    bereich: "geld",
  },
  {
    key: "wohngeld",
    name: "Wohngeld",
    wofuer: "Zuschuss zur Miete, auch im Rentenalter.",
    wo: "Wohngeldstelle der Stadt oder Gemeinde.",
    voraussetzung: "Einkommen unter der Grenze; nicht gleichzeitig mit Grundsicherung.",
    quelle: "Wohngeldgesetz",
    bereich: "geld",
  },
  {
    key: "rundfunkbeitrag",
    name: "Befreiung vom Rundfunkbeitrag",
    wofuer: "Der Beitrag entfällt oder wird ermäßigt.",
    wo: "Beitragsservice, mit Nachweis.",
    voraussetzung: "Grundsicherung oder bestimmte Merkzeichen im Schwerbehindertenausweis.",
    quelle: "Rundfunkbeitragsstaatsvertrag",
    bereich: "geld",
  },
  {
    key: "pflegeberatung",
    name: "Pflegeberatung nach § 7a",
    wofuer: "Kostenlose, unabhängige Beratung, die durch den Antragsdschungel führt.",
    wo: "Pflegekasse oder Pflegestützpunkt vor Ort.",
    voraussetzung: "Der Anspruch besteht, sobald Leistungen beantragt sind.",
    hinweis: "Der beste erste Anruf, wenn diese Liste erschlägt.",
    quelle: "SGB XI § 7a",
    bereich: "pflege",
  },
  {
    key: "vorsorgevollmacht",
    name: "Vorsorgevollmacht und Patientenverfügung",
    wofuer: "Keine Leistung, sondern Vorsorge: wer entscheidet, wenn man selbst nicht mehr kann.",
    wo: "Selbst verfassen; Betreuungsbehörde oder Notariat beglaubigt.",
    voraussetzung: "Solange man geschäftsfähig ist – deshalb früh.",
    hinweis: "Ohne Vollmacht entscheidet nicht automatisch die Familie, sondern das Betreuungsgericht.",
    quelle: "BGB · Formulare kostenlos beim Bundesjustizministerium",
    bereich: "vorsorge",
  },
];

export const BEREICH_LABEL: Record<Leistungsdef["bereich"], string> = {
  pflege: "Pflege",
  gesundheit: "Gesundheit",
  geld: "Geld",
  wohnen: "Wohnen",
  vorsorge: "Vorsorge",
};

export const leistung = (key: string) => LEISTUNGEN.find((l) => l.key === key);
