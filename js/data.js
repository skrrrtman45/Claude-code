// Beispieldaten für die Demo. Alles hier ist fiktiv, außer den Vereinsnamen.
// - Kneipen: erfundene Namen und Preise, Koordinaten grob in echten Berliner Kiezen.
// - Spiele: Beispiel-Paarungen, keine echten Ansetzungen.
// - Treffen: erfundene Verabredungen.

// Hilfsfunktion: Datum "in X Tagen um HH:MM" als ISO-Text.
// So liegen Spiele und Treffen immer in der Zukunft, egal wann die Demo geöffnet wird.
function daysFromNow(days, time) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

// Bundesliga-Vereine 2026/27 (18 Vereine). color = Hauptfarbe für Badges.
const CLUBS = [
  { id: "fcb", name: "FC Bayern München", short: "Bayern", color: "#dc052d" },
  { id: "bvb", name: "Borussia Dortmund", short: "Dortmund", color: "#fde100" },
  { id: "rbl", name: "RB Leipzig", short: "Leipzig", color: "#dd0741" },
  { id: "vfb", name: "VfB Stuttgart", short: "Stuttgart", color: "#e32219" },
  { id: "tsg", name: "TSG Hoffenheim", short: "Hoffenheim", color: "#1961b5" },
  { id: "b04", name: "Bayer 04 Leverkusen", short: "Leverkusen", color: "#e32221" },
  { id: "scf", name: "SC Freiburg", short: "Freiburg", color: "#e2001a" },
  { id: "sge", name: "Eintracht Frankfurt", short: "Frankfurt", color: "#000000" },
  { id: "fca", name: "FC Augsburg", short: "Augsburg", color: "#ba3733" },
  { id: "m05", name: "1. FSV Mainz 05", short: "Mainz", color: "#c3141e" },
  { id: "fcu", name: "1. FC Union Berlin", short: "Union", color: "#eb1923" },
  { id: "bmg", name: "Borussia Mönchengladbach", short: "Gladbach", color: "#000000" },
  { id: "hsv", name: "Hamburger SV", short: "HSV", color: "#0a3f86" },
  { id: "koe", name: "1. FC Köln", short: "Köln", color: "#ed1c24" },
  { id: "svw", name: "SV Werder Bremen", short: "Werder", color: "#1d9053" },
  { id: "s04", name: "FC Schalke 04", short: "Schalke", color: "#004d9d" },
  { id: "sve", name: "SV Elversberg", short: "Elversberg", color: "#000000" },
  { id: "scp", name: "SC Paderborn 07", short: "Paderborn", color: "#005ca9" },
];

// Fiktive Kneipen. clubId = Fankneipe dieses Vereins, null = keine Fankneipe.
// image: Foto in img/ (siehe img/CREDITS.md).
const PUBS = [
  {
    id: "flutlicht",
    name: "Flutlicht",
    district: "Friedrichshain, nahe Boxhagener Platz",
    lat: 52.5106, lng: 13.4590,
    image: "img/pub-flutlicht.jpg",
    clubId: null,
    drinks: [
      { name: "Pils 0,5 l", price: 4.8 },
      { name: "Radler 0,5 l", price: 4.8 },
      { name: "Spezi 0,4 l", price: 3.5 },
    ],
    food: [
      { name: "Currywurst mit Pommes", price: 7.5 },
      { name: "Nachos mit Käse", price: 6.0 },
    ],
  },
  {
    id: "halbzeit",
    name: "Halbzeit",
    district: "Kreuzberg, Wrangelkiez",
    lat: 52.5005, lng: 13.4380,
    image: "img/pub-halbzeit.jpg",
    clubId: "s04",
    drinks: [
      { name: "Pils 0,5 l", price: 4.5 },
      { name: "Weizen 0,5 l", price: 5.0 },
      { name: "Cola 0,4 l", price: 3.5 },
    ],
    food: [
      { name: "Frikadelle mit Brötchen", price: 4.5 },
      { name: "Pommes rot-weiß", price: 4.0 },
    ],
  },
  {
    id: "eckfahne",
    name: "Eckfahne",
    district: "Neukölln, Weserstraße",
    lat: 52.4870, lng: 13.4320,
    image: "img/pub-eckfahne.jpg",
    clubId: null,
    drinks: [
      { name: "Pils 0,5 l", price: 4.2 },
      { name: "Craft IPA 0,4 l", price: 5.5 },
      { name: "Mate 0,5 l", price: 3.8 },
    ],
    food: [
      { name: "Flammkuchen", price: 8.5 },
      { name: "Vegane Currywurst", price: 7.0 },
    ],
  },
  {
    id: "kiezkick",
    name: "Kiezkick",
    district: "Prenzlauer Berg, Helmholtzplatz",
    lat: 52.5435, lng: 13.4180,
    image: "img/pub-kiezkick.jpg",
    clubId: "svw",
    drinks: [
      { name: "Pils 0,5 l", price: 5.0 },
      { name: "Alster 0,5 l", price: 5.0 },
      { name: "Apfelschorle 0,4 l", price: 3.8 },
    ],
    food: [
      { name: "Fischbrötchen", price: 5.5 },
      { name: "Kartoffelsalat mit Würstchen", price: 7.0 },
    ],
  },
  {
    id: "elfmeterpunkt",
    name: "Elfmeterpunkt",
    district: "Mitte, Rosenthaler Platz",
    lat: 52.5297, lng: 13.4015,
    image: "img/pub-elfmeterpunkt.jpg",
    clubId: "fcb",
    drinks: [
      { name: "Helles 0,5 l", price: 5.2 },
      { name: "Weißbier 0,5 l", price: 5.5 },
      { name: "Spezi 0,4 l", price: 3.8 },
    ],
    food: [
      { name: "Weißwurst mit Brezel", price: 8.0 },
      { name: "Obatzda mit Brot", price: 7.5 },
    ],
  },
  {
    id: "gelbewand",
    name: "Die Gelbe Wand",
    district: "Schöneberg, Akazienkiez",
    lat: 52.4890, lng: 13.3540,
    image: "img/pub-gelbewand.jpg",
    clubId: "bvb",
    drinks: [
      { name: "Pils 0,5 l", price: 4.6 },
      { name: "Export 0,5 l", price: 4.8 },
      { name: "Cola 0,4 l", price: 3.5 },
    ],
    food: [
      { name: "Currywurst", price: 5.5 },
      { name: "Schnitzel mit Pommes", price: 12.5 },
    ],
  },
  {
    id: "steilpass",
    name: "Steilpass",
    district: "Wedding, Leopoldplatz",
    lat: 52.5465, lng: 13.3590,
    image: "img/pub-steilpass.jpg",
    clubId: "hsv",
    drinks: [
      { name: "Pils 0,5 l", price: 4.0 },
      { name: "Alster 0,5 l", price: 4.0 },
      { name: "Fassbrause 0,5 l", price: 3.5 },
    ],
    food: [
      { name: "Labskaus", price: 9.5 },
      { name: "Bockwurst mit Brot", price: 4.0 },
    ],
  },
  {
    id: "doppelpass",
    name: "Doppelpass",
    district: "Charlottenburg, Savignyplatz",
    lat: 52.5055, lng: 13.3220,
    image: "img/pub-doppelpass.jpg",
    clubId: null,
    drinks: [
      { name: "Pils 0,4 l", price: 5.2 },
      { name: "Weizen 0,5 l", price: 5.8 },
      { name: "Alkoholfreies Bier 0,33 l", price: 4.0 },
    ],
    food: [
      { name: "Burger mit Pommes", price: 13.5 },
      { name: "Chicken Wings", price: 9.0 },
    ],
  },
  {
    id: "eiserneecke",
    name: "Eiserne Ecke",
    district: "Köpenick, Altstadt",
    lat: 52.4455, lng: 13.5750,
    image: "img/pub-eiserneecke.jpg",
    clubId: "fcu",
    drinks: [
      { name: "Pils 0,5 l", price: 4.0 },
      { name: "Schwarzbier 0,5 l", price: 4.5 },
      { name: "Fassbrause 0,5 l", price: 3.5 },
    ],
    food: [
      { name: "Bulette mit Senf", price: 3.5 },
      { name: "Soljanka", price: 5.5 },
    ],
  },
  {
    id: "nachspielzeit",
    name: "Nachspielzeit",
    district: "Moabit, Arminiusmarkthalle",
    lat: 52.5290, lng: 13.3405,
    image: "img/pub-nachspielzeit.jpg",
    clubId: "koe",
    drinks: [
      { name: "Kölsch 0,2 l", price: 2.5 },
      { name: "Pils 0,5 l", price: 4.5 },
      { name: "Cola 0,4 l", price: 3.5 },
    ],
    food: [
      { name: "Halver Hahn", price: 6.0 },
      { name: "Frikadelle mit Senf", price: 4.0 },
    ],
  },
];

// Beispiel-Spiele (Bundesliga). kickoff = Anstoß.
const MATCHES = [
  { id: "m1", homeId: "fcu", awayId: "fcb", kickoff: daysFromNow(2, "15:30") },
  { id: "m2", homeId: "bvb", awayId: "s04", kickoff: daysFromNow(2, "18:30") },
  { id: "m3", homeId: "hsv", awayId: "svw", kickoff: daysFromNow(3, "17:30") },
  { id: "m4", homeId: "koe", awayId: "b04", kickoff: daysFromNow(3, "15:30") },
  { id: "m5", homeId: "rbl", awayId: "vfb", kickoff: daysFromNow(4, "20:30") },
  { id: "m6", homeId: "sge", awayId: "bmg", kickoff: daysFromNow(5, "15:30") },
  { id: "m7", homeId: "sve", awayId: "scp", kickoff: daysFromNow(5, "15:30") },
  { id: "m8", homeId: "m05", awayId: "scf", kickoff: daysFromNow(6, "17:30") },
];

// Vorhandene Treffen. meetTime = Treffpunkt-Uhrzeit (vor dem Anstoß).
// participants = Anzahl bereits Angemeldeter (ohne dich).
const MEETUPS = [
  {
    id: "t1", matchId: "m1", pubId: "eiserneecke", meetTime: daysFromNow(2, "14:45"),
    host: "Jonas", participants: 12,
    note: "Neu in Köpenick und suche Leute für die Alte Försterei-Stimmung am Tresen.",
  },
  {
    id: "t2", matchId: "m1", pubId: "elfmeterpunkt", meetTime: daysFromNow(2, "15:00"),
    host: "Sophie", participants: 4,
    note: "Bayern-Fans in Mitte, wer schaut mit?",
  },
  {
    id: "t3", matchId: "m2", pubId: "halbzeit", meetTime: daysFromNow(2, "17:45"),
    host: "Lea", participants: 6,
    note: "Revierderby! Erst seit einem Monat in Berlin, freue mich auf Schalker.",
  },
  {
    id: "t4", matchId: "m3", pubId: "steilpass", meetTime: daysFromNow(3, "16:45"),
    host: "Mats", participants: 9,
    note: "Nordderby gucken, Werder-Fans ausdrücklich willkommen.",
  },
  {
    id: "t5", matchId: "m4", pubId: "nachspielzeit", meetTime: daysFromNow(3, "14:45"),
    host: "Deniz", participants: 7,
    note: "Kölsch und Effzeh. Kommt einfach vorbei.",
  },
  {
    id: "t6", matchId: "m6", pubId: "flutlicht", meetTime: daysFromNow(5, "15:00"),
    host: "Paula", participants: 3,
    note: "Neutral, einfach Lust auf Fußball und neue Leute.",
  },
];

// ---------- Nachschlage-Funktionen ----------

function findClub(clubId) {
  return CLUBS.find((club) => club.id === clubId);
}

function findPub(pubId) {
  return PUBS.find((pub) => pub.id === pubId);
}

function findMatch(matchId) {
  return MATCHES.find((match) => match.id === matchId);
}

// Alle Treffen in einer Kneipe, nach Uhrzeit sortiert
function meetupsAtPub(pubId) {
  return MEETUPS
    .filter((meetup) => meetup.pubId === pubId)
    .sort((a, b) => new Date(a.meetTime) - new Date(b.meetTime));
}
