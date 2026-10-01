/**
 * FahrSchule Schweiz - Interactive Web Application Script
 * Clean vanilla JS: Navigation, Categories Explorer, 2D Road Scene, Signs Explorer, Gamification & FAQ
 */

document.addEventListener('DOMContentLoaded', () => {
  initLanguageSwitcher();
  initMobileNav();
  initCategoriesExplorer();
  initRoadScene();
  initSignsExplorer();
  initGamificationDemo();
  initFaqAccordion();
});

/* ===================================================================
   1. Language Switcher & Localization
   =================================================================== */
let currentLang = 'de';

function initLanguageSwitcher() {
  const langBtn = document.getElementById('currentLangBtn');
  const langDropdown = document.getElementById('langDropdown');
  const langOptions = document.querySelectorAll('.lang-option');

  // Detect language from path, e.g. /de/, /fr/, /it/, /en/
  const path = window.location.pathname.toLowerCase();
  if (path.includes('/fr/')) currentLang = 'fr';
  else if (path.includes('/it/')) currentLang = 'it';
  else if (path.includes('/en/')) currentLang = 'en';
  else if (path.includes('/de/')) currentLang = 'de';
  else {
    const saved = localStorage.getItem('fs_lang');
    if (saved && ['de', 'fr', 'it', 'en'].includes(saved)) {
      currentLang = saved;
    }
  }

  updateLangBtnLabel();

  if (langBtn && langDropdown) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      langDropdown.classList.remove('show');
    });

    langOptions.forEach(opt => {
      opt.addEventListener('click', (e) => {
        const selectedLang = opt.getAttribute('data-lang');
        if (selectedLang) {
          currentLang = selectedLang;
          localStorage.setItem('fs_lang', currentLang);
          updateLangBtnLabel();
          langDropdown.classList.remove('show');
          applyLanguageChanges();
        }
      });
    });
  }
}

function updateLangBtnLabel() {
  const labelEl = document.getElementById('currentLangLabel');
  if (labelEl) {
    const labels = { de: '🇨🇭 DE', fr: '🇫🇷 FR', it: '🇮🇹 IT', en: '🇬🇧 EN' };
    labelEl.textContent = labels[currentLang] || '🇨🇭 DE';
  }
}

function applyLanguageChanges() {
  // Re-render categories & signs with new language
  if (window.renderActiveCategory) window.renderActiveCategory();
  if (window.renderSignsGrid) window.renderSignsGrid();
  if (window.updateSceneInfo) window.updateSceneInfo();
}

/* ===================================================================
   2. Mobile Drawer Navigation
   =================================================================== */
function initMobileNav() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  if (!menuBtn || !drawer) return;

  menuBtn.addEventListener('click', () => {
    drawer.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', drawer.classList.contains('open'));
  });

  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
    });
  });
}

/* ===================================================================
   3. 12 Licence Categories Explorer
   =================================================================== */
let activeCategoryCode = 'B';

function initCategoriesExplorer() {
  const tabsContainer = document.getElementById('categoryTabs');
  const detailContainer = document.getElementById('categoryDetailCard');
  if (!tabsContainer || !detailContainer || typeof SWISS_CATEGORIES_DATA === 'undefined') return;

  // Generate tab buttons
  tabsContainer.innerHTML = '';
  SWISS_CATEGORIES_DATA.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `cat-tab-btn ${cat.code === activeCategoryCode ? 'active' : ''}`;
    btn.innerHTML = `<span>${cat.icon}</span> <span>Kat. ${cat.displayCode}</span>`;
    btn.addEventListener('click', () => {
      activeCategoryCode = cat.code;
      document.querySelectorAll('.cat-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCategoryDetail(cat);
    });
    tabsContainer.appendChild(btn);
  });

  window.renderActiveCategory = () => {
    const cat = SWISS_CATEGORIES_DATA.find(c => c.code === activeCategoryCode) || SWISS_CATEGORIES_DATA[0];
    renderCategoryDetail(cat);
  };

  window.renderActiveCategory();
}

function renderCategoryDetail(cat) {
  const detailContainer = document.getElementById('categoryDetailCard');
  if (!detailContainer) return;

  const isEn = currentLang === 'en';
  const isFr = currentLang === 'fr';
  const isIt = currentLang === 'it';

  const name = isEn ? cat.nameEn : (isFr ? cat.nameFr : (isIt ? cat.nameIt : cat.nameDe));
  const subtitle = isEn ? cat.subtitleEn : (isFr ? cat.subtitleFr : (isIt ? cat.subtitleIt : cat.subtitleDe));
  const desc = isEn ? cat.descEn : (cat.descDe);
  const examType = isEn ? cat.examTypeEn : cat.examTypeDe;
  const questionType = isEn ? cat.questionTypeEn : cat.questionTypeDe;
  const vkuText = isEn ? cat.vkuRequiredEn : cat.vkuRequiredDe;

  detailContainer.innerHTML = `
    <div class="cat-card-left">
      <div class="cat-card-header">
        <div class="cat-badge-code">${cat.displayCode}</div>
        <div class="cat-card-title">
          <h3>${name}</h3>
          <p>${subtitle}</p>
        </div>
      </div>

      <div class="cat-specs-grid">
        <div class="cat-spec-box">
          <div class="cat-spec-label">${isEn ? 'Minimum Age' : (isFr ? 'Âge minimal' : (isIt ? 'Età minima' : 'Mindestalter'))}</div>
          <div class="cat-spec-val">${cat.minAge} ${isEn ? 'years' : (isFr ? 'ans' : (isIt ? 'anni' : 'Jahre'))}</div>
        </div>
        <div class="cat-spec-box">
          <div class="cat-spec-label">${isEn ? 'Exam Questions' : (isFr ? 'Questions' : (isIt ? 'Domande' : 'Prüfungsfragen'))}</div>
          <div class="cat-spec-val">${cat.questionCount} ${isEn ? 'Questions' : 'Fragen'}</div>
        </div>
        <div class="cat-spec-box">
          <div class="cat-spec-label">${isEn ? 'Duration' : (isFr ? 'Durée' : (isIt ? 'Durata' : 'Zeitlimite'))}</div>
          <div class="cat-spec-val">${cat.durationMinutes} min</div>
        </div>
        <div class="cat-spec-box">
          <div class="cat-spec-label">${isEn ? 'Max Errors' : (isFr ? 'Fautes max.' : (isIt ? 'Errori max.' : 'Max. Fehlerpunkte'))}</div>
          <div class="cat-spec-val">${cat.maxErrorPoints} (${cat.passRate} ${isEn ? 'to pass' : 'Bestehquote'})</div>
        </div>
      </div>
    </div>

    <div class="cat-card-right">
      <div class="cat-card-rules">
        <h4>📋 ${examType}</h4>
        <p><strong>${isEn ? 'Question Format' : 'Frageformat'}:</strong> ${questionType}</p>
        <p><strong>${isEn ? 'Requirements' : 'Voraussetzungen'}:</strong> ${vkuText}</p>
        <p style="margin-top: 10px;">${desc}</p>
        <div class="cat-legal-cite">⚖️ Gesetzliche Grundlage: ${cat.legalBasis}</div>
      </div>
    </div>
  `;
}

/* ===================================================================
   4. 2D Kinematic Road Scene Simulation
   =================================================================== */
let sceneAnimationId = null;
let sceneProgress = 0; // 0 to 1
let isScenePlaying = false;
let sceneStep = 0; // 0: initial, 1: red car goes, 2: blue car goes

function initRoadScene() {
  const canvas = document.getElementById('roadSceneCanvas');
  const playBtn = document.getElementById('scenePlayBtn');
  const stepBtn = document.getElementById('sceneStepBtn');
  const resetBtn = document.getElementById('sceneResetBtn');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    drawScene(rect.width, rect.height);
  }

  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 50);

  function drawScene(w, h) {
    ctx.clearRect(0, 0, w, h);

    // Background grass/curb
    ctx.fillStyle = '#10B981';
    ctx.fillRect(0, 0, w, h);

    const roadWidth = Math.min(w, h) * 0.34;
    const cx = w / 2;
    const cy = h / 2;

    // Asphalt Crossroads
    ctx.fillStyle = '#334155';
    // Horizontal road
    ctx.fillRect(0, cy - roadWidth / 2, w, roadWidth);
    // Vertical road
    ctx.fillRect(cx - roadWidth / 2, 0, roadWidth, h);

    // Road Markings (Swiss Guide Lines 6.02 & Leitlinien)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 12]);

    // Horizontal dashed center
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(cx - roadWidth / 2, cy);
    ctx.moveTo(cx + roadWidth / 2, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();

    // Vertical dashed center
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, cy - roadWidth / 2);
    ctx.moveTo(cx, cy + roadWidth / 2);
    ctx.lineTo(cx, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Curbs & Sidewalk borders
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, cy - roadWidth / 2, cx - roadWidth / 2, roadWidth);
    ctx.strokeRect(cx + roadWidth / 2, cy - roadWidth / 2, w - (cx + roadWidth / 2), roadWidth);

    // Pedestrian Crossing Stripes (Swiss Signal 6.17) on West Arm
    ctx.fillStyle = '#FACC15';
    for (let i = -roadWidth / 2 + 6; i < roadWidth / 2 - 6; i += 16) {
      ctx.fillRect(cx - roadWidth / 2 - 32, cy + i, 24, 8);
    }

    // Kinematic Vehicles Positions based on progress
    // Car 1 (Red Car coming from East -> heading West)
    // Priority 1: Has no car on its right! Proceeds first.
    let redX = (w * 0.85) - ((w * 0.85 - w * 0.15) * Math.min(sceneProgress * 1.6, 1.0));
    let redY = cy - roadWidth * 0.25;

    // Car 2 (Blue Car coming from South -> heading North)
    // Priority 2: Must wait until Red Car clears intersection.
    let blueX = cx + roadWidth * 0.25;
    let blueProgress = Math.max(0, (sceneProgress - 0.55) * 2.2);
    let blueY = (h * 0.85) - ((h * 0.85 - h * 0.15) * Math.min(blueProgress, 1.0));

    // Draw Red Car
    drawVehicle(ctx, redX, redY, 44, 24, '#E53935', '1. Vorfahrt', Math.PI);

    // Draw Blue Car
    drawVehicle(ctx, blueX, blueY, 24, 44, '#1E88E5', '2. Wartet', 3 * Math.PI / 2);

    // Priority Marker at Intersection Center
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
  }

  function drawVehicle(ctx, x, y, width, height, color, label, heading) {
    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.roundRect(-width/2 + 2, -height/2 + 2, width, height, 6);
    ctx.fill();

    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-width/2, -height/2, width, height, 6);
    ctx.fill();

    // Windshield
    ctx.fillStyle = '#CBD5E1';
    if (width > height) {
      ctx.fillRect(-width * 0.15, -height * 0.35, width * 0.3, height * 0.7);
    } else {
      ctx.fillRect(-width * 0.35, -height * 0.15, width * 0.7, height * 0.3);
    }

    // Headlights
    ctx.fillStyle = '#FEF08A';
    if (heading === Math.PI) { // facing left
      ctx.fillRect(-width/2, -height/2 + 2, 3, 5);
      ctx.fillRect(-width/2, height/2 - 7, 3, 5);
    } else if (heading === 3 * Math.PI / 2) { // facing up
      ctx.fillRect(-width/2 + 2, -height/2, 5, 3);
      ctx.fillRect(width/2 - 7, -height/2, 5, 3);
    }

    // Label tag
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 0, height/2 + 14);

    ctx.restore();
  }

  function animate() {
    if (!isScenePlaying) return;
    const rect = canvas.getBoundingClientRect();
    sceneProgress += 0.007;
    if (sceneProgress > 1.0) {
      sceneProgress = 0;
    }
    drawScene(rect.width, rect.height);
    sceneAnimationId = requestAnimationFrame(animate);
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      isScenePlaying = !isScenePlaying;
      playBtn.textContent = isScenePlaying ? '⏸️ Pause' : '▶️ Animation Starten';
      if (isScenePlaying) {
        animate();
      } else {
        cancelAnimationFrame(sceneAnimationId);
      }
    });
  }

  if (stepBtn) {
    stepBtn.addEventListener('click', () => {
      isScenePlaying = false;
      if (playBtn) playBtn.textContent = '▶️ Animation Starten';
      sceneStep = (sceneStep + 1) % 3;
      const rect = canvas.getBoundingClientRect();
      if (sceneStep === 0) sceneProgress = 0;
      else if (sceneStep === 1) sceneProgress = 0.45; // red crosses
      else if (sceneStep === 2) sceneProgress = 0.95; // blue crosses
      drawScene(rect.width, rect.height);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      isScenePlaying = false;
      sceneProgress = 0;
      sceneStep = 0;
      if (playBtn) playBtn.textContent = '▶️ Animation Starten';
      const rect = canvas.getBoundingClientRect();
      drawScene(rect.width, rect.height);
    });
  }
}

/* ===================================================================
   5. 71 Swiss Traffic Signs Explorer
   =================================================================== */
let selectedCategoryGroup = 'all';
let signsSearchQuery = '';

function initSignsExplorer() {
  const container = document.getElementById('signsGrid');
  const searchInput = document.getElementById('signsSearchInput');
  const filterBtns = document.querySelectorAll('.sign-tab-btn');
  const modal = document.getElementById('signModal');
  const modalClose = document.getElementById('modalCloseBtn');
  if (!container || typeof SWISS_SIGNS_DATA === 'undefined') return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCategoryGroup = btn.getAttribute('data-group') || 'all';
      renderSigns();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      signsSearchQuery = e.target.value.toLowerCase().trim();
      renderSigns();
    });
  }

  if (modalClose && modal) {
    modalClose.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  window.renderSignsGrid = renderSigns;
  renderSigns();

  function renderSigns() {
    container.innerHTML = '';
    const isEn = currentLang === 'en';
    const isFr = currentLang === 'fr';
    const isIt = currentLang === 'it';

    const filtered = SWISS_SIGNS_DATA.filter(sign => {
      const matchGroup = (selectedCategoryGroup === 'all') || (sign.group === selectedCategoryGroup);
      const name = isEn ? sign.nameEn : (isFr ? sign.nameFr : (isIt ? sign.nameIt : sign.nameDe));
      const matchQuery = !signsSearchQuery ||
        sign.code.toLowerCase().includes(signsSearchQuery) ||
        name.toLowerCase().includes(signsSearchQuery) ||
        sign.descDe.toLowerCase().includes(signsSearchQuery);

      return matchGroup && matchQuery;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-muted);">
          <h3>Keine Signale gefunden</h3>
          <p>Bitte überprüfen Sie Ihre Suchanfrage oder wählen Sie eine andere Kategorie.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(sign => {
      const card = document.createElement('div');
      card.className = 'sign-card';
      const name = isEn ? sign.nameEn : (isFr ? sign.nameFr : (isIt ? sign.nameIt : sign.nameDe));
      const cat = isEn ? sign.catEn : (isFr ? sign.catFr : (isIt ? sign.catIt : sign.catDe));

      card.innerHTML = `
        <span class="sign-badge-num">${sign.code}</span>
        <div class="sign-img-wrap">
          <img src="assets/signs/${sign.svg}" alt="${name}" loading="lazy">
        </div>
        <div class="sign-title">${name}</div>
        <div class="sign-cat-label">${cat}</div>
      `;

      card.addEventListener('click', () => openSignModal(sign));
      container.appendChild(card);
    });
  }

  function openSignModal(sign) {
    if (!modal) return;
    const isEn = currentLang === 'en';
    const isFr = currentLang === 'fr';
    const isIt = currentLang === 'it';

    const name = isEn ? sign.nameEn : (isFr ? sign.nameFr : (isIt ? sign.nameIt : sign.nameDe));
    const cat = isEn ? sign.catEn : (isFr ? sign.catFr : (isIt ? sign.catIt : sign.catDe));
    const desc = isEn ? sign.descEn : (isFr ? sign.descFr : (isIt ? sign.descIt : sign.descDe));

    document.getElementById('modalSignImg').src = `assets/signs/${sign.svg}`;
    document.getElementById('modalSignCode').textContent = `Signal ${sign.code} · ${sign.article}`;
    document.getElementById('modalSignTitle').textContent = name;
    document.getElementById('modalSignCategory').textContent = cat;
    document.getElementById('modalSignDesc').textContent = desc;

    modal.classList.add('active');
  }
}

/* ===================================================================
   6. Gamified Streak & XP Simulator
   =================================================================== */
let userStreak = 7;
let userXp = 140;

function initGamificationDemo() {
  const completeBtn = document.getElementById('demoCompleteLessonBtn');
  const streakValEl = document.getElementById('demoStreakValue');
  const xpValEl = document.getElementById('demoXpValue');
  const xpFillEl = document.getElementById('demoXpFill');
  const celebrationEl = document.getElementById('demoCelebrationText');
  if (!completeBtn || !streakValEl || !xpValEl) return;

  completeBtn.addEventListener('click', () => {
    userStreak++;
    userXp += 20;

    streakValEl.textContent = `${userStreak} Tage`;
    xpValEl.textContent = `${userXp} / 200 XP`;

    const percentage = Math.min((userXp / 200) * 100, 100);
    if (xpFillEl) xpFillEl.style.width = `${percentage}%`;

    if (celebrationEl) {
      celebrationEl.textContent = `🎉 Super gemacht! +20 XP erhalten! Serie auf ${userStreak} Tage verlängert!`;
      celebrationEl.style.display = 'block';
      setTimeout(() => {
        celebrationEl.style.display = 'none';
      }, 3500);
    }
  });
}

/* ===================================================================
   7. Interactive FAQ Accordion
   =================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });
}
