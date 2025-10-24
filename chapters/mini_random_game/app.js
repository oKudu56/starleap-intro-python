// Dodge! — small dependency-free Canvas game
// Move left/right and avoid falling blocks. Press Space to start. R to restart.
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
  running: true,
  started: false,
  player: {x: W/2, y: H - 80, w: 36, h: 24, vx: 0},
  obstacles: [],
  spawnTimer: 0,
  spawnInterval: 1.0,
  speedScale: 1,
  score: 0,
  highScore: 0
};

let keys = {};
window.addEventListener('keydown', (e)=>{ keys[e.code] = true;
  if(e.code === 'Space'){
    if(!state.started){
      state.started = true; state.running = true; state.score = 0; state.obstacles.length = 0; state.spawnInterval = 1.0; state.speedScale = 1;
      hudMsg.innerText = 'Dodge the blocks!'; overlay.classList.add('hidden');
    } else if(!state.running){ /* nothing */ }
  }
  if(e.code === 'KeyR' && !state.running){
    // restart
    state.started = false; state.running = true; state.obstacles.length = 0; state.spawnTimer = 0;
    hudMsg.innerText = 'Press Space to start. Move with A/D or ◀︎/▶︎. Avoid falling blocks!';
    overlay.classList.add('hidden');
  }
});
window.addEventListener('keyup',(e)=>{ keys[e.code]=false; });

function spawnObstacle(){
  const w = 20 + Math.random()*60;
  const x = Math.random() * (W - w);
  const speed = 80 + Math.random()*120 + state.speedScale*30;
  state.obstacles.push({x, y: -40, w, h: 18, vy: speed});
}

function rectsOverlap(a,b){
  return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
}

let last = performance.now();
function update(dt){
  if(!state.started) return;
  if(!state.running) return;
  // player
  const moveSpeed = 280;
  if(keys['KeyA'] || keys['ArrowLeft']) state.player.x -= moveSpeed * dt;
  if(keys['KeyD'] || keys['ArrowRight']) state.player.x += moveSpeed * dt;
  state.player.x = Math.max(6, Math.min(W - state.player.w - 6, state.player.x));

  // spawn obstacles
  state.spawnTimer -= dt;
  if(state.spawnTimer <= 0){ spawnObstacle(); state.spawnTimer = state.spawnInterval * (0.8 + Math.random()*0.6); }

  // speed up gradually
  state.speedScale += dt * 0.06;
  state.spawnInterval = Math.max(0.25, 1.0 - state.speedScale*0.08);

  // move obstacles
  for(let i=state.obstacles.length-1;i>=0;i--){
    const o = state.obstacles[i];
    o.y += o.vy * dt * (1 + state.speedScale*0.25);
    if(o.y > H + 60) state.obstacles.splice(i,1);
    else{
      if(rectsOverlap({x:state.player.x, y:state.player.y, w:state.player.w, h:state.player.h}, o)){
        // hit
        state.running = false;
        hudMsg.innerText = 'You were hit! Press R to restart.';
        overlay.classList.remove('hidden');
        overlay.innerText = `Game Over — Score: ${Math.floor(state.score)}\nPress R to restart`;
        state.highScore = Math.max(state.highScore, Math.floor(state.score));
      }
    }
  }

  // score
  state.score += dt * 10 * (1 + state.speedScale*0.5);
  scoreEl.innerText = 'Score: ' + Math.floor(state.score) + (state.highScore ? ' • Best: '+state.highScore : '');
}

function draw(){
  // background
  ctx.fillStyle = '#121218'; ctx.fillRect(0,0,W,H);
  // ground line
  ctx.fillStyle = '#222'; ctx.fillRect(0, H-60, W, 60);

  // player
  ctx.fillStyle = '#4cc9f0'; ctx.fillRect(state.player.x, state.player.y, state.player.w, state.player.h);
  ctx.fillStyle = '#0b3d49'; ctx.fillRect(state.player.x, state.player.y + state.player.h - 6, state.player.w, 6);

  // obstacles
  for(const o of state.obstacles){
    ctx.fillStyle = '#ff6b6b'; ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(o.x, o.y, o.w, 3);
  }

  // HUD
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(8,8,140,36);
  ctx.fillStyle = '#fff'; ctx.font = '16px sans-serif'; ctx.fillText('Score: '+Math.floor(state.score), 16, 30);
}

function loop(ts){
  const dt = Math.min(0.05, (ts - last)/1000); last = ts;
  try{ update(dt); draw(); }
  catch(err){ console.error(err); overlay.classList.remove('hidden'); overlay.innerText = 'Runtime error: '+String(err); state.running = false; }
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
