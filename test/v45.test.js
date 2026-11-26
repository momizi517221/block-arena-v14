'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const A = require('../public/shared');
const html = fs.readFileSync(path.join(__dirname, '../public/client.html'), 'utf8');

test('V45 auto-reload begins when the magazine reaches zero', () => {
  const p = A.makePlayer();
  const w = A.weaponFor(p);
  p.ammo = 0;
  A.combat(p, {}, 1 / 30);
  assert.ok(p.reloadProgress > 0);
  assert.equal(p.ammo, 0);
});

test('V45 auto-reload completes once and restores the current weapon magazine', () => {
  const p = A.makePlayer();
  const w = A.weaponFor(p);
  p.ammo = 0;
  for (let i = 0; i < Math.ceil(w.reload * 30) + 2; i++) A.combat(p, {}, 1 / 30);
  assert.equal(p.ammo, w.magazine);
  assert.equal(p.reloadProgress, 0);
});

test('V45 manual reload remains supported and weapon magazine sizes are unchanged', () => {
  for (const id of A.weaponIds) {
    const p = A.makePlayer();
    assert.equal(A.equip(p, id), true);
    const w = A.weaponFor(p);
    assert.equal(p.ammo, w.magazine);
    p.ammo = Math.max(0, w.magazine - 1);
    A.combat(p, { reload: true }, 1 / 30);
    assert.ok(p.reloadProgress > 0);
  }
  assert.equal(A.weapons.pistol.magazine, 10);
  assert.equal(A.weapons.smg.magazine, 30);
  assert.equal(A.weapons.shotgun.magazine, 8);
  assert.equal(A.weapons.assault.magazine, 20);
  assert.equal(A.weapons.sniper.magazine, 6);
});

test('V45 damage calculation preserves normal and headshot weapon damage', () => {
  const attacker = A.makePlayer();
  const target = A.makePlayer(2, 'Target', 0);
  assert.equal(A.damageFor(target, false, attacker), A.weaponFor(attacker).damage);
  assert.equal(A.damageFor(target, true, attacker), A.weaponFor(attacker).headDamage);
});

test('V45 mobile profile inputs use the in-game keyboard and action buttons default to the right', () => {
  assert.match(html, /field\.readOnly=true/);
  assert.match(html, /field\.setAttribute\('inputmode','none'\)/);
  assert.match(html, /fire:\[\.90,\.66\],jump:\[\.90,\.86\],heal:\[\.70,\.66\],reload:\[\.70,\.86\],ads31:\[\.80,\.47\]/);
  assert.match(html, /#move\{display:none!important/);
});

test('V45 lobby hides gameplay HUD and the enemy HP strip requires a recent hit', () => {
  assert.match(html, /roomPhase==='result'\|\|warm/);
  assert.match(html, /damageMemory45\.get\(e\.id\)\|\|0\)>time/);
  assert.match(html, /damageMemory45\.set\(e\.target,time\+12\)/);
});

test('V45 exposes separate ADS sensitivity, aim-assist controls, outline and death summary', () => {
  assert.match(html, /adsSensitivity45/);
  assert.match(html, /assistCandidate45/);
  assert.match(html, /drawOutline45/);
  assert.match(html, /showCombatSummary45/);
  assert.match(html, /combatDealt45/);
});
