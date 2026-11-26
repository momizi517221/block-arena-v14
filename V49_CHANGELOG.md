# BERSERK V49 — SKY PARK playable prototype

## Status
New stage added, not a replacement for CLASSIC ARENA. Engineering prototype for playtesting; not the final art/balance pass. V48 is the baseline. No deployment performed.

## How to select
- Training: title → 訓練場 → CLASSIC ARENA or SKY PARK.
- Online: title → オンライン → 部屋を作る → toggle ステージ to SKY PARK → enter room code. Guests inherit the host's selected map. Existing room behavior is preserved. The stage is kept on rematch/return to room; old clients should refresh after deploying the update.

## Implementation
- 60×60m bounds (x=-30..30, z=-18..42; center z=12). Ground plus elevated deck top at y=4, thickness 0.3; four 5m outer walkways, four 8×8m corner plazas, 4m connectors, approximately 14m central circular deck, four offset 4m-wide, 8m-long stairs. Central deck uses strips with cutouts for the stairs. Stairs use treads for visuals/rays and a continuous slope with a small transition at the top for movement.
- Ground grass/paving, solid cover, supports, simplified trees, benches, shelter roofs, color-coded corners and distant decorative buildings. Partial handrails with openings; corner landmarks and central monument are simplified blocks, not final assets.
- Shared collision/raycast support for elevated boxes with separate bottom/top. Head clearance and ground support, falling, camera and rays use the common stage geometry. Special movement respects collision; grapple can find a safe three-waypoint route around a deck edge, dash/slash follow a grounded ramp. Safe spawn candidates (16) and height-aware targets (5); respawn prefers distance and cover from opponents.
- Existing weapon and ability parameters unchanged. Scan displays UPPER/GROUND based on target's recorded height on SKY PARK. Gravity/strike and aim assist/autoaim use existing LOS with the elevated floor. Wall placement additionally checks its height against geometry. Rewind uses safe 3D positions. Existing shared code remains embedded identically in both HTML files.
- Server fixes: per-room stage selection, synchronous stage context for join/tick/ability/reset, welcome/lobby stage ID, target Y coordinates, same stage on late join and room return. The stage selection is validated on the server; guests cannot change a running room's stage.

## Files changed
- `public/shared.js`, `public/index.html`, `public/client.html`
- `simulation.js`, `rooms.js`, `server.js`
- `test/v49.test.js` (15 additional tests)
- `V49_CHANGELOG.md`
The package includes prior V48 update files as well. Overlay onto the existing project (keep `.git`, package.json, lockfile, and existing project files). Do not copy test harnesses outside the package.

## Verified
- Node 22: `node --test test/*.test.js`, 81/81 passed (66 previous + 15 V49).
- Syntax: both HTML inline scripts and shared/server/room/simulation JS pass `node --check`.
- Four stairs up/down, connected deck floor samples, movement beneath deck, overhead collision, fall with HP preserved, rays through/around floor, grapple from ground to a representative deck edge, dash on stair, dash/slash boundary collision, rewind to upper floor, gravity/strike separated by floor, TPS camera representative poses, scan height, upper wall placement, overdrive stair movement, stage context isolation and basic UI integration.
- 16 simulated players × 300 ticks; valid positions within bounds and finite heights. Not a real device FPS benchmark.
- Desktop/mobile simulated browser UI with mocked WebGL: stage selection, training HUD, equipment selection and host stage toggle passed. Real WebGL is disabled and browser file navigation blocked in this environment, so no true rendered view or visual inspection was possible.
- Local WebSocket protocol: three clients, two rooms with different stages, join inherits host map, countdown/battle, return to same map, unaffected other room; passed. Used environment's bundled ws implementation for transport test; npm production install/deployment not tested.

## Remaining / needs playtest
- Full art: fountain/clock/sunshade/flower-bed distinct motifs, signage, detailed foliage/handrails/lighting, central monument shape, skyline composition. Current art is primitive, no final models/textures.
- Verify real FPS/TPS camera smoothness at every ramp edge, all approach angles and rail gaps, actual outline rendering/depth, gun range/line of sight and all ability combinations in live play. Representative cases were tested, not exhaustive. Grapple edge-route may stop at obstructed or unsuitable edges, and stairs use a small top transition. Strike/gravity placement on all stair/edge geometries, wall on steep stair positions, and spawn fairness under pressure still need further testing.
- Actual smartphone and controller operation, mobile rendering performance, real multiplayer latency, 16 live clients, beginner/advanced playtests and balance adjustments not performed. Do not call the stage final until these are verified.
