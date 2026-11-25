'use strict';
const A=require('./public/shared');
const MAX=16,HZ=30,DT=1/HZ;
class Match {
 constructor(){this.players=new Map();this.time=0;this.tick=0;this.events=[];this.nextId=1;this.nextSpawn=0;this.warmup=false;this.targets=[];}
 join(name,type=0){if(this.players.size>=MAX)return null;let id=this.nextId++,p=A.makePlayer(id,name,type,this.nextSpawn++);p.input={x:0,z:0,yaw:p.yaw,pitch:p.pitch,f:false,j:false,fps:false,seq:0};p.lastInput=this.time;this.players.set(id,p);return p;}
 leave(id){this.players.delete(id);}
 input(id,i){let p=this.players.get(id);if(!p||!i||typeof i!=='object')return false;let {x,z,yaw,pitch,seq}=i;if(![x,z,yaw,pitch,seq].every(Number.isFinite)||!Number.isSafeInteger(seq)||seq<=p.input.seq)return false;p.input={x:A.clamp(x,-1,1),z:A.clamp(z,-1,1),yaw:Math.atan2(Math.sin(yaw),Math.cos(yaw)),pitch:A.clamp(pitch,-1.2,i.fps===true?1.25:.12),f:i.f===true,j:i.j===true,fps:i.fps===true,seq};p.lastInput=this.time;return true;}
 step(){this.time+=DT;this.tick++;const players=[...this.players.values()];for(let p of players){if(p.hp<=0){if(this.time>=p.deadUntil){let old=p,spawn=A.spawns[this.nextSpawn++%A.spawns.length],fresh=A.makePlayer(p.id,p.name,p.type);Object.assign(p,fresh,{x:spawn[0],z:spawn[1],kills:old.kills,deaths:old.deaths||0,input:{...p.input,f:false,j:false,x:0,z:0},lastInput:this.time,ack:p.input.seq,camera:null});this.events.push({kind:'respawn',id:p.id});}else continue;}
 let i=this.time-p.lastInput>.35?{...p.input,x:0,z:0,f:false,j:false}:p.input;A.movement(p,i,DT);p.ack=i.seq;}
 if(this.warmup)for(let t of this.targets)if(t.hp<=0&&this.time>=t.deadUntil){t.hp=60;this.events.push({kind:'target',id:t.id,hp:t.hp});}
 const aimables=this.warmup?this.targets:players;for(let p of players){if(p.hp<=0)continue;const cam=p.camera=A.cameraFor(p,A.config,true,p.camera||null,DT),target=A.aimTarget(p,aimables,cam);A.aimBody(p,target.point,DT);if(!p.firing||this.time<p.nextShot)continue;p.nextShot=this.time+A.config.fireInterval;let s=A.fire(p,aimables,cam),e=s.enemy,kill=false;if(e&&e.hp>0){e.hp=Math.max(0,e.hp-A.config.damage);if(e.hp===0){kill=true;e.deadUntil=this.time+A.config.respawn;if(!this.warmup){p.kills++;e.deaths=(e.deaths||0)+1;}e.firing=false;}}
 if(this.warmup&&e)this.events.push({kind:'target',id:e.id,hp:e.hp});
 this.events.push({kind:'shot',id:p.id,a:s.a,b:s.b,target:e?e.id:0,kill});}
 }
 snapshot(){return{kind:'state',tick:this.tick,time:this.time,players:[...this.players.values()].map(p=>[p.id,p.x,p.y,p.z,p.yaw,p.pitch,p.bodyYaw,p.gunPitch,p.hp,p.kills,p.phase,(p.moving?1:0)|(p.grounded?2:0)|(p.firing?4:0)|(p.fps?8:0)|(p.prevJump?16:0),p.vy,p.ack,p.deadUntil])};}
 drain(){return this.events.splice(0);}
}
module.exports={Match,MAX,HZ};
