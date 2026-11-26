# BERSERK V52 - movement / staircase hotfix

## Fixed
- Reproduced V51 stair penetration by approaching the north staircase from the side (x=6.7, z=2.475), walking into its collision, then jumping while continuing toward it. V51 allowed the feet to enter just below the ramp surface and then fall through the steps. V52 explicitly raises the feet onto the slope for small, permitted side contacts, handles descending landing at the slope surface, and rejects positions below the ramp. Grounded snapshots are normalized within a 0.012 m tolerance to handle centimeter quantization.
- Online local model and camera now share one corrected visual position; the old model-only offset is removed. If a corrected visual position overlaps a solid, it is rejected. Authoritative simulation positions remain separate from the visual smoothing.
- Remote interpolation uses a monotonic clock with a 125 ms interpolation target (previously 100 ms). Small packet-arrival timing changes no longer move the interpolation clock backward. The extra 25 ms affects remote presentation, not the server simulation tick rate.

## Files changed
- public/shared.js: shared movement and interpolation helper.
- public/index.html and public/client.html: identical embedded shared code and online rendering/interpolation changes.
- test/v52.test.js: six regression tests.
- V52_CHANGELOG.md: this report.

All V51 features and gameplay balance remain unchanged, including 4 EN/s regeneration, single/double ability input, and both stages. Server uses the updated shared module. No network protocol change.

## Verification
- `node --test test/*.test.js`: 97 passed, 0 failed (91 existing + 6 added).
- Reproduced the old stair fault, verified the corrected sequence, tested both sides of four ramps at 30/60/120 Hz, and tested server simulation landing and quantized ramp snapshots.
- Tested monotonic interpolation helper with irregular packet timing. Static integration check confirms camera and avatar share the corrected visual position; not an actual browser rendering test.
- Syntax checks passed for all four inline scripts in each HTML file, public/shared.js, simulation.js, rooms.js, server.js.
- Not verified: actual WebGL frame times, real device controller/touch operation, live WebSocket latency and player experience. If jitter remains, identify local vs remote player, training vs online, device and stage; actual GPU frame-time profiling may be needed.

## Update
Overwrite all files from this archive into the existing project, preserving .git and node_modules. Restart/redeploy the server so it uses the new shared.js. No need to change saved settings or balance values.
