// PYTHON CODE RAIN — subtle Matrix-style background
(function() {
  const canvas = document.getElementById('codeRain');
  const ctx = canvas.getContext('2d');

  const pythonSnippets = [
    'def', 'class', 'import', 'return', 'self', 'model', 'train',
    'loss', 'torch', 'numpy', 'fit()', 'predict', 'forward',
    'if __name__', 'lambda', 'yield', 'async', 'await', 'with',
    'open()', 'print()', 'range()', 'len()', 'True', 'False',
    'None', 'except', 'raise', 'try:', 'for i in', 'while',
    'data', 'model.eval()', '.cuda()', 'nn.Linear', 'optimizer',
    'gradient', 'tensor', 'embed', 'query', 'vector', 'index',
    'pipeline', 'transform', 'encode', 'decode', 'token',
    'attention', 'layer', 'batch', 'epoch', 'lr=0.001',
    'x = 0', 'y += 1', 'res[]', '**kwargs', '*args', '# AI',
    'pandas', 'sklearn', 'faiss', 'langchain', 'llm', 'rag',
    'prompt', 'chain', 'agent', 'tool', 'memory', 'retriever',
    'def build():', 'class AI:', '.to(device)', 'F.relu(x)',
    'np.array', 'pd.DataFrame', '.fit(X, y)', '.shape',
    'config', 'hidden', 'output', 'weight', 'bias', 'dim=512',
    'mcp', 'harbor', 'pytest', 'assert', 'docker', 'eval()',
    'verifier', 'terminal-bench', 'seed=42', 'subprocess'
  ];

  const fontSize = 13;
  const lineGap = fontSize * 1.7;
  const TAIL = 4;                 // trailing glyphs behind each head
  const CYAN = [0, 229, 204], VIOLET = [139, 92, 246];

  let W, H, columns, drops, rafId = null;

  const pick = () => pythonSnippets[Math.floor(Math.random() * pythonSnippets.length)];

  function spawn(i, fromTop) {
    return {
      x: i * (W / columns) + Math.random() * 20,
      y: fromTop ? -50 - Math.random() * 200 : Math.random() * H * -2,
      speed: 0.25 + Math.random() * 0.5,   // 25% faster than the original 0.2–0.6
      alpha: 0.3 + Math.random() * 0.7,
      hue: Math.random() < 0.15 ? VIOLET : CYAN,   // ~15% violet accents, fixed per drop
      trail: Array.from({ length: TAIL + 1 }, pick),
      changeCounter: 0,
      changeInterval: 60 + Math.floor(Math.random() * 120)
    };
  }

  function initRain() {
    // Scale the backing store for retina, but keep drawing in CSS pixels.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    columns = Math.floor(W / (fontSize * 2.6)) || 1;
    drops = Array.from({ length: columns }, (_, i) => spawn(i, false));
  }

  function draw() {
    ctx.fillStyle = 'rgba(11, 11, 11, 0.06)';
    ctx.fillRect(0, 0, W, H);
    ctx.font = fontSize + 'px JetBrains Mono, monospace';

    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      const [r, g, b] = d.hue;

      d.changeCounter++;
      if (d.changeCounter >= d.changeInterval) {
        d.trail.pop();
        d.trail.unshift(pick());   // new head, tail shifts back
        d.changeCounter = 0;
      }

      // Head: near-white, brightest glyph of the column.
      ctx.fillStyle = 'rgba(210, 255, 250,' + (d.alpha * 0.85) + ')';
      ctx.fillText(d.trail[0], d.x, d.y);

      // Tail: fades out over TAIL glyphs in the drop's own hue.
      for (let t = 1; t <= TAIL; t++) {
        const fade = (1 - t / (TAIL + 1)) * d.alpha * 0.5;
        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + fade + ')';
        ctx.fillText(d.trail[t], d.x, d.y - t * lineGap);
      }

      d.y += d.speed;
      if (d.y > H + 50) drops[i] = spawn(i, true);
    }
    rafId = requestAnimationFrame(draw);
  }

  function start() { if (rafId === null) draw(); }
  function stop() { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }

  // Respect reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!prefersReduced.matches) {
    initRain();
    start();
    // Don't burn CPU animating a tab nobody is looking at.
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initRain, 200);
    });
  }
})();

// SCROLL-DRIVEN TIMELINE
const timelineFill = document.getElementById('timelineFill');
const spine = document.querySelector('.timeline-spine');
const dotSections = [...document.querySelectorAll('.section[data-section]')];

// One dot per section, positioned at that section's fractional depth in the page.
const dots = dotSections.map(() => {
  const dot = document.createElement('div');
  dot.className = 'timeline-dot';
  spine.appendChild(dot);
  return dot;
});

let dotFractions = [];
function placeDots() {
  const docHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  dotFractions = dotSections.map(sec => Math.min(sec.offsetTop / docHeight, 1));
  dots.forEach((dot, i) => { dot.style.top = (dotFractions[i] * 100) + '%'; });
}

function updateTimeline() {
  // Guard: docHeight is 0 when the page fits the viewport, which would yield NaN%.
  const docHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const scrollPercent = Math.min(window.scrollY / docHeight, 1);
  timelineFill.style.height = (scrollPercent * 100) + '%';
  dots.forEach((dot, i) => dot.classList.toggle('lit', scrollPercent >= dotFractions[i] - 0.005));
}

window.addEventListener('scroll', () => { updateTimeline(); updateActiveNav(); }, { passive: true });
let spineResizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(spineResizeTimer);
  spineResizeTimer = setTimeout(() => { placeDots(); updateTimeline(); }, 200);
});
placeDots();
updateTimeline();
// Sections reveal on scroll, which changes their offsets; re-measure once settled.
window.addEventListener('load', () => { placeDots(); updateTimeline(); updateActiveNav(); });

// INTERSECTION OBSERVER — SECTION REVEAL
const sections = document.querySelectorAll('.section[data-section]');
const navLinks = document.querySelectorAll('[data-nav]');
const mobileNavLinks = document.querySelectorAll('[data-nav-m]');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

sections.forEach(s => revealObserver.observe(s));

// ACTIVE NAV HIGHLIGHT
// Whichever section has crossed a line 35% down the viewport is the current one.
// Deliberately not an IntersectionObserver: ratio thresholds can never be met by
// sections taller than the viewport, which silently skipped 6 of the 11 nav items.
const allSections = [...document.querySelectorAll('.section')];
function updateActiveNav() {
  const line = window.scrollY + window.innerHeight * 0.35;
  let current = allSections[0];
  for (const sec of allSections) if (sec.offsetTop <= line) current = sec;
  const hash = '#' + current.id;
  navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === hash));
  mobileNavLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === hash));
}

// JOURNEY EXPAND/COLLAPSE
function toggleJourney(el) {
  const wasActive = el.classList.contains('active');
  document.querySelectorAll('.journey-item').forEach(i => i.classList.remove('active'));
  if (!wasActive) el.classList.add('active');
}

// SMOOTH SCROLL FOR NAV
document.querySelectorAll('.left-nav a, .mobile-nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// CONTACT FORM — hand off to the visitor's mail client
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target.elements;   // .elements: a field named "name" would shadow form.name
  const subject = 'Portfolio enquiry from ' + f.name.value;
  const body = f.message.value + '\n\n\u2014 ' + f.name.value + ' (' + f.email.value + ')';
  e.target.querySelector('.form-status').textContent = 'Opening your mail app\u2026';
  window.location.href = 'mailto:naveenkenchgunde10@gmail.com?subject='
    + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
});
