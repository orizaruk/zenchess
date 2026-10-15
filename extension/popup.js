const defaults = { enabled: true, hideOwnRating: true, flagNewAccounts: true };

chrome.storage.sync.get(defaults, (settings) => {
  for (const key of Object.keys(defaults)) {
    const box = document.getElementById(key);
    box.checked = settings[key];
    box.addEventListener("change", () => chrome.storage.sync.set({ [key]: box.checked }));
  }
});
