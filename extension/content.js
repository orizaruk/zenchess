// ZenChess content script. CSS does the hiding; this file toggles it and
// scrubs the few things CSS can't reach (tab title, tooltip attributes).
(() => {
  const root = document.documentElement;
  // On by default, before storage answers, so nothing flashes on page load.
  root.classList.add("zc-on");

  const settings = { enabled: true, hideOwnRating: true, flagNewAccounts: true };

  function apply() {
    root.classList.toggle("zc-on", settings.enabled);
    root.classList.toggle("zc-hide-own", settings.enabled && settings.hideOwnRating);
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

  // Account-age badge on the opponent's bar: red (under NEW_ACCOUNT_DAYS old,
  // or no public profile), gray (checking / lookup failed), green (older).
  // The join date comes from chess.com's public API (an exact timestamp), so
  // we don't depend on the hover card's "6 days ago" / "Feb 15, 2025" text.
  const NEW_ACCOUNT_DAYS = 30;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const lookups = new Map(); // username -> Promise<{ kind, days? }>

  function lookup(username) {
    if (!lookups.has(username)) {
      const url = `https://api.chess.com/pub/player/${encodeURIComponent(username)}`;
      lookups.set(
        username,
        fetch(url)
          .then(async (r) => {
            if (r.status === 404) return { kind: "missing" };
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const { joined } = await r.json();
            if (!joined) throw new Error("no join date");
            const days = Math.max(0, Math.floor((Date.now() - joined * 1000) / DAY_MS));
            return { kind: days < NEW_ACCOUNT_DAYS ? "new" : "ok", days };
          })
          .catch(() => {
            lookups.delete(username); // retry on the next game / page change
            return { kind: "error" };
          })
      );
    }
    return lookups.get(username);
  }

  function formatAge(days) {
    if (days === 0) return "today";
    if (days < NEW_ACCOUNT_DAYS) return days === 1 ? "1 day" : `${days} days`;
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30.4);
    if (!years) return `${Math.max(1, months)} mo`;
    return months ? `${years} yr ${months} mo` : `${years} yr`;
  }

  const BADGE_TEXT = {
    checking: () => "Checking account…",
    new: (r) => `New account · ${formatAge(r.days)}`,
    missing: () => "No public profile",
    error: () => "Account age unknown",
    ok: (r) => `Account · ${formatAge(r.days)}`,
  };

  function setBadge(badge, result) {
    badge.dataset.zcState = result.kind;
    badge.textContent = BADGE_TEXT[result.kind](result);
  }

  function showAccountBadge() {
    const block = document.querySelector("#board-layout-player-top .cc-user-block-component");
    const nameEl = block && block.querySelector('[data-test-element="user-tagline-username"]');
    const username = nameEl && nameEl.textContent.trim().toLowerCase();
    let badge = document.querySelector(".zc-account-badge");
    // Bots and the coach sit in the same player bar but aren't real accounts.
    const vsComputer = /^\/play\/(computer|coach)\b/.test(location.pathname);
    if (!settings.flagNewAccounts || !username || vsComputer) {
      if (badge) badge.remove();
      return;
    }
    if (badge && badge.dataset.zcUser === username && badge.parentNode === block) return;
    if (badge) badge.remove();
    badge = document.createElement("span");
    badge.className = "zc-account-badge";
    badge.dataset.zcUser = username;
    setBadge(badge, { kind: "checking" });
    block.appendChild(badge);
    lookup(username).then((result) => setBadge(badge, result));
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
