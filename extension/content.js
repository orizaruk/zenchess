// ZenChess content script. CSS does the hiding; this file toggles it and
// scrubs the few things CSS can't reach (tab title, tooltip attributes).
(() => {
  const root = document.documentElement;
  // On by default, before storage answers, so nothing flashes on page load.
  root.classList.add("zc-on");

  const settings = {
    enabled: true,
    hideOwnRating: true,
    flagNewAccounts: true,
    newAccountDays: 30,
    flagFewGames: true,
    minGames: 50,
  };

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

  // Flag suspicious opponents with a red badge. Two checks, each toggled and
  // tuned in the popup:
  //   - account age: younger than newAccountDays (join date from /pub/player)
  //   - experience: fewer than minGames rated games in this game's mode
  //     (bullet/blitz/rapid/daily, from /pub/player/<name>/stats)
  // Either check alone shows the badge, listing whichever reasons apply
  // ("New account · 4 days · 12 rapid games"). If the games count is unknown
  // (check off, unrated variant, lookup failed), only account age can flag.
  // No public profile (404, e.g. guests) is always flagged. The API gives exact numbers, so we don't depend on the
  // hover card's "6 days ago" / "Feb 15, 2025" text.
  const DAY_MS = 24 * 60 * 60 * 1000;
  const RETRY_MS = 60 * 1000;
  const MODES = { bullet: "chess_bullet", blitz: "chess_blitz", rapid: "chess_rapid", daily: "chess_daily" };
  const results = new Map(); // username -> { kind: "found" | "missing" | "error", joined?, stats?, at? }
  const inflight = new Set();

  function getJson(url) {
    return fetch(url).then((r) => {
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
  }

  function lookup(username) {
    if (inflight.has(username)) return;
    inflight.add(username);
    const base = `https://api.chess.com/pub/player/${encodeURIComponent(username)}`;
    Promise.all([getJson(base), getJson(`${base}/stats`).catch(() => null)])
      .then(([profile, stats]) => {
        if (!profile) return { kind: "missing" };
        if (!profile.joined) throw new Error("no join date");
        return { kind: "found", joined: profile.joined * 1000, stats };
      })
      .catch(() => ({ kind: "error", at: Date.now() }))
      .then((result) => {
        results.set(username, result);
        inflight.delete(username);
        showAccountBadge();
      });
  }

  // Rated games in this mode, or null if unknown (no stats, unrated variant).
  function gamesInMode(stats, mode) {
    const key = MODES[mode];
    if (!stats || !key) return null;
    const record = stats[key] && stats[key].record;
    return record ? record.win + record.loss + record.draw : 0; // mode never played
  }

  function badgeText(result, mode) {
    if (result.kind === "missing") return "No public profile";
    if (result.kind !== "found") return null;
    const days = Math.max(0, Math.floor((Date.now() - result.joined) / DAY_MS));
    const isNew = settings.flagNewAccounts && days < Number(settings.newAccountDays);
    const games = settings.flagFewGames ? gamesInMode(result.stats, mode) : null;
    const fewGames = games !== null && games < Number(settings.minGames);
    const parts = [];
    if (isNew) parts.push(`New account · ${days === 0 ? "today" : days === 1 ? "1 day" : `${days} days`}`);
    if (fewGames) parts.push(`${games} ${mode} game${games === 1 ? "" : "s"}`);
    return parts.join(" · ") || null;
  }

  function showAccountBadge() {
    const block = document.querySelector("#board-layout-player-top .cc-user-block-component");
    const nameEl = block && block.querySelector('[data-test-element="user-tagline-username"]');
    const username = nameEl && nameEl.textContent.trim().toLowerCase();
    const badge = document.querySelector(".zc-account-badge");
    const anyCheck = settings.flagNewAccounts || settings.flagFewGames;
    // Bots and the coach sit in the same player bar but aren't real accounts.
    const vsComputer = /^\/play\/(computer|coach)\b/.test(location.pathname);
    let result = username && results.get(username);
    if (result && result.kind === "error" && Date.now() - result.at > RETRY_MS) {
      results.delete(username);
      result = null;
    }
    if (anyCheck && username && !vsComputer && !result) lookup(username);
    const text = anyCheck && !vsComputer && result ? badgeText(result, block.getAttribute("rating-type")) : null;
    if (!text) {
      if (badge) badge.remove();
      return;
    }
    if (badge && badge.dataset.zcUser === username && badge.parentNode === block && badge.textContent === text) return;
    if (badge) badge.remove();
    const el = document.createElement("span");
    el.className = "zc-account-badge";
    el.dataset.zcUser = username;
    el.textContent = text;
    block.appendChild(el);
  }

  let pending = false;
  new MutationObserver(() => {
    if ((!settings.enabled && !settings.flagNewAccounts && !settings.flagFewGames) || pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      if (settings.enabled) scrub();
      showAccountBadge();
    });
  }).observe(root, { childList: true, subtree: true, characterData: true });
})();
