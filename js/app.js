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
