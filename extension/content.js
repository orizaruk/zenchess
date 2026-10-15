// ZenChess content script. CSS does the hiding; this file toggles it and
// scrubs the few things CSS can't reach (tab title, tooltip attributes).
(() => {
  const root = document.documentElement;
  // On by default, before storage answers, so nothing flashes on page load.
  root.classList.add("zc-on");

  const settings = { enabled: true, hideOwnRating: true, flagNewAccounts: true };

  function apply() {
    root.classList.toggle("zc-on", settings.enabled);
    root.classList.toggle("zc-hide-own", settings.hideOwnRating);
    if (settings.enabled) scrub();
    showAccountBadge();
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

  // Flag suspicious opponents with a red badge: account under NEW_ACCOUNT_DAYS
  // old, or no public profile (404, e.g. guests). Nothing is shown for older
  // accounts or when the lookup fails. The join date comes from chess.com's
  // public API (an exact timestamp), so we don't depend on the hover card's
  // "6 days ago" / "Feb 15, 2025" text.
  const NEW_ACCOUNT_DAYS = 30;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const RETRY_MS = 60 * 1000;
  const results = new Map(); // username -> { kind: "new" | "missing" | "ok" | "error", days?, at? }
  const inflight = new Set();

  function lookup(username) {
    if (inflight.has(username)) return;
    inflight.add(username);
    const url = `https://api.chess.com/pub/player/${encodeURIComponent(username)}`;
    fetch(url)
      .then(async (r) => {
        if (r.status === 404) return { kind: "missing" };
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const { joined } = await r.json();
        if (!joined) throw new Error("no join date");
        const days = Math.max(0, Math.floor((Date.now() - joined * 1000) / DAY_MS));
        return { kind: days < NEW_ACCOUNT_DAYS ? "new" : "ok", days };
      })
      .catch(() => ({ kind: "error", at: Date.now() }))
      .then((result) => {
        results.set(username, result);
        inflight.delete(username);
        showAccountBadge();
      });
  }

  function badgeText({ kind, days }) {
    if (kind === "missing") return "No public profile";
    return `New account · ${days === 0 ? "today" : days === 1 ? "1 day" : `${days} days`}`;
  }

  function showAccountBadge() {
    const block = document.querySelector("#board-layout-player-top .cc-user-block-component");
    const nameEl = block && block.querySelector('[data-test-element="user-tagline-username"]');
    const username = nameEl && nameEl.textContent.trim().toLowerCase();
    const badge = document.querySelector(".zc-account-badge");
    // Bots and the coach sit in the same player bar but aren't real accounts.
    const vsComputer = /^\/play\/(computer|coach)\b/.test(location.pathname);
    let result = username && results.get(username);
    if (result && result.kind === "error" && Date.now() - result.at > RETRY_MS) {
      results.delete(username);
      result = null;
    }
    if (settings.flagNewAccounts && username && !vsComputer && !result) lookup(username);
    const suspicious = result && (result.kind === "new" || result.kind === "missing");
    if (!settings.flagNewAccounts || vsComputer || !suspicious) {
      if (badge) badge.remove();
      return;
    }
    if (badge && badge.dataset.zcUser === username && badge.parentNode === block) return;
    if (badge) badge.remove();
    const el = document.createElement("span");
    el.className = "zc-account-badge";
    el.dataset.zcUser = username;
    el.textContent = badgeText(result);
    block.appendChild(el);
  }

  let pending = false;
  new MutationObserver(() => {
    if ((!settings.enabled && !settings.flagNewAccounts) || pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      if (settings.enabled) scrub();
      showAccountBadge();
    });
  }).observe(root, { childList: true, subtree: true, characterData: true });
})();
