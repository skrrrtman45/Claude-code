# CLAUDE.md

## Projekt

Mobil-optimierte Demo-Web-App: Fußballfans, die neu in einer Stadt sind (Start: Berlin),
finden Kneipen und verabreden sich, um Spiele gemeinsam zu schauen.

Es ist eine **Demo**. Kein Produktivsystem.

## Umfang

Drin:
- Kartenansicht mit Kneipen und Treffen
- Kneipen-Detail: Bild, Getränkepreise, Essensangebot, ggf. Fankneipe eines Vereins
- Treffen erstellen (Spiel, Kneipe, Uhrzeit) und beitreten
- Später optional: Swipe-Ansicht der Treffen

Nicht drin (nicht einbauen, auch nicht "vorbereitend"):
- Login / Accounts
- Chat
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
img/              Platzhalterbilder für Kneipen
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
- Code einfach und kommentiert halten, der Nutzer soll ihn lesen können.

## Beispieldaten

- Kneipennamen und Angaben sind **fiktiv**. Keine echten Kneipen mit erfundenen
  Preisen oder Fan-Zugehörigkeiten darstellen.
- Koordinaten realistisch innerhalb Berlins.
- Vereinsnamen dürfen real sein (z.B. Hertha BSC, Union Berlin), Spiele sind Beispiele.

## Arbeitsweise

- Schrittweise nach `PLAN.md` vorgehen, ein Schritt pro Commit.
- Nach jedem Schritt im Browser (Mobilgröße) prüfen.
- Bei Unklarheiten nachfragen statt annehmen.
