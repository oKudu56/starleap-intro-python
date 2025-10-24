// Tiny Random Generator: haiku, palette, doodle
const haikuEl = document.getElementById('haiku');
const paletteEl = document.getElementById('palette');
const canvas = document.getElementById('doodle');
const ctx = canvas.getContext('2d');
const randomizeBtn = document.getElementById('randomize');
const shareBtn = document.getElementById('share');

function resizeCanvas(){ const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * devicePixelRatio; canvas.height = rect.height * devicePixelRatio; ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); }
window.addEventListener('resize', resizeCanvas); resizeCanvas();

const haikus = [
  ['lonely moonlight', 'a paper boat drifts slowly', 'night hums soft secrets'],
  ['dawn splits the silence', 'coffee breath and city steps', 'a cat folds itself'],
  ['wet leaves remember', 'footprints stitch the morning fog', 'you hum an old song'],
  ['small stone, big ripple', 'the pond keeps your quiet face', 'stars nod, then wink out'],
  ['paper cranes whisper', 'hands fold futures in the light', 'windows fog, then clear']
];

const palettes = [
  ['#0b2447','#1b6ca8','#7fc7ff','#dff6ff'],
  ['#0b3d2e','#136f63','#2ec4b6','#e6fbf2'],
  ['#2f1b4c','#6b2d5c','#ff7eb6','#ffd6e8'],
  ['#071229','#0b4c6b','#7ae7ff','#bff0ff'],
  ['#2b2d42','#8d99ae','#edf2f4','#ef233c']
];

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function renderHaiku(h){ haikuEl.innerHTML = `<strong>${h[0]}</strong><br>${h[1]}<br><em>${h[2]}</em>`; }

function renderPalette(p){ paletteEl.innerHTML = ''; p.forEach(c=>{ const d = document.createElement('div'); d.className='color'; d.style.background=c; d.innerText = c; d.onclick = ()=>{ navigator.clipboard && navigator.clipboard.writeText(c); d.style.outline = '2px solid rgba(255,255,255,0.12)'; setTimeout(()=>d.style.outline='none',400); }; paletteEl.appendChild(d); }); }

function drawDoodle(palette){ resizeCanvas(); ctx.clearRect(0,0,canvas.width, canvas.height);
  const W = canvas.width / devicePixelRatio, H = canvas.height / devicePixelRatio;
  // background wash
  ctx.fillStyle = palette[0]; ctx.fillRect(0,0,W,H);
  // random blobs
  for(let i=0;i<6;i++){
    ctx.beginPath(); ctx.fillStyle = palette[1 + (i% (palette.length-1))];
    const x = Math.random()*W, y = Math.random()*H; const r = 30 + Math.random()*140;
    ctx.ellipse(x,y, r*(0.6+Math.random()*1.2), r*(0.4+Math.random()*1.4), Math.random()*Math.PI*2, 0, Math.PI*2);
    ctx.fill();
  }
  // strokes
  for(let s=0;s<4;s++){
    ctx.beginPath(); ctx.strokeStyle = palette[1 + (s % (palette.length-1))]; ctx.lineWidth = 2 + Math.random()*4;
    const cx = Math.random()*W, cy = Math.random()*H;
    ctx.moveTo(cx, cy);
    for(let k=0;k<5;k++){ ctx.quadraticCurveTo(cx + Math.random()*120-60, cy + Math.random()*120-60, cx + (k+1)*20, cy + Math.random()*40-20); }
    ctx.stroke();
  }
}

function randomize(){ const h = pick(haikus); const p = pick(palettes); renderHaiku(h); renderPalette(p); drawDoodle(p); }

randomizeBtn.addEventListener('click', randomize);
shareBtn.addEventListener('click', ()=>{ const text = haikuEl.innerText + '\nPalette: ' + Array.from(paletteEl.querySelectorAll('.color')).map(n=>n.innerText).join(', '); navigator.clipboard && navigator.clipboard.writeText(text); overlay.classList.remove('hidden'); overlay.innerText = 'Copied to clipboard'; setTimeout(()=>overlay.classList.add('hidden'),900); });

randomize();
