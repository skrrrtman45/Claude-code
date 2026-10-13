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

  // Karte neu ausmessen, wenn sie wieder sichtbar wird
  if (viewId === "view-map") refreshMap();
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => showView(btn.dataset.view));
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
            <span class="muted">${formatDay(meetup.meetTime)} · ${formatTime(meetup.meetTime)} · ${participantCount(meetup)} dabei</span>
          </div>
          ${compactJoinButtonHtml(meetup)}
        </li>`;
    })
    .join("");
}

// Welche Kneipe gerade im Sheet offen ist (null = keine)
let openPubId = null;

function openPubDetail(pubId, keepScroll = false) {
  openPubId = pubId;
  const pub = findPub(pubId);
  const club = pub.clubId ? findClub(pub.clubId) : null;

  // Fankneipen-Badge mit Punkt in Vereinsfarbe
  const fanBadge = club
    ? `<span class="fan-badge"><i style="background:${club.color}"></i>Fankneipe ${escapeHtml(club.name)}</span>`
    : "";

  sheetContent.innerHTML = `
    <div class="pub-photo">
      <img src="${pub.image}" alt="" onerror="this.remove()">
    </div>
    <h2 class="pub-name">${escapeHtml(pub.name)}</h2>
    <p class="muted">${escapeHtml(pub.district)}</p>
    ${fanBadge}

    <h3>Treffen hier</h3>
    <ul class="plain-list">${pubMeetupsHtml(pub)}</ul>
    <button class="secondary-btn" data-create-at="${pub.id}">Treffen hier erstellen</button>

    <h3>Getränke</h3>
    <ul class="price-list">${priceListHtml(pub.drinks)}</ul>

    <h3>Essen</h3>
    <ul class="price-list">${priceListHtml(pub.food)}</ul>
  `;

  if (!keepScroll) sheetContent.scrollTop = 0;
  sheet.classList.add("open");
  sheetBackdrop.classList.add("open");
}

function closePubDetail() {
  openPubId = null;
  sheet.classList.remove("open");
  sheetBackdrop.classList.remove("open");
}

document.getElementById("sheet-close").addEventListener("click", closePubDetail);
sheetBackdrop.addEventListener("click", closePubDetail);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePubDetail();
});

// ---------- Beitreten ----------

const CHECK_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;

// Großer Knopf für die Karten in der Treffen-Liste
function joinButtonHtml(meetup) {
  if (!isJoined(meetup.id)) {
    return `<button class="join-btn" data-join="${meetup.id}">Beitreten</button>`;
  }
  return `
    <div class="joined-row">
      <span class="joined-label">${CHECK_ICON}Du bist dabei</span>
      <button class="leave-btn" data-join="${meetup.id}">Austreten</button>
    </div>`;
}

// Kleiner Umschalt-Knopf für die Zeilen im Kneipen-Detail
function compactJoinButtonHtml(meetup) {
  const joined = isJoined(meetup.id);
  return `<button class="join-btn-small${joined ? " joined" : ""}" data-join="${meetup.id}"
            aria-pressed="${joined}">${joined ? CHECK_ICON + "Dabei" : "Beitreten"}</button>`;
}

// Ein Tipp auf irgendeinen Beitreten-/Austreten-Knopf, egal in welcher Ansicht
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-join]");
  if (!button) return;
  toggleJoin(button.dataset.join);
  renderMeetupList();
  if (openPubId) openPubDetail(openPubId, true);
});

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
  const clubs = CLUBS.filter((club) => clubIds.has(club.id));

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
        <span class="count-pill">${participantCount(meetup)} dabei</span>
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
  if (event.target.closest("[data-join]")) return;
  const card = event.target.closest(".meetup-card");
  if (card) openPubDetail(card.dataset.pub);
});

renderClubFilter();
renderMeetupList();

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
  });

  // Formular leeren, alles neu zeichnen, zur Liste wechseln
  createForm.reset();
  timeHint.textContent = "";
  selectedClubId = null;
  renderClubFilter();
  renderMeetupList();
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
  showView("view-create");
});

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

fillCreateForm();
