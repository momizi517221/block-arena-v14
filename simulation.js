'use strict';
const A=require('./public/shared');
const MAX=16,HZ=30,DT=1/HZ;
class Match {
 constructor(){this.players=new Map();this.time=0;this.tick=0;this.events=[];this.nextId=1;this.nextSpawn=0;this.warmup=false;this.targets=[];}
 join(name,type=0){if(this.players.size>=MAX)return null;let id=this.nextId++,p=A.makePlayer(id,name,type,this.nextSpawn++);p.input={x:0,z:0,yaw:p.yaw,pitch:p.pitch,f:false,j:false,fps:false,seq:0};p.lastInput=this.time;this.players.set(id,p);return p;}
 leave(id){this.players.delete(id);}
 input(id,i){let p=this.players.get(id);if(!p||!i||typeof i!=='object')return false;let {x,z,yaw,pitch,seq}=i;if(![x,z,yaw,pitch,seq].every(Number.isFinite)||!Number.isSafeInteger(seq)||seq<=p.input.seq)return false;if(i.f===true&&!p.input.f&&this.time+DT>=p.nextShot&&p.ammo>0&&!p.reloadProgress&&!i.heal&&p.hp>0)p.shotLatch=true;p.input={x:A.clamp(x,-1,1),z:A.clamp(z,-1,1),yaw:Math.atan2(Math.sin(yaw),Math.cos(yaw)),pitch:A.clamp(pitch,-1.2,i.fps===true?1.25:1.22),f:i.f===true,j:i.j===true,heal:i.heal===true,reload:i.reload===true,fps:i.fps===true,ads:i.ads===true,cancelFire:i.cancelFire===true,seq};p.lastInput=this.time;return true;}
 step(){this.time+=DT;this.tick++;const players=[...this.players.values()];for(let p of players){if(p.hp<=0){if(this.time>=p.deadUntil){let kills=p.kills,deaths=p.deaths||0,spawn=A.spawns[this.nextSpawn++%A.spawns.length],fresh=A.makePlayer(p.id,p.name,p.type);A.equip(fresh,p.weapon);Object.assign(p,fresh,{x:spawn[0],z:spawn[1],kills,deaths,input:{...p.input,f:false,j:false,x:0,z:0},lastInput:this.time,ack:p.input.seq,camera:null});this.events.push({kind:'respawn',id:p.id});}else continue;}
 let i=this.time-p.lastInput>.35?{...p.input,x:0,z:0,f:false,j:false,heal:false,reload:false,ads:false,cancelFire:true}:p.input;if(p.shotLatch){i={...i,f:true};p.shotLatch=false;}A.combat(p,i,DT);p.traitCanFire=A.weaponInput(p,i,DT,this.time+1e-8>=p.nextShot);A.movement(p,i,DT);p.ack=i.seq;}
 if(this.warmup)for(let t of this.targets)if(t.hp<=0&&this.time>=t.deadUntil){t.hp=60;this.events.push({kind:'target',id:t.id,hp:t.hp});}
 const aimables=this.warmup?this.targets:players;for(let p of players){if(p.hp<=0)continue;const cam=p.camera=A.cameraFor(p,A.config,true,p.camera||null,DT),target=A.aimTarget(p,aimables,cam);A.aimBody(p,target.point,DT);if(!p.traitCanFire||!p.firing||this.time+1e-8<p.nextShot)continue;let interval=A.shotInterval(p);p.nextShot=p.weapon==='sniper'?this.time+interval:Math.max(this.time-DT,p.nextShot)+interval;p.ammo--;let pellet=0,hitId=null;for(let s of A.fireVolley(p,aimables,cam)){let e=s.enemy,kill=false,damage=0;if(e&&e.hp>0){damage=Math.min(e.hp,A.damageFor(e,s.headshot,p));e.hp-=damage;hitId=e.id;if(e.hp===0){kill=true;hitId=null;e.deadUntil=this.time+A.config.respawn;if(!this.warmup){p.kills++;e.deaths=(e.deaths||0)+1;}e.firing=false;}}
 if(this.warmup&&e)this.events.push({kind:'target',id:e.id,hp:e.hp});
 this.events.push({kind:'shot',id:p.id,a:s.a,b:s.b,target:e?e.id:0,headshot:!!(e&&s.headshot),kill,damage,weapon:p.weapon,interval,ammo:p.ammo,pellet:pellet++});}A.finishShot(p,hitId);}
 }
 snapshot(){return{kind:'state',tick:this.tick,time:this.time,players:[...this.players.values()].map(p=>[p.id,p.x,p.y,p.z,p.yaw,p.pitch,p.bodyYaw,p.gunPitch,p.hp,p.kills,p.phase,(p.moving?1:0)|(p.grounded?2:0)|(p.firing?4:0)|(p.fps?8:0)|(p.prevJump?16:0)|(p.type<<5),p.vy,p.ack,p.deadUntil,p.ammo,p.healProgress,p.reloadProgress,p.jumps,A.weaponIds.indexOf(p.weapon),Number(p.ads)])};}
 drain(){return this.events.splice(0);}
}
module.exports={Match,MAX,HZ};
