# CLAUDE.md

## Projekt

Mobil-optimierte Demo-Web-App: Fußballfans, die neu in einer Stadt sind (Start: Berlin),
finden Kneipen und verabreden sich, um Spiele gemeinsam zu schauen.

Es ist eine **Demo**. Kein Produktivsystem.

## Umfang

Drin:
- Kartenansicht mit Kneipen und Treffen
- Kneipen-Detail: Bild, Getränkepreise, Essensangebot, ggf. Fankneipe eines Vereins
- Treffen erstellen (Spiel, Kneipe, Uhrzeit, Plätze) und verbindlich zusagen
- No-Show-Schutz: begrenzte Plätze, Absage bis 3 Std. vorher, Warteliste, Erinnerung in der App
- Profil (Name, Foto, Lieblingsverein, Bezirk, Sprachen), nur im Browser gespeichert
- Simulierter Chat pro Treffen: Beispielnachrichten + eigene Nachrichten nur auf dem Gerät,
  klar als Demo gekennzeichnet
- Später optional: Swipe-Ansicht der Treffen

Nicht drin (nicht einbauen, auch nicht "vorbereitend"):
- Login / Accounts, echte Verifizierung
- Echter Chat oder echte Push-Benachrichtigungen (bräuchten einen Server)
- Backend, Datenbank, API
- Bezahlung

## Tech-Stack

- **HTML + CSS + Vanilla JavaScript**, kein Framework, kein Build-Schritt, kein npm.
- **Leaflet** (per CDN, feste Version) mit **OpenStreetMap**-Kacheln für die Karte.
- **Beispieldaten** in `js/data.js` als JS-Objekte.
- **localStorage** speichert selbst erstellte Treffen und Beitritte im Browser.

Begründung: Der Nutzer kann Python, kaum Webentwicklung. Dieser Stack hat die wenigsten
beweglichen Teile, jede Datei ist direkt lesbar, und die App läuft als statische Seite
(lokal oder z.B. auf GitHub Pages). Python wird nur zum lokalen Ausliefern gebraucht.

## Struktur

```
index.html        Einstiegsseite, alle Ansichten
css/style.css     Styles, mobile-first
js/data.js        Beispieldaten: Kneipen, Vereine, Spiele, Treffen
js/store.js       Lesen/Schreiben von localStorage
js/map.js         Karte, Marker, Popups
js/app.js         Ansichtswechsel, Formulare, Event-Handler
img/              Lizenzfreie Fotos für Kneipen
img/CREDITS.md    Quelle, Fotograf und Lizenz je Foto
```

## Starten

```
python3 -m http.server 8000
```
Dann im Browser `http://localhost:8000` öffnen. Für Handy-Ansicht: Browser-DevTools,
Gerätemodus (z.B. iPhone-Größe).

## Konventionen

- Code-Bezeichner auf Englisch, UI-Texte auf Deutsch.
- Mobile-first: Layout zuerst für ~375px Breite, dann größer.
- Kein Code außer den oben genannten Dateien ohne Absprache. Keine neuen Bibliotheken
  ohne Absprache.
- Externe Skripte nur mit fester Versionsnummer.
- Bei jeder Änderung an CSS/JS die Versionsnummer `?v=...` in `index.html` erhöhen,
  sonst zeigen Handys bis zu 10 Minuten alte Dateien (Zwischenspeicher von GitHub Pages).
- Code einfach und kommentiert halten, der Nutzer soll ihn lesen können.

## Design

- Richtung: modern, minimalistisch, so einfach wie möglich zu bedienen, aber warm und
  mit Charakter (keine kühle Finanz-App-Optik).
- Farben, Radien, Schatten nur über die CSS-Variablen in `css/style.css` (`:root`).
  Hintergrund warmes Off-White, Akzent Flutlicht-Orange `#ff5a36`, Rasengrün nur
  sparsam (z.B. Fankneipen-Badge).
- Systemschrift, Titel fett (800) mit leicht engem Zeichenabstand.
- Runde Formen, Linien-Icons (inline SVG, kein Icon-Paket), keine Emojis.
- Pro Ansicht genau eine Hauptaktion in Akzentfarbe. Wenig Text, große Touch-Ziele.

## Beispieldaten

- Kneipennamen und Angaben sind **fiktiv**. Keine echten Kneipen mit erfundenen
  Preisen oder Fan-Zugehörigkeiten darstellen.
- Koordinaten realistisch innerhalb Berlins.
- Fankneipen selten halten (derzeit 3 von 10), sonst wirkt es unrealistisch.
- Jede Kneipe hat `tv` (Sky/DAZN) und `leagues` (1./2. Bundesliga), beides fiktiv.
- Vereine: die ganze Bundesliga (reale Vereinsnamen). Die Vereinsliste der aktuellen
  Saison vor dem Eintragen prüfen, nicht aus dem Gedächtnis übernehmen. Spiele und
  Termine sind Beispiele.
- Fotos: lizenzfrei (z.B. Unsplash- oder Pexels-Lizenz), lokal in `img/` speichern,
  nicht per Hotlink. Jedes Foto in `img/CREDITS.md` mit Quelle und Lizenz eintragen.
  Allgemeine Kneipen-/Bar-Motive, keine erkennbar echten Lokale.

## Betrieb

- Online über GitHub Pages, Quelle: Branch `claude/sweet-ramanujan-w7s1ou`, Ordner `/`.
  Jeder Push auf diesen Branch aktualisiert die Seite.
- Das Repository ist öffentlich: keine Zugangsdaten oder privaten Infos committen.

## Arbeitsweise

- Schrittweise nach `PLAN.md` vorgehen, ein Schritt pro Commit.
- Nach jedem Schritt im Browser (Mobilgröße) prüfen.
- Bei Unklarheiten nachfragen statt annehmen.
