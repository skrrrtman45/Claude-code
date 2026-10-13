// Karte mit Leaflet: zeigt alle Kneipen als Marker. Antippen öffnet die Detailansicht.
// - Fankneipen haben einen Ring in der Vereinsfarbe.
// - Stehen in einer Kneipe Treffen an, zeigt ein oranges Badge die Anzahl.

const BERLIN_CENTER = [52.515, 13.41];

let map = null;
let markerLayer = null; // Gruppe aller Kneipen-Marker

// Baut das Aussehen eines Markers als HTML (Leaflet "divIcon").
function createPubIcon(pub) {
  const club = pub.clubId ? findClub(pub.clubId) : null;
  const meetupCount = meetupsAtPub(pub.id).length;

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
  PUBS.forEach((pub) => {
    const marker = L.marker([pub.lat, pub.lng], { icon: createPubIcon(pub) }).addTo(markerLayer);
    // Antippen öffnet die Detailansicht (openPubDetail steht in js/app.js)
    marker.on("click", () => openPubDetail(pub.id));
  });
}

// Leaflet muss neu messen, wenn die Karte nach dem Ausblenden wieder sichtbar wird.
function refreshMap() {
  if (map) map.invalidateSize();
}
