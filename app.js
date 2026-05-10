/* ============================
   FocusFlow — app.js
   ============================ */

// ─── CONSTANTS ───────────────────────────────────────────────────
const PHASES = [
  { id: 'dawn', label: '집중 시작', icon: '🌅', minMinutes: 0, color: '#ff6b9d' },
  { id: 'morning', label: '워밍업', icon: '☀️', minMinutes: 25, color: '#ffd200' },
  { id: 'flow', label: '플로우 상태', icon: '🌿', minMinutes: 60, color: '#43cea2' },
  { id: 'deep', label: '딥 포커스', icon: '🔮', minMinutes: 120, color: '#8e54e9' },
  { id: 'zone', label: '존 돌입 🔥', icon: '⚡', minMinutes: 180, color: '#e040fb' },
];

// Manual phase offset applied on top of auto-computed phase
// +1 means one step higher, -1 means one step lower, etc.

const QUOTES = [
  { text: '작은 진전도 진전이다.', author: '익명' },
  { text: '집중은 최고의 형태의 지능이다.', author: '아인슈타인' },
  { text: '오늘 하루를 최선으로 살아라.', author: '칸트' },
  { text: '규율은 목표와 성취 사이의 다리다.', author: '짐 론' },
  { text: '성공은 매일의 작은 노력들의 합이다.', author: '로버트 콜리어' },
  { text: '지금 이 순간에 집중하라.', author: '마르쿠스 아우렐리우스' },
  { text: '시작이 반이다.', author: '아리스토텔레스' },
  { text: '천 리 길도 한 걸음부터.', author: '노자' },
  { text: '천재는 1%의 영감과 99%의 노력이다.', author: '에디슨' },
  { text: '배움에는 끝이 없다.', author: '공자' },
];

// ─── TOUHOU DATA ─────────────────────────────────────────────────────
const TOUHOU_QUOTES = [
  { text: '이 세상에 내가 해결 못할 일은 없어. 하쿠레이 레이무가 직접 나설게.', author: '하쿠레이 레이무 「봉래의 약」' },
  { text: '마스터 스파크! 노력보다 중요한 건 집중력이야. 나는 그걸 알고 있어!', author: '기리사메 마리사 「마법의 숲」' },
  { text: '시간은 내 손안에 있어. 지금 이 순간에 최선의 집중을 다해.', author: '이사요이 사쿠야 「홍마관」' },
  { text: '내 안에 있는 힘을 꺼내봐. 그게 바로 진짜 집중이야!', author: '플란드르 스카를렛 「붉은 안개의 관」' },
  { text: '감정에 휘둘리지 않는 것, 그게 집중의 시작이야.', author: '코치야 코코로 「신령묘」' },
  { text: '환상향에는 환상의 힘이 있어. 그 힘이 바로 너의 집중력이야.', author: '야쿠모 유카리 「봉래의 약」' },
  { text: '쉬운 일은 없어. 하지만 집중하면 못 해낼 일도 없지.', author: '히나나위 텐시 「천공의 마을」' },
  { text: '살아있다는 것의 의미를 알고 싶다면, 먼저 지금 이 순간에 집중해봐.', author: '코치야 사나에 「신의 바람 사당」' },
  { text: '다음 스펠카드가 기다리고 있어 — 내 집중력에 응답하라!', author: '레미리아 스카를렛 「홍마관」' },
  { text: '집중하지 않으면 탄막에 맞아. 자, 정신 차려!', author: '치르노 「안개의 호수」' },
];

const TOUHOU_PHASES = [
  { id: 'dawn', label: '레이무의 음양옥', icon: '☯️', charName: '레이무', spellName: '음양옥 결계', spellKR: '「음양의 경계」' },
  { id: 'morning', label: '마리사의 마스터 스파크', icon: '⭐️', charName: '마리사', spellName: '마스터 스파크', spellKR: '「극광의 빛줄기」' },
  { id: 'flow', label: '사쿠야의 시간 조작', icon: '⏱️', charName: '사쿠야', spellName: '은빛 결계', spellKR: '「시간이 멈춘 세계」' },
  { id: 'deep', label: '플란드르의 금단', icon: '✨', charName: '플란드르', spellName: '포 오브 어 카인드', spellKR: '「파괴의 네 자매」' },
  { id: 'zone', label: '레미리아의 홍안결', icon: '🔥', charName: '레미리아', spellName: '스칼렛 마이스터', spellKR: '「진홍의 지배자」' },
];

const DANMAKU_COLORS = [
  '#ff3a5c', '#ff6688', '#ff88aa',
  '#ffd700', '#ffec80', '#ffb347',
  '#88ccff', '#aaddff', '#cceeff',
  '#ff44aa', '#ff88cc', '#ffaadd',
  '#ff1111', '#ff4444', '#ff6666',
];

const CHERRY_EMOJIS = ['🌸', '🌸', '🌸', '❅', '❆', '❊'];

let touhouMode = false;
let danmakuInterval = null;

const CIRCUMFERENCE = 2 * Math.PI * 130; // ~816.8


// ─── STATE ───────────────────────────────────────────────────────
let settings = {
  focusDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsGoal: 8,
  autoStart: false,
  sound: true,
};

let state = {
  mode: 'focus',
  running: false,
  timeLeft: 0,
  totalSeconds: 0,
  sessionNum: 1,
  streak: 0,
  longestStreak: 0,
  todayFocusMinutes: 0,
  todayCompletedSessions: 0,
  totalFocusMinutes: 0,
  totalSessions: 0,
  currentPhase: PHASES[0],
  phaseManualOffset: 0,   // user-controlled ±offset on top of auto phase
  tasks: [],
  sessionHistory: [],   // {id, duration, phase, time, date}
  weekData: [0, 0, 0, 0, 0, 0, 0],
  tickInterval: null,
  quoteIdx: 0,
};

// ─── DOM REFS ─────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const body = document.body;

const els = {
  timerDisplay: $('timerDisplay'),
  timerLabel: $('timerLabel'),
  sessionCount: $('sessionCount'),
  streakCount: $('streakCount'),
  startBtn: $('startBtn'),
  startBtnIcon: $('startBtnIcon'),
  resetBtn: $('resetBtn'),
  skipBtn: $('skipBtn'),
  ringProgress: $('ringProgress'),
  ringGlow: $('ringGlow'),
  ringDot: $('ringDot'),
  timerSvg: $('timerSvg'),
  phaseIcon: $('phaseIcon'),
  phaseLabel: $('phaseLabel'),
  phaseBanner: $('phaseBanner'),
  todayTime: $('todayTime'),
  todaySessions: $('todaySessions'),
  todayGoal: $('todayGoal'),
  goalPercent: $('goalPercent'),
  quoteText: $('quoteText'),
  quoteAuthor: $('quoteAuthor'),
  taskList: $('taskList'),
  taskInput: $('taskInput'),
  taskInputWrap: $('taskInputWrapper'),
  toast: $('toast'),
  statsModal: $('statsModal'),
  settingsModal: $('settingsModal'),
  particles: $('particles'),
};

// ─── AUDIO ───────────────────────────────────────────────────────
const audioCtx = window.AudioContext ? new AudioContext() : null;

function playTone(freq, dur, type = 'sine', gain = 0.3) {
  if (!audioCtx || !settings.sound) return;
  const osc = audioCtx.createOscillator();
  const gn = audioCtx.createGain();
  osc.connect(gn); gn.connect(audioCtx.destination);
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  osc.type = type;
  gn.gain.setValueAtTime(gain, audioCtx.currentTime);
  gn.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  osc.start(); osc.stop(audioCtx.currentTime + dur);
}

function playTick() { playTone(880, 0.05, 'sine', 0.05); }
function playComplete() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.3, 'sine', 0.25), i * 120));
}
function playBreak() {
  [784, 659, 523].forEach((f, i) => setTimeout(() => playTone(f, 0.3, 'sine', 0.2), i * 100));
}

// ─── NATURE LAYER ────────────────────────────────────────────────
function spawnNature() {
  const layer = document.getElementById('natureLayer');
  if (!layer) return;

  // Seaweed / plants along the bottom
  const plants = ['🌿', '🪴', '🌱', '🍀', '🌾', '🪸'];
  const plantCount = 8;
  for (let i = 0; i < plantCount; i++) {
    const el = document.createElement('div');
    el.className = 'seaweed';
    el.textContent = plants[Math.floor(Math.random() * plants.length)];
    el.style.left = `${5 + (i / plantCount) * 90 + Math.random() * 4}%`;
    el.style.fontSize = `${1.4 + Math.random()}rem`;
    el.style.animationDuration = `${2.5 + Math.random() * 3}s`;
    el.style.animationDelay = `${Math.random() * 2}s`;
    layer.appendChild(el);
  }

  // Fish swimming
  const fishEmoji = ['🐟', '🐠', '🐡', '🐟', '🦑'];
  for (let i = 0; i < 5; i++) {
    const el = document.createElement('div');
    el.className = 'fish' + (Math.random() > 0.5 ? ' rtl' : '');
    el.textContent = fishEmoji[Math.floor(Math.random() * fishEmoji.length)];
    el.style.top = `${10 + Math.random() * 70}%`;
    el.style.animationDuration = `${18 + Math.random() * 20}s`;
    el.style.animationDelay = `${-Math.random() * 20}s`;
    el.style.fontSize = `${1.1 + Math.random() * 0.8}rem`;
    layer.appendChild(el);
  }

  // Bubbles
  for (let i = 0; i < 10; i++) {
    const el = document.createElement('div');
    el.className = 'bubble';
    const size = 6 + Math.random() * 14;
    el.style.width = el.style.height = `${size}px`;
    el.style.left = `${Math.random() * 95}%`;
    el.style.bottom = `${Math.random() * 30}%`;
    el.style.animationDuration = `${8 + Math.random() * 12}s`;
    el.style.animationDelay = `${-Math.random() * 12}s`;
    layer.appendChild(el);
  }

  // Drifting leaves
  const leafEmoji = ['🍂', '🍃', '🌸', '✿', '❀'];
  for (let i = 0; i < 4; i++) {
    const el = document.createElement('div');
    el.className = 'leaf';
    el.textContent = leafEmoji[Math.floor(Math.random() * leafEmoji.length)];
    el.style.left = `${Math.random() * 85}%`;
    el.style.top = `-30px`;
    el.style.animationDuration = `${20 + Math.random() * 20}s`;
    el.style.animationDelay = `${-Math.random() * 20}s`;
    layer.appendChild(el);
  }
}

function spawnParticles(n = 12) {
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      left:${Math.random() * 100}%;
      width:${size}px; height:${size}px;
      animation-duration:${6 + Math.random() * 10}s;
      animation-delay:${Math.random() * 8}s;
      opacity:${0.3 + Math.random() * 0.5};
    `;
    els.particles.appendChild(p);
  }
}

// ─── PHASE ───────────────────────────────────────────────────────
function getPhase(minutes) {
  let baseIdx = 0;
  for (let i = 0; i < PHASES.length; i++) {
    if (minutes >= PHASES[i].minMinutes) baseIdx = i;
  }
  // Apply manual offset, clamped to valid range
  const idx = Math.max(0, Math.min(PHASES.length - 1, baseIdx + state.phaseManualOffset));
  return PHASES[idx];
}

function applyPhase(phase) {
  body.dataset.phase = phase.id;
  els.phaseIcon.textContent = phase.icon;
  els.phaseLabel.textContent = phase.label;
  // brief banner flash
  els.phaseBanner.style.transform = 'scale(1.05)';
  setTimeout(() => { els.phaseBanner.style.transform = ''; }, 400);
  // Update manual phase control buttons
  updatePhaseControls();
}

function updatePhaseControls() {
  const currentIdx = PHASES.indexOf(state.currentPhase);
  const downBtn = document.getElementById('phaseDownBtn');
  const upBtn = document.getElementById('phaseUpBtn');
  if (downBtn) downBtn.disabled = currentIdx <= 0;
  if (upBtn) upBtn.disabled = currentIdx >= PHASES.length - 1;
}

function shiftPhase(delta) {
  state.phaseManualOffset += delta;
  const newPhase = getPhase(state.todayFocusMinutes);
  if (newPhase.id !== state.currentPhase.id) {
    state.currentPhase = newPhase;
    applyPhase(newPhase);
    const dir = delta > 0 ? '⬆️' : '⬇️';
    showToast(`${dir} 단계 조정: ${newPhase.label}`);
  }
  saveState();
}

// ─── RING ─────────────────────────────────────────────────────────
function updateRing(fraction) {
  // fraction 1 = full, 0 = empty
  const offset = CIRCUMFERENCE * (1 - fraction);
  els.ringProgress.style.strokeDashoffset = offset;
  els.ringGlow.style.strokeDashoffset = offset;

  // Rotate dot along the ring — follows the END of the filled arc.
  // The CSS rotates the entire SVG by -90deg, so 0° in SVG = 3-o'clock = screen top.
  // The arc starts at 3-o'clock (SVG) and fills clockwise, covering fraction * 360°.
  // The dot must use the same SVG coordinate origin — no -90 correction needed.
  const angle = fraction * 360; // degrees clockwise from 3-o'clock (SVG space)
  const rad = angle * Math.PI / 180;
  const cx = 150 + 130 * Math.cos(rad);
  const cy = 150 + 130 * Math.sin(rad);
  els.ringDot.setAttribute('cx', cx);
  els.ringDot.setAttribute('cy', cy);
}

// ─── TIMER CORE ──────────────────────────────────────────────────
function getDuration() {
  if (state.mode === 'focus') return settings.focusDuration * 60;
  if (state.mode === 'short') return settings.shortBreak * 60;
  return settings.longBreak * 60;
}

function resetTimer(silent = false) {
  clearInterval(state.tickInterval);
  state.running = false;
  state.timeLeft = getDuration();
  state.totalSeconds = getDuration();
  updateDisplay();
  updateRing(1);
  els.startBtnIcon.textContent = '▶';
  els.timerSvg.classList.remove('ring-complete');
  if (!silent) updateTodayStats();
}

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateDisplay() {
  els.timerDisplay.textContent = formatTime(state.timeLeft);
  document.title = `${formatTime(state.timeLeft)} — FocusFlow`;
}

function tick() {
  if (state.timeLeft <= 0) {
    handleComplete();
    return;
  }
  state.timeLeft--;
  updateDisplay();
  updateRing(state.timeLeft / state.totalSeconds);

  // Subtle tick in last 10s
  if (state.mode === 'focus' && state.timeLeft <= 10 && state.timeLeft > 0) playTick();
}

function handleComplete() {
  clearInterval(state.tickInterval);
  state.running = false;
  els.startBtnIcon.textContent = '▶';
  els.timerSvg.classList.add('ring-complete');
  updateRing(0);

  if (state.mode === 'focus') {
    const dur = settings.focusDuration;
    state.todayFocusMinutes += dur;
    state.totalFocusMinutes += dur;
    state.todayCompletedSessions++;
    state.totalSessions++;
    state.streak++;
    if (state.streak > state.longestStreak) state.longestStreak = state.streak;

    // Record session
    const now = new Date();
    state.sessionHistory.unshift({
      id: Date.now(),
      duration: dur,
      phase: state.currentPhase.label,
      phaseIcon: state.currentPhase.icon,
      time: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      date: now.toDateString(),
    });
    // Keep at most 50 records
    if (state.sessionHistory.length > 50) state.sessionHistory.pop();

    const dayIdx = (new Date().getDay() + 6) % 7;
    state.weekData[dayIdx] += dur;

    const newPhase = getPhase(state.todayFocusMinutes);
    if (newPhase.id !== state.currentPhase.id) {
      state.currentPhase = newPhase;
      applyPhase(newPhase);
      showToast(`🎉 새 단계 달성: ${newPhase.label}!`);
    } else {
      showToast('✅ 집중 세션 완료! 잘했어요!');
    }

    playComplete();
    updateTodayStats();
    renderSessionHistory();
    els.streakCount.textContent = state.streak;
    saveState();
    cycleQuote();

    if (state.todayCompletedSessions % 4 === 0) {
      setTimeout(() => setMode('long'), 1000);
    } else {
      setTimeout(() => setMode('short'), 1000);
    }
  } else {
    playBreak();
    showToast('☕ 휴식 종료! 다시 집중해볼까요?');
    state.sessionNum++;
    els.sessionCount.textContent = `세션 ${state.sessionNum}`;
    setTimeout(() => setMode('focus'), 1000);
  }
}

function startStop() {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  state.running = !state.running;
  if (state.running) {
    els.startBtnIcon.textContent = '⏸';
    els.timerLabel.textContent = state.mode === 'focus' ? '집중 중...' : '휴식 중...';
    state.tickInterval = setInterval(tick, 1000);
  } else {
    els.startBtnIcon.textContent = '▶';
    els.timerLabel.textContent = '일시정지';
    clearInterval(state.tickInterval);
  }
}

function setMode(mode) {
  state.mode = mode;
  body.dataset.mode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
    b.setAttribute('aria-selected', b.dataset.mode === mode);
  });
  const labels = { focus: '집중할 시간이에요', short: '잠깐 쉬어가요 ☕', long: '충분히 쉬어요 😌' };
  els.timerLabel.textContent = labels[mode];
  resetTimer(true);
}

// ─── STATS DISPLAY ───────────────────────────────────────────────
function updateTodayStats() {
  const mins = state.todayFocusMinutes;
  els.todayTime.textContent = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}분`;
  els.todaySessions.textContent = state.todayCompletedSessions;
  const pct = Math.min(100, Math.round((state.todayCompletedSessions / settings.sessionsGoal) * 100));
  els.goalPercent.textContent = `${pct}%`;
  els.todayGoal.textContent = pct >= 100 ? '🏆 달성!' : '목표 달성';
}

// ─── QUOTE ───────────────────────────────────────────────────────
function cycleQuote() {
  const pool = touhouMode ? TOUHOU_QUOTES : QUOTES;
  state.quoteIdx = (state.quoteIdx + 1) % pool.length;
  const q = pool[state.quoteIdx];
  els.quoteText.style.opacity = '0';
  setTimeout(() => {
    els.quoteText.textContent = `"${q.text}"`;
    els.quoteAuthor.textContent = `— ${q.author}`;
    els.quoteText.style.opacity = '1';
  }, 300);
}

function showTouhouQuote() {
  const q = TOUHOU_QUOTES[Math.floor(Math.random() * TOUHOU_QUOTES.length)];
  els.quoteText.style.opacity = '0';
  setTimeout(() => {
    els.quoteText.textContent = `"${q.text}"`;
    els.quoteAuthor.textContent = `— ${q.author}`;
    els.quoteText.style.opacity = '1';
  }, 300);
}

function restoreNormalQuote() {
  const q = QUOTES[state.quoteIdx % QUOTES.length];
  els.quoteText.style.opacity = '0';
  setTimeout(() => {
    els.quoteText.textContent = `\u201c${q.text}\u201d`;
    els.quoteAuthor.textContent = `\u2014 ${q.author}`;
    els.quoteText.style.opacity = '1';
  }, 300);
}

// ─── SESSION HISTORY ─────────────────────────────────────────────
function renderSessionHistory() {
  const list = document.getElementById('sessionList');
  const counter = document.getElementById('sessionHistoryCount');
  if (!list) return;

  const todayStr = new Date().toDateString();
  const todaySessions = state.sessionHistory.filter(s => s.date === todayStr);
  counter.textContent = `${todaySessions.length}개`;

  if (todaySessions.length === 0) {
    list.innerHTML = `<li class="session-empty">완료된 세션이 없어요 — 시작해봐요! 🚀</li>`;
    return;
  }
  list.innerHTML = '';
  todaySessions.forEach(s => {
    const li = document.createElement('li');
    li.className = 'session-item';
    li.dataset.id = s.id;
    li.innerHTML = `
      <span class="session-icon">${s.phaseIcon}</span>
      <div class="session-info">
        <div class="session-time">${s.duration}분 집중</div>
        <div class="session-meta">${s.time} &bull; ${s.phase}</div>
      </div>
      <button class="session-del" data-id="${s.id}" aria-label="세션 삭제">✕</button>`;
    list.appendChild(li);
  });

  list.querySelectorAll('.session-del').forEach(btn => {
    btn.onclick = () => deleteSession(Number(btn.dataset.id));
  });
}

function deleteSession(id) {
  const idx = state.sessionHistory.findIndex(s => s.id === id);
  if (idx === -1) return;
  const s = state.sessionHistory[idx];
  // Revert stats
  state.todayFocusMinutes = Math.max(0, state.todayFocusMinutes - s.duration);
  state.totalFocusMinutes = Math.max(0, state.totalFocusMinutes - s.duration);
  state.todayCompletedSessions = Math.max(0, state.todayCompletedSessions - 1);
  state.totalSessions = Math.max(0, state.totalSessions - 1);
  state.streak = Math.max(0, state.streak - 1);
  const dayIdx = (new Date().getDay() + 6) % 7;
  state.weekData[dayIdx] = Math.max(0, state.weekData[dayIdx] - s.duration);

  state.sessionHistory.splice(idx, 1);

  // If streak is broken (hit 0), reset phase entirely including manual offset
  if (state.streak === 0) {
    state.phaseManualOffset = 0;
    state.currentPhase = PHASES[0];
    applyPhase(PHASES[0]);
    showToast('💔 연속 끊김 — 집중 단계가 초기화됐어요');
  } else {
    // Re-evaluate phase respecting manual offset
    state.currentPhase = getPhase(state.todayFocusMinutes);
    applyPhase(state.currentPhase);
    showToast('🗑️ 세션이 삭제됐어요');
  }

  els.streakCount.textContent = state.streak;
  updateTodayStats();
  renderSessionHistory();
  saveState();
}

function renderTasks() {
  els.taskList.innerHTML = '';
  if (state.tasks.length === 0) {
    els.taskList.innerHTML = `<li style="text-align:center;opacity:0.4;font-size:0.85rem;padding:12px 0">할 일을 추가해 보세요 ✍️</li>`;
    return;
  }
  state.tasks.forEach((t, i) => {
    const li = document.createElement('li');
    li.className = `task-item${t.done ? ' done' : ''}`;
    li.innerHTML = `
      <button class="task-check${t.done ? ' checked' : ''}" data-idx="${i}" aria-label="완료 체크"></button>
      <span class="task-text" data-idx="${i}">${t.text}</span>
      <button class="task-del" data-idx="${i}" aria-label="삭제">✕</button>`;
    els.taskList.appendChild(li);
  });

  els.taskList.querySelectorAll('.task-check').forEach(btn => {
    btn.onclick = () => {
      const i = +btn.dataset.idx;
      state.tasks[i].done = !state.tasks[i].done;
      saveState(); renderTasks();
    };
  });
  els.taskList.querySelectorAll('.task-del').forEach(btn => {
    btn.onclick = () => {
      state.tasks.splice(+btn.dataset.idx, 1);
      saveState(); renderTasks();
    };
  });
}

function addTask(text) {
  if (!text.trim()) return;
  state.tasks.push({ text: text.trim(), done: false });
  saveState(); renderTasks();
}

// ─── STATS MODAL ─────────────────────────────────────────────────
function openStats() {
  const total = state.totalFocusMinutes;
  $('statTotalTime').textContent = `${Math.floor(total / 60)}h ${total % 60}m`;
  $('statTotalSessions').textContent = state.totalSessions;
  $('statLongestStreak').textContent = state.longestStreak;
  const today = state.todayFocusMinutes;
  $('statTodayTime').textContent = `${today}분`;

  // Week chart
  const maxVal = Math.max(...state.weekData, 1);
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  $('weekChart').innerHTML = state.weekData.map((v, i) => `
    <div class="week-bar-wrap">
      <div class="week-bar" style="height:${Math.max(4, (v / maxVal) * 72)}px"></div>
      <div class="week-day-label">${days[i]}</div>
    </div>`).join('');

  // Phase progress
  const phaseColors = { dawn: '#ff6b9d', morning: '#ffd200', flow: '#43cea2', deep: '#8e54e9', zone: '#e040fb' };
  $('phaseList').innerHTML = PHASES.map(p => {
    const pct = Math.min(100, ((today - p.minMinutes) / (p.minMinutes + 30)) * 100);
    const locked = today < p.minMinutes;
    return `
      <div class="phase-item">
        <div class="phase-dot" style="background:${phaseColors[p.id]}"></div>
        <div class="phase-info">
          <div class="phase-name">${p.icon} ${p.label} ${locked ? '🔒' : today >= p.minMinutes ? '✅' : ''}</div>
          <div class="phase-bar-bg">
            <div class="phase-bar-fill" style="width:${locked ? 0 : Math.max(0, Math.min(100, ((today - p.minMinutes) / (30)) * 100))}%;background:${phaseColors[p.id]}"></div>
          </div>
        </div>
        <div class="phase-mins">${p.minMinutes}분~</div>
      </div>`;
  }).join('');

  els.statsModal.classList.add('open');
}

// ─── SETTINGS MODAL ──────────────────────────────────────────────
function openSettings() {
  $('focusDurationInput').value = settings.focusDuration;
  $('shortBreakInput').value = settings.shortBreak;
  $('longBreakInput').value = settings.longBreak;
  $('sessionsGoalInput').value = settings.sessionsGoal;
  $('autoStartInput').checked = settings.autoStart;
  $('notifInput').checked = settings.sound;
  els.settingsModal.classList.add('open');
}

function saveSettings() {
  settings.focusDuration = parseInt($('focusDurationInput').value) || 25;
  settings.shortBreak = parseInt($('shortBreakInput').value) || 5;
  settings.longBreak = parseInt($('longBreakInput').value) || 15;
  settings.sessionsGoal = parseInt($('sessionsGoalInput').value) || 8;
  settings.autoStart = $('autoStartInput').checked;
  settings.sound = $('notifInput').checked;
  localStorage.setItem('ff_settings', JSON.stringify(settings));
  resetTimer(true);
  els.settingsModal.classList.remove('open');
  showToast('⚙️ 설정이 저장됐어요!');
}

// ─── TOAST ───────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2800);
}

// ─── PERSIST ─────────────────────────────────────────────────────
function saveState() {
  const data = {
    tasks: state.tasks, streak: state.streak, longestStreak: state.longestStreak,
    todayFocusMinutes: state.todayFocusMinutes, todayCompletedSessions: state.todayCompletedSessions,
    totalFocusMinutes: state.totalFocusMinutes, totalSessions: state.totalSessions,
    weekData: state.weekData, sessionNum: state.sessionNum, quoteIdx: state.quoteIdx,
    sessionHistory: state.sessionHistory,
    phaseManualOffset: state.phaseManualOffset,
    date: new Date().toDateString(),
  };
  localStorage.setItem('ff_state', JSON.stringify(data));
}

function loadState() {
  try {
    const raw = localStorage.getItem('ff_state');
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.date !== new Date().toDateString()) {
      // New day — full reset of daily stats AND phase progress
      d.todayFocusMinutes = 0;
      d.todayCompletedSessions = 0;
      d.streak = 0;
      d.phaseManualOffset = 0;
      d.sessionHistory = (d.sessionHistory || []).filter(s => s.date === new Date().toDateString());
    }
    Object.assign(state, d);
    if (!Array.isArray(state.sessionHistory)) state.sessionHistory = [];
    if (typeof state.phaseManualOffset !== 'number') state.phaseManualOffset = 0;
  } catch (_) { }

  try {
    const rs = localStorage.getItem('ff_settings');
    if (rs) Object.assign(settings, JSON.parse(rs));
  } catch (_) { }
}

// ─── SOUND TOGGLE ────────────────────────────────────────────────
function toggleSound() {
  settings.sound = !settings.sound;
  const icon = $('soundIcon');
  if (!settings.sound) {
    icon.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>`;
  } else {
    icon.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>`;
  }
  localStorage.setItem('ff_settings', JSON.stringify(settings));
}

// ─── INIT ─────────────────────────────────────────────────────────
function init() {
  loadState();
  spawnParticles(10);
  spawnNature();

  const q = QUOTES[state.quoteIdx];
  els.quoteText.textContent = `\u201c${q.text}\u201d`;
  els.quoteAuthor.textContent = `\u2014 ${q.author}`;

  state.currentPhase = getPhase(state.todayFocusMinutes);
  applyPhase(state.currentPhase);
  body.dataset.mode = state.mode;

  els.sessionCount.textContent = `세션 ${state.sessionNum}`;
  els.streakCount.textContent = state.streak;

  resetTimer(true);
  updateTodayStats();
  renderTasks();
  renderSessionHistory();
  updatePhaseControls();

  // ─── EVENT LISTENERS ─────────────────────────────────────────
  els.startBtn.addEventListener('click', startStop);
  els.resetBtn.addEventListener('click', () => { clearInterval(state.tickInterval); state.running = false; els.startBtnIcon.textContent = '▶'; resetTimer(); });
  els.skipBtn.addEventListener('click', () => {
    clearInterval(state.tickInterval); state.running = false;
    els.startBtnIcon.textContent = '▶';
    handleComplete();
  });

  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.running) { clearInterval(state.tickInterval); state.running = false; }
      setMode(btn.dataset.mode);
    });
  });

  // Phase manual controls
  const phaseDownBtn = document.getElementById('phaseDownBtn');
  const phaseUpBtn = document.getElementById('phaseUpBtn');
  if (phaseDownBtn) phaseDownBtn.addEventListener('click', () => shiftPhase(-1));
  if (phaseUpBtn) phaseUpBtn.addEventListener('click', () => shiftPhase(+1));

  // Header
  $('statsBtn').addEventListener('click', openStats);
  $('settingsBtn').addEventListener('click', openSettings);
  $('soundBtn').addEventListener('click', toggleSound);

  // Stats modal
  $('statsClose').addEventListener('click', () => els.statsModal.classList.remove('open'));
  els.statsModal.addEventListener('click', e => { if (e.target === els.statsModal) els.statsModal.classList.remove('open'); });

  // Settings modal
  $('settingsClose').addEventListener('click', () => els.settingsModal.classList.remove('open'));
  els.settingsModal.addEventListener('click', e => { if (e.target === els.settingsModal) els.settingsModal.classList.remove('open'); });
  $('saveSettingsBtn').addEventListener('click', saveSettings);

  // Tasks
  $('addTaskBtn').addEventListener('click', () => {
    els.taskInputWrap.style.display = els.taskInputWrap.style.display === 'none' ? 'flex' : 'none';
    if (els.taskInputWrap.style.display === 'flex') els.taskInput.focus();
  });
  $('taskConfirm').addEventListener('click', () => {
    addTask(els.taskInput.value);
    els.taskInput.value = '';
    els.taskInputWrap.style.display = 'none';
  });
  els.taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') { addTask(els.taskInput.value); els.taskInput.value = ''; els.taskInputWrap.style.display = 'none'; } });

  // Quote auto-cycle every 60s
  setInterval(cycleQuote, 60000);

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (e.code === 'Space') { e.preventDefault(); startStop(); }
    if (e.code === 'KeyR') resetTimer();
    if (e.code === 'KeyS') openStats();
    if (e.code === 'KeyF') toggleFullscreen();
  });

  // Fullscreen button
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', updateFullscreenIcon);

  // ⑨ Easter egg: Touhou mode — requires exactly 9 clicks (Cirno's number!)
  const touhouBtn = document.getElementById('touhouBtn');
  if (touhouBtn) {
    let clickCount = 0;
    let clickResetTimer = null;
    const REQUIRED_CLICKS = 9;

    touhouBtn.addEventListener('click', () => {
      // If already in touhou mode, one click toggles it off
      if (touhouMode) {
        toggleTouhouMode();
        clickCount = 0;
        touhouBtn.title = '⑨';
        touhouBtn.querySelector('span').textContent = '⑨';
        return;
      }

      clickCount++;

      // Reset counter after 2s of inactivity
      clearTimeout(clickResetTimer);
      clickResetTimer = setTimeout(() => {
        if (clickCount > 0 && clickCount < REQUIRED_CLICKS) {
          showToast(`❄️ 치르노: "${clickCount}번 눌렀어? ⑨번 눌러야 한다고!"`);
        }
        clickCount = 0;
        touhouBtn.title = '⑨';
        touhouBtn.querySelector('span').textContent = '⑨';
      }, 2000);

      if (clickCount < REQUIRED_CLICKS) {
        // Show progress on button
        touhouBtn.querySelector('span').textContent = `${clickCount}`;
        touhouBtn.title = `⑨번 눌러야 해! (${clickCount}/${REQUIRED_CLICKS})`;
      } else {
        // 9번 달성!
        clickCount = 0;
        clearTimeout(clickResetTimer);
        touhouBtn.title = '⑨';
        touhouBtn.querySelector('span').textContent = '⑨';
        toggleTouhouMode();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', init);

// ─────────────────────────────────────────────────────────────────
// ✦ TOUHOU PROJECT MODE — 幻想郷 Gensokyo Focus Mode
// ─────────────────────────────────────────────────────────────────

function spawnDanmaku() {
  const layer = document.getElementById('danmakuLayer');
  if (!layer || !touhouMode) return;

  const types = ['type-orb', 'type-rice', 'type-star', 'type-needle'];
  const type = types[Math.floor(Math.random() * types.length)];
  const color = DANMAKU_COLORS[Math.floor(Math.random() * DANMAKU_COLORS.length)];
  const spiral = Math.random() > 0.7;

  const el = document.createElement('div');
  el.className = 'danmaku-bullet ' + type + (spiral ? ' spiral' : '');
  el.style.setProperty('--bcolor', color);
  el.style.left = `${Math.random() * 100}%`;
  el.style.top = `-30px`;
  el.style.animationDuration = `${3.5 + Math.random() * 5}s`;
  el.style.animationDelay = `0s`;
  el.style.setProperty('--rot', `${Math.random() * 30 - 15}deg`);
  if (spiral) el.style.setProperty('--sx', `${(Math.random() - 0.5) * 200}px`);
  layer.appendChild(el);

  // Remove after animation ends
  el.addEventListener('animationend', () => el.remove(), { once: true });
  setTimeout(() => el.remove(), 10000);
}

function spawnDanmakuBurst(count = 12) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => spawnDanmaku(), i * 60);
  }
}

function startDanmaku() {
  if (danmakuInterval) return;
  spawnDanmakuBurst(20);
  danmakuInterval = setInterval(() => {
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) setTimeout(spawnDanmaku, i * 80);
  }, 400);
}

function stopDanmaku() {
  clearInterval(danmakuInterval);
  danmakuInterval = null;
  const layer = document.getElementById('danmakuLayer');
  if (layer) layer.innerHTML = '';
}

function showSpellcard(phaseData, callback) {
  const overlay = document.getElementById('spellcardOverlay');
  const charEl = document.getElementById('spellcardChar');
  const titleEl = document.getElementById('spellcardTitle');
  const subEl = document.getElementById('spellcardSub');
  if (!overlay) return callback && callback();

  charEl.textContent = phaseData.icon;
  titleEl.textContent = phaseData.spellName;
  subEl.textContent = phaseData.spellKR;

  overlay.classList.add('active');

  // Quick burst of danmaku behind the overlay
  spawnDanmakuBurst(30);

  setTimeout(() => {
    overlay.classList.remove('active');
    if (callback) callback();
  }, 2200);
}

function applyTouhouPhase(phase) {
  const th = TOUHOU_PHASES.find(p => p.id === phase.id) || TOUHOU_PHASES[0];
  body.dataset.phase = phase.id;
  els.phaseIcon.textContent = th.icon;
  els.phaseLabel.textContent = th.label;
  els.phaseBanner.style.transform = 'scale(1.05)';
  setTimeout(() => { els.phaseBanner.style.transform = ''; }, 400);
  updatePhaseControls();
}

function replaceCherryBlossoms() {
  // Replace fish/seaweed with cherry blossoms in nature layer
  const layer = document.getElementById('natureLayer');
  if (!layer) return;
  // Mark existing leaves as touhou leaves
  layer.querySelectorAll('.leaf').forEach(el => {
    el.textContent = CHERRY_EMOJIS[Math.floor(Math.random() * CHERRY_EMOJIS.length)];
    el.style.fontSize = `${0.8 + Math.random() * 0.8}rem`;
  });
}

function enableTouhouMode() {
  touhouMode = true;
  const btn = document.getElementById('touhouBtn');
  if (btn) btn.classList.add('touhou-active');
  body.classList.add('touhou-mode');

  const curPhase = TOUHOU_PHASES.find(p => p.id === state.currentPhase.id) || TOUHOU_PHASES[0];

  // Show spellcard then start danmaku
  showSpellcard(curPhase, () => {
    startDanmaku();
    replaceCherryBlossoms();
    showToast(`✨ 동방 집중 모드 활성화! ${curPhase.charName}와 함께 집중하세요~`);
  });

  // Override logo text
  const logoText = document.querySelector('.logo-text');
  if (logoText) logoText.textContent = '동방 FocusFlow';

  // Override phase display
  applyTouhouPhase(state.currentPhase);

  // Show touhou quote immediately
  showTouhouQuote();

  // Patch applyPhase for touhou mode
  window._origApplyPhase = window._origApplyPhase || applyPhase;
}

function disableTouhouMode() {
  touhouMode = false;
  const btn = document.getElementById('touhouBtn');
  if (btn) btn.classList.remove('touhou-active');
  body.classList.remove('touhou-mode');
  stopDanmaku();

  // Restore logo
  const logoText = document.querySelector('.logo-text');
  if (logoText) logoText.textContent = 'FocusFlow';

  // Restore phase
  applyPhase(state.currentPhase);

  // Restore normal quote
  restoreNormalQuote();

  showToast('🎙️ 일반 모드로 돌아왔어요');
}

function toggleTouhouMode() {
  if (touhouMode) {
    disableTouhouMode();
  } else {
    enableTouhouMode();
  }
}

// Wire up the ⑨ button — handled inside init()

// ─── FULLSCREEN ───────────────────────────────────────────────────
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => { });
  } else {
    document.exitFullscreen();
  }
}

function updateFullscreenIcon() {
  const btn = document.getElementById('fullscreenBtn');
  if (!btn) return;
  const isFs = !!document.fullscreenElement;
  btn.setAttribute('title', isFs ? '전체화면 종료' : '전체화면');
  btn.setAttribute('aria-label', isFs ? '전체화면 종료' : '전체화면');
  const icon = btn.querySelector('svg');
  if (!icon) return;
  if (isFs) {
    // Exit fullscreen icon (compress)
    icon.innerHTML = `<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>`;
  } else {
    // Enter fullscreen icon (expand)
    icon.innerHTML = `<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>`;
  }
}
