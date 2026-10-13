// Speichert, was der Nutzer in der Demo tut, im Browser (localStorage).
// Die Daten bleiben nur in diesem Browser auf diesem Gerät.
// localStorage kann fehlen oder gesperrt sein (z.B. privater Modus) -
// dann funktioniert die Demo trotzdem, merkt sich aber nichts.

const STORAGE_KEY_JOINED = "fantreff.joined";

function loadList(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function saveList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Speichern nicht möglich: ignorieren, die Demo läuft weiter
  }
}

// ---------- Beitritte ----------

let joinedIds = loadList(STORAGE_KEY_JOINED);

function isJoined(meetupId) {
  return joinedIds.includes(meetupId);
}

// Beitreten oder wieder austreten
function toggleJoin(meetupId) {
  if (isJoined(meetupId)) {
    joinedIds = joinedIds.filter((id) => id !== meetupId);
  } else {
    joinedIds.push(meetupId);
  }
  saveList(STORAGE_KEY_JOINED, joinedIds);
}

// Teilnehmerzahl inklusive dir, falls du beigetreten bist
function participantCount(meetup) {
  return meetup.participants + (isJoined(meetup.id) ? 1 : 0);
}

// ---------- Selbst erstellte Treffen ----------
// Gespeichert wird die Uhrzeit als "HH:MM", nicht als festes Datum.
// Grund: Die Beispiel-Spiele liegen immer "in X Tagen" (siehe data.js),
// ihr Datum verschiebt sich also täglich. Das Treffen hängt sich an den Spieltag an.

const STORAGE_KEY_MEETUPS = "fantreff.meetups";

// Uhrzeit "HH:MM" am Tag des Spiels -> ISO-Datum
function meetTimeForMatch(match, time) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(match.kickoff);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

// Gespeichertes Treffen in das Format der Beispieldaten umwandeln
function toMeetup(saved) {
  return { ...saved, meetTime: meetTimeForMatch(findMatch(saved.matchId), saved.time) };
}

let savedMeetups = loadList(STORAGE_KEY_MEETUPS);

// Beim Start: eigene Treffen zu den Beispiel-Treffen hinzufügen.
// Treffen, deren Spiel oder Kneipe es nicht mehr gibt, werden übersprungen.
savedMeetups
  .filter((saved) => findMatch(saved.matchId) && findPub(saved.pubId))
  .forEach((saved) => MEETUPS.push(toMeetup(saved)));

// Neues Treffen anlegen, speichern und direkt beitreten
function createMeetup({ matchId, pubId, time, host, note, spots }) {
  const saved = {
    id: "u" + Date.now(),
    matchId,
    pubId,
    time,
    host,
    note,
    participants: 0, // du selbst zählst über den Beitritt
    spots,
  };
  savedMeetups.push(saved);
  saveList(STORAGE_KEY_MEETUPS, savedMeetups);

  const meetup = toMeetup(saved);
  MEETUPS.push(meetup);
  toggleJoin(meetup.id);
  return meetup;
}

// ---------- Profil ----------

const STORAGE_KEY_PROFILE = "fantreff.profile";

const EMPTY_PROFILE = { name: "", photo: "", clubId: "", district: "", languages: [] };

function loadProfile() {
  try {
    return { ...EMPTY_PROFILE, ...JSON.parse(localStorage.getItem(STORAGE_KEY_PROFILE)) };
  } catch {
    return { ...EMPTY_PROFILE };
  }
}

let profile = loadProfile();

function saveProfile(newProfile) {
  profile = newProfile;
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch {
    // z.B. Speicher voll: ignorieren
  }
}

// ---------- No-Show-Schutz: Plätze, Absage-Frist, Warteliste ----------

// Bis so viele Stunden vor dem Treffpunkt darf man absagen
const CANCEL_DEADLINE_HOURS = 3;

const STORAGE_KEY_WAITLIST = "fantreff.waitlist";
let waitlistIds = loadList(STORAGE_KEY_WAITLIST);

function spotsLeft(meetup) {
  return meetup.spots - participantCount(meetup);
}

function isFull(meetup) {
  return spotsLeft(meetup) <= 0;
}

// Zeitpunkt, bis zu dem eine Absage möglich ist
function cancelDeadline(meetup) {
  return new Date(new Date(meetup.meetTime).getTime() - CANCEL_DEADLINE_HOURS * 60 * 60 * 1000);
}

function canCancel(meetup) {
  return new Date() < cancelDeadline(meetup);
}

function isOnWaitlist(meetupId) {
  return waitlistIds.includes(meetupId);
}

function toggleWaitlist(meetupId) {
  waitlistIds = isOnWaitlist(meetupId)
    ? waitlistIds.filter((id) => id !== meetupId)
    : [...waitlistIds, meetupId];
  saveList(STORAGE_KEY_WAITLIST, waitlistIds);
}
