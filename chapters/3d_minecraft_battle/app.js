// Minimal, dependency-free Canvas prototype for the battle demo
// - battle bus flies across the top
// - press Space to jump out (start)
// - move with A/D, click to shoot, chests and simple bots exist

// Runtime error overlay helpers: if an exception occurs in the game loop or event handlers
// this will surface the error text into the `#overlay` element in the page so it's easy
// to see without opening devtools.
window.addEventListener('error', (ev) => {
  try{
    const overlay = document.getElementById && document.getElementById('overlay');
    if(overlay){ overlay.classList.remove('hidden'); overlay.innerText = 'Runtime error: ' + (ev && ev.message ? ev.message : String(ev)); }
  }catch(_){}
  console.error(ev);
});
window.addEventListener('unhandledrejection', (ev) => {
  try{
    const overlay = document.getElementById && document.getElementById('overlay');
    if(overlay){ overlay.classList.remove('hidden'); overlay.innerText = 'Unhandled rejection: ' + (ev && ev.reason ? String(ev.reason) : String(ev)); }
  }catch(_){}
  console.error('Unhandled promise rejection', ev);
});

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;

window.addEventListener('resize', ()=>{ 
  W = canvas.width = window.innerWidth; 
  H = canvas.height = window.innerHeight; 
  // update world width so it scales with screen size
  state.worldW = Math.max(2000, W * 3);
});

let now = performance.now();
let last = now;

const state = {
  running: true,
  started: false,
  // make the world wider than the screen so the player can traverse
  worldW: Math.max(2000, W * 3),
  busX: -300,
  player: {x: W/2, y: 120, vx:0, vy:0, onGround:false, standingPlatform: null, health:100},
  bullets: [],
  botBullets: [],
  particles: [],
  chests: [],
  bots: [],
  platforms: [],
  trees: [],
  victory: false,
};

const hudMsg = document.getElementById('message');
hudMsg.innerText = 'Battle bus inbound — press Space to jump out';

// create chests spread across the wider world
for(let i=0;i<14;i++){
  state.chests.push({x: Math.random()*state.worldW, y: H-60, opened:false});
}
// create bots across the map
// accessory helper: small cosmetic items
const accessoryTypes = ['none','hat','backpack','glasses'];
function pickAccessory(){
  const t = accessoryTypes[Math.floor(Math.random()*accessoryTypes.length)];
  if(t === 'none') return {type:'none'};
  const color = ['#ffd700','#ff7f50','#7fffd4','#ff69b4','#a0522d'][Math.floor(Math.random()*5)];
  return {type: t, color};
}

for(let i=0;i<12;i++){
  state.bots.push({x: Math.random()*state.worldW, y: H-60, health:30, shootCooldown: Math.random()*2, accessory: pickAccessory()});
}

// platforms (small elevated ledges)
for(let i=0;i<16;i++){
  const pw = 60 + Math.random()*220;
  const px = Math.random()*(state.worldW - pw);
  const py = H - (100 + Math.random()*160);
  state.platforms.push({x: px, y: py, w: pw});
}

// trees and decor
for(let i=0;i<60;i++){
  state.trees.push({x: Math.random()*state.worldW, y: H-80 - (Math.random()*20)});
}

// give the player a random accessory too
state.player.accessory = pickAccessory();

let keys = {};
window.addEventListener('keydown', e=>{
  keys[e.code] = true;
  if(e.code === 'Space'){
    if(!state.started){
      // initial jump-out from bus
      state.started = true;
      hudMsg.innerText = 'You jumped — use A/D to move, click to fire.';
      // place player near center, slightly above ground
      state.player.x = W/2; state.player.y = H-120; state.player.vy = 0; state.player.onGround = false;
    } else if(state.started && state.player.onGround && state.running){
      // single jump while in-match
      state.player.vy = -480; // jump impulse
      state.player.onGround = false;
    }
  }
  // restart when dead or after victory
  if(e.code === 'KeyR' && !state.running){
    // reset small state
    state.running = true;
    state.started = false;
    state.busX = -300;
    state.player = {x: W/2, y: 120, vx:0, vy:0, onGround:false, standingPlatform: null, health:100, accessory: pickAccessory()};
    state.bullets = [];
    state.botBullets = [];
    state.chests = [];
    state.bots = [];
    state.victory = false;
    state.particles = [];
  // repopulate chests/bots across the world
  for(let i=0;i<14;i++) state.chests.push({x: Math.random()*state.worldW, y: H-60, opened:false});
  for(let i=0;i<12;i++) state.bots.push({x: Math.random()*state.worldW, y: H-60, health:30, shootCooldown: Math.random()*2, accessory: pickAccessory()});
    // regenerate platforms
    state.platforms = [];
    for(let i=0;i<16;i++){
      const pw = 60 + Math.random()*220;
      const px = Math.random()*(state.worldW - pw);
      const py = H - (100 + Math.random()*160);
      state.platforms.push({x: px, y: py, w: pw});
    }
    // regenerate trees
    state.trees = [];
    for(let i=0;i<60;i++) state.trees.push({x: Math.random()*state.worldW, y: H-80 - (Math.random()*20)});
    hudMsg.innerText = 'Battle bus inbound — press Space to jump out';
  }
});
window.addEventListener('keyup', e=>{ keys[e.code]=false; });

canvas.addEventListener('mousedown', e=>{
  if(!state.started) return;
  // fire bullet (convert screen coords to world coords using camera X)
  const camX = Math.max(0, Math.min(state.player.x - W/2, state.worldW - W));
  const worldClickX = camX + e.clientX;
  // fire bullet
  const dir = {x: (worldClickX - state.player.x), y: (e.clientY - state.player.y)};
  const len = Math.hypot(dir.x, dir.y) || 1;
  dir.x/=len; dir.y/=len;
  state.bullets.push({x: state.player.x, y: state.player.y, vx: dir.x*600, vy: dir.y*600});
});

function update(dt){
  if(!state.running) return; // stop updates if dead/paused
  const prevOnGround = state.player.onGround;

  // bus moves when not started
  if(!state.started){ state.busX += 120 * dt; }

  // player controls
  if(state.started){
    // horizontal movement
    if(keys['KeyA']) state.player.x -= 200*dt;
    if(keys['KeyD']) state.player.x += 200*dt;
    // apply gravity with simple platform collision
    const prevY = state.player.y;
    state.player.vy += 900*dt;
    state.player.y += state.player.vy*dt;

    // assume not grounded until we detect ground or a platform
    state.player.onGround = false;

    // world ground collision (floor)
    if(state.player.y > H-50){
      state.player.y = H-50; state.player.vy = 0; state.player.onGround = true;
    } else {
        // platform collision: only if we were above the platform and moved down into it
        for(const p of state.platforms){
          // horizontal overlap check (player width ~= 20)
          const halfW = 10;
          if(state.player.x + halfW > p.x && state.player.x - halfW < p.x + p.w){
            // came from above and now at or below platform top
            // require we were above the platform last frame and now crossed it while falling
            if(prevY <= p.y && state.player.y >= p.y && state.player.vy >= 0){
              state.player.y = p.y; state.player.vy = 0; state.player.onGround = true; state.player.standingPlatform = p;
              break;
            }
          }
        }
    }

    // clamp horizontal movement to world bounds
    if(state.player.x < 0) state.player.x = 0;
    if(state.player.x > state.worldW) state.player.x = state.worldW;
  }

  // detect landing event to spawn particles (if we went from not grounded to grounded)
  if(!prevOnGround && state.player.onGround){
    // spawn a few small dust particles at the player's feet
    for(let i=0;i<8;i++){
      const ang = Math.PI + (Math.random()-0.5);
      const spd = 40 + Math.random()*120;
      state.particles.push({
        x: state.player.x + (Math.random()*8-4),
        y: state.player.y + 4,
        vx: Math.cos(ang)*spd,
        vy: Math.sin(ang)*spd*0.45,
        life: 0.35 + Math.random()*0.5,
        alpha: 1
      });
    }
  }
  // leaving a platform clears the standing reference
  if(prevOnGround && !state.player.onGround) state.player.standingPlatform = null;

  // bullets
  for(let i=state.bullets.length-1;i>=0;i--){
    const b = state.bullets[i];
    b.x += b.vx*dt; b.y += b.vy*dt;
    // remove if offscreen
  if(b.x<0||b.x>state.worldW||b.y<0||b.y>H) state.bullets.splice(i,1);
    else{
      // hit bots
      for(let j=state.bots.length-1;j>=0;j--){
        const bot = state.bots[j];
        if(Math.hypot(bot.x-b.x, bot.y-b.y) < 18){
          bot.health -= 20;
          state.bullets.splice(i,1);
          if(bot.health<=0) state.bots.splice(j,1);
          break;
        }
      }
    }
  }

  // bot bullets movement and collision with player
  for(let i=state.botBullets.length-1;i>=0;i--){
    const b = state.botBullets[i];
    b.x += b.vx*dt; b.y += b.vy*dt;
    // offscreen
  if(b.x<0||b.x>state.worldW||b.y<0||b.y>H){ state.botBullets.splice(i,1); continue; }
    // hit player
    const pd = Math.hypot(b.x - state.player.x, b.y - state.player.y);
    if(pd < 12 && state.running){
      state.player.health -= b.damage || 25;
      state.botBullets.splice(i,1);
      if(state.player.health <= 0){
        state.player.health = 0; state.running = false; hudMsg.innerText = 'You were killed. Press R to restart.';
      }
    }
  }

  // bots simple AI: move toward player x
  for(const bot of state.bots){
    if(Math.abs(bot.x - state.player.x) > 4) bot.x += Math.sign(state.player.x - bot.x) * 60 * dt;
    // damage player if close
    const dist = Math.hypot(bot.x - state.player.x, bot.y - state.player.y);
    if(dist < 28){
      // damage per second while in contact
      state.player.health -= 18 * dt; // ~18 HP/s
      if(state.player.health <= 0){
        state.player.health = 0;
        state.running = false; // stop game updates
        hudMsg.innerText = 'You died. Press R to restart.';
      }
    }

    // bot shooting: cooldown counts down, shoot toward player if in range
    bot.shootCooldown -= dt;
    const shootRange = 300;
    if(bot.shootCooldown <= 0 && dist < shootRange && state.running){
      // create bullet toward player
      const dirx = (state.player.x - bot.x);
      const diry = (state.player.y - bot.y);
      const len = Math.hypot(dirx, diry) || 1;
      const vx = (dirx/len) * 260;
      const vy = (diry/len) * 260;
      state.botBullets.push({x: bot.x, y: bot.y-8, vx, vy, damage:20});
      bot.shootCooldown = 1.2 + Math.random()*1.6; // 1.2-2.8s between shots
    }
  }

  // player touches chests
  for(const c of state.chests){
    if(!c.opened && Math.hypot(c.x - state.player.x, c.y - state.player.y) < 30){
      c.opened = true;
      // give medpack: heal immediately
      state.player.health = Math.min(100, state.player.health + 40);
      hudMsg.innerText = 'Found medpack! Health: ' + Math.round(state.player.health);
    }
  }

  // victory condition: all bots eliminated
  if(state.started && state.running && state.bots.length === 0){
    state.running = false;
    state.victory = true;
    hudMsg.innerText = 'Victory! You eliminated all bots. Press R to restart.';
  }


function draw(){
  ctx.clearRect(0,0,W,H);
  // compute camera X (follow player horizontally)
  const camX = Math.max(0, Math.min(state.player.x - W/2, state.worldW - W));

  // sky
  ctx.fillStyle = '#87ceeb'; ctx.fillRect(0,0,W,H);

  // background hills across the world
  ctx.fillStyle = '#7bb26f';
  for(let hx = -200; hx < state.worldW + 400; hx += 200){
    const sx = hx - camX;
    const hillY = H - 120 - (30 * Math.sin(hx * 0.002));
    ctx.beginPath(); ctx.ellipse(sx + 80, hillY, 120, 60, 0, 0, Math.PI*2); ctx.fill();
  }

  // ground (world-wide)
  ctx.fillStyle = '#228B22'; ctx.fillRect(-camX, H-80, state.worldW, 80);

  // bus (moves along world)
  ctx.fillStyle = '#ffcc00';
  const busScreenX = (state.busX % (state.worldW + 400)) - 200 - camX;
  ctx.fillRect(busScreenX, 40, 160, 36);
  ctx.fillStyle = '#000'; ctx.fillText('BATTLE BUS', busScreenX + 20, 60);

  // platforms
  for(const p of state.platforms){
    const px = p.x - camX; const py = p.y;
    // highlight platform if player is standing on it
    if(p === state.player.standingPlatform){ ctx.fillStyle = '#8b5e3c'; }
    else { ctx.fillStyle = '#654321'; }
    ctx.fillRect(px, py, p.w, 12);
    // small top edge highlight
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(px, py, p.w, 2);
  }

  // trees/decor
  for(const t of state.trees){
    const tx = t.x - camX;
    ctx.fillStyle = '#6b8e23'; ctx.beginPath(); ctx.arc(tx, t.y - 8, 12, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#4b2e1e'; ctx.fillRect(tx-3, t.y-8, 6, 12);
  }

  // chests
  for(const c of state.chests){
    const cx = c.x - camX; ctx.fillStyle = c.opened ? '#444' : '#8B4513';
    ctx.fillRect(cx-12, c.y-12, 24, 24);
  }

  // bots
  for(const b of state.bots){
    const bx = b.x - camX; ctx.fillStyle = '#ff4444'; ctx.fillRect(bx-10, b.y-24, 20, 24);
    // accessory for bot
    if(b.accessory && b.accessory.type !== 'none'){
      const a = b.accessory;
      if(a.type === 'hat'){
        ctx.fillStyle = a.color; ctx.beginPath(); ctx.moveTo(bx-12, b.y-24); ctx.lineTo(bx+12, b.y-24); ctx.lineTo(bx, b.y-44); ctx.closePath(); ctx.fill();
      } else if(a.type === 'backpack'){
        ctx.fillStyle = a.color; ctx.fillRect(bx+10, b.y-18, 8, 18);
      } else if(a.type === 'glasses'){
        ctx.fillStyle = a.color; ctx.fillRect(bx-8, b.y-22, 6, 4); ctx.fillRect(bx+2, b.y-22, 6, 4); ctx.fillStyle = '#000'; ctx.fillRect(bx-2, b.y-22, 4, 1);
      }
    }
  }

  // player
  const playerScreenX = state.player.x - camX;
  ctx.fillStyle = '#0077ff'; ctx.fillRect(playerScreenX-10, state.player.y-28, 20, 28);
  // player accessory
  if(state.player.accessory && state.player.accessory.type !== 'none'){
    const a = state.player.accessory;
    if(a.type === 'hat'){
      // draw a simple hat above head
      ctx.fillStyle = a.color;
      ctx.beginPath(); ctx.moveTo(playerScreenX-12, state.player.y-28); ctx.lineTo(playerScreenX+12, state.player.y-28); ctx.lineTo(playerScreenX, state.player.y-48); ctx.closePath(); ctx.fill();
    } else if(a.type === 'backpack'){
      ctx.fillStyle = a.color; ctx.fillRect(playerScreenX+8, state.player.y-20, 8, 18);
    } else if(a.type === 'glasses'){
      ctx.fillStyle = a.color; ctx.fillRect(playerScreenX-8, state.player.y-22, 6, 4); ctx.fillRect(playerScreenX+2, state.player.y-22, 6, 4); ctx.fillStyle = '#000'; ctx.fillRect(playerScreenX-2, state.player.y-22, 4, 1);
    }
  }
  // health (text and bar)
  ctx.fillStyle = '#000'; ctx.font = '16px sans-serif'; ctx.fillText('Health: '+Math.round(state.player.health), 12, 20);
  // bar background
  ctx.fillStyle = '#222'; ctx.fillRect(12,26,180,12);
  // bar fill (green -> red)
  const hp = Math.max(0, state.player.health)/100;
  const gradW = Math.round(176 * hp);
  ctx.fillStyle = hp > 0.4 ? '#3cb371' : '#ff4444';
  ctx.fillRect(14,28, gradW,8);

  // bullets (camera offset)
  ctx.fillStyle = '#fff';
  for(const b of state.bullets) ctx.fillRect(b.x - camX -3, b.y-3, 6,6);
  // bot bullets
  ctx.fillStyle = '#ffdd55';
  for(const bb of state.botBullets) ctx.fillRect(bb.x - camX -4, bb.y-4, 8,8);

  // particles (dust/landing)
  for(let i=state.particles.length-1;i>=0;i--){
    const p = state.particles[i];
    p.x += p.vx * (1/60);
    p.y += p.vy * (1/60);
    p.vy += 220 * (1/60); // gravity on particles
    p.life -= 1/60;
    p.alpha = Math.max(0, p.life / 0.8);
    if(p.life <= 0) state.particles.splice(i,1);
    else{
      ctx.fillStyle = 'rgba(120,80,40,' + (p.alpha*0.9) + ')';
      ctx.beginPath(); ctx.arc(p.x - camX, p.y, 3, 0, Math.PI*2); ctx.fill();
    }
  }

  // victory overlay (centered, big yellow)
  if(state.victory){
    const title = 'VICTORY!';
    ctx.save();
    // translucent dark backdrop
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, W, H);
    ctx.font = 'bold 84px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffea61'; // yellow
    // drop shadow
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.shadowBlur = 8;
    ctx.fillText(title, W/2, H/2 - 10);
    ctx.font = '20px sans-serif';
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#fff';
    ctx.fillText('You eliminated all bots. Press R to restart.', W/2, H/2 + 48);
    ctx.restore();
  }
}

function loop(ts){
  now = ts; const dt = Math.min(0.05, (now-last)/1000); last = now;
  update(dt); draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
}
