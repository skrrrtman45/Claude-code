// Karte mit Leaflet: zeigt alle Kneipen als Marker. Antippen öffnet die Detailansicht.
// - Fankneipen haben einen Ring in der Vereinsfarbe.
// - Stehen in einer Kneipe Treffen an, zeigt ein oranges Badge die Anzahl.

const BERLIN_CENTER = [52.515, 13.41];

let map = null;
let markerLayer = null; // Gruppe aller Kneipen-Marker

// Baut das Aussehen eines Markers als HTML (Leaflet "divIcon").
function createPubIcon(pub) {
  const club = pub.clubId ? findClub(pub.clubId) : null;
  const meetupCount = filteredMeetupsAt(pub).length;

  // Ringfarbe: Vereinsfarbe bei Fankneipen, sonst dunkel
  const ringColor = club ? club.color : "var(--color-text)";
  const badge = meetupCount > 0 ? `<span class="pin-badge">${meetupCount}</span>` : "";

  return L.divIcon({
    className: "pub-pin-wrapper",
    html: `
      <div class="pub-pin${club ? " pub-pin-fan" : ""}" style="--ring:${ringColor}">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 5h10v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5zM16 8h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"/>
        </svg>
        ${badge}
      </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

function initMap() {
  map = L.map("map", {
    zoomControl: false,        // Zoomen per Fingergeste reicht, spart Platz
    attributionControl: false, // wird unten oben rechts neu angelegt
    zoomSnap: 0.25,            // feinere Zoomstufen, damit der Ausschnitt besser passt
  }).setView(BERLIN_CENTER, 12);

  // Quellenangabe für OpenStreetMap ist Pflicht. Oben rechts, damit die Navigation sie nicht verdeckt.
  L.control.attribution({ position: "topright", prefix: false }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);

  // OpenStreetMap-Kacheln (kostenlos, ohne Schlüssel). Quellenangabe ist Pflicht.
  // Per CSS (style.css, #map) entsättigt und aufgehellt, damit die Karte ruhig und
  // weniger "realistisch" wirkt und die Marker hervorstechen.
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  renderMarkers();

  // Startausschnitt: alle Kneipen im Umkreis von 10 km um die Mitte.
  // Weiter entfernte (z.B. Köpenick) würden zu weit herauszoomen; die erreicht man durch Verschieben.
  // Abstand oben für die Legende, unten für die schwebende Navigation.
  const innerPubs = PUBS.filter((pub) => map.distance(BERLIN_CENTER, [pub.lat, pub.lng]) < 10000);
  const bounds = L.latLngBounds(innerPubs.map((pub) => [pub.lat, pub.lng]));
  map.fitBounds(bounds, { paddingTopLeft: [24, 60], paddingBottomRight: [24, 110] });
}

// Marker (neu) zeichnen, z.B. nachdem ein Treffen erstellt wurde
function renderMarkers() {
  markerLayer.clearLayers();
  PUBS.filter(pubMatchesFilter).forEach((pub) => {
    const marker = L.marker([pub.lat, pub.lng], { icon: createPubIcon(pub) }).addTo(markerLayer);
    // Antippen öffnet die Detailansicht (openPubDetail steht in js/app.js)
    marker.on("click", () => openPubDetail(pub.id));
  });
}

// Leaflet muss neu messen, wenn die Karte nach dem Ausblenden wieder sichtbar wird.
function refreshMap() {
  if (map) map.invalidateSize();
}

// ---------- Kartenfilter: Zeit, Bezirk, Verein, Sender ----------

const mapFilterForm = document.getElementById("map-filter");
const mapFilterBtn = document.getElementById("map-filter-btn");
const mapFilterCount = document.getElementById("map-filter-count");

// Aktueller Filter (Standard: alles zeigen)
let mapFilter = { time: "all", district: "", club: "", tv: [] };

// Liegt ein Datum im gewählten Zeitraum?
function inTimeRange(iso, range) {
  if (range === "all") return true;
  const date = new Date(iso);
  const today = new Date();
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  if (range === "today") return sameDay(date, today);
  if (range === "tomorrow") {
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    return sameDay(date, tomorrow);
  }
  // Wochenende: kommender Samstag oder Sonntag (innerhalb der nächsten 7 Tage)
  const inWeek = date - today < 7 * 24 * 60 * 60 * 1000;
  return inWeek && (date.getDay() === 6 || date.getDay() === 0);
}

// Treffen einer Kneipe, die zu Zeit und Verein passen
function filteredMeetupsAt(pub) {
  return meetupsAtPub(pub.id).filter(
    (meetup) =>
      inTimeRange(meetup.meetTime, mapFilter.time) &&
      (!mapFilter.club || meetupClubIds(meetup).includes(mapFilter.club))
  );
}

// Soll die Kneipe auf der Karte erscheinen?
function pubMatchesFilter(pub) {
  if (mapFilter.district && pub.district.split(",")[0] !== mapFilter.district) return false;
  if (!mapFilter.tv.every((tv) => pub.tv.includes(tv))) return false;

  // Bei Zeit- oder Vereinsfilter: nur Kneipen mit passenden Treffen
  // (Ausnahme: Fankneipe des gewählten Vereins ohne Zeitfilter)
  if (mapFilter.time !== "all" || mapFilter.club) {
    const fanPub = mapFilter.club && pub.clubId === mapFilter.club && mapFilter.time === "all";
    return fanPub || filteredMeetupsAt(pub).length > 0;
  }
  return true;
}

function activeFilterCount() {
  return (mapFilter.time !== "all") + !!mapFilter.district + !!mapFilter.club + mapFilter.tv.length;
}

// Auswahllisten füllen: Bezirke aus den Kneipen, alle Vereine
function fillMapFilter() {
  const districts = [...new Set(PUBS.map((pub) => pub.district.split(",")[0]))].sort();
  mapFilterForm.district.innerHTML =
    `<option value="">Alle Bezirke</option>` + districts.map((d) => `<option>${d}</option>`).join("");
  mapFilterForm.club.innerHTML =
    `<option value="">Alle Vereine</option>` +
    CLUBS.map((club) => `<option value="${club.id}">${club.name}</option>`).join("");
}

// Formular auslesen und Karte sofort aktualisieren
function applyMapFilter() {
  mapFilter = {
    time: mapFilterForm.time.value,
    district: mapFilterForm.district.value,
    club: mapFilterForm.club.value,
    tv: [...mapFilterForm.querySelectorAll("[name=tv]:checked")].map((box) => box.value),
  };
  renderMarkers();
  const count = activeFilterCount();
  mapFilterCount.hidden = count === 0;
  mapFilterCount.textContent = count;
  mapFilterBtn.classList.toggle("active", count > 0);
  const shown = PUBS.filter(pubMatchesFilter).length;
  document.getElementById("map-filter-done").textContent =
    shown === 1 ? "1 Kneipe zeigen" : `${shown} Kneipen zeigen`;
}

function toggleMapFilter(open) {
  mapFilterForm.hidden = !open;
  mapFilterBtn.setAttribute("aria-expanded", open);
}

mapFilterBtn.addEventListener("click", () => toggleMapFilter(mapFilterForm.hidden));
mapFilterForm.addEventListener("change", applyMapFilter);
mapFilterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  toggleMapFilter(false);
});
document.getElementById("map-filter-reset").addEventListener("click", () => {
  mapFilterForm.reset();
  applyMapFilter();
});

fillMapFilter();
