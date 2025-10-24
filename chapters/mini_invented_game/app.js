// Orb Collector — move and collect glowing orbs while avoiding sentry bots
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;
window.addEventListener('resize', ()=>{ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; });

const hudMsg = document.getElementById('message');
const scoreEl = document.getElementById('score');
const overlay = document.getElementById('overlay');

const state = {
  started: false,
  running: true,
  player: {x: W/2, y: H/2, r: 14, vx:0, vy:0, speed: 220, health: 100},
  orbs: [],
  bots: [],
  score: 0,
  target: 8,
  respawnTimer: 0
};

let keys = {};
window.addEventListener('keydown', e=>{ keys[e.code]=true; if(e.code==='Space'){ if(!state.started){ startMatch(); } } if(e.code==='KeyR' && !state.running){ resetMatch(); } });
window.addEventListener('keyup', e=>{ keys[e.code]=false; });

function rand(min,max){ return min + Math.random()*(max-min); }

function spawnOrb(){ state.orbs.push({x: rand(60,W-60), y: rand(60,H-60), r: 8 + Math.random()*6, picked:false, glow: Math.random()*Math.PI*2}); }
function spawnBot(){ const x = Math.random() < 0.5 ? -40 : W+40; const y = rand(60,H-60); state.bots.push({x,y,r:12,vx:0,vy:0,speed: 40+Math.random()*40}); }

function startMatch(){ state.started = true; state.running = true; state.player.x = W/2; state.player.y = H/2; state.player.health = 100; state.orbs = []; state.bots = []; state.score = 0; state.target = 6 + Math.floor(Math.random()*6); state.respawnTimer = 0; for(let i=0;i<state.target;i++) spawnOrb(); for(let i=0;i<3;i++) spawnBot(); hudMsg.innerText = 'Collect the orbs — avoid sentry bots!'; updateScore(); overlay.classList.add('hidden'); }
function resetMatch(){ state.started = false; state.running = true; hudMsg.innerText = 'Collect all orbs! Use WASD or Arrow keys to move.'; overlay.classList.add('hidden'); }

function updateScore(){ scoreEl.innerText = `Orbs: ${state.score} / ${state.target}`; }

function update(dt){ if(!state.started || !state.running) return;
  // player input
  let ax=0, ay=0;
  if(keys['KeyA']||keys['ArrowLeft']) ax -= 1;
  if(keys['KeyD']||keys['ArrowRight']) ax += 1;
  if(keys['KeyW']||keys['ArrowUp']) ay -= 1;
  if(keys['KeyS']||keys['ArrowDown']) ay += 1;
  const len = Math.hypot(ax,ay) || 1; ax/=len; ay/=len;
  state.player.vx = ax * state.player.speed; state.player.vy = ay * state.player.speed;
  state.player.x += state.player.vx * dt; state.player.y += state.player.vy * dt;
  state.player.x = Math.max(20, Math.min(W-20, state.player.x)); state.player.y = Math.max(20, Math.min(H-20, state.player.y));

  // orbs
  for(let i=state.orbs.length-1;i>=0;i--){
    const o = state.orbs[i]; o.glow += dt * 6;
    const d = Math.hypot(o.x - state.player.x, o.y - state.player.y);
    if(d < o.r + state.player.r){ state.score++; state.orbs.splice(i,1); updateScore(); if(state.score >= state.target){ state.running = false; hudMsg.innerText = 'You collected all orbs! Press R to play again.'; overlay.classList.remove('hidden'); overlay.innerText = `You win! Score: ${state.score}`; } }
  }

  // bots: simple chase behaviour, but avoid getting too fast
  for(const b of state.bots){
    const dx = state.player.x - b.x; const dy = state.player.y - b.y; const d = Math.hypot(dx,dy) || 1;
    b.vx = (dx/d) * b.speed; b.vy = (dy/d) * b.speed;
    b.x += b.vx * dt; b.y += b.vy * dt;
    // damage player on contact
    if(Math.hypot(b.x - state.player.x, b.y - state.player.y) < b.r + state.player.r){ state.player.health -= 20 * dt; if(state.player.health <= 0){ state.player.health = 0; state.running = false; hudMsg.innerText = 'You were caught! Press R to try again.'; overlay.classList.remove('hidden'); overlay.innerText = `Game Over — Orbs collected: ${state.score}`; } }
  }

  // respawn orbs gradually
  state.respawnTimer -= dt;
  if(state.orbs.length < state.target && state.respawnTimer <= 0){ spawnOrb(); state.respawnTimer = 1.0 + Math.random()*2.0; }
}

function draw(){ ctx.clearRect(0,0,W,H); // background
  // soft gradient
  const g = ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#071229'); g.addColorStop(1,'#021018'); ctx.fillStyle = g; ctx.fillRect(0,0,W,H);

  // orbs
  for(const o of state.orbs){
    const glow = 0.4 + 0.6 * (0.5 + 0.5*Math.sin(o.glow));
    ctx.beginPath(); ctx.fillStyle = `rgba(120,240,200,${0.2*glow})`; ctx.arc(o.x, o.y, o.r*2.4,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.fillStyle = `rgba(80,220,170,${1*glow})`; ctx.arc(o.x, o.y, o.r,0,Math.PI*2); ctx.fill();
  }

  // bots
  for(const b of state.bots){ ctx.fillStyle = '#ff6b6b'; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill(); ctx.fillStyle='rgba(0,0,0,0.12)'; ctx.fillRect(b.x-b.r, b.y-b.r, b.r*2, 4); }

  // player
  ctx.beginPath(); ctx.fillStyle = '#7ae7ff'; ctx.arc(state.player.x, state.player.y, state.player.r,0,Math.PI*2); ctx.fill();
  // health arc
  ctx.beginPath(); ctx.lineWidth = 4; ctx.strokeStyle = '#ff6b6b'; ctx.arc(state.player.x, state.player.y, state.player.r+6, -Math.PI/2, -Math.PI/2 + (Math.PI*2)*(state.player.health/100)); ctx.stroke(); ctx.lineWidth = 1;

  // HUD
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(8,8,200,46);
  ctx.fillStyle = '#fff'; ctx.font = '16px sans-serif'; ctx.fillText(`Orbs: ${state.score} / ${state.target}`, 16, 28);
  ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif'; ctx.fillText(`Health: ${Math.round(state.player.health)}`, 16, 44);
}

let last = performance.now(); function loop(ts){ const dt = Math.min(0.05, (ts-last)/1000); last = ts; try{ update(dt); draw(); } catch(err){ console.error(err); overlay.classList.remove('hidden'); overlay.innerText = 'Runtime error: '+String(err); state.running = false; } requestAnimationFrame(loop); }
requestAnimationFrame(loop);
