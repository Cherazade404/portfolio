/* ===== STARFIELD + SHOOTING STARS ===== */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [], shooters = [], nebulae = [];
  let W, H, t = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    nebulae = [
      { x: W * 0.85, y: H * 0.18, r: 280, color: 'rgba(139,92,246,0.045)' },
      { x: W * 0.12, y: H * 0.72, r: 220, color: 'rgba(0,212,255,0.04)' },
      { x: W * 0.5,  y: H * 0.5,  r: 350, color: 'rgba(139,92,246,0.025)' },
      { x: W * 0.3,  y: H * 0.1,  r: 180, color: 'rgba(0,212,255,0.03)' },
    ];
  }

  function mkStar() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2,
      alpha: Math.random() * 0.7 + 0.15,
      speed: Math.random() * 0.08 + 0.01,
      tw: Math.random() * 0.008 + 0.003,
      twOff: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.85 ? 200 : 220,
    };
  }

  function mkShooter() {
    const angle = (Math.random() * 40 + 20) * Math.PI / 180;
    const len = Math.random() * 120 + 60;
    return {
      x: Math.random() * W * 0.8,
      y: Math.random() * H * 0.5,
      dx: Math.cos(angle) * (Math.random() * 8 + 6),
      dy: Math.sin(angle) * (Math.random() * 8 + 6),
      len,
      alpha: 1,
      fade: Math.random() * 0.02 + 0.015,
      trail: [],
      active: true,
    };
  }

  function initStars(n) {
    stars = Array.from({ length: n }, mkStar);
  }

  function drawNebulae() {
    nebulae.forEach(n => {
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      g.addColorStop(0, n.color);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawStars() {
    stars.forEach(s => {
      const tw = 0.55 + 0.45 * Math.sin(t * s.tw + s.twOff);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue},60%,92%,${s.alpha * tw})`;
      ctx.fill();
      s.y -= s.speed;
      if (s.y < -2) { s.y = H + 2; s.x = Math.random() * W; }
    });
  }

  function drawShooters() {
    shooters = shooters.filter(s => s.active);
    shooters.forEach(s => {
      s.trail.push({ x: s.x, y: s.y });
      if (s.trail.length > 20) s.trail.shift();
      s.x += s.dx;
      s.y += s.dy;
      s.alpha -= s.fade;
      if (s.alpha <= 0 || s.x > W + 50 || s.y > H + 50) { s.active = false; return; }

      // Trail
      for (let i = 1; i < s.trail.length; i++) {
        const ratio = i / s.trail.length;
        ctx.beginPath();
        ctx.moveTo(s.trail[i - 1].x, s.trail[i - 1].y);
        ctx.lineTo(s.trail[i].x, s.trail[i].y);
        ctx.strokeStyle = `rgba(220,240,255,${s.alpha * ratio * 0.7})`;
        ctx.lineWidth = ratio * 2;
        ctx.stroke();
      }
      // Head
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,240,255,${s.alpha})`;
      ctx.fill();
    });
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawNebulae();
    drawStars();
    drawShooters();
    t++;
    requestAnimationFrame(loop);
  }

  resize();
  initStars(300);
  loop();

  // Spawn shooting star occasionally
  setInterval(() => {
    if (shooters.length < 3 && Math.random() > 0.35) {
      shooters.push(mkShooter());
    }
  }, 2800);

  window.addEventListener('resize', () => { resize(); initStars(300); }, { passive: true });
})();

/* ===== TYPING EFFECT ===== */
(function initTyping() {
  const roles = [
    'Apprentie DevOps',
    'Apprentie Tests de Performance',
    'Infrastructure Enthusiast',
    'Master SRS · Lyon 1',
    'Passionnée de l\'espace 🚀',
  ];
  const el = document.getElementById('typedRole');
  if (!el) return;
  let ri = 0, ci = 0, del = false;
  function type() {
    const r = roles[ri];
    if (!del) {
      el.textContent = r.slice(0, ++ci);
      if (ci === r.length) { del = true; setTimeout(type, 2000); return; }
    } else {
      el.textContent = r.slice(0, --ci);
      if (ci === 0) { del = false; ri = (ri + 1) % roles.length; }
    }
    setTimeout(type, del ? 45 : 75);
  }
  setTimeout(type, 800);
})();

/* ===== UPTIME ===== */
(function initUptime() {
  const el = document.getElementById('uptime');
  if (!el) return;
  const start = Date.now();
  setInterval(() => {
    const s = Math.floor((Date.now() - start) / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    el.textContent = h > 0 ? `${h}h ${m % 60}m ${s % 60}s` : `${m}m ${s % 60}s`;
  }, 1000);
})();

/* ===== INTERACTIVE TERMINAL ===== */
(function initTerminal() {
  const output = document.getElementById('termOutput');
  const input = document.getElementById('termInput');
  const win = document.getElementById('terminalWindow');
  if (!output || !input) return;

  let history = [], histIdx = -1;

  // ── Command definitions ──────────────────────────────────────────────────
  const CMDS = {

    help: () => `<span class="t-purple">╔══ Commandes disponibles ═══════════════════════════════════╗</span>
  <span class="t-cyan t-bold">whoami</span>        Identité & profil
  <span class="t-cyan t-bold">about</span>         À propos de moi
  <span class="t-cyan t-bold">skills</span>        Compétences techniques
  <span class="t-cyan t-bold">experience</span>    Expériences professionnelles
  <span class="t-cyan t-bold">education</span>     Parcours de formation
  <span class="t-cyan t-bold">projects</span>      Projets réalisés
  <span class="t-cyan t-bold">contact</span>       Me contacter
  <span class="t-cyan t-bold">ls</span>            Lister les fichiers
  <span class="t-cyan t-bold">cat &lt;fichier&gt;</span>  Lire un fichier
  <span class="t-cyan t-bold">clear</span>         Vider le terminal
  <span class="t-dim">──── Easter eggs cachés... explore ! ────</span>
<span class="t-purple">╚═════════════════════════════════════════════════════════════╝</span>`,

    whoami: () => `
<span class="t-green t-bold">Cherazade EL KARROUMI</span>
<span class="t-muted">─────────────────────────────────────────</span>
<span class="t-cyan">role</span>      Apprentie Tests de Performance & DevOps
<span class="t-cyan">company</span>   Groupama G2S · Ecully, France
<span class="t-cyan">school</span>    Master Informatique SRS · Université Lyon 1
<span class="t-cyan">location</span>  Lyon, France 🌍
<span class="t-cyan">languages</span> Français (natif) · Anglais · Chinois
<span class="t-cyan">status</span>    <span class="t-green">● En alternance</span>`,

    about: () => `
<span class="t-bold">$ cat about.md</span>
<span class="t-muted">─────────────────────────────────────────</span>
Apprentie ingénieure chez <span class="t-cyan">Groupama G2S</span> (Ecully), spécialisée en
tests de performance et DevOps. Élaboration de stratégies de charge,
développement de scénarios, pilotage d'exécutions et reporting technique.

Stage chez <span class="t-purple">Constellium</span> : développement d'un service <span class="t-green">.NET 8/C#</span>
collectant des données machines via <span class="t-yellow">OPC UA/DA</span> → <span class="t-yellow">MQTT</span>
avec buffer <span class="t-yellow">SQLite</span> anti-coupure réseau. Dashboards Grafana temps réel.

Tutrice en informatique à <span class="t-cyan">Lyon 1</span> : C++, Réseaux, OCaml.
Ambassadrice étudiante · Passionnée d'espace 🌌`,

    skills: () => `
<span class="t-bold">$ cat skills.json</span>
<span class="t-muted">─────────────────────────────────────────</span>
<span class="t-cyan">DevOps & CI/CD   </span>  GitLab CI · Docker · Git · OpenStack · NeoLoad · Node-RED
<span class="t-purple">Monitoring       </span>  Grafana · Dynatrace · Prometheus
<span class="t-green">Langages         </span>  Python · C · C++ · C# · JavaScript · SQL · PowerShell · OCaml · Java
<span class="t-yellow">Réseaux & Sys.   </span>  Linux · Unix · Cisco IOS · OPC UA/DA · MQTT · Wireshark · CCNA 1
<span class="t-red">Bases de données </span>  MariaDB · SQLite · phpMyAdmin
<span class="t-muted">Outils           </span>  VSCode · Vim · Node.js · Jupyter · Unity · .NET 8`,

    experience: () => `
<span class="t-bold">$ cat experience.log</span>
<span class="t-muted">─────────────────────────────────────────</span>
<span class="t-cyan t-bold">[ GROUPAMA G2S ]</span>  <span class="t-dim">Sept. 2025 → Présent · Ecully</span>
  Apprentie Ingénieure Tests de Performance DevOps
  ↳ Stratégies de tests de charge & scénarios NeoLoad
  ↳ Pilotage d'exécutions · Reporting technique & fonctionnel
  ↳ Stack : <span class="t-yellow">NeoLoad · Dynatrace · Grafana</span>

<span class="t-purple t-bold">[ CONSTELLIUM ]</span>  <span class="t-dim">Avr. → Août 2025 · Neuf-Brisach</span>
  Stagiaire Informatique Industrielle — Mesure & Régulations
  ↳ Service .NET 8/C# : OPC UA/DA → MQTT + buffer SQLite
  ↳ Dashboards Grafana temps réel (état machines, bobines)
  ↳ Remontée données énergétiques UAP FD6
  ↳ Stack : <span class="t-yellow">C# · .NET 8 · OPC UA · MQTT · SQLite · Grafana</span>

<span class="t-green t-bold">[ LYON 1 — Tutrice ]</span>  <span class="t-dim">Sept. 2024 → Août 2025</span>
  Enseignement C++ · Réseaux · OCaml (programmation récursive)

<span class="t-muted t-bold">[ LYON 1 — Ambassadrice ]</span>  <span class="t-dim">Sept. 2023 → Présent</span>
  Orientation étudiants & lycéens · Salons & lycées`,

    education: () => `
<span class="t-bold">$ cat education.md</span>
<span class="t-muted">─────────────────────────────────────────</span>
<span class="t-cyan">2025 → Présent</span>  Master Informatique — Systèmes, Réseaux & Sécurité
                 Université Claude Bernard Lyon 1  <span class="t-green">[EN COURS]</span>

<span class="t-cyan">2024</span>            CCNA 1 — Introduction aux Réseaux
                 Cisco Networking Academy  <span class="t-green">[CERTIFIÉ]</span>

<span class="t-cyan">2023 → 2025</span>     Licence Informatique
                 Université Claude Bernard Lyon 1  <span class="t-green">[OBTENUE]</span>

<span class="t-cyan">2020 → 2023</span>     Licence Physique, Chimie & Sciences de l'Ingénieur
                 Université Claude Bernard Lyon 1  <span class="t-dim">[non validée]</span>

<span class="t-cyan">2018</span>            Certification Mandarin 🀄
                 华东理工大学 (ECUST)`,

    projects: () => `
<span class="t-bold">$ ls -la projects/</span>
<span class="t-muted">─────────────────────────────────────────</span>
<span class="t-cyan t-bold">1. Service OPC UA/DA → MQTT</span>  <span class="t-dim">[Constellium · 2025]</span>
   Service .NET 8 / C# collectant données machines industrielles
   via OPC UA & OPC DA, transmises en MQTT avec buffer SQLite
   (garantie zéro perte en cas de coupure réseau)
   Stack : <span class="t-yellow">C# · .NET 8 · OPC UA · OPC DA · MQTT · SQLite</span>

<span class="t-purple t-bold">2. Dashboards Grafana industriels</span>  <span class="t-dim">[Constellium · 2025]</span>
   Visualisation temps réel & différé de l'état des machines
   et des données bobines du site de Neuf-Brisach
   Stack : <span class="t-yellow">Grafana · ibaPDA · MariaDB</span>

<span class="t-green t-bold">3. Campagnes de test de performance</span>  <span class="t-dim">[Groupama G2S · 2025–]</span>
   Élaboration de stratégies de charge, scripts de scénarios
   et reporting pour applications critiques
   Stack : <span class="t-yellow">NeoLoad · Dynatrace · Grafana</span>`,

    contact: () => `
<span class="t-bold">$ cat contact.cfg</span>
<span class="t-muted">─────────────────────────────────────────</span>
<span class="t-cyan">email</span>     cherazade.el-karroumi@etu.univ-lyon1.fr
<span class="t-cyan">phone</span>     06 34 31 50 37
<span class="t-cyan">location</span>  10 rue Nérard, 69009 Lyon, France
<span class="t-cyan">linkedin</span>  linkedin.com/in/cherazade-el-karroumi
<span class="t-cyan">github</span>    github.com/Cherazade404
<span class="t-green">status</span>    <span class="t-green">● Disponible — réponse sous 24h</span>`,

    ls: () => `<span class="t-cyan">about.md</span>  <span class="t-cyan">skills.json</span>  <span class="t-cyan">experience.log</span>  <span class="t-cyan">education.md</span>  <span class="t-cyan">projects/</span>  <span class="t-cyan">contact.cfg</span>  <span class="t-dim">.easter_eggs</span>`,

    // Easter eggs
    neofetch: () => `
<span class="t-purple">        ████       </span>  <span class="t-green t-bold">cherazade</span><span class="t-muted">@</span><span class="t-cyan t-bold">devops-station</span>
<span class="t-purple">      ████████     </span>  <span class="t-muted">─────────────────────────────</span>
<span class="t-purple">    ████████████   </span>  <span class="t-cyan">OS</span>       CherazadeOS 25.09.0 x86_64
<span class="t-purple">   ██████ ████████ </span>  <span class="t-cyan">Kernel</span>   DevOps-Kernel 5.x LTS
<span class="t-purple">   ████████████   </span>  <span class="t-cyan">Uptime</span>   Toujours en ligne ⚡
<span class="t-purple">    ────████████  </span>  <span class="t-cyan">Shell</span>    bash + NeoLoad
<span class="t-purple">   ─────────────  </span>  <span class="t-cyan">DE</span>       Space Theme (Orbital Edition)
<span class="t-purple">                  </span>  <span class="t-cyan">CPU</span>      Intel® Brain™ i9 (cafféiné)
                    <span class="t-cyan">GPU</span>      NVIDIA DevOps 4090
                    <span class="t-cyan">Memory</span>   8 Go / ∞ Go (curiosité illimitée)
                    <span class="t-cyan">Langs</span>    FR · EN · ZH 🌐`,

    'sudo rm -rf /': () => `<span class="t-red">bash: sudo: Permission denied.</span>
<span class="t-muted">Nice try. L'infrastructure est protégée. 😏</span>`,

    'ping space': () => `PING space (∞.∞.∞.∞) 56 bytes of stardust
64 bytes from Voie Lactée: icmp_seq=1 ttl=∞ time=299 792 458 ms
64 bytes from Voie Lactée: icmp_seq=2 ttl=∞ time=299 792 458 ms
<span class="t-yellow">^C</span>
<span class="t-muted">--- space ping statistics ---
2 packets transmitted, 2 received, 0% packet loss</span>`,

    'docker ps': () => `<span class="t-purple">CONTAINER ID   IMAGE                STATUS          NAMES</span>
a7b3c9f1e2d4   grafana/grafana      Up 47 days      grafana-prod
b8c4d0f2e3e5   prom/prometheus      Up 47 days      prometheus
c9d5e1f3f4a6   neoload-controller   Up 12 hours     neoload-ctl
d0e6f2a4a5b7   postgres:15          Up 47 days      db-metrics
<span class="t-green">4 containers running</span>`,

    'git log': () => `<span class="t-yellow">commit a7b3c9f</span> (HEAD → main)
Author: Cherazade EL KARROUMI &lt;cherazade@devops&gt;
Date:   Fri Jun 27 2026

    feat: add OPC UA/DA → MQTT service with SQLite buffer

<span class="t-yellow">commit b4e8d2c</span>
Date:   Mon Apr 28 2025

    feat: Grafana dashboards for real-time machine monitoring

<span class="t-yellow">commit c9f1a0e</span>
Date:   Thu Sep 5 2025

    chore: setup Groupama G2S alternance environment

<span class="t-dim">... et bien d'autres commits 🚀</span>`,

    'uname -a': () => `<span class="t-green">CherazadeOS 25.09.0 DevOps-Kernel #1 SMP PREEMPT Lyon 2025 x86_64 GNU/Linux</span>`,

    htop: () => `<span class="t-green t-bold">CPU</span>  [████████████████░░░] 82%   <span class="t-cyan">Tasks:</span> 42 running
<span class="t-green t-bold">MEM</span>  [█████████░░░░░░░░░░] 48%   <span class="t-cyan">Load:</span>  Performance tests
<span class="t-green t-bold">SWP</span>  [░░░░░░░░░░░░░░░░░░░] 0%

  <span class="t-cyan">PID   PROCESS             CPU%  MEM%</span>
  1042  neoload-runner      42.1   12.3   <span class="t-green">●</span>
  1843  grafana             8.7     4.1   <span class="t-green">●</span>
  2091  prometheus          6.2     3.8   <span class="t-green">●</span>
  3012  curiosite-infinie   ∞       ∞     <span class="t-yellow">●</span>`,

    exit: () => `<span class="t-muted">Il n'y a pas de sortie de l'univers DevOps...</span>
<span class="t-dim">Rebooting curiosity... done ✓</span>`,

    hello: () => `<span class="t-green">Bonjour ! 👋 Bienvenue sur mon portfolio.</span>
<span class="t-muted">Tapez <span class="t-cyan">help</span> pour explorer mes commandes.</span>`,

    pwd: () => `<span class="t-cyan">/home/cherazade/portfolio</span>`,

    date: () => `<span class="t-green">${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>`,

    'cat about.md':     () => CMDS.about(),
    'cat skills.json':  () => CMDS.skills(),
    'cat experience.log': () => CMDS.experience(),
    'cat education.md': () => CMDS.education(),
    'cat contact.cfg':  () => CMDS.contact(),
    'cat projects':     () => CMDS.projects(),
    'ls projects':      () => `<span class="t-cyan">01_opc-ua-mqtt-service/</span>  <span class="t-cyan">02_grafana-dashboards/</span>  <span class="t-cyan">03_perf-campaigns/</span>`,
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  function appendPromptLine(cmd) {
    const row = document.createElement('div');
    row.className = 'term-line';
    row.innerHTML = `<span class="t-prompt-full"><span class="t-at" style="color:var(--cyan)">cherazade</span><span style="color:var(--muted2)">@devops</span><span style="color:var(--muted2)">:</span><span style="color:var(--purple)">~</span><span style="color:var(--green)">$</span></span> <span class="term-cmd-echo">${escapeHtml(cmd)}</span>`;
    output.appendChild(row);
  }

  function appendOutput(html) {
    const block = document.createElement('div');
    block.className = 'term-line-block';
    block.innerHTML = `<div class="term-out">${html}</div>`;
    output.appendChild(block);
  }

  function appendError(msg) {
    appendOutput(`<span class="t-red">${escapeHtml(msg)}</span>`);
  }

  function scrollBottom() {
    output.scrollTop = output.scrollHeight;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Process input ─────────────────────────────────────────────────────────

  function processCmd(raw) {
    const cmd = raw.trim();
    if (!cmd) return;

    history.unshift(cmd);
    histIdx = -1;

    appendPromptLine(cmd);

    if (cmd === 'clear') {
      output.innerHTML = '';
      return;
    }

    const key = cmd.toLowerCase();

    if (key in CMDS) {
      appendOutput(CMDS[key]());
    } else if (key.startsWith('cat ') && !(key in CMDS)) {
      appendError(`cat: ${cmd.slice(4)}: No such file or directory`);
    } else if (key === 'sudo' || key.startsWith('sudo ')) {
      appendOutput(`<span class="t-red">Permission denied. Nice try. 😏</span>`);
    } else if (key === 'rm' || key.startsWith('rm ')) {
      appendOutput(`<span class="t-red">rm: Permission denied. L'infrastructure est protégée.</span>`);
    } else if (key === 'vim' || key === 'nano' || key === 'vi') {
      appendOutput(`<span class="t-muted">Ouverture de ${cmd}... <span class="t-red">erreur : impossible de quitter Vim. Bon courage. 😂</span></span>`);
    } else if (key === 'python' || key === 'python3') {
      appendOutput(`<span class="t-green">Python 3.12.0 (CherazadeOS)</span>\n<span class="t-muted">Type "help" for more information.</span>\n<span class="t-cyan">&gt;&gt;&gt;</span> <span class="t-dim">Ce terminal ne supporte pas Python interactif. Essayez <span class="t-cyan">skills</span>.</span>`);
    } else if (key === 'ssh' || key.startsWith('ssh ')) {
      appendOutput(`<span class="t-muted">ssh: connexion à l'espace refusée (trop loin) 🚀</span>`);
    } else if (key === 'man') {
      appendOutput(`<span class="t-muted">RTFM ? Ici on préfère <span class="t-cyan">help</span>.</span>`);
    } else {
      appendError(`${cmd}: command not found. Tapez 'help' pour la liste des commandes.`);
    }

    appendOutput('');
    scrollBottom();
  }

  // ── Welcome message ───────────────────────────────────────────────────────

  function printWelcome() {
    output.innerHTML = `<div class="term-line-block"><div class="term-out">
<span class="t-cyan t-bold">══════════════════════════════════════════════════</span>
  <span class="t-green t-bold">CHERAZADE EL KARROUMI</span> — Portfolio Shell v1.0.0
  <span class="t-muted">Apprentie DevOps · Tests de Performance · Lyon, France</span>
<span class="t-cyan t-bold">══════════════════════════════════════════════════</span>

Tapez <span class="t-cyan t-bold">help</span> pour voir les commandes disponibles.
Tapez <span class="t-cyan">whoami</span>, <span class="t-cyan">skills</span>, <span class="t-cyan">experience</span> ou <span class="t-cyan">projects</span> pour explorer.
<span class="t-dim">Des easter eggs sont cachés... cherchez bien 🌌</span>
</div></div>`;
    scrollBottom();
  }

  // ── Event listeners ───────────────────────────────────────────────────────

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      processCmd(input.value);
      input.value = '';
      histIdx = -1;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        histIdx++;
        input.value = history[histIdx];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = history[histIdx]; }
      else { histIdx = -1; input.value = ''; }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const partial = input.value.toLowerCase();
      const matches = Object.keys(CMDS).filter(k => k.startsWith(partial));
      if (matches.length === 1) input.value = matches[0];
      else if (matches.length > 1) {
        appendPromptLine(input.value);
        appendOutput(matches.map(m => `<span class="t-cyan">${m}</span>`).join('  '));
        scrollBottom();
      }
    }
  });

  // Click anywhere in terminal → focus input
  win.addEventListener('click', () => input.focus());

  printWelcome();
})();

/* ===== INTERSECTION OBSERVER ===== */
(function initObservers() {
  document.querySelectorAll('.section-header, .about-grid, .skill-category, .timeline-item, .edu-card, .contact-grid').forEach(el => {
    el.classList.add('fade-in');
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 70);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
})();

/* ===== NAV ===== */
(function initNav() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 40 ? 'rgba(5,7,15,0.96)' : 'rgba(5,7,15,0.75)';
  }, { passive: true });

  const btn = document.getElementById('navToggle');
  const links = document.querySelector('.nav-links');
  btn?.addEventListener('click', () => links.classList.toggle('open'));
  links?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
})();

