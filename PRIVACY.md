# ZenChess privacy policy

Last updated: October 16, 2026

ZenChess does not collect, store or sell any personal data, and it has no
servers of its own.

## What the extension does

- **Hides information on chess.com pages.** All of this happens locally in
  your browser.
- **Saves your settings** (the popup toggles) with Chrome's `storage.sync`, so
  they follow your Chrome profile. Nothing else is stored.
- **Looks up your opponent's account age** when the account-age badge is on.
  The extension sends your opponent's chess.com username to chess.com's own
  public API (`https://api.chess.com/pub/player/<username>`) and reads the
  account's join date from the reply. The request goes straight from your
  browser to chess.com, like any other request the chess.com page makes. No
  third party is involved. Results are kept in memory only until the tab is
  closed or reloaded.

## What it does not do

- No analytics, tracking, ads or remote code.
- No access to any site other than chess.com.
- It does not read your moves or games, and it gives no help during play.

## Contact

Questions: open an issue on the project's GitHub page.

ZenChess is an independent project and is not affiliated with, endorsed by
or sponsored by Chess.com.
