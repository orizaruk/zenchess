# Chrome Web Store submission

Copy these into the Developer Dashboard fields.

## Store listing

**Name:** ZenChess

**Summary** (from manifest, 132 chars max):
Play on Chess.com without knowing who you're playing: hides opponent identity and ratings, and shows how old their account is.

**Category:** Games (or Entertainment, whichever the dashboard offers)

**Language:** English

**Description:**

Play chess, not the opponent.

ZenChess hides who you're playing on Chess.com, so you can focus on the board
instead of their rating, their country or their name. It feels like playing a
computer: no rating anxiety, no tilt.

What it hides while you play:
• Opponent's name, avatar, rating, country flag and badges
• Hover cards and name tooltips
• The "name (rating) vs. name (rating)" line and the win/lose rating preview
• The Chat and Info tabs
• The pre-game "vs" animation
• New ratings and rating changes in the game-over popup
• Your own rating (optional)
• The Game History section on the home page

New-account flag (optional):
A red badge next to "Opponent" warns you when their account is under 30 days
old or has no public profile, without showing who they are.

The clock, captured pieces and everything else you need to play stay visible.
Toggle any of it from the toolbar icon; changes apply instantly.

Privacy: no tracking, no analytics, no servers. The only network request is
to Chess.com's own public API, for the opponent's join date.

ZenChess is an independent project and is not affiliated with, endorsed by
or sponsored by Chess.com.

**Icon:** `extension/icons/icon-128.png`

**Screenshots** (1280×800 or 640×400, at least 1): take them yourself in a
real game. Suggested shots:
1. A game in progress with "Opponent" and no badge.
2. A red "New account" badge.
3. The popup with its toggles.

**Small promo tile** (440×280): `store/promo-tile-440x280.png`

## Privacy practices tab

**Single purpose:**
Hide opponent identity and ratings on Chess.com so players can focus on the
game, optionally flagging opponents with very new accounts.

**Permission justifications:**
- `storage`: saves the user's on/off settings from the popup.
- Host access (content script on chess.com): the extension hides elements on
  Chess.com pages and adds the new-account badge there. It runs on no other
  site.

**Remote code:** No.

**Data usage:** Check none of the data types; the extension collects no user
data. Opponent usernames are sent only to Chess.com's own API to read the
account's join date and are not stored or shared.
Certify all three statements (no selling, no unrelated use, no creditworthiness).

**Privacy policy URL:** link to `PRIVACY.md` on GitHub.

## Packaging

Zip the **contents** of `extension/` so `manifest.json` sits at the zip root
(PowerShell, from the repo root):

```powershell
Compress-Archive -Path extension\* -DestinationPath zenchess-1.0.0.zip -Force
```

## Regenerating the icon

`tools/gen-icon.js` writes `extension/icons/icon.svg`. Render each PNG size
(16, 32, 48, 128) from it with headless Chrome or any SVG tool.
