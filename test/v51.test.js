'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),A=require('../public/shared'),{Match,HZ}=require('../simulation');
const eps=1e-7;
test('V51 default regeneration is 4 per second; unchanged costs and cap',()=>{
 assert.equal(A.abilityConfig.regen,4);assert.equal(A.abilityConfig.max,100);assert.equal(A.abilityConfig.skillDelay,2);
 for(const [id,cost] of Object.entries({dash:20,grapple:25,scan:30,gravity:30,wall:35,overdrive:100,rewind:100,strike:100,slash:100,autoaim:100}))assert.equal(A.abilityConfig[id].cost,cost);
 assert.deepEqual(require('../balance.example.json').abilities,A.exportBalance().abilities);
});
test('V51 all skill and ultimate thresholds at 30/60/120Hz',()=>{
 for(const hz of [30,60,120])for(const id of [...A.skills48,...A.ults48]){
  const p=A.makePlayer(),w=A.abilityWorld(),cost=A.abilityConfig[id].cost,n=Math.ceil(cost*hz/4);
  for(let k=1;k<n;k++)A.abilityTick(w,[p],k/hz,1/hz);
  assert.ok(p.gauge<cost-eps);A.abilityTick(w,[p],n/hz,1/hz);assert.ok(p.gauge>=cost-eps&&p.gauge<=100);
 }
});
test('V51 authoritative server: 5-second dash, 25-second ultimate, death pauses charge',()=>{
 const m=new Match(),p=m.join('P');p.skill='dash';p.ult='overdrive';
 for(let k=0;k<5*HZ;k++)m.step();assert.ok(Math.abs(p.gauge-20)<eps);
 m.input(p.id,{seq:1,x:0,z:0,yaw:0,pitch:0});assert.ok(m.ability(p.id,'skill',1));assert.ok(p.gauge<eps);
 for(let k=0;k<25*HZ;k++)m.step();assert.ok(Math.abs(p.gauge-100)<eps);
 m.input(p.id,{seq:2,x:0,z:0,yaw:0,pitch:0});assert.ok(m.ability(p.id,'ult',2));assert.equal(p.gauge,0);
 for(let k=0;k<HZ;k++)m.step();assert.ok(Math.abs(p.gauge-4)<eps);
 p.hp=0;p.deadUntil=m.time+10;const old=p.gauge;for(let k=0;k<HZ;k++)m.step();assert.equal(p.gauge,old);
});
