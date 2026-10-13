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
