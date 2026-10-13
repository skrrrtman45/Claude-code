// Ansichtswechsel über die untere Navigationsleiste.
// Jede Ansicht ist ein <section class="view"> mit eigener id.
// Ein Button mit data-view="..." zeigt die passende Ansicht an.

const navButtons = document.querySelectorAll(".nav-btn");
const views = document.querySelectorAll(".view");
const viewTitle = document.getElementById("view-title");

function showView(viewId) {
  // Alle Ansichten ausblenden, nur die gewünschte einblenden
  views.forEach((view) => {
    view.hidden = view.id !== viewId;
  });

  // Aktiven Button in der Navigation markieren
  navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewId);
  });

  // Titel in der Kopfzeile anpassen
  const activeView = document.getElementById(viewId);
  viewTitle.textContent = activeView.dataset.title;

  // Jede Ansicht beginnt oben
  document.querySelector(".app-main").scrollTop = 0;

  // Karte neu ausmessen, wenn sie wieder sichtbar wird
  if (viewId === "view-map") refreshMap();
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () =>
    btn.dataset.view === "view-create" ? openCreateView() : showView(btn.dataset.view)
  );
});

// Start: Karte aufbauen
initMap();

// ---------- Formatierung ----------

// 4.5 -> "4,50 €"
function formatPrice(value) {
  return value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

// ISO-Datum -> "Sa., 17. Okt."
function formatDay(iso) {
  return new Date(iso).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" });
}

// ISO-Datum -> "15:30"
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

// "Union – Bayern"
function matchLabel(match) {
  return `${findClub(match.homeId).short} – ${findClub(match.awayId).short}`;
}

// Text sicher in HTML einsetzen (wichtig, sobald Nutzer eigene Texte eingeben)
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ---------- Kneipen-Detail (Bottom-Sheet) ----------

const sheet = document.getElementById("pub-sheet");
const sheetBackdrop = document.getElementById("sheet-backdrop");
const sheetContent = document.getElementById("pub-sheet-content");

// Eine Preisliste (Getränke oder Essen) als HTML
function priceListHtml(items) {
  return items
    .map((item) => `<li><span>${escapeHtml(item.name)}</span><span>${formatPrice(item.price)}</span></li>`)
    .join("");
}

// Günstigster Preis einer Liste
function cheapest(items) {
  return Math.min(...items.map((item) => item.price));
}

// Sender und Ligen als kleine Chips, z.B. "Sky", "DAZN", "1. Liga", "2. Liga"
const TV_NAMES = { sky: "Sky", dazn: "DAZN" };

function featuresHtml(pub) {
  const tv = pub.tv.map((id) => `<span class="feature">${TV_NAMES[id]}</span>`);
  const leagues = pub.leagues.map((n) => `<span class="feature">${n}. Bundesliga</span>`);
  return `<div class="features">${tv.join("")}${leagues.join("")}</div>`;
}

// Liste der Treffen in dieser Kneipe als HTML
function pubMeetupsHtml(pub) {
  const meetups = meetupsAtPub(pub.id);
  if (meetups.length === 0) {
    return `<p class="muted">Noch keine Treffen geplant.</p>`;
  }
  return meetups
    .map((meetup) => {
      const match = findMatch(meetup.matchId);
      return `
        <li class="meetup-row">
          <div>
            <strong>${matchLabel(match)}</strong>
            <span class="muted">${formatDay(meetup.meetTime)} · ${formatTime(meetup.meetTime)} · ${spotsText(meetup)}</span>
          </div>
          ${compactJoinButtonHtml(meetup)}
        </li>`;
    })
    .join("");
}

// Welche Kneipe gerade im Sheet offen ist (null = keine)
let openPubId = null;

function openPubDetail(pubId, keepScroll = false) {
  // Beim ersten Öffnen einen Verlaufseintrag anlegen,
  // damit die Zurück-Taste/-Geste des Handys das Sheet schließt statt die Seite zu verlassen
  if (openPubId === null) history.pushState({ sheet: true }, "");
  openPubId = pubId;
  const pub = findPub(pubId);
  const club = pub.clubId ? findClub(pub.clubId) : null;

  // Fankneipen-Badge mit Punkt in Vereinsfarbe
  const fanBadge = club
    ? `<span class="fan-badge"><i style="background:${club.color}"></i>Fankneipe ${escapeHtml(club.name)}</span>`
    : "";

  sheetContent.innerHTML = `
    <div class="pub-photo">
      ${pub.image ? `<img src="${pub.image}" alt="" onerror="this.remove()">` : ""}
    </div>
    <h2 class="pub-name">${escapeHtml(pub.name)}</h2>
    <p class="muted">${escapeHtml(pub.district)}</p>
    ${fanBadge}
    ${featuresHtml(pub)}

    <h3>Treffen hier</h3>
    <ul class="plain-list">${pubMeetupsHtml(pub)}</ul>
    <button class="secondary-btn" data-create-at="${pub.id}">Treffen hier erstellen</button>

    <!-- Preise eingeklappt: wichtig, aber nicht im Vordergrund -->
    <details class="menu">
      <summary>
        <span>Getränke &amp; Essen</span>
        <span class="muted">Getränke ab ${formatPrice(cheapest(pub.drinks))}</span>
      </summary>
      <p class="menu-heading">Getränke</p>
      <ul class="price-list">${priceListHtml(pub.drinks)}</ul>
      <p class="menu-heading">Essen</p>
      <ul class="price-list">${priceListHtml(pub.food)}</ul>
    </details>
  `;

  if (!keepScroll) sheetContent.scrollTop = 0;
  sheet.classList.add("open");
  sheetBackdrop.classList.add("open");
}

// Sheet sichtbar schließen (ohne Verlauf anzufassen)
function hidePubDetail() {
  openPubId = null;
  sheet.classList.remove("open");
  sheetBackdrop.classList.remove("open");
}

// Schließen per X, Schleier oder Wischen: über den Verlauf zurückgehen,
// das löst "popstate" aus und blendet das Sheet aus
function closePubDetail() {
  if (openPubId === null) return;
  if (history.state && history.state.sheet) {
    history.back();
  } else {
    hidePubDetail();
  }
}

// Zurück-Taste/-Geste des Handys
window.addEventListener("popstate", () => {
  if (openPubId !== null) hidePubDetail();
});

// Nach unten wischen schließt das Sheet (nur wenn ganz nach oben gescrollt)
let swipeStartY = null;
sheet.addEventListener("touchstart", (event) => {
  swipeStartY = sheetContent.scrollTop === 0 ? event.touches[0].clientY : null;
}, { passive: true });
sheet.addEventListener("touchend", (event) => {
  if (swipeStartY === null) return;
  const distance = event.changedTouches[0].clientY - swipeStartY;
  if (distance > 80) closePubDetail();
  swipeStartY = null;
});

document.getElementById("sheet-close").addEventListener("click", closePubDetail);
sheetBackdrop.addEventListener("click", closePubDetail);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePubDetail();
});

// ---------- Zusagen, Absagen, Warteliste (No-Show-Schutz) ----------

const CHECK_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;

// "6 von 8 dabei" bzw. "Voll"
function spotsText(meetup) {
  return isFull(meetup) ? "Voll" : `${participantCount(meetup)} von ${meetup.spots} dabei`;
}

// Kurzer Hinweis unter dem Button
function spotsHint(meetup) {
  if (isJoined(meetup.id)) {
    return canCancel(meetup)
      ? `Absagen bis ${formatDay(cancelDeadline(meetup).toISOString())}, ${formatTime(cancelDeadline(meetup).toISOString())}`
      : "Absage nicht mehr möglich – bitte im Chat Bescheid geben";
  }
  if (isOnWaitlist(meetup.id)) return "Wird ein Platz frei, rückst du nach.";
  if (spotsLeft(meetup) === 1) return "Nur noch 1 Platz frei";
  return "";
}

// Buttons für die Karten in der Treffen-Liste.
// data-action sagt dem zentralen Klick-Handler (unten), was zu tun ist.
function joinButtonHtml(meetup) {
  const id = meetup.id;
  const hint = spotsHint(meetup);
  const hintHtml = hint ? `<p class="join-hint">${hint}</p>` : "";

  if (isJoined(id)) {
    return `
      <div class="joined-row">
        <span class="joined-label">${CHECK_ICON}Du bist dabei</span>
        <span class="joined-actions">
          ${canCancel(meetup) ? `<button class="leave-btn" data-action="cancel" data-id="${id}">Absagen</button>` : ""}
          <button class="chat-btn" data-action="chat" data-id="${id}">Chat</button>
        </span>
      </div>${hintHtml}`;
  }
  if (isOnWaitlist(id)) {
    return `
      <div class="joined-row">
        <span class="waitlist-label">Auf der Warteliste</span>
        <button class="leave-btn" data-action="waitlist" data-id="${id}">Verlassen</button>
      </div>${hintHtml}`;
  }
  if (isFull(meetup)) {
    return `<button class="join-btn join-btn-secondary" data-action="waitlist" data-id="${id}">Auf die Warteliste</button>`;
  }
  return `<button class="join-btn" data-action="join" data-id="${id}">Zusagen</button>${hintHtml}`;
}

// Kompakter Button für die Zeilen im Kneipen-Detail
function compactJoinButtonHtml(meetup) {
  const id = meetup.id;
  if (isJoined(id)) {
    return `<button class="join-btn-small joined" data-action="${canCancel(meetup) ? "cancel" : "locked"}" data-id="${id}">${CHECK_ICON}Dabei</button>`;
  }
  if (isOnWaitlist(id)) {
    return `<button class="join-btn-small joined" data-action="waitlist" data-id="${id}">Warteliste</button>`;
  }
  if (isFull(meetup)) {
    return `<button class="join-btn-small" data-action="waitlist" data-id="${id}">Warteliste</button>`;
  }
  return `<button class="join-btn-small" data-action="join" data-id="${id}">Zusagen</button>`;
}

// Nach jeder Änderung: alles neu zeichnen, was Teilnehmer zeigt
function refreshMeetupViews() {
  renderReminder();
  renderMeetupList();
  if (openPubId) openPubDetail(openPubId, true);
}

// ----- Bestätigungsdialog für die verbindliche Zusage -----

const confirmDialog = document.getElementById("confirm-dialog");
const confirmText = document.getElementById("confirm-text");
let pendingJoinId = null;

function askToJoin(meetup) {
  pendingJoinId = meetup.id;
  const match = findMatch(meetup.matchId);
  const pub = findPub(meetup.pubId);
  const deadline = cancelDeadline(meetup).toISOString();
  const rule = canCancel(meetup)
    ? `Absagen kannst du bis <strong>${formatDay(deadline)}, ${formatTime(deadline)} Uhr</strong> (${CANCEL_DEADLINE_HOURS} Std. vorher). Danach plant die Gruppe fest mit dir.`
    : `Das Treffen beginnt in weniger als ${CANCEL_DEADLINE_HOURS} Stunden. <strong>Eine Absage ist danach nicht mehr möglich.</strong>`;
  confirmText.innerHTML = `
    <strong>${matchLabel(match)}</strong> · ${escapeHtml(pub.name)}<br>
    ${formatDay(meetup.meetTime)}, ${formatTime(meetup.meetTime)} Uhr
    <span class="dialog-rule">${rule}</span>`;
  confirmDialog.showModal();
}

document.getElementById("confirm-yes").addEventListener("click", () => {
  if (pendingJoinId && !isJoined(pendingJoinId)) toggleJoin(pendingJoinId);
  confirmDialog.close();
  refreshMeetupViews();
  showToast("Zugesagt – die Gruppe zählt auf dich");
});

document.getElementById("confirm-no").addEventListener("click", () => confirmDialog.close());

// ----- Zentraler Klick-Handler für alle Zusage-Buttons -----

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const meetup = MEETUPS.find((m) => m.id === button.dataset.id);
  if (!meetup) return;

  switch (button.dataset.action) {
    case "join":
      askToJoin(meetup);
      return; // neu zeichnen erst nach Bestätigung
    case "cancel":
      toggleJoin(meetup.id);
      showToast("Abgesagt");
      break;
    case "locked":
      showToast("Absage nicht mehr möglich – bitte im Chat Bescheid geben");
      return;
    case "chat":
      openChat(meetup);
      return;
    case "waitlist":
      toggleWaitlist(meetup.id);
      showToast(isOnWaitlist(meetup.id) ? "Du stehst auf der Warteliste" : "Warteliste verlassen");
      break;
  }
  refreshMeetupViews();
});

// ----- Erinnerung: deine Treffen in den nächsten 24 Stunden -----

const reminder = document.getElementById("reminder");

function renderReminder() {
  const now = Date.now();
  const soon = MEETUPS.filter((m) => {
    const t = new Date(m.meetTime).getTime();
    return isJoined(m.id) && t > now && t - now < 24 * 60 * 60 * 1000;
  }).sort((a, b) => new Date(a.meetTime) - new Date(b.meetTime));

  if (soon.length === 0) {
    reminder.hidden = true;
    return;
  }
  const next = soon[0];
  reminder.hidden = false;
  reminder.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4"/></svg>
    <span><strong>Erinnerung:</strong> ${matchLabel(findMatch(next.matchId))} um ${formatTime(next.meetTime)} Uhr
    im ${escapeHtml(findPub(next.pubId).name)}</span>`;
}

// ---------- Treffen-Liste mit Vereinsfilter ----------

const clubFilter = document.getElementById("club-filter");
const meetupList = document.getElementById("meetup-list");

// Gewählter Verein im Filter; null = alle
let selectedClubId = null;

// Alle Treffen, nach Uhrzeit sortiert
function allMeetupsSorted() {
  return [...MEETUPS].sort((a, b) => new Date(a.meetTime) - new Date(b.meetTime));
}

// Spielt der Verein in dem Spiel dieses Treffens?
function meetupInvolvesClub(meetup, clubId) {
  const match = findMatch(meetup.matchId);
  return match.homeId === clubId || match.awayId === clubId;
}

// Filter-Chips: "Alle" plus nur die Vereine, für die es Treffen gibt
function renderClubFilter() {
  const clubIds = new Set();
  MEETUPS.forEach((meetup) => {
    const match = findMatch(meetup.matchId);
    clubIds.add(match.homeId);
    clubIds.add(match.awayId);
  });
  // Lieblingsverein aus dem Profil steht vorne
  const clubs = CLUBS.filter((club) => clubIds.has(club.id)).sort(
    (a, b) => (b.id === profile.clubId) - (a.id === profile.clubId)
  );

  const chip = (id, label) =>
    `<button class="chip${selectedClubId === id ? " active" : ""}" data-club="${id ?? ""}">${label}</button>`;

  clubFilter.innerHTML = chip(null, "Alle") + clubs.map((club) => chip(club.id, club.short)).join("");
}

// Ein Treffen als Karte
function meetupCardHtml(meetup) {
  const match = findMatch(meetup.matchId);
  const pub = findPub(meetup.pubId);
  const home = findClub(match.homeId);
  const away = findClub(match.awayId);

  return `
    <li class="meetup-card" data-pub="${pub.id}">
      <div class="meetup-top">
        <span class="meetup-when">${formatDay(meetup.meetTime)} · ${formatTime(meetup.meetTime)}</span>
        <span class="count-pill${isFull(meetup) ? " full" : ""}">${spotsText(meetup)}</span>
      </div>
      <p class="meetup-match">
        <i class="club-dot" style="background:${home.color}"></i>${home.short}
        <span class="muted-inline">–</span>
        <i class="club-dot" style="background:${away.color}"></i>${away.short}
      </p>
      <p class="muted">${escapeHtml(pub.name)} · ${escapeHtml(pub.district.split(",")[0])}</p>
      <p class="meetup-note">${
        meetup.note ? `„${escapeHtml(meetup.note)}“ – ` : "Erstellt von "
      }${escapeHtml(meetup.host)}</p>
      ${joinButtonHtml(meetup)}
    </li>`;
}

function renderMeetupList() {
  const meetups = allMeetupsSorted().filter(
    (meetup) => !selectedClubId || meetupInvolvesClub(meetup, selectedClubId)
  );

  meetupList.innerHTML = meetups.length
    ? meetups.map(meetupCardHtml).join("")
    : `<li class="empty-state"><p class="empty-text">Keine Treffen für diesen Verein.</p></li>`;
}

// Chip antippen: Filter setzen und neu zeichnen
clubFilter.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (!chip) return;
  selectedClubId = chip.dataset.club || null;
  renderClubFilter();
  renderMeetupList();
});

// Karte antippen: Detail der Kneipe öffnen (außer der Beitreten-Knopf wurde getippt)
meetupList.addEventListener("click", (event) => {
  if (event.target.closest("[data-action]")) return;
  const card = event.target.closest(".meetup-card");
  if (card) openPubDetail(card.dataset.pub);
});

renderClubFilter();
renderMeetupList();
renderReminder();

// ---------- Treffen erstellen ----------

const createForm = document.getElementById("create-form");
const formError = document.getElementById("form-error");
const timeHint = document.getElementById("time-hint");
const toast = document.getElementById("toast");

// Auswahllisten füllen: Spiele nach Anstoß sortiert, Kneipen alphabetisch
function fillCreateForm() {
  const matches = [...MATCHES].sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
  createForm.match.innerHTML =
    `<option value="">Spiel wählen</option>` +
    matches
      .map((match) => `<option value="${match.id}">${matchLabel(match)} · ${formatDay(match.kickoff)}, ${formatTime(match.kickoff)}</option>`)
      .join("");

  const pubs = [...PUBS].sort((a, b) => a.name.localeCompare(b.name, "de"));
  createForm.pub.innerHTML =
    `<option value="">Kneipe wählen</option>` +
    pubs
      .map((pub) => {
        const club = pub.clubId ? ` (Fankneipe ${findClub(pub.clubId).short})` : "";
        return `<option value="${pub.id}">${escapeHtml(pub.name)} · ${escapeHtml(pub.district.split(",")[0])}${club}</option>`;
      })
      .join("");
}

// Nach Spielauswahl: Uhrzeit 30 Minuten vor Anstoß vorschlagen
createForm.match.addEventListener("change", () => {
  const match = findMatch(createForm.match.value);
  if (!match) {
    timeHint.textContent = "";
    return;
  }
  const suggestion = new Date(new Date(match.kickoff).getTime() - 30 * 60 * 1000);
  createForm.time.value = formatTime(suggestion.toISOString());
  timeHint.textContent = `Anstoß ${formatTime(match.kickoff)} Uhr`;
});

// Prüft die Eingaben. Gibt einen Fehlertext zurück oder "" wenn alles passt.
function validateCreateForm() {
  const match = findMatch(createForm.match.value);
  if (!match) return "Bitte wähle ein Spiel.";
  if (!createForm.pub.value) return "Bitte wähle eine Kneipe.";
  if (!createForm.time.value) return "Bitte gib eine Uhrzeit an.";
  if (meetTimeForMatch(match, createForm.time.value) > match.kickoff) {
    return `Der Treffpunkt sollte vor dem Anstoß (${formatTime(match.kickoff)} Uhr) liegen.`;
  }
  if (!createForm.host.value.trim()) return "Bitte gib deinen Vornamen an.";
  return "";
}

createForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Seite nicht neu laden

  const error = validateCreateForm();
  formError.textContent = error;
  if (error) return;

  createMeetup({
    matchId: createForm.match.value,
    pubId: createForm.pub.value,
    time: createForm.time.value,
    host: createForm.host.value.trim(),
    note: createForm.note.value.trim(),
    spots: Number(createForm.spots.value),
  });

  // Formular leeren, alles neu zeichnen, zur Liste wechseln
  createForm.reset();
  timeHint.textContent = "";
  selectedClubId = null;
  renderClubFilter();
  renderMeetupList();
  renderReminder();
  renderMarkers();
  showView("view-meetups");
  showToast("Treffen erstellt – du bist dabei");
});

// Fehlermeldung verschwindet, sobald man etwas ändert
createForm.addEventListener("input", () => {
  formError.textContent = "";
});

// "Treffen hier erstellen" im Kneipen-Detail: Formular mit dieser Kneipe öffnen
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-create-at]");
  if (!button) return;
  closePubDetail();
  createForm.pub.value = button.dataset.createAt;
  openCreateView();
});

// Formular öffnen; Vorname aus dem Profil übernehmen, falls noch leer
function openCreateView() {
  if (!createForm.host.value) createForm.host.value = profile.name;
  showView("view-create");
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

fillCreateForm();

// ---------- Profil ----------

const profileForm = document.getElementById("profile-form");
const profileBtn = document.getElementById("profile-btn");
const profilePhotoPreview = document.getElementById("profile-photo-preview");

const BERLIN_DISTRICTS = [
  "Charlottenburg-Wilmersdorf", "Friedrichshain-Kreuzberg", "Lichtenberg",
  "Marzahn-Hellersdorf", "Mitte", "Neukölln", "Pankow", "Reinickendorf",
  "Spandau", "Steglitz-Zehlendorf", "Tempelhof-Schöneberg", "Treptow-Köpenick",
];

const PERSON_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`;

// Foto, sonst Initiale, sonst Personen-Symbol
function avatarHtml(photo, name) {
  if (photo) return `<img src="${photo}" alt="">`;
  if (name) return `<span>${escapeHtml(name.trim()[0].toUpperCase())}</span>`;
  return PERSON_ICON;
}

function renderProfileButton() {
  profileBtn.innerHTML = avatarHtml(profile.photo, profile.name);
}

// Foto, das gerade im Formular gewählt ist (wird erst beim Speichern übernommen)
let pendingPhoto = "";

function fillProfileForm() {
  profileForm.club.innerHTML =
    `<option value="">Kein Lieblingsverein</option>` +
    CLUBS.map((club) => `<option value="${club.id}">${escapeHtml(club.name)}</option>`).join("");
  profileForm.district.innerHTML =
    `<option value="">Bezirk wählen</option>` +
    BERLIN_DISTRICTS.map((d) => `<option>${d}</option>`).join("");

  profileForm.name.value = profile.name;
  profileForm.club.value = profile.clubId;
  profileForm.district.value = profile.district;
  profileForm.querySelectorAll("[name=lang]").forEach((box) => {
    box.checked = profile.languages.includes(box.value);
  });
  pendingPhoto = profile.photo;
  profilePhotoPreview.innerHTML = avatarHtml(pendingPhoto, profile.name);
}

// Foto verkleinern (quadratisch, 160 px), damit es in den Browser-Speicher passt
profileForm.photo.addEventListener("change", () => {
  const file = profileForm.photo.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    const size = 160;
    const side = Math.min(img.width, img.height);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    canvas.getContext("2d").drawImage(
      img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size
    );
    pendingPhoto = canvas.toDataURL("image/jpeg", 0.8);
    profilePhotoPreview.innerHTML = avatarHtml(pendingPhoto, "");
    URL.revokeObjectURL(img.src);
  };
  img.src = URL.createObjectURL(file);
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveProfile({
    name: profileForm.name.value.trim(),
    photo: pendingPhoto,
    clubId: profileForm.club.value,
    district: profileForm.district.value,
    languages: [...profileForm.querySelectorAll("[name=lang]:checked")].map((box) => box.value),
  });
  renderProfileButton();
  renderClubFilter();
  showToast("Profil gespeichert");
});

profileBtn.addEventListener("click", () => {
  fillProfileForm();
  showView("view-profile");
});

renderProfileButton();

// ---------- Simulierter Chat ----------
// Demo: vorbereitete Nachrichten der Gruppe + deine eigenen (nur auf diesem Gerät).
// Auf deine erste Nachricht antwortet die Gruppe einmal automatisch.

const chat = document.getElementById("chat");
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
let chatMeetup = null;

const FAKE_NAMES = ["Aylin", "Tom", "Mira", "Ben", "Clara", "Emre", "Lukas", "Jule"];
const FAKE_LINES = [
  "Bin dabei! Wer ist noch neu in Berlin?",
  "Ich komme direkt von der Arbeit, kann 10 Minuten später werden.",
  "Hab einen Tisch vorne beim großen Screen angefragt.",
  "Erkennungszeichen: Schal um den Hals.",
];
const FAKE_REPLIES = [
  "Super, bis später!",
  "Top, freu mich!",
  "Sehr gut, ich halte dir einen Platz frei.",
];

// Feste Beispiel-Nachrichten je Treffen (immer gleich für dasselbe Treffen)
function seedMessages(meetup) {
  const n = [...meetup.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const messages = [];
  if (meetup.note) messages.push({ from: meetup.host, text: meetup.note });
  if (!meetup.id.startsWith("u")) {
    messages.push({ from: FAKE_NAMES[n % FAKE_NAMES.length], text: FAKE_LINES[n % FAKE_LINES.length] });
    messages.push({ from: FAKE_NAMES[(n + 3) % FAKE_NAMES.length], text: FAKE_LINES[(n + 1) % FAKE_LINES.length] });
  }
  return messages;
}

function renderChat() {
  const own = loadChat(chatMeetup.id);
  const all = [...seedMessages(chatMeetup), ...own];
  chatMessages.innerHTML =
    `<p class="chat-system">Demo-Chat: Deine Nachrichten bleiben auf diesem Gerät.</p>` +
    all
      .map((m) =>
        m.from === "me"
          ? `<div class="bubble me">${escapeHtml(m.text)}</div>`
          : `<div class="bubble"><span class="bubble-name">${escapeHtml(m.from)}</span>${escapeHtml(m.text)}</div>`
      )
      .join("");
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function openChat(meetup) {
  chatMeetup = meetup;
  const match = findMatch(meetup.matchId);
  document.getElementById("chat-title").textContent = matchLabel(match);
  document.getElementById("chat-subtitle").textContent =
    `${findPub(meetup.pubId).name} · ${formatDay(meetup.meetTime)}, ${formatTime(meetup.meetTime)}`;
  renderChat();
  history.pushState({ chat: true }, "");
  chat.classList.add("open");
}

function hideChat() {
  chatMeetup = null;
  chat.classList.remove("open");
}

document.getElementById("chat-back").addEventListener("click", () => history.back());
window.addEventListener("popstate", () => {
  if (chatMeetup) hideChat();
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = chatForm.text.value.trim();
  if (!text) return;
  const meetup = chatMeetup;
  const messages = loadChat(meetup.id);
  const isFirst = !messages.some((m) => m.from === "me");
  messages.push({ from: "me", text });
  saveChat(meetup.id, messages);
  chatForm.text.value = "";
  renderChat();

  // Einmalige automatische Antwort, damit der Chat lebendig wirkt (Demo)
  if (isFirst) {
    setTimeout(() => {
      const updated = loadChat(meetup.id);
      updated.push({ from: meetup.host, text: FAKE_REPLIES[updated.length % FAKE_REPLIES.length] });
      saveChat(meetup.id, updated);
      if (chatMeetup && chatMeetup.id === meetup.id) renderChat();
    }, 1500);
  }
});
