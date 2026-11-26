# BERSERK V45 update notes

## Implemented in this package
- Mobile player name, room code, and admin password fields use the in-game virtual keyboard only on touch devices (`readonly` + `inputmode=none`); tapping the field opens the in-game keyboard.
- Mobile action buttons (fire, jump, heal, reload, ADS) are placed on the right side by default. Existing saved layouts are clamped to the right side. The visible movement-stick graphic is hidden; dragging the left half of the screen still controls movement. The settings button moves to the upper-right.
- Online warmup/countdown hides the match HUD and ammo/action-progress panels so they no longer overlap the room roster.
- Added red visible-enemy outline rendering with wall-ray occlusion, adjustable thickness and color. Current game data has no team field/team mode; all other players in the current free-for-all are treated as opponents.
- Split normal view sensitivity and ADS sensitivity; settings are stored through the existing device preference persistence.
- Added configurable aim-assist toggle, strength, acquisition distance, and angle. Assist only engages while the player is moving the view, only for targets with line of sight, and keeps a target lock while it remains valid. It does not fire automatically or snap instantly.
- Enemy HP strips are hidden until this player damages that enemy, then remain visible for 12 seconds after the most recent hit; they are hidden through walls and cleared when the enemy respawns/leaves.
- Added auto-reload when the magazine reaches zero, reusing the existing reload duration and reload state. Online client sends the existing reload input once the authoritative ammo state reaches zero. The current game model has no reserve-ammo counter, so it retains its existing unlimited-reserve reload behavior.
- Added death combat summary UI with total damage dealt/received, last attacker, and per-opponent totals. Damage values are reconstructed from authoritative shot events and the existing weapon/character damage rules; stats reset on respawn.

## Preserved
- Existing FPS/TPS switching, weapon models/scopes, weapon stats and magazine capacities, recoil-free hitscan behavior, controls, and white/yellow/red awareness indicators.
- Weapon-specific abilities from section 3.7 were not implemented because they were explicitly provisional.

## Important source-package limitation
The supplied V44 ZIP contains `public/client.html`, `public/index.html`, `public/shared.js`, tests, and a balance example, but does not include the online server source files (`simulation.js`, `rooms.js`, or equivalent). Therefore server internals could not be edited or audited. Online features in this package rely on the existing server's input and shot-event protocol. Real online verification is still required.

## Verification
- JavaScript syntax checks are run for all inline scripts and `public/shared.js`.
- Focused V45 shared-simulation tests cover auto-reload and unchanged weapon damage/magazine data.
- The original `match.test.js` and `v31.test.js` import server modules not present in the supplied ZIP, so those suites cannot run from this archive.
- Actual mobile device behavior and live online multiplayer behavior have not been physically tested.
