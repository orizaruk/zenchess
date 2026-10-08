// ZenChess content script. CSS does the hiding; this file toggles it and
// scrubs the few things CSS can't reach (tab title, tooltip attributes).
(() => {
  const root = document.documentElement;
  // On by default, before storage answers, so nothing flashes on page load.
  root.classList.add("zc-on");

  const settings = { enabled: true, hideOwnRating: false };

  function apply() {
    root.classList.toggle("zc-on", settings.enabled);
    root.classList.toggle("zc-hide-own", settings.enabled && settings.hideOwnRating);
    if (settings.enabled) scrub();
  }

  chrome.storage.sync.get(settings, (stored) => {
    Object.assign(settings, stored);
    apply();
  });
  chrome.storage.onChanged.addListener((changes) => {
    for (const [key, { newValue }] of Object.entries(changes)) settings[key] = newValue;
    apply();
  });

  // Names leak through title/aria-label attributes (tooltips) and the tab title.
  function scrub() {
    const top = document.getElementById("board-layout-player-top");
    if (top) {
      for (const el of top.querySelectorAll("[title], [aria-label], [alt]")) {
        if (el.closest('[class*="clock"]')) continue;
        el.removeAttribute("title");
        el.removeAttribute("aria-label");
        el.removeAttribute("alt");
      }
    }
    // e.g. "Alice vs Bob" -> "Chess.com"
    if (/\svs\.?\s/i.test(document.title) && document.getElementById("board-layout-chessboard")) {
      document.title = "ZenChess";
    }
  }

  let pending = false;
  new MutationObserver(() => {
    if (!settings.enabled || pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      scrub();
    });
  }).observe(root, { childList: true, subtree: true, characterData: true });
})();
