# Chrome Web Store submission

Copy these into the Developer Dashboard fields.

## Store listing

**Name:** ZenChess

**Summary** (from manifest, 132 chars max):
Play on Chess.com without knowing who you're playing: hides opponent identity and ratings, and flags suspicious accounts.

**Category:** Games (under Lifestyle). Entertainment also fits.

**Language:** English

**Description** (paste the block as-is; the dashboard keeps line breaks):

```text
Play chess, not the opponent.

ZenChess hides who you're playing on Chess.com, so you can focus on the board instead of their rating, their country or their name. It feels like playing a computer: no rating anxiety, no tilt.

What it hides while you play:
• Opponent's name, avatar, rating, country flag and badges
• Hover cards and name tooltips
• The "name (rating) vs. name (rating)" line and the win/lose rating preview
• The Chat and Info tabs
• The pre-game "vs" animation
• New ratings and rating changes in the game-over popup
• Your own rating (optional)
• The Game History section on the home page (optional)

Suspicious-opponent flag (optional):
A red badge next to "Opponent" warns you when they have a brand-new account, few games in the mode you're playing, or no public profile, without showing who they are. Both thresholds are adjustable.

The clock, captured pieces and everything else you need to play stay visible. Toggle any of it from the toolbar icon; changes apply instantly.

Privacy: no tracking, no analytics, no servers. The only network requests go to Chess.com's own public API, for the opponent's join date and games played.

ZenChess is an independent project and is not affiliated with, endorsed by or sponsored by Chess.com.
```

**Icon:** `extension/icons/icon-128.png`

**Screenshots** (1280×800, upload in this order), in `store/screenshots/`:
1. `1-new-account-badge.png`: a game with the red "New account · 18 days ·
   49 rapid games" badge.
2. `2-zen-mode-game.png`: a game in Zen mode, opponent hidden, no badge.
3. `3-popup-settings.png`: the popup with all its settings.

**Small promo tile** (440×280): `store/promo-tile-440x280.png`

**Marquee promo tile** (1400×560): optional, skip.

**Additional fields:**
- Homepage URL: https://github.com/orizaruk/zenchess
- Support URL: https://github.com/orizaruk/zenchess/issues
- Mature content: No

## Privacy practices tab

**Single purpose:**
Hide opponent identity and ratings on Chess.com so players can focus on the
game, optionally flagging suspicious opponents (new accounts, few games).

**Permission justifications:**
- `storage`: saves the user's on/off settings from the popup.
- Host access (content script on chess.com): the extension hides elements on
  Chess.com pages and adds the suspicious-opponent badge there. It runs on no other
  site.

**Remote code:** No.

**Data usage:** Check none of the data types; the extension collects no user
data. Opponent usernames are sent only to Chess.com's own API to read the
account's join date and games played, and are not stored or shared.
Certify all three statements (no selling, no unrelated use, no creditworthiness).

**Privacy policy URL:** https://github.com/orizaruk/zenchess/blob/main/PRIVACY.md

## Distribution tab

**Visibility:** Public (or Unlisted for a soft launch: only people with the
link can install it).

**Regions:** All regions.

**Test instructions** (for the reviewer):

```text
No login to the extension is needed. Log in to chess.com (any free account) and start an online game (Play > Play Online). The opponent's name, avatar and rating are replaced by "Opponent". Click the ZenChess toolbar icon to toggle each feature; changes apply instantly. The red badge appears only for opponents whose account is under 30 days old or who have under 50 games in the current mode.
```

## Packaging

The upload zip is `dist/zenchess-1.0.0.zip` (git-ignored). It holds the
contents of `extension/` with `manifest.json` at the zip root and forward-slash
paths; `icons/icon.svg` is left out since the extension doesn't use it. For a
new release, bump `version` in `extension/manifest.json` and rebuild.

## Regenerating the icon

`tools/gen-icon.js` writes `extension/icons/icon.svg`. Render each PNG size
(16, 32, 48, 128) from it with headless Chrome or any SVG tool.
