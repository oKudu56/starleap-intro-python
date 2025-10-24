// Space Runner — side-scrolling endless runner in space
// Controls: Space to start / jump (boost), A/D or ←/→ to move horizontally, R to restart
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
  player: {x: 140, y: H/2, r: 16, vy:0, vx:0, gravity: 380, boost: -280},
  asteroids: [],
  fuels: [],
  spawnTimer: 0,
  spawnInterval: 1.1,
  speed: 160,
  score: 0,
  highScore: 0
};

let keys = {};
window.addEventListener('keydown', e=>{ keys[e.code]=true; if(e.code==='Space'){ if(!state.started){ start(); } else if(state.running){ state.player.vy = state.player.boost; } } if(e.code==='KeyR' && !state.running){ restart(); } });
window.addEventListener('keyup', e=>{ keys[e.code]=false; });

function rand(min,max){ return min + Math.random()*(max-min); }
function spawnAsteroid(){ const r = 14 + Math.random()*28; const y = rand(80, H-120); state.asteroids.push({x: W + r + 20, y, r, vx: -(state.speed + Math.random()*120)}); }
function spawnFuel(){ const r = 8; const y = rand(80, H-120); state.fuels.push({x: W + 60, y, r, vx: -(state.speed+40)}); }

function start(){ state.started = true; state.running = true; state.asteroids = []; state.fuels = []; state.score = 0; state.spawnTimer = 0; state.spawnInterval = 1.1; state.player.y = H/2; state.player.vy = 0; hudMsg.innerText = 'Boost with Space to avoid asteroids — collect fuel cells!'; overlay.classList.add('hidden'); }
function restart(){ state.started = false; state.running = true; hudMsg.innerText = 'Press Space to start. Avoid asteroids and collect fuel cells.'; overlay.classList.add('hidden'); }

function update(dt){ if(!state.started) return; if(!state.running) return;
  // horizontal control
  if(keys['KeyA']||keys['ArrowLeft']) state.player.x -= 220*dt;
  if(keys['KeyD']||keys['ArrowRight']) state.player.x += 220*dt;
  state.player.x = Math.max(60, Math.min(W-60, state.player.x));
  // vertical physics
  state.player.vy += state.player.gravity * dt;
  state.player.y += state.player.vy * dt;
  if(state.player.y < 60){ state.player.y = 60; state.player.vy = 0; }
  if(state.player.y > H-80){ state.player.y = H-80; state.player.vy = 0; }

  // spawn
  state.spawnTimer -= dt; if(state.spawnTimer <= 0){ if(Math.random() < 0.7) spawnAsteroid(); else spawnFuel(); state.spawnTimer = state.spawnInterval * (0.8 + Math.random()*0.8); }
  state.spawnInterval = Math.max(0.5, 1.1 - state.score*0.004);

  // move asteroids and fuels
  for(let i=state.asteroids.length-1;i>=0;i--){ const a = state.asteroids[i]; a.x += a.vx * dt; if(a.x < -80) state.asteroids.splice(i,1); else{ const d = Math.hypot(a.x - state.player.x, a.y - state.player.y); if(d < a.r + state.player.r){ // hit
        state.running = false; hudMsg.innerText = 'Ship destroyed! Press R to restart.'; overlay.classList.remove('hidden'); overlay.innerText = `Game Over — Score: ${Math.floor(state.score)}`; state.highScore = Math.max(state.highScore, Math.floor(state.score)); }
    }}
  for(let i=state.fuels.length-1;i>=0;i--){ const f = state.fuels[i]; f.x += f.vx * dt; if(f.x < -80) state.fuels.splice(i,1); else{ const d = Math.hypot(f.x - state.player.x, f.y - state.player.y); if(d < f.r + state.player.r){ state.score += 10; state.fuels.splice(i,1); scoreEl.innerText = 'Score: '+Math.floor(state.score)+' • Best: '+state.highScore; } }}

  // score grows over time
  state.score += dt * 6;
  scoreEl.innerText = 'Score: '+Math.floor(state.score)+' • Best: '+state.highScore;
}

function draw(){ ctx.clearRect(0,0,W,H);
  // starfield
  ctx.fillStyle = '#000812'; ctx.fillRect(0,0,W,H);
  for(let i=0;i<120;i++){ const x = (i*47 + (Date.now()*0.01)%W) % W; const y = (i*31)%H; ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(x,y,1,1); }
  // player
  ctx.save(); ctx.translate(state.player.x, state.player.y);
  ctx.fillStyle = '#7ef9ff'; ctx.beginPath(); ctx.moveTo(-state.player.r, -state.player.r/1.6); ctx.lineTo(state.player.r, 0); ctx.lineTo(-state.player.r, state.player.r/1.6); ctx.closePath(); ctx.fill(); ctx.restore();

  // asteroids
  for(const a of state.asteroids){ ctx.fillStyle = '#8b8680'; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI*2); ctx.fill(); ctx.fillStyle='rgba(0,0,0,0.14)'; ctx.fillRect(a.x - a.r, a.y - a.r, a.r*2, 3); }
  // fuels
  for(const f of state.fuels){ ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI*2); ctx.fill(); ctx.fillStyle='#fff'; ctx.fillRect(f.x-4, f.y-2, 8,4); }

  // HUD
  ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(8,8,160,36);
  ctx.fillStyle = '#fff'; ctx.font = '16px sans-serif'; ctx.fillText('Score: '+Math.floor(state.score), 16, 30);
}

let last = performance.now(); function loop(ts){ const dt = Math.min(0.05, (ts-last)/1000); last = ts; try{ update(dt); draw(); } catch(err){ console.error(err); overlay.classList.remove('hidden'); overlay.innerText = 'Runtime error: '+String(err); state.running = false; } requestAnimationFrame(loop); }
requestAnimationFrame(loop);
