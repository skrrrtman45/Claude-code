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
            <span class="muted">${formatDay(meetup.meetTime)} · Treffen ${formatTime(meetup.meetTime)}</span>
          </div>
          <span class="count-pill">${meetup.participants} dabei</span>
        </li>`;
    })
    .join("");
}

function openPubDetail(pubId) {
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

    <h3>Getränke</h3>
    <ul class="price-list">${priceListHtml(pub.drinks)}</ul>

    <h3>Essen</h3>
    <ul class="price-list">${priceListHtml(pub.food)}</ul>
  `;

  sheetContent.scrollTop = 0;
  sheet.classList.add("open");
  sheetBackdrop.classList.add("open");
}

function closePubDetail() {
  sheet.classList.remove("open");
  sheetBackdrop.classList.remove("open");
}

document.getElementById("sheet-close").addEventListener("click", closePubDetail);
sheetBackdrop.addEventListener("click", closePubDetail);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePubDetail();
});
