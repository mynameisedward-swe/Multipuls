/* Multipuls v3 — install offline support without reloading an active game. */
(function () {
  "use strict";
  if (!("serviceWorker" in navigator) || !/^https?:$/.test(window.location.protocol)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js", {scope: "./", updateViaCache: "none"})
      .then(registration => registration.update())
      .catch(() => { /* Offline installation is optional; the game still runs. */ });
  });
})();
