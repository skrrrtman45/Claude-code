# Plan: Fußball-Treffen-Demo

Jeder Schritt ist einzeln lauffähig und wird einzeln committet.

## Schritt 1: Grundgerüst
- `index.html`, `css/style.css`, `js/app.js` anlegen
- Mobile Layout: Kopfzeile, Inhaltsbereich, untere Navigationsleiste (Karte / Neu / Treffen)
- Ergebnis: leere App mit umschaltbaren Ansichten

## Schritt 2: Beispieldaten
- `js/data.js` mit ca. 8–10 fiktiven Kneipen in Berlin (Name, Adresse, Koordinaten,
  Bild, Getränkepreise, Essen, optional Verein)
- Alle Bundesliga-Vereine der aktuellen Saison (Liste vorher prüfen)
- 5–8 Spiele (Heim, Gast, Datum/Uhrzeit, Wettbewerb)
- 4–6 vorhandene Treffen (Spiel, Kneipe, Uhrzeit, Teilnehmerzahl)
- Lizenzfreie Fotos in `img/`, Nachweise in `img/CREDITS.md` (offen: Unsplash mit Bot-Sperre, Wikimedia drosselt Downloads; Platzhalter aktiv)

## Schritt 3: Karte
- Leaflet einbinden, Karte auf Berlin zentriert, volle Höhe
- Marker für jede Kneipe; Fankneipen farblich markiert
- Kennzeichnung, ob in der Kneipe Treffen anstehen (z.B. Zahl am Marker)

## Schritt 4: Kneipen-Detail
- Tippen auf Marker öffnet Detailansicht (Bottom-Sheet)
- Bild, Getränkepreise, Essen, Fankneipen-Badge, Liste der Treffen dort

## Schritt 5: Treffen-Liste
- Ansicht "Treffen": Karten mit Spiel, Kneipe, Uhrzeit, Teilnehmerzahl
- Einfacher Filter nach Verein

## Schritt 6: Treffen beitreten
- Button "Beitreten" / "Verlassen"
- Status in localStorage, Teilnehmerzahl aktualisiert sich

## Schritt 7: Treffen erstellen
- Formular: Spiel (Auswahl), Kneipe (Auswahl), Uhrzeit, kurze Beschreibung
- Validierung (Pflichtfelder)
- Speichern in localStorage, erscheint sofort auf Karte und in Liste

## Schritt 8: Design-Durchgang
- Alle Ansichten gemeinsam mit dem Nutzer prüfen und überarbeiten
- Einheitliche Abstände, Typografie, Zustände (aktiv, leer, Fehler)

## Schritt 9: Feinschliff
- Test auf echter Handygröße, Abstände, Touch-Ziele (min. 44px)
- Button "Demo zurücksetzen" (localStorage löschen)
- README mit Startanleitung

## Schritt 10 (optional): Swipe-Ansicht
- Treffen als Karten-Stapel, nach rechts = beitreten, nach links = überspringen
- Umsetzung mit Touch-Events in Vanilla JS, ohne Bibliothek

## Entscheidungen
- Bilder: lizenzfreie Fotos, lokal gespeichert, mit Quellennachweis
- Vereine: ganze Bundesliga
- Design: modern, minimalistisch, warm (Details in CLAUDE.md)
- Betrieb: online über GitHub Pages (Branch `claude/sweet-ramanujan-w7s1ou`)
