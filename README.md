# matrix-rain

A Claude Code mod that paints slow binary rain behind the chat in the Claude desktop app, and stacks a pile of settled digits from the bottom of the window as the context window fills.

## What it does

- Sets a dark, phosphor-green color theme for the session.
- Draws columns of 0s and 1s behind the conversation. The digits stay still and a fading window falls down each column, so nothing flickers.
- Reads how full the context window is after each reply and draws a pile of digits that tall, in 2% steps. An empty or just-compacted window has no pile.
- The pile is green, turns amber at 75% and red at 90%.

## Install

At the prompt of a terminal session:

```
/plugin install matrix-rain --marketplace AIEngineerX/matrix-rain
```

Answer `y` to add the marketplace, then pick a scope.

From a shell:

```
claude plugin install matrix-rain --marketplace AIEngineerX/matrix-rain
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `AIEngineerX/matrix-rain`, then Add plugin.

## What it needs

A Claude desktop or mobile app that draws a mod's theme. The terminal and editors draw no backdrop. The look is made for dark mode only.

## Known limits

- A session has one theme at a time, so this replaces any other mod's theme, and another mod's theme replaces this one.
- Each time the pile grows the scene is redrawn, and the drops restart from their starting positions.
- With reduced motion on, the rain rests as a still picture.
- It has been used by its author on one Windows machine. Other setups are untested.

## What it reads

The session's context usage percentage, through `$.session.usage()`. It reads no prompt or reply text and sends nothing anywhere.

## Credits

`hooks/make-colors.js` and `hooks/make-colors.d.ts` are Anthropic's, copied unchanged from Claude Code's plugin-authoring skill as its instructions direct. Everything else is under the MIT license in `LICENSE`.
