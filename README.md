# ZenChess

A browser extension that makes chess.com anonymous: while you play, your
opponent's name, avatar, rating, country flag and badges are hidden. It's
like playing a computer, with no rating anxiety and no tilt from seeing who's
across the board.

## What v0.1 hides

- Opponent (top player bar): avatar, username, rating, flag, badges/flair,
  hover cards and name tooltips. A plain "Opponent" label replaces them.
  The clock and captured pieces stay visible.
- Sidebar: the "name (rating) vs. name (rating), win +8 / lose -8" line, and
  the Chat and Info tabs.
- Pre-game "vs" animation.
- Game-over popup: the new rating and +/- change for both the opponent and
  you. Your league badge stays.
- Your own rating in the player bar (on by default; toggle in the popup).
- Home page: the whole Game History section.

## Install (Chrome / Edge / Brave)

1. Download or clone this repo.
2. Go to `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and select the `extension/` folder.
4. Open chess.com and play. Use the toolbar icon to turn Zen mode on or off.

After editing files, click the reload icon on the extension card, then refresh
chess.com.

## If something leaks

chess.com changes its page markup now and then. If a name or rating shows up,
right-click it, choose **Inspect**, and note the `class="..."` of the element
and its parent. Add that class to `extension/content.css`, or report it.
