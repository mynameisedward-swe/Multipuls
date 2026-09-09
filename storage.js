/* Multipuls v3 — device-local session storage, isolated by application path. */
(function () {
  "use strict";
  function createStore(storage, href) {
    const key = "multipuls:session:1:" + new URL(".", href).pathname;
    let issue = storage ? "" : "storageUnavailable";
    let locked = false;
    return {
      key,
      get issue() { return issue; },
      read() {
        if (!storage) return null;
        let text;
        try { text = storage.getItem(key); }
        catch (error) { issue = "storageUnavailable"; return null; }
        if (text === null) return null;
        try {
          const value = JSON.parse(text);
          if (!value || value.schema !== 1) throw new Error("Unknown session format");
          return value;
        } catch (error) {
          locked = true; issue = "storageInvalid"; return null;
        }
      },
      write(value) {
        if (locked || !storage) return false;
        try {
          storage.setItem(key, JSON.stringify({...value, schema: 1}));
          issue = "";
          return true;
        } catch (error) { issue = "storageUnavailable"; return false; }
      },
      rejectSavedData() { locked = true; issue = "storageInvalid"; },
      startNewSession() { locked = false; issue = storage ? "" : "storageUnavailable"; }
    };
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {createStore}; return;
  }
  const root = document.getElementById("multipuls-v3");
  if (!root) return;
  let storage = null;
  try { storage = window.localStorage; } catch (error) { /* The game remains usable. */ }
  root.multipulsStore = createStore(storage, window.location.href);
})();
