# ZenChess privacy policy

Last updated: October 16, 2026

ZenChess does not collect, store or sell any personal data, and it has no
servers of its own.

## What the extension does

- **Hides information on chess.com pages.** All of this happens locally in
  your browser.
- **Saves your settings** (the popup toggles) with Chrome's `storage.sync`, so
  they follow your Chrome profile. Nothing else is stored.
- **Looks up your opponent's account age and games played** when either
  suspicious-opponent check is on. The extension sends your opponent's
  chess.com username to chess.com's own public API
  (`https://api.chess.com/pub/player/<username>` and `.../stats`) and reads
  the account's join date and game counts from the reply. The requests go
  straight from your browser to chess.com, like any other request the
  chess.com page makes. No third party is involved. Results are kept in
  memory only until the tab is closed or reloaded.

## What it does not do

- No analytics, tracking, ads or remote code.
- No access to any site other than chess.com.
- It does not read your moves or games, and it gives no help during play.

## Your choices

Turn off both "Flag suspicious opponents" checks in the popup and the
extension makes no network requests at all. Removing the extension deletes
its saved settings.

## Changes to this policy

Any change is published in this file, with a new "Last updated" date. The
history is visible in the repository.

## Contact

Questions or concerns: open an issue at
https://github.com/orizaruk/zenchess/issues

ZenChess is an independent project and is not affiliated with, endorsed by
or sponsored by Chess.com.
