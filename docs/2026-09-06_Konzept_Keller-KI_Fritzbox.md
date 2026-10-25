# Keller-KI für die ADHS-Versorgungs-App — Anbindung ans Heimnetz
Stand: 2026-09-06 · Ergänzung zu Code Projekte/ADHS_Versorgung

## Zweck
Ein Rechner im Haus übernimmt die Bildanalyse für die App (Tellerfoto, Laborbefund, Zutatenliste, Speisekarte). Gesundheitsdaten bleiben in der App auf dem Handy, das Bild bleibt im Haus. Die App funktioniert ohne den Server genauso, nur mit Tippen statt Foto.

## Wo der Server steht
Per Kabel im normalen Heimnetz der Fritzbox, mit fester IP-Adresse (Fritzbox → Heimnetz → Netzwerk → Gerät bearbeiten → „Diesem Netzwerkgerät immer die gleiche IPv4-Adresse zuweisen"). Nicht ins Gästenetz: Das Gästenetz ist vom Heimnetz getrennt, Geräte dort erreichen nur das Internet, das Handy im Heimnetz käme nicht an den Server. Kein WLAN für den Server, Dauerlast gehört ans Kabel.

## Was nicht passiert
Keine Portfreigabe in der Fritzbox. Der Server ist von außen unsichtbar. Kein Dienst außer dem Modell und dem Proxy. Automatische Updates an.

## Von unterwegs: WireGuard in der Fritzbox
FRITZ!OS ab 7.50 hat WireGuard eingebaut (Internet → Freigaben → VPN (WireGuard) → Verbindung hinzufügen → „Einzelgerät", QR-Code mit der WireGuard-App auf dem Handy scannen). Das Handy ist dann unterwegs im Heimnetz, die App spricht den Server über dieselbe Adresse an wie zu Hause. Voraussetzung ist eine erreichbare öffentliche Adresse (IPv6 oder IPv4 ohne DS-Lite; MyFRITZ! liefert den Namen). Alternative, falls das nicht geht oder der Bekannte es so betreibt: Tailscale auf Server und Handy, gleiches Ergebnis ohne Fritzbox-Einstellung.

## Auf dem Server
Modell-Laufzeit: Ollama (oder vLLM), gebunden an die Heimnetz-Adresse, nicht an 0.0.0.0. Davor ein Reverse-Proxy (Caddy) mit HTTPS und Passwort, damit die PWA über eine verschlüsselte Adresse spricht; Browser verlangen HTTPS für Kamera und Service Worker. Zertifikat über Caddys interne CA (Stammzertifikat einmal aufs Handy) oder über einen eigenen Domainnamen mit DNS-Challenge.

Beispiel Caddyfile:
```
keller.home.arpa {
  tls internal
  basicauth {
    martin <bcrypt-hash>
  }
  reverse_proxy 127.0.0.1:11434
}
```

## Modell
Bild-Sprach-Modell mit 7 bis 12 Milliarden Parametern (Qwen-VL, Gemma, LLaVA-Abkömmlinge). Reicht für: Bausteine erkennen, Eiweiß ja/nein, Zucker grob, Laborwerte und Referenzbereiche vom Blatt lesen, Zutatenlisten lesen. Reicht nicht für grammgenaue Nährwerte, das kann kein Modell aus einem Foto. Die App zeigt das Ergebnis immer zur Bestätigung, nichts wird ungesehen gespeichert.

## Hardware
Grafikkarte mit 12 bis 16 GB Speicher (RTX 3060 12 GB, RTX 4060 Ti 16 GB; gebraucht 250 bis 400 Euro) oder Mac mini mit 16 GB Einheitsspeicher. Leerlauf 15 bis 30 Watt, eine Bildanalyse wenige Sekunden Last. Passt zu PV-Überschuss am Tag, fällt nachts kaum auf.

## Schnittstelle zur App
OpenAI-kompatibel (`POST /v1/chat/completions` mit Bild als Base64), wie Ollama sie liefert. Die App bekommt in den Einstellungen: Adresse, Passwort, Modellname. Ist der Server nicht erreichbar, blendet die App die Foto-Knöpfe aus und alles läuft wie heute.

## Reihenfolge
Server ins Heimnetz, feste IP, Ollama mit einem Bildmodell, Caddy davor. Test aus dem Heimnetz mit dem Handy. Dann WireGuard auf der Fritzbox, Test von unterwegs. Dann Foto-Modus in der App (v0.2).
