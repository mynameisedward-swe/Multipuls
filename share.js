/* Multipuls v3 — included only by the standalone web page. */
(function () {
  "use strict";

  function appLink(href) {
    let url;
    try { url = new URL(href); } catch (error) { return null; }
    if (!/^https?:$/.test(url.protocol) || url.username || url.password) return null;
    if (["localhost", "127.0.0.1", "0.0.0.0", "[::1]"].includes(url.hostname)) return null;
    url.search = "";
    url.hash = "";
    if (url.pathname.endsWith("/index.html")) url.pathname = url.pathname.slice(0, -10);
    return url.href;
  }

  function createLinkSharer(location, device) {
    return async function shareMultipulsLink() {
      const url = appLink(location.href);
      if (!url) return { status: "unpublished" };
      // Share only the entry link and app name. No scores, settings or version.
      const data = { title: "Multipuls", url };
      if (typeof device.share === "function") {
        try {
          // Called synchronously from the click handler, before any await.
          await device.share(data);
          return { status: "shared" };
        } catch (error) {
          // Closing the native sheet is not a request to copy anything.
          if (error && error.name === "AbortError") return { status: "cancelled" };
        }
      }
      if (device.clipboard && typeof device.clipboard.writeText === "function") {
        try {
          await device.clipboard.writeText(url);
          return { status: "copied" };
        } catch (error) {
          // No copied confirmation unless the browser confirmed the write.
        }
      }
      return { status: "link", url };
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { appLink, createLinkSharer };
    return;
  }
  const root = document.getElementById("multipuls-v3");
  if (root) root.shareMultipulsLink = createLinkSharer(window.location, navigator);
})();
