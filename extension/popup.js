const defaults = {
  enabled: true,
  hideOwnRating: true,
  hideGameHistory: true,
  flagNewAccounts: true,
  newAccountDays: 30,
  flagFewGames: true,
  minGames: 50,
};

chrome.storage.sync.get(defaults, (settings) => {
  for (const key of Object.keys(defaults)) {
    const input = document.getElementById(key);
    if (input.type === "checkbox") {
      input.checked = settings[key];
      input.addEventListener("change", () => chrome.storage.sync.set({ [key]: input.checked }));
    } else {
      input.value = settings[key];
      input.addEventListener("change", () => {
        const n = Math.round(Number(input.value));
        const value = Number.isFinite(n) ? Math.min(Math.max(n, Number(input.min)), Number(input.max)) : defaults[key];
        input.value = value;
        chrome.storage.sync.set({ [key]: value });
      });
    }
  }
});
