const destinations = [
  ['埃及','尼羅河旁的古老旅程','🏜️','#f7d49e','#d38451','#ebb67d','#8d3a20'],
  ['海洋','跟著洋流探訪珊瑚礁','🐋','#a7e4e4','#338b99','#67bac0','#185269'],
  ['法國','沿著塞納河逛巴黎','🗼','#edc9d9','#b47999','#d99fb4','#813954'],
  ['泰國','搭船逛水上市集，再欣賞星空下的金色佛塔','🛶','#f5db8c','#5da58a','#a6c697','#74480f'],
  ['日本','搭著列車賞櫻與雪山','🗻','#f6cfde','#8b88b5','#d7a4bb','#813950'],
  ['台灣','從山城走到夜市','🏮','#bfe4cb','#529a78','#8ec69a','#175643'],
  ['美國','走過國家公園與城市天際線','🗽','#bddcf3','#bb7861','#eead88','#823f30']
];

const stops = [1, 3, 4, 0, 2, 6, 5].map(index => destinations[index]);
const scenes = [
  ['ocean','ocean.jpg','50% 69%','#235e72'],
  ['thailand','thailand-temples.jpg','50% 54%','#28585c'],
  ['japan','japan.jpg','50% 49%','#75506b'],
  ['egypt','egypt.jpg','50% 51%','#82452e'],
  ['france','france.jpg','50% 47%','#5c607b'],
  ['usa','usa.png','50% 56%','#625479'],
  ['taiwan','taiwan.jpg','50% 50%','#2a665b']
];

const points = [[9,53],[22,28],[36,61],[50,31],[64,63],[78,29],[91,56]];
let previousIsland = -1;
let walk;
function drawMap(show, animate) {
  const map = $('suitcase');
  if (walk) walk.cancel();
  $('start').disabled = false;
  map.hidden = !show;
  if (!show) return;
  map.replaceChildren();
  for (const decoration of ['compass','sailboat','chart-caption']) {
    const mark = document.createElement('span');
    mark.className = 'chart-decoration ' + decoration;
    mark.setAttribute('aria-hidden', 'true');
    if (decoration === 'compass') mark.textContent = '✥';
    if (decoration === 'chart-caption') mark.textContent = '七島航海圖';
    map.append(mark);
  }
  const {clientWidth:width,clientHeight:height} = map;
  for (let index = 1; index < points.length; index++) {
    const [x,y] = points[index - 1];
    const [endX,endY] = points[index];
    const dx = (endX - x) * width / 100;
    const dy = (endY - y) * height / 100;
    const leg = document.createElement('span');
    leg.className = 'route-leg';
    Object.assign(leg.style,{left:x+'%',top:y+'%',width:Math.hypot(dx,dy)+'px',transform:'rotate('+Math.atan2(dy,dx)+'rad)'});
    map.append(leg);
  }
  const landmarks = [0,3,0,1,0,0,0];
  stops.forEach(([name], index) => {
    const island = document.createElement('span');
    island.className = index === level ? 'island current' : 'island';
    [island.style.left,island.style.top] = points[index].map(value => value + '%');
    const landmark = makeCardArt(index, landmarks[index]);
    landmark.classList.add('island-landmark');
    island.append(landmark);
    const label = document.createElement('small');
    label.textContent = name;
    island.append(label);
    map.append(island);
  });
  const traveler = document.createElement('span');
  traveler.className = 'traveler';
  traveler.setAttribute('aria-hidden', 'true');
  for (const part of ['pack','feet','coat','head','hat','scarf']) {
    const shape = document.createElement('span');
    shape.className = 'chef-' + part;
    traveler.append(shape);
  }
  const [x,y] = points[level];
  Object.assign(traveler.style,{left:x+'%',top:y+'%'});
  map.append(traveler);
  if (animate && traveler.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const [fromX,fromY] = points[previousIsland] || [0,63];
    const steps = Array.from({length:9}, (_, step) => {
      const progress = step / 8;
      return {
        left: fromX + (x - fromX) * progress + '%',
        top: fromY + (y - fromY) * progress + '%',
        transform: step % 2 ? 'translateY(-7px) rotate(-7deg)' : 'translateY(0)'
      };
    });
    walk = traveler.animate(steps, {duration:1200, easing:'linear'});
    const start = $('start');
    start.disabled = true;
    $('arrival').hidden = true;
    walk.finished.then(() => {
      $('arrival').hidden = false;
      start.disabled = false;
      start.focus();
    }, () => {});
  }
  if (animate) previousIsland = level;
}

const $ = id => document.getElementById(id);
const boardSizes = [2, 3, 4, 4, 4, 5, 5];
let level = 0;
let phase = 'welcome';
let first = null;
let locked = false;
let found = 0;
let total = 0;
let deadline = 0;
let clock = 0;
let conceal = 0;

function skin() {
  const [name, , landmark, ...colors] = stops[level];
  const [scene,image,crop,card] = scenes[level];
  const root = document.documentElement;
  root.dataset.scene = scene;
  root.style.setProperty('--scene', image ? 'url("scenes/' + image + '")' : 'none');
  root.style.setProperty('--crop', crop);
  root.style.setProperty('--card', card);
  ['sky','ground','far','accent'].forEach((key, i) => document.documentElement.style.setProperty('--' + key, colors[i]));
  $('landmark').textContent = landmark;
  $('route').replaceChildren(...stops.map(([label], index) => {
    const stop = document.createElement('span');
    stop.className = 'stop';
    stop.textContent = label;
    if (index === level) stop.setAttribute('aria-current', 'step');
    return stop;
  }));
  $('destination').textContent = '第 ' + (level + 1) + ' 關 · ' + name;
}

function renderSceneEffects() {
  const layer = $('scene-effects');
  layer.replaceChildren();
  if (phase !== 'boarding' && phase !== 'playing') return;

  const effects = [
    ['bubble', [12,26,41,58,73,88]],
    ['boat', [54,70,82]],
    ['petal', [9,21,36,50,68,81,93]],
    ['camel', [57], [1]],
    ['steam', [43,50,57]],
    ['plane', [0]],
    ['snack', [9,24,39,55,70,87], [0,2,4,7,10,16]]
  ];
  const [kind, positions, illustrations] = effects[level];
  if (kind === 'steam') {
    const cup = makeCardArt(level, 11);
    cup.classList.add('steam-cup');
    layer.append(cup);
  }
  positions.forEach((position, index) => {
    const particle = document.createElement('span');
    particle.className = 'arrival-effect ' + kind;
    particle.style.setProperty('--spot', position + '%');
    particle.style.setProperty('--wait', (index * .46) + 's');
    if (kind === 'petal' || kind === 'snack') {
      const range = (min, max) => min + Math.random() * (max - min);
      particle.style.setProperty('--spot', Math.max(3, Math.min(95, position + range(-7, 7))) + '%');
      particle.style.setProperty('--wait', range(-8, .8) + 's');
      particle.style.setProperty('--fall-time', range(9, 19) + 's');
      particle.style.setProperty('--fall-scale', range(.65, 1.17));
      particle.style.setProperty('--fall-bend', range(-14, 14) + 'vw');
      particle.style.setProperty('--fall-end', range(-17, 17) + 'vw');
      particle.style.setProperty('--fall-start', range(-40, 40) + 'deg');
      particle.style.setProperty('--fall-turn', range(-110, 110) + 'deg');
      particle.style.setProperty('--fall-spin', range(-235, 235) + 'deg');
    }
    if (illustrations) particle.append(makeCardArt(level, illustrations[index]));
    if (kind === 'plane') particle.textContent = '✈';
    layer.append(particle);
  });
}

function showScreen(nextPhase) {
  clearInterval(clock);
  clearTimeout(conceal);
  phase = nextPhase;
  skin();
  renderSceneEffects();
  const [name, scene] = stops[level];
  const dimension = boardSizes[level];
  const seconds = 20 + 10 * level;
  const copy = {
    welcome: ['七站旅行 · 記憶配對', '旅行的記憶', '準備好出發了嗎？找出相同圖案，每配對一次就多 5 秒。', '開始遊戲'],
    boarding: ['第 ' + (level + 1) + ' 關 · ' + dimension + ' × ' + dimension + ' · ' + seconds + ' 秒', '前往' + name, scene, '開始翻牌'],
    expired: ['第 ' + (level + 1) + ' 關 · ' + name, '時間到囉', '再試一次，完成這一站就能繼續旅行。', '重試本關'],
    won: ['七站旅行完成', '環遊成功！', '你收集了七站的回憶，旅程圓滿結束。', '再旅行一次']
  }[phase];
  ['eyebrow','title','description','start'].forEach((id, index) => { $(id).textContent = copy[index]; });
  $('play').hidden = true;
  $('intro').hidden = false;
  $('intro').dataset.phase = phase;
  $('arrival').hidden = false;
  drawMap(phase === 'boarding' || phase === 'won', phase === 'boarding');
  refreshMusic();
  if (phase === 'expired') cue([67,64,60], .19);
  if (phase === 'won') cue([72,76,79,84], .16);
  const arrival = $('arrival');
  if (phase === 'boarding') {
    arrival.setAttribute('role', 'dialog');
    arrival.setAttribute('aria-modal', 'true');
    arrival.setAttribute('aria-labelledby', 'title');
  } else {
    arrival.removeAttribute('role');
    arrival.removeAttribute('aria-modal');
    arrival.removeAttribute('aria-labelledby');
  }
  if (phase !== 'welcome') $('start').focus();
}

function updateClock() {
  const remaining = Math.max(0, Math.ceil((deadline - performance.now()) / 1000));
  $('timer').textContent = '剩餘 ' + remaining + ' 秒';
  if (remaining === 0 && phase === 'playing') showScreen('expired');
}

function startLevel() {
  const size = boardSizes[level];
  total = Math.floor(size * size / 2);
  found = 0;
  first = null;
  locked = false;
  const fromBoarding = phase === 'boarding';
  phase = 'playing';
  if (!fromBoarding) renderSceneEffects();
  const symbols = travelDecks[level][0].split(' ').slice(0, total);
  const cards = [...symbols, ...symbols];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  if (size % 2) cards.splice(total, 0, null);
  const board = $('board');
  board.style.setProperty('--size', size);
  board.replaceChildren(...cards.map((symbol, index) => {
    if (!symbol) {
      const stamp = document.createElement('span');
      stamp.className = 'stamp';
      stamp.setAttribute('role', 'img');
      stamp.setAttribute('aria-label', '旅行行李箱，這格不能翻牌');
      return stamp;
    }
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card';
    const label = '第 ' + (index + 1) + ' 張卡片';
    function turn(over) {
      card.classList.toggle('flipped', over);
      card.textContent = over ? '' : '✦';
      if (over) card.append(makeCardArt(level, symbols.indexOf(symbol)));
      card.setAttribute('aria-label', over ? label + ' ' + symbol : label);
    }
    turn(false);
    card.addEventListener('click', () => {
      if (locked || card.classList.contains('flipped') || phase !== 'playing') return;
      if (performance.now() >= deadline) {
        updateClock();
        return;
      }
      turn(true);
      if (!first) {
        first = {card, symbol, turn};
        return;
      }
      const previous = first;
      first = null;
      if (previous.symbol === symbol) {
        for (const match of [previous.card, card]) {
          match.classList.add('matched');
          match.setAttribute('aria-disabled', 'true');
        }
        cue([79,84], .11);
        deadline += 5000;
        found++;
        updateClock();
        $('pairs').textContent = found + ' / ' + total + ' 對';
        $('feedback').textContent = '配對成功，＋5 秒！';
        if (found === total) {
          clearInterval(clock);
          locked = true;
          conceal = setTimeout(() => {
            
            if (level === stops.length - 1) showScreen('won');
            else {
              level++;
              showScreen('boarding');
            }
          }, 600);
        }
      } else {
        locked = true;
        $('feedback').textContent = '再找找看';
        conceal = setTimeout(() => {
          turn(false);
          previous.turn(false);
          locked = false;
        }, 680);
      }
    });
    return card;
  }));
  $('pairs').textContent = '0 / ' + total + ' 對';
  $('feedback').textContent = '';
  $('intro').hidden = true;
  $('play').hidden = false;
  board.querySelector('button').focus();
  deadline = performance.now() + (20 + level * 10) * 1000;
  updateClock();
  clock = setInterval(updateClock, 100);
}

$('start').addEventListener('click', () => {
  if (phase === 'welcome' || phase === 'won') {
    level = 0;
    previousIsland = -1;
    showScreen('boarding');
  } else startLevel();
  if (musicEnabled && !audio) startMusic();
});


let musicEnabled = true;
let audio;
let bus;
let melody;
let surf;
let activeTrack = -1;
const tracks = [
  {step:.42, wave:'sine', notes:[72,76,79,81,79,76,74,67], bass:[48,53,55,48]},
  {step:.24, wave:'triangle', notes:[74,77,79,81,84,81,79,77,74,72,77,74], bass:[50,55,57,50]},
  {step:.33, wave:'triangle', notes:[69,70,74,76,77,null,76,74,70,69,65,69], bass:[45,46,50,45]},
  {step:.31, wave:'triangle', notes:[62,63,66,67,69,67,66,63,62,66,63,62], bass:[50,50,55,50]},
  {step:.29, wave:'triangle', notes:[72,76,79,81,79,76,74,77,81,79,74,71], bass:[48,48,55,53]},
  {step:.27, wave:'triangle', notes:[67,70,72,73,74,77,74,72,70,67,65,67], bass:[43,48,50,43]},
  {step:.32, wave:'sine', notes:[72,74,76,79,81,79,76,74,76,81,79,72], bass:[48,53,55,48]}
];
function note(key, onset, duration, gain, wave, output) {
  if (key === null) return;
  const tone = audio.createOscillator();
  const envelope = audio.createGain();
  tone.type = wave;
  tone.frequency.value = 440 * 2 ** ((key - 69) / 12);
  envelope.gain.setValueAtTime(.0001, onset);
  envelope.gain.exponentialRampToValueAtTime(gain, onset + .025);
  envelope.gain.exponentialRampToValueAtTime(.0001, onset + duration);
  tone.connect(envelope).connect(output);
  tone.start(onset);
  tone.stop(onset + duration);
}
function cue(notes, step) {
  if (!audio || !bus || audio.state !== 'running') return;
  const start = audio.currentTime + .02;
  notes.forEach((key,i) => note(key,start+i*step,.3,.045,'sine',bus));
}
function startSurf() {
  const buffer = audio.createBuffer(1,audio.sampleRate*4,audio.sampleRate);
  const data = buffer.getChannelData(0);
  let sample = 0;
  for (let i = 0; i < data.length; i++) {
    sample = .96 * sample + .04 * (Math.random()*2-1);
    const swell = .25 + .75 * Math.sin(Math.PI*i/data.length)**2;
    data[i] = sample * swell;
  }
  surf = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 520;
  surf.buffer = buffer;
  surf.loop = true;
  surf.connect(filter).connect(bus);
  surf.start();
}
function stopMusic() {
  clearInterval(melody);
  if (surf) {
    surf.stop();
    surf = undefined;
  }
  if (bus) {
    bus.disconnect();
    bus = undefined;
  }
  activeTrack = -1;
}
function refreshMusic() {
  if (!audio || audio.state !== 'running' || activeTrack === level) return;
  stopMusic();
  activeTrack = level;
  bus = audio.createGain();
  bus.gain.value = .72;
  bus.connect(audio.destination);
  const {step,wave,notes,bass} = tracks[level];
  if (level === 0) startSurf();
  const french = level === 4;
  const swing = level === 5;
  const beats = french ? 3 : 4;
  const beat = step * 2;
  const duration = beats * beat;
  const motif = notes.filter(key => key !== null);
  const changes = [0,1,0,2,0,1,3,2,1,2,3,1,2,3,1,2,0,3,2,1,3,2,1,2,0,1,2,0,3,2,1,0];
  const rhythms = [
    [0,1,2,3,4,5,6,7],
    [0,2,3,5,6],
    [0,1,3,4,6,7],
    [0,2,4,7]
  ];
  let bar = 0;
  let barStart = audio.currentTime + .06;

  function scheduleBar() {
    const section = Math.floor(bar / 8);
    const measure = bar % 8;
    const root = bass[changes[bar]];
    const shift = root - bass[0];
    const last = bar === changes.length - 1;
    const eighths = beats * 2;
    const rhythm = rhythms[(measure + section) % rhythms.length].filter(slot => slot < eighths);
    const offset = (measure * 3 + section * 2) % motif.length;
    note(root,barStart,beat*1.35,.052,'sine',bus);
    for (let pulse = 1; pulse < beats; pulse++) {
      const harmony = pulse % 2 ? 7 : 12;
      note(root+harmony,barStart+pulse*beat,beat*.72,.028,wave,bus);
      if (french) note(root+15,barStart+pulse*beat,beat*.52,.019,'triangle',bus);
    }
    if (last) {
      note(motif[0],barStart,duration*.85,.08,wave,bus);
    } else {
      rhythm.forEach((slot, index) => {
        if (bar < 2 && index % 2) return;
        const position = section === 1 ? offset - index + motif.length : offset + index;
        const pitch = motif[position % motif.length] + (section === 2 ? shift : section === 3 && measure < 4 ? -12 : 0);
        const onset = barStart + slot*step + (swing && slot % 2 ? step*.2 : 0);
        const gap = (rhythm[index+1] ?? eighths) - slot;
        note(pitch,onset,Math.min(gap*.92,2.9)*step,.071,wave,bus);
      });
    }
    bar = (bar + 1) % changes.length;
    barStart += duration + (last ? beat*2 : 0);
  }

  function schedule() {
    const now = audio.currentTime;
    if (barStart < now - duration) barStart = now + .04;
    while (barStart <= now + .85) scheduleBar();
  }

  schedule();
  melody = setInterval(schedule, 180);
}
async function startMusic() {
  const Audio = window.AudioContext || window.webkitAudioContext;
  let context;
  try {
    context = new Audio();
    audio = context;
    await context.resume();
    if (audio === context && musicEnabled) refreshMusic();
  } catch {
    if (audio !== context) return;
    stopMusic();
    audio = undefined;
    if (context) context.close().catch(() => {});
  }
}

$('music').addEventListener('click', () => {
  musicEnabled = !musicEnabled;
  const button = $('music');
  button.setAttribute('aria-pressed', String(musicEnabled));
  button.textContent = musicEnabled ? '♫ 音樂開啟' : '♫ 音樂關閉';
  if (musicEnabled) {
    startMusic();
  } else if (audio) {
    const context = audio;
    stopMusic();
    audio = undefined;
    context.close().catch(() => {});
  }
});
$('arrival').addEventListener('keydown', event => {
  if (phase === 'boarding' && event.key === 'Tab') {
    event.preventDefault();
    $('start').focus();
  }
});
showScreen('welcome');


























