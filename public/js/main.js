// Main JavaScript file for portfolio project
// (Removed startup console.log to keep console clean in production)

// Theme toggle logic
(function () {
    const root = document.documentElement; // using :root for variables
    const STORAGE_KEY = 'portfolio-theme';
    const toggleBtn = document.getElementById('theme-toggle');
    const toggleBtnMobile = document.getElementById('theme-toggle-mobile');
    const iconSpan = document.getElementById('theme-toggle-icon');

    function applyTheme(mode) {
        if (mode === 'light') {
            root.classList.add('light');
            if (iconSpan) iconSpan.textContent = '🌞';
        } else {
            root.classList.remove('light');
            if (iconSpan) iconSpan.textContent = '🌙';
        }
    }

    function currentPrefersLight() {
        return window.matchMedia('(prefers-color-scheme: light)').matches;
    }

    function getStoredTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (__e) {
            return null;
        }
    }

    function storeTheme(mode) {
        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch (__e) {
            /* ignore */
        }
    }

    function initTheme() {
        const stored = getStoredTheme();
        const mode = stored || (currentPrefersLight() ? 'light' : 'dark');
        applyTheme(mode);
    }

    function toggleTheme() {
        const isLight = root.classList.contains('light');
        const next = isLight ? 'dark' : 'light';
        applyTheme(next);
        storeTheme(next);
    }

    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        if (toggleBtn) toggleBtn.addEventListener('click', toggleTheme);
        if (toggleBtnMobile) toggleBtnMobile.addEventListener('click', toggleTheme);
    });
})();

// ---- Site Interactions (moved from inline) ----
document.addEventListener('DOMContentLoaded', () => {
    if (console && console.info) console.info('[portfolio] DOMContentLoaded start');
    // Dynamic content injection
    const isArabic = document.documentElement.lang === 'ar';
    // Add version query to defeat stale SW/cached JSON so new skills update immediately
    const baseContentPath = isArabic ? '../data/content.ar.json' : 'data/content.json';
    const v = (window.BUILD_VERSION || '').toString();
    const contentPath = v ? `${baseContentPath}?v=${v}` : baseContentPath;
    if (console && console.info) console.info('[portfolio] fetching content:', contentPath);
    fetch(contentPath, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((data) => {
            if (console && console.info)
                console.info(
                    '[portfolio] content loaded. summary items:',
                    (data.summary || []).length
                );
            renderSummary(data.summary || []);
            renderProjects(data.projects || []);
            renderSkills(data.skills || []);
            renderPublications(data.publications || []);
            renderOutreach(data.outreach || []);

            // Initialize visitor stats with data from content.json
            initVisitorStats(data);

            window.__PORTFOLIO_DATA__ = data; // expose for simple admin edits
        })
        .catch((err) => {
            console.warn('Content fetch failed:', err);
            // Minimal fallback render so sections not empty if fetch fails
            const fallback = {
                summary: [
                    { title: 'Machine Learning Engineering', body: 'Designing robust ML systems.' },
                    { title: 'LLM & Retrieval', body: 'Building production-grade AI pipelines.' },
                    { title: 'MLOps & Deployment', body: 'Shipping reliable, scalable models.' }
                ],
                projects: [],
                skills: [],
                publications: []
            };
            renderSummary(fallback.summary);
        });

    function renderSummary(items) {
        const container = document.getElementById('summary-cards');
        if (!container) return;
        function derivePillar(title) {
            const t = (title || '').toLowerCase();
            if (t.includes('machine')) return 'Core';
            if (t.includes('generative') || t.includes('llm')) return 'LLMs';
            if (t.includes('vector') || t.includes('retrieval')) return 'Retrieval';
            if (t.includes('pipeline') || t.includes('mlops')) return 'MLOps';
            return 'Focus';
        }
        // Inline SVG icon set (monotone)
        const inlineIconMap = {
            core: "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='3'/><circle cx='12' cy='12' r='8'/></svg>",
            brain: "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><path d='M8 6a3 3 0 0 0-3 3v1.5A2.5 2.5 0 0 0 7.5 13H8v7h1a3 3 0 0 0 3-3v-4h1a3 3 0 0 0 3-3V8a2 2 0 0 0-2-2 2 2 0 0 0-2-2h-1'/><path d='M16 6a3 3 0 0 1 3 3v1.5A2.5 2.5 0 0 1 18.5 13H16v7h-1a3 3 0 0 1-3-3'/></svg>",
            retrieval:
                "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><path d='M3 7h18M3 12h18M3 17h18'/><path d='M8 5v4M12 10v4M16 15v4'/></svg>",
            pipeline:
                "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='3' width='7' height='7' rx='1'/><rect x='14' y='3' width='7' height='7' rx='1'/><rect x='3' y='14' width='7' height='7' rx='1'/><path d='M10 6h4M6.5 10v4M17.5 10v4M10 17h4'/></svg>"
        };
        function pickInlineIcon(name) {
            if (!name) return null;
            const key = name.toLowerCase();
            return inlineIconMap[key] || null;
        }
        function hexToRgba(hex, alpha) {
            if (!hex || typeof hex !== 'string') return `rgba(255,88,88,${alpha})`;
            const h = hex.replace('#', '');
            if (![3, 6].includes(h.length)) return `rgba(255,88,88,${alpha})`;
            const full =
                h.length === 3
                    ? h
                          .split('')
                          .map((c) => c + c)
                          .join('')
                    : h;
            const r = parseInt(full.slice(0, 2), 16);
            const g = parseInt(full.slice(2, 4), 16);
            const b = parseInt(full.slice(4, 6), 16);
            return `rgba(${r},${g},${b},${alpha})`;
        }
        container.innerHTML = items
            .map((s, idx) => {
                const pillar = derivePillar(s.title);
                const metric = s.metric || s.badge;
                const iconHTML = s.icon
                    ? s.icon.includes('/') || s.icon.includes('.svg')
                        ? `<span class='summary-icon'><img src='${escapeAttr(s.icon)}' alt='' loading='lazy' decoding='async' /></span>`
                        : pickInlineIcon(s.icon)
                          ? `<span class='summary-icon'>${pickInlineIcon(s.icon)}</span>`
                          : ''
                    : '';
                const accentFrom = s.colorFrom || s.accentFrom || s.color || '#d92323';
                const accentTo =
                    s.colorTo || s.accentTo || (accentFrom === '#d92323' ? '#ff5858' : accentFrom);
                const tilt = typeof s.tilt === 'number' ? s.tilt : 5;
                const radial = hexToRgba(accentTo, 0.22);
                return `\n            <div class="summary-card card-hover-effect group focus-within:outline-none" tabindex="0" data-index="${idx}" style="--card-accent-from:${escapeAttr(accentFrom)};--card-accent-to:${escapeAttr(accentTo)};--card-tilt-max:${tilt}deg;--card-accent-radial:${radial};">\n              <div class="summary-card-inner">\n                ${iconHTML}\n                <span class="summary-pill" aria-hidden="true">${escapeHTML(s.pillar || pillar)}</span>\n                <h3 class="summary-title">${escapeHTML(s.title)}</h3>\n                <p class="summary-body">${escapeHTML(s.body)}</p>\n                ${metric ? `<span class='summary-metric' aria-label='Key metric'>${escapeHTML(metric)}</span>` : ''}\n              </div>\n            </div>`;
            })
            .join('');
    }

    function renderProjects(items) {
        const container = document.getElementById('projects-grid');
        if (!container) return;
        const wrapper = document.getElementById('projects-carousel');
        const auto = wrapper && wrapper.dataset.auto === 'true';
        // Duplicate items for seamless loop when auto-carousel is enabled
        const list = auto ? [...items, ...items] : items;
        container.innerHTML = list
            .map((p, i) => {
                const isDuped = auto && i >= items.length;
                const baseIdx = i % items.length;
                const altPalette = ['#ff5858', '#2e2e2e', '#d92323', '#3a3a3a'];
                const rawBg = p.image
                    ? `url('${escapeAttr(p.image)}') center/cover`
                    : altPalette[baseIdx % altPalette.length];
                const dark = /#2e2e2e|#3a3a3a|var\(--color-card\)/i.test(rawBg);
                return `
          <div class="project-card has-lid" role="listitem" data-dupe="${isDuped ? 'true' : 'false'}" style="--lid-bg:${rawBg};">
            <div class="project-lid${dark ? ' is-dark' : ''}" tabindex="0">
              ${
                  p.githubUrl
                      ? `<a href='${escapeAttr(p.githubUrl)}' class='proj-gh' target='_blank' rel='noopener' aria-label='GitHub: ${escapeAttr(p.title)}'>
                          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'><path d='M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.93c.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.13-3.2.7-3.88-1.36-3.88-1.36-.53-1.35-1.3-1.71-1.3-1.71-1.07-.73.08-.72.08-.72 1.18.08 1.8 1.21 1.8 1.21 1.05 1.79 2.76 1.27 3.43.97.11-.76.41-1.27.75-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.19a11.1 11.1 0 0 1 2.9-.39 11.1 11.1 0 0 1 2.9.39c2.2-1.5 3.17-1.19 3.17-1.19.63 1.59.24 2.76.12 3.05.75.81 1.2 1.84 1.2 3.1 0 4.43-2.69 5.41-5.25 5.69.42.37.8 1.1.8 2.22 0 1.6-.02 2.88-.02 3.27 0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z'/></svg>
                        </a>`
                      : ''
              }
            </div>
            <div class="project-body">
              <p class="text-brand-gray">${escapeHTML(p.description)}</p>
              <div class="tech-tags">${(p.tech || [])
                  .map((t) => `<span>${escapeHTML(t)}</span>`)
                  .join('')}
              </div>
              ${
                  p.githubUrl
                      ? `<div class='mt-2'><a href='${escapeAttr(p.githubUrl)}' class='text-brand-red text-xs font-semibold hover:underline' target='_blank' rel='noopener'>GitHub →</a></div>`
                      : ''
              }
            </div>
          </div>`;
            })
            .join('');

        // Initialize auto-carousel if enabled
        if (auto) {
            initProjectsSection();
        }
    }

    // Initialize Projects section
    function initProjectsSection() {
        const wrapper = document.getElementById('projects-carousel');
        const track = document.getElementById('projects-grid');

        if (wrapper && track && wrapper.dataset.auto === 'true') {
            // For auto-carousel, pause animation on hover/focus
            wrapper.addEventListener('mouseenter', () => {
                track.style.animationPlayState = 'paused';
            });
            wrapper.addEventListener('mouseleave', () => {
                track.style.animationPlayState = 'running';
            });
            wrapper.addEventListener('focusin', () => {
                track.style.animationPlayState = 'paused';
            });
            wrapper.addEventListener('focusout', () => {
                track.style.animationPlayState = 'running';
            });
        }
    }

    // Progressive Arc Matrix Renderer (elevated version of prior timeline)
    function renderSkills(items) {
        const track = document.getElementById('skills-track');
        if (!track) return;
        track.className = 'skills-matrix progressive-arcs';

        // Allow future structured objects; normalize to { name, percent?, category? }
        const normalized = items.map((it) => {
            if (typeof it === 'string') return { name: it };
            return {
                name: it.name || String(it),
                percent: it.percent,
                category: it.category,
                level: it.level,
                xp: it.xp
            };
        });
        // Deterministic simulated percentages for missing values (stable across loads)
        const base = 58;
        normalized.forEach((s, i) => {
            if (typeof s.percent !== 'number') {
                s.percent = Math.min(97, base + ((i * 7) % 42)); // widen spread slightly
            }
        });

        // Heuristic categories if none supplied
        const catMap = {
            python: 'ML/AI',
            pytorch: 'ML/AI',
            tensorflow: 'ML/AI',
            'scikit-learn': 'ML/AI',
            pandas: 'Data',
            docker: 'DevOps',
            sql: 'Data',
            'apache spark': 'Data',
            spark: 'Data',
            mlflow: 'MLOps'
        };
        normalized.forEach((s) => {
            if (!s.category) {
                const key = s.name.toLowerCase();
                s.category = catMap[key] || 'General';
            }
        });

        // Icon map (static)
        const iconMap = {
            Python: 'images/skills/python.svg',
            PyTorch: 'images/skills/pytorch.svg',
            TensorFlow: 'images/skills/tensorflow.svg',
            'Scikit-learn': 'images/skills/scikit-learn.svg',
            Pandas: 'images/skills/pandas.svg',
            Docker: 'images/skills/docker.svg',
            SQL: 'images/skills/sql.svg',
            'Apache Spark': 'images/skills/spark.svg',
            MLflow: 'images/skills/mlflow.svg',
            'Hugging Face Transformers': 'images/skills/huggingface.svg',
            Diffusers: 'images/skills/diffusers.svg',
            'Neural Networks': 'images/skills/neural-networks.svg',
            Ollama: 'images/skills/ollama.svg',
            'PEFT/LoRA': 'images/skills/peft-lora.svg',
            LlamaIndex: 'images/skills/llamaindex.svg',
            ChromaDB: 'images/skills/chromadb.svg',
            Milvus: 'images/skills/milvus.svg',
            LangGraph: 'images/skills/langgraph.svg',
            CrewAI: 'images/skills/crewai.svg',
            Docling: 'images/skills/docling.svg',
            Tesseract: 'images/skills/tesseract.svg'
        };

        const radius = 30; // inner progress ring
        const outerRadius = 34; // subtle backdrop ring
        const circ = 2 * Math.PI * radius;
        const outerCirc = 2 * Math.PI * outerRadius;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Build category pills (dedupe)
        const pillBar = document.getElementById('skill-category-pills');
        if (pillBar) {
            const cats = Array.from(new Set(normalized.map((s) => s.category)));
            pillBar.innerHTML = '';
            cats.forEach((cat) => {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'skill-cat-pill';
                b.textContent = cat;
                b.setAttribute('data-category', cat);
                b.setAttribute('aria-pressed', 'false');
                // Removed unused event parameter to satisfy lint (no-undef/no-unused-vars)
                b.addEventListener('click', () => {
                    // Toggle all skills in category
                    const skillsInCat = normalized
                        .filter((s) => s.category === cat)
                        .map((s) => s.name);
                    const allSelected = skillsInCat.every((s) => activeSkillFilters.has(s));
                    if (allSelected) {
                        skillsInCat.forEach((s) => activeSkillFilters.delete(s));
                        b.setAttribute('aria-pressed', 'false');
                    } else {
                        skillsInCat.forEach((s) => activeSkillFilters.add(s));
                        b.setAttribute('aria-pressed', 'true');
                    }
                    updateProjectFiltering();
                    announceFilterChange();
                    persistFilters();
                    syncPillStates();
                });
                pillBar.appendChild(b);
            });
            function syncPillStates() {
                Array.from(pillBar.querySelectorAll('button[data-category]')).forEach((btn) => {
                    const cat = btn.getAttribute('data-category');
                    const skillsInCat = normalized
                        .filter((s) => s.category === cat)
                        .map((s) => s.name);
                    const allSelected = skillsInCat.every((s) => activeSkillFilters.has(s));
                    btn.setAttribute('aria-pressed', allSelected ? 'true' : 'false');
                    btn.classList.toggle('active', allSelected);
                });
            }
        }

        const frag = document.createDocumentFragment();
        normalized.forEach((skill, idx) => {
            const wrap = document.createElement('div');
            wrap.className = 'skill-arc';
            wrap.dataset.index = String(idx);
            wrap.dataset.category = skill.category;
            wrap.setAttribute('role', 'progressbar');
            wrap.setAttribute('aria-label', `${skill.name} proficiency`);
            wrap.setAttribute('aria-valuemin', '0');
            wrap.setAttribute('aria-valuemax', '100');
            wrap.setAttribute('aria-valuenow', String(skill.percent));
            const pctVal = skill.percent;
            let band = 'mid';
            if (pctVal < 60) band = 'low';
            else if (pctVal < 80) band = 'mid';
            else if (pctVal < 92) band = 'high';
            else band = 'top';
            wrap.dataset.band = band;

            const fig = document.createElement('figure');
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 90 90');
            svg.classList.add('arc-svg');

            // Outer ambient track (very subtle)
            const outerTrack = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            outerTrack.setAttribute('class', 'ring-outer');
            outerTrack.setAttribute('cx', '45');
            outerTrack.setAttribute('cy', '45');
            outerTrack.setAttribute('r', String(outerRadius));
            outerTrack.style.strokeDasharray = `${outerCirc}`;
            outerTrack.style.strokeDashoffset = '0';

            // Background track
            const trackCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            trackCircle.setAttribute('class', 'ring-track');
            trackCircle.setAttribute('cx', '45');
            trackCircle.setAttribute('cy', '45');
            trackCircle.setAttribute('r', String(radius));
            trackCircle.style.strokeDasharray = `${circ}`;
            trackCircle.style.strokeDashoffset = '0';

            // Progress ring
            const prog = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            prog.setAttribute('class', 'ring-progress');
            prog.setAttribute('cx', '45');
            prog.setAttribute('cy', '45');
            prog.setAttribute('r', String(radius));
            prog.style.strokeDasharray = `${circ}`;
            prog.style.strokeDashoffset = `${circ}`; // start hidden
            prog.style.transformOrigin = '50% 50%';
            prog.style.transform = 'rotate(-90deg)';
            prog.setAttribute('data-target-offset', String(circ * (1 - skill.percent / 100)));
            prog.setAttribute('stroke', 'url(#grad-accent)');

            svg.appendChild(outerTrack);
            svg.appendChild(trackCircle);
            svg.appendChild(prog);

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'skill-item';
            btn.setAttribute('data-skill', skill.name);
            btn.setAttribute('data-category', skill.category);
            btn.setAttribute('aria-label', skill.name + ' skill icon');
            const src = iconMap[skill.name];
            btn.innerHTML = src
                ? `<img src="${escapeAttr(src)}" alt="${escapeAttr(skill.name)} logo" loading="lazy"/>`
                : escapeHTML(skill.name[0] || '?');
            const tooltip = `${skill.name} — ${skill.level || ''} (${skill.percent}%)\nXP: ${skill.xp || 'n/a'}\nCategory: ${skill.category}`;
            btn.setAttribute('data-tooltip', tooltip.trim());

            // Count-up number overlay (hidden until reveal)
            const percentSpan = document.createElement('span');
            percentSpan.className = 'skill-percent';
            percentSpan.textContent = '0%';
            percentSpan.dataset.target = String(skill.percent);

            const nameSpan = document.createElement('span');
            nameSpan.className = 'skill-name';
            nameSpan.textContent = skill.name;

            fig.appendChild(svg);
            fig.appendChild(btn);
            fig.appendChild(percentSpan);
            fig.appendChild(nameSpan);
            wrap.appendChild(fig);
            frag.appendChild(wrap);

            // Filtering interaction (multi-select capable)
            btn.addEventListener('click', (e) => {
                if (typeof handleSkillFilterClick === 'function') {
                    handleSkillFilterClick(e, skill.name);
                }
            });
        });

        track.innerHTML = '';
        track.appendChild(frag);
        initSkillTooltip(track);

        // IntersectionObserver to trigger animations once visible
        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver(
                (entries, o) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return;
                        const el = entry.target;
                        el.classList.add('reveal');
                        const prog = el.querySelector('circle.ring-progress');
                        const num = el.querySelector('.skill-percent');
                        if (prog) {
                            const target = prog.getAttribute('data-target-offset');
                            if (prefersReducedMotion) {
                                prog.style.strokeDashoffset = target;
                            } else {
                                requestAnimationFrame(() => {
                                    prog.style.strokeDashoffset = target;
                                });
                            }
                        }
                        if (num)
                            animateCount(
                                num,
                                Number(num.dataset.target || '0'),
                                prefersReducedMotion
                            );
                        o.unobserve(el);
                    });
                },
                { threshold: 0.25 }
            );
            track.querySelectorAll('.skill-arc').forEach((arc) => obs.observe(arc));
        } else {
            // Fallback – no observer
            track.querySelectorAll('.skill-arc').forEach((el) => {
                const prog = el.querySelector('circle.ring-progress');
                const num = el.querySelector('.skill-percent');
                if (prog)
                    prog.style.strokeDashoffset = prog.getAttribute('data-target-offset') || '0';
                if (num) num.textContent = num.dataset.target + '%';
            });
        }
    }

    function animateCount(el, target, reduced) {
        if (reduced) {
            el.textContent = target + '%';
            return;
        }
        const duration = 1100;
        const nowFn =
            typeof globalThis !== 'undefined' &&
            globalThis.performance &&
            typeof globalThis.performance.now === 'function'
                ? () => globalThis.performance.now()
                : () => Date.now();
        const start = nowFn();
        function step(ts) {
            const p = Math.min(1, (ts - start) / duration);
            const eased = p * (2 - p); // easeOutQuad
            el.textContent = Math.round(eased * target) + '%';
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    // Tooltip system
    let skillTooltipEl = null;
    function ensureSkillTooltip() {
        if (!skillTooltipEl) {
            skillTooltipEl = document.createElement('div');
            skillTooltipEl.className = 'skill-tooltip';
            document.body.appendChild(skillTooltipEl);
        }
        return skillTooltipEl;
    }
    function initSkillTooltip(container) {
        const el = ensureSkillTooltip();
        const move = (e) => {
            const pad = 14;
            let x = e.clientX + pad,
                y = e.clientY + pad;
            const r = el.getBoundingClientRect();
            if (x + r.width + 8 > window.innerWidth) x = e.clientX - r.width - pad;
            if (y + r.height + 8 > window.innerHeight) y = e.clientY - r.height - pad;
            el.style.left = x + 'px';
            el.style.top = y + 'px';
        };
        container.addEventListener('pointerover', (e) => {
            const btn = e.target.closest('button.skill-item');
            if (!btn) return;
            const data = btn.getAttribute('data-tooltip');
            if (!data) return;
            const skillName = btn.getAttribute('data-skill');
            const arc = btn.closest('.skill-arc');
            const pct = arc?.getAttribute('aria-valuenow') || '';
            const category = btn.getAttribute('data-category') || '';
            const lines = data.split(/\n+/);
            const levelLine = lines[0];
            const xpLine = lines.find((l) => /^XP:/i.test(l));
            el.innerHTML =
                `<div class="tt-head"><span>${escapeHTML(skillName || '')}</span><span class="pct">${pct}%</span></div>` +
                `<div class="tt-meta">${category ? `<span>${escapeHTML(category)}</span>` : ''}${levelLine ? `<span>${escapeHTML(levelLine.replace(/^.*—/, '').replace(/\(.*/, '').trim())}</span>` : ''}${xpLine ? `<span>${escapeHTML(xpLine.replace('XP:', '').trim())}</span>` : ''}</div>`;
            el.classList.add('show');
            move(e);
            window.addEventListener('pointermove', move, { passive: true });
        });
        container.addEventListener('pointerout', (e) => {
            if (
                e.relatedTarget &&
                e.relatedTarget.closest &&
                e.relatedTarget.closest('.skill-item')
            )
                return;
            el.classList.remove('show');
        });
        container.addEventListener('pointerdown', () => el.classList.remove('show'));
    }

    const activeSkillFilters = new Set();
    const FILTER_STORAGE_KEY = 'portfolio-skill-filters-v1';
    (function restoreFilters() {
        try {
            const raw = localStorage.getItem(FILTER_STORAGE_KEY);
            if (raw) {
                JSON.parse(raw).forEach((s) => activeSkillFilters.add(s));
            }
        } catch (_e) {
            /* ignore restore error */
        }
    })();
    function persistFilters() {
        try {
            localStorage.setItem(
                FILTER_STORAGE_KEY,
                JSON.stringify(Array.from(activeSkillFilters))
            );
        } catch (_e) {
            /* ignore persist error */
        }
    }
    let lastClickedSkill = null; // for shift-range selection
    function handleSkillFilterClick(evt, skill) {
        const multi = evt.ctrlKey || evt.metaKey; // allow multi-select with Ctrl / Cmd
        const isShift = evt.shiftKey;
        if (isShift && lastClickedSkill) {
            // Range selection across constellation order
            const order = Array.from(document.querySelectorAll('#skills-track [data-skill]'));
            const startIdx = order.findIndex(
                (b) => b.getAttribute('data-skill') === lastClickedSkill
            );
            const endIdx = order.findIndex((b) => b.getAttribute('data-skill') === skill);
            if (startIdx !== -1 && endIdx !== -1) {
                const [a, b] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
                for (let i = a; i <= b; i++) {
                    activeSkillFilters.add(order[i].getAttribute('data-skill'));
                }
            } else {
                activeSkillFilters.add(skill);
            }
        } else if (!multi && !activeSkillFilters.has(skill) && activeSkillFilters.size <= 1) {
            activeSkillFilters.clear();
            activeSkillFilters.add(skill);
        } else if (multi) {
            if (activeSkillFilters.has(skill)) activeSkillFilters.delete(skill);
            else activeSkillFilters.add(skill);
            if (activeSkillFilters.size === 0) {
                updateProjectFiltering();
                announceFilterChange();
                lastClickedSkill = skill;
                return;
            }
        } else if (activeSkillFilters.has(skill) && activeSkillFilters.size === 1) {
            activeSkillFilters.clear();
        } else {
            activeSkillFilters.clear();
            activeSkillFilters.add(skill);
        }
        lastClickedSkill = skill;
        updateProjectFiltering();
        announceFilterChange();
        persistFilters();
    }

    function updateProjectFiltering() {
        const grid = document.getElementById('projects-grid');
        const wrapper = document.getElementById('projects-carousel');
        if (!grid) return;
        const cards = Array.from(grid.children);
        const filters = Array.from(activeSkillFilters);
        const filtering = filters.length > 0;
        let matchedTotal = 0;

        // Update carousel mode based on filtering state
        if (wrapper) {
            if (filtering) {
                // Filtered mode: stop animation and center content
                wrapper.classList.add('filtered-mode');
                grid.style.animationPlayState = 'paused';
            } else {
                // Default mode: restore infinite carousel
                wrapper.classList.remove('filtered-mode');
                grid.style.animationPlayState = 'running';
            }
        }

        if (filtering) grid.classList.add('filtering');
        else grid.classList.remove('filtering');

        cards.forEach((card) => {
            const techBadges = Array.from(card.querySelectorAll('span')).map((s) =>
                (s.textContent || '').toLowerCase()
            );
            // Base visibility: match at least one filter (OR logic) or show all when no filters
            let show = !filtering || filters.some((f) => techBadges.includes(f.toLowerCase()));
            // If we're filtering, suppress the duplicated carousel clones (data-dupe="true")
            // so the user doesn't see repeated project cards.
            if (filtering && card.dataset.dupe === 'true') {
                show = false;
            }
            card.dataset.hidden = show ? 'false' : 'true';
            if (!show) {
                // delay hide to allow transition
                setTimeout(() => {
                    if (card.dataset.hidden === 'true') card.style.display = 'none';
                }, 380);
            } else {
                card.style.display = '';
                matchedTotal++;
            }
        });
        if (!filtering) {
            cards.forEach((c) => {
                c.style.display = '';
                c.dataset.hidden = 'false';
            });
        }
        // Update skill arc selection highlighting
        const skillArcs = document.querySelectorAll('#skills-track .skill-arc');
        skillArcs.forEach((arc) => {
            const name = arc.querySelector('[data-skill]')?.getAttribute('data-skill');
            if (filters.length === 0) {
                arc.removeAttribute('data-selected');
            } else if (name && activeSkillFilters.has(name)) {
                arc.setAttribute('data-selected', 'true');
            } else {
                arc.removeAttribute('data-selected');
            }
        });
        updateFilterIndicators(filters, matchedTotal);
    }

    function updateFilterIndicators(filters, matched) {
        const headerBox = document.getElementById('active-skill-filters');
        const clearBtn = document.getElementById('clear-skill-filters');
        const announcer = document.getElementById('filter-announcer');
        if (!headerBox || !clearBtn) return;
        headerBox.innerHTML = '';
        if (filters.length === 0) {
            headerBox.classList.add('hidden');
            clearBtn.classList.add('hidden');
            if (announcer) announcer.textContent = 'Filters cleared. Showing all projects.';
            document
                .querySelectorAll('.skills-legend button[data-category]')
                .forEach((b) => b.setAttribute('aria-pressed', 'false'));
            return;
        }
        headerBox.classList.remove('hidden');
        clearBtn.classList.remove('hidden');
        filters.forEach((f) => {
            const pill = document.createElement('span');
            pill.className = 'px-2 py-1 bg-gray-700 rounded-full';
            pill.textContent = f;
            headerBox.appendChild(pill);
        });
        clearBtn.onclick = () => {
            activeSkillFilters.clear();
            updateProjectFiltering();
            announceFilterChange();
            persistFilters();
        };
        clearBtn.textContent = 'Clear Filters (' + matched + ')';
    }

    function announceFilterChange() {
        const announcer = document.getElementById('filter-announcer');
        if (!announcer) return;
        const filters = Array.from(activeSkillFilters);
        if (filters.length === 0) {
            announcer.textContent = 'All projects visible';
        } else {
            announcer.textContent = 'Filtered by ' + filters.join(', ');
        }
    }

    // Category legend click -> toggle all category skills
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.skills-legend button[data-category]');
        if (!target) return;
        const cat = target.getAttribute('data-category');
        const skillsInCat = Array.from(
            document.querySelectorAll(`#skills-track [data-category='${cat}']`)
        ).map((el) => el.getAttribute('data-skill'));
        const allSelected = skillsInCat.every((s) => activeSkillFilters.has(s));
        if (allSelected) {
            skillsInCat.forEach((s) => activeSkillFilters.delete(s));
            target.setAttribute('aria-pressed', 'false');
        } else {
            skillsInCat.forEach((s) => activeSkillFilters.add(s));
            target.setAttribute('aria-pressed', 'true');
        }
        updateProjectFiltering();
        announceFilterChange();
        persistFilters();
    });

    // Lazy-load constellation: wait until skills section visible
    const skillsSection = document.getElementById('skills');
    if (skillsSection && 'IntersectionObserver' in window) {
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // If not rendered yet (no children), re-render skills from cached data
                        if (
                            skillsSection.querySelector('#skills-track')?.children.length === 0 &&
                            window.__PORTFOLIO_DATA__?.skills
                        ) {
                            renderSkills(window.__PORTFOLIO_DATA__.skills);
                        }
                        obs.disconnect();
                    }
                });
            },
            { threshold: 0.15 }
        );
        obs.observe(skillsSection);
    }

    function renderPublications(items) {
        const heroContainer = document.getElementById('publications-hero');
        const gridContainer = document.getElementById('publications-grid');
        const controlsContainer = document.getElementById('publications-controls');
        if (!heroContainer || !gridContainer) return;
        if (!Array.isArray(items)) return;

        // Normalize publication objects (expected keys: title, image, published, description, link, type, domain, featured, pdf)
        const normalized = items
            .map((it) => {
                if (typeof it === 'string') {
                    return { title: it };
                }
                return {
                    title: it.title || it.name || 'Untitled',
                    image: it.image || '',
                    published: it.published || it.date || '',
                    description: it.description || it.summary || '',
                    link: it.link || it.url || '#',
                    type: it.type || '',
                    domain: it.domain || it.topic || '',
                    featured: !!it.featured,
                    pdf: it.pdf || null,
                    readingTime: it.readingTime || null
                };
            })
            .sort((a, b) => {
                const da = Date.parse(a.published) || 0;
                const db = Date.parse(b.published) || 0;
                return db - da;
            });
        function approxReading(text) {
            if (!text) return '';
            const words = String(text).trim().split(/\s+/).length;
            const mins = Math.max(1, Math.round(words / 200));
            return mins + ' min';
        }

        // --- Missing helper utilities (added) ---
        function badgeHTML(pub) {
            const pills = [];
            if (pub.type) pills.push(`<span class="pub-pill type">${escapeHTML(pub.type)}</span>`);
            if (pub.domain)
                pills.push(`<span class="pub-pill domain">${escapeHTML(pub.domain)}</span>`);
            if (pub.featured) pills.push('<span class="pub-pill featured">Featured</span>');
            if (!pills.length) return '';
            return `<div class="pub-badges" aria-label="Tags">${pills.join('')}</div>`;
        }
        function metaRow(pub) {
            const rt = pub.readingTime || approxReading(pub.description);
            let dateDisplay = '';
            if (pub.published) {
                // Try to parse; if invalid keep original string only
                const ts = Date.parse(pub.published.replace(/,/g, '')); // tolerate comma
                if (!isNaN(ts)) {
                    const iso = new Date(ts).toISOString().split('T')[0];
                    dateDisplay = `<time datetime="${iso}">${escapeHTML(pub.published)}</time>`;
                } else {
                    dateDisplay = `<span class="pub-date">${escapeHTML(pub.published)}</span>`;
                }
            }
            return `<div class="pub-meta-row">${dateDisplay}${rt ? `<span class="reading-time">${escapeHTML(rt)}</span>` : ''}</div>`;
        }

        function summaryHTML(pub) {
            return `<p class="pub-summary">${escapeHTML(pub.description || '')}</p>`;
        }

        function featureCardHTML(pub, idx) {
            return `<article class="pub-feature-card" aria-labelledby="feature-${idx}-title">
                                <img class="thumb" src="${escapeAttr(pub.image)}" alt="${escapeAttr(pub.title)}" loading="lazy" />
                                <div class="content">
                                    ${badgeHTML(pub)}
                                    <h3 class="pub-title" id="feature-${idx}-title"><a href="${escapeAttr(pub.link)}" target="_blank" rel="noopener">${escapeHTML(pub.title)}</a></h3>
                                    ${metaRow(pub)}
                                    ${summaryHTML(pub)}
                                    <div class="pub-actions">
                                        <a class="pub-btn primary" href="${escapeAttr(pub.link)}" target="_blank" rel="noopener" aria-label="Read ${escapeAttr(pub.title)}">Read →</a>
                                        ${pub.pdf ? `<a class="pub-btn" href="${escapeAttr(pub.pdf)}" target="_blank" rel="noopener" aria-label="Download PDF of ${escapeAttr(pub.title)}">PDF</a>` : ''}
                                    </div>
                                </div>
                        </article>`;
        }

        function cardHTML(pub, i) {
            return `
            <article class="pub-card" aria-labelledby="pub-${i}-title">
              <img src="${escapeAttr(pub.image)}" alt="${escapeAttr(pub.title)}" class="cover" loading="lazy" />
              ${badgeHTML(pub)}
              <h3 class="pub-title" id="pub-${i}-title"><a href="${escapeAttr(pub.link)}" target="_blank" rel="noopener">${escapeHTML(
                  pub.title
              )}</a></h3>
              ${metaRow(pub)}
              ${summaryHTML(pub)}
              <div class="pub-actions">
                <a class="pub-btn" href="${escapeAttr(pub.link)}" target="_blank" rel="noopener" aria-label="Read ${escapeAttr(
                    pub.title
                )}">Open</a>
                ${pub.pdf ? `<a class="pub-btn" href="${escapeAttr(pub.pdf)}" target="_blank" rel="noopener" aria-label="Download PDF of ${escapeAttr(pub.title)}">PDF</a>` : ''}
              </div>
            </article>`;
        }

        // Parse + feature selection logic (wrap normalized list)
        const parsed = normalized.map((raw) => ({ raw }));
        const explicitFeatured = normalized.filter((p) => p.featured);
        const fill = normalized
            .filter((p) => !p.featured)
            .slice(0, Math.max(0, 2 - explicitFeatured.length));
        const featuredSet = [...explicitFeatured, ...fill].slice(0, 2);
        const featIds = new Set(featuredSet.map((p) => p.title + '|' + p.published));
        const rest = normalized.filter((p) => !featIds.has(p.title + '|' + p.published));

        // Build filter/search UI once
        if (controlsContainer && !controlsContainer.dataset.ready) {
            const types = Array.from(
                new Set(items.map((p) => (p.type || '').trim().toLowerCase()).filter(Boolean))
            );
            const pillsHTML = types
                .map(
                    (t) =>
                        `<button class="pub-filter-pill" data-type="${escapeAttr(
                            t
                        )}" aria-pressed="false">${escapeHTML(t)}</button>`
                )
                .join('');
            controlsContainer.innerHTML = `
                            <div class="pub-search-outer" data-enhanced>
                                <div class="pub-search-box" role="search">
                                    <span class="icon" aria-hidden="true">🔍</span>
                                    <input id="pub-search" type="search" autocomplete="off" spellcheck="false" placeholder="Search guides & reports..." aria-label="Search publications" />
                                    <button type="button" class="clear-btn" id="pub-search-clear" aria-label="Clear search" hidden>✕</button>
                                    <div class="ring-anim" aria-hidden="true"></div>
                                </div>
                            </div>
                            <div class="pub-filter-pills" role="toolbar" aria-label="Publication type filters">${pillsHTML}</div>`;
            controlsContainer.dataset.ready = 'true';

            controlsContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.pub-filter-pill');
                if (!btn) return;
                const pressed = btn.getAttribute('aria-pressed') === 'true';
                // Single-select behavior; could be multi if desired
                controlsContainer
                    .querySelectorAll('.pub-filter-pill[aria-pressed="true"]')
                    .forEach((b) => b.setAttribute('aria-pressed', 'false'));
                btn.setAttribute('aria-pressed', pressed ? 'false' : 'true');
                applyFilters();
            });
            const searchInput = controlsContainer.querySelector('#pub-search');
            const clearBtn = controlsContainer.querySelector('#pub-search-clear');
            searchInput.addEventListener('input', () => {
                clearBtn.hidden = searchInput.value.length === 0;
                applyFilters();
            });
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && searchInput.value) {
                    searchInput.value = '';
                    clearBtn.hidden = true;
                    applyFilters();
                }
            });
            clearBtn.addEventListener('click', () => {
                if (!searchInput.value) return;
                searchInput.value = '';
                clearBtn.hidden = true;
                applyFilters();
                searchInput.focus();
            });
        }

        // Attach skeleton shimmer loaders to publication images
        function attachPubImageSkeletons(scopeRoot = document) {
            const imgs = scopeRoot.querySelectorAll(
                '#publications-hero img.thumb:not([data-skel]), #publications-grid img.cover:not([data-skel])'
            );
            imgs.forEach((img) => {
                img.dataset.skel = '1';
                img.classList.add('pub-img-skel');
                if (img.complete) {
                    // If already cached
                    requestAnimationFrame(() => img.classList.add('loaded'));
                } else {
                    img.addEventListener('load', () => img.classList.add('loaded'), {
                        once: true
                    });
                    img.addEventListener(
                        'error',
                        () => {
                            img.classList.add('loaded');
                            img.classList.add('error');
                        },
                        { once: true }
                    );
                }
            });
        }

        function applyFilters() {
            const searchEl = controlsContainer?.querySelector('#pub-search');
            const q = (searchEl?.value || '').toLowerCase();
            const activeType = controlsContainer?.querySelector(
                '.pub-filter-pill[aria-pressed="true"]'
            )?.dataset.type;
            const predicate = (p) => {
                const matchesType = activeType ? (p.type || '').toLowerCase() === activeType : true;
                if (!matchesType) return false;
                if (!q) return true;
                const blob = [p.title, p.description, p.type, p.domain]
                    .filter(Boolean)
                    .join(' ') //
                    .toLowerCase();
                return blob.includes(q);
            };

            const filtered = parsed.filter((o) => predicate(o.raw)).map((o) => o.raw);
            // Recompute featured subset for filtered set
            const reFeatExplicit = filtered.filter((p) => p.featured);
            const reFeatFill = filtered
                .filter((p) => !p.featured)
                .slice(0, Math.max(0, 2 - reFeatExplicit.length));
            const reFeatured = [...reFeatExplicit, ...reFeatFill].slice(0, 2);
            const reIds = new Set(reFeatured.map((p) => p.title + '|' + p.published));
            const remainder = filtered.filter((p) => !reIds.has(p.title + '|' + p.published));
            heroContainer.innerHTML = reFeatured.length
                ? `<div class="pub-featured-row">${reFeatured
                      .map((p, i) => featureCardHTML(p, i))
                      .join('')}</div>`
                : '';
            if (reFeatured.length === 0 && remainder.length === 0) {
                gridContainer.innerHTML = `<div class="pub-empty" role="status">No publications match your filters.<button type="button" class="pub-reset">Reset</button></div>`;
            } else {
                gridContainer.innerHTML = remainder.map(cardHTML).join('');
            }
            requestAnimationFrame(equalizeHeights);
            attachPubImageSkeletons(heroContainer);
            attachPubImageSkeletons(gridContainer);
            // Publication image path recovery (filter re-render)
            runPublicationImageRecovery();
            const resetBtn = gridContainer.querySelector('.pub-empty .pub-reset');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    // Clear filters & search
                    controlsContainer
                        ?.querySelectorAll('.pub-filter-pill[aria-pressed="true"]')
                        .forEach((b) => b.setAttribute('aria-pressed', 'false'));
                    if (searchEl) searchEl.value = '';
                    applyFilters();
                });
            }
        }

        heroContainer.innerHTML = featuredSet.length
            ? `<div class="pub-featured-row">${featuredSet
                  .map((p, i) => featureCardHTML(p, i))
                  .join('')}</div>`
            : '';
        if (featuredSet.length === 0 && rest.length === 0) {
            gridContainer.innerHTML = `<div class="pub-empty" role="status">No publications available yet.</div>`;
        } else {
            gridContainer.innerHTML = rest.map(cardHTML).join('');
        }
        requestAnimationFrame(equalizeHeights);
        attachPubImageSkeletons(heroContainer);
        attachPubImageSkeletons(gridContainer);
        // Publication image path recovery (initial render)
        runPublicationImageRecovery();

        function equalizeHeights() {
            // Equalize summary heights in feature cards for clean row
            const featureCards = heroContainer.querySelectorAll('.pub-feature-card');
            let maxSummary = 0;
            featureCards.forEach((card) => {
                const sum = card.querySelector('.pub-summary');
                if (sum) {
                    sum.style.maxHeight = 'none';
                    const h = sum.getBoundingClientRect().height;
                    if (h > maxSummary) maxSummary = h;
                }
            });
            featureCards.forEach((card) => {
                const sum = card.querySelector('.pub-summary');
                if (sum) sum.style.maxHeight = maxSummary + 'px';
            });

            // Grid card title balancing (optional minor tweak)
            const titles = gridContainer.querySelectorAll('.pub-card .pub-title');
            let maxTitle = 0;
            titles.forEach((t) => {
                t.style.maxHeight = 'none';
                const h = t.getBoundingClientRect().height;
                if (h > maxTitle) maxTitle = h;
            });
            titles.forEach((t) => (t.style.maxHeight = maxTitle + 'px'));
        }

        // Apply filters initially if controls exist
        if (controlsContainer?.dataset.ready) applyFilters();
    }

    /* ---------------- Outreach / Training / Conferences ---------------- */
    function renderOutreach(items) {
        const grid = document.getElementById('outreach-grid');
        if (!grid) return;
        if (!Array.isArray(items) || items.length === 0) {
            grid.innerHTML =
                '<div class="p-4 rounded-lg bg-brand-card border border-gray-700 text-center text-sm text-gray-400">No engagements yet.</div>';
            return;
        }
        // Normalize + sort (newest first by date if ISO or fallback string)
        const normalized = items
            .map((o) => ({
                title: o.title || 'Untitled',
                type: o.type || 'Session',
                date: o.date || '',
                location: o.location || '',
                audience: o.audience || '',
                description: o.description || '',
                link: o.link || o.slides || '',
                slides: o.slides || '',
                image: o.image || ''
            }))
            .sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));

        const typeSet = Array.from(new Set(normalized.map((n) => n.type))).sort();
        const filterBar = document.getElementById('outreach-filters');
        if (filterBar && !filterBar.dataset.ready) {
            filterBar.innerHTML = typeSet
                .map(
                    (t) =>
                        `<button class="px-3 py-1 rounded-full bg-gray-800 hover:bg-gray-700 transition text-gray-300" data-type="${escapeAttr(t)}" aria-pressed="false">${escapeHTML(t)}</button>`
                )
                .join('');
            filterBar.dataset.ready = 'true';
            filterBar.addEventListener('click', (e) => {
                const btn = e.target.closest('button[data-type]');
                if (!btn) return;
                const active = btn.getAttribute('aria-pressed') === 'true';
                filterBar
                    .querySelectorAll('button[aria-pressed="true"]')
                    .forEach((b) => b.setAttribute('aria-pressed', 'false'));
                btn.setAttribute('aria-pressed', active ? 'false' : 'true');
                applyFilters();
            });
        }

        function cardHTML(ev, _i) {
            const d = ev.date
                ? `<time datetime="${escapeAttr(ev.date)}" class="block text-xs text-gray-400">${escapeHTML(ev.date)}</time>`
                : '';
            const loc = ev.location
                ? `<span class="text-xs text-gray-400">${escapeHTML(ev.location)}</span>`
                : '';
            const aud = ev.audience
                ? `<span class="text-xs text-gray-400">${escapeHTML(ev.audience)}</span>`
                : '';
            const linkBtn = ev.link
                ? `<a href="${escapeAttr(ev.link)}" target="_blank" rel="noopener" class="mt-3 inline-flex items-center gap-1 text-brand-red text-xs font-semibold hover:underline">Details →</a>`
                : '';
            const slidesBtn =
                !ev.link && ev.slides
                    ? `<a href="${escapeAttr(ev.slides)}" target="_blank" rel="noopener" class="mt-3 inline-flex items-center gap-1 text-brand-red text-xs font-semibold hover:underline">Slides →</a>`
                    : '';
            const img = ev.image
                ? `<div class="h-32 -mx-4 -mt-4 mb-3 rounded-t-lg overflow-hidden bg-gray-800"><img src="${escapeAttr(ev.image)}" alt="" class="w-full h-full object-cover" loading="lazy"/></div>`
                : '';
            return `<article class="relative p-4 rounded-lg bg-brand-card border border-gray-700 flex flex-col min-h-[200px] hover:border-brand-red/60 transition group" data-type="${escapeAttr(ev.type)}">
                ${img}
                <div class="flex items-start justify-between gap-3 mb-1">
                    <h3 class="text-sm font-semibold text-white leading-snug flex-1">${escapeHTML(ev.title)}</h3>
                    <span class="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 group-hover:bg-brand-red/20 group-hover:text-brand-red transition">${escapeHTML(ev.type)}</span>
                </div>
                ${d}
                <div class="flex gap-2 flex-wrap mt-1">${loc}${aud}</div>
                <p class="mt-2 text-xs text-gray-300 leading-relaxed line-clamp-4">${escapeHTML(ev.description)}</p>
                ${linkBtn || slidesBtn || ''}
            </article>`;
        }

        function applyFilters() {
            const activeBtn = filterBar?.querySelector('button[aria-pressed="true"]');
            const activeType = activeBtn?.dataset.type || null;
            const list = activeType ? normalized.filter((n) => n.type === activeType) : normalized;
            grid.innerHTML = list.map(cardHTML).join('');
        }
        applyFilters();
    }

    // Helper added outside renderPublications so both initial & dynamic renders can use it
    function runPublicationImageRecovery() {
        const triedAttr = 'data-img-fallback-idx';
        const altRoots = ['src', 'images', 'docs'];
        document
            .querySelectorAll('#publications-hero img.thumb, #publications-grid img.cover')
            .forEach((img) => {
                if (img.getAttribute('data-img-recovery-bound') === '1') return;
                img.setAttribute('data-img-recovery-bound', '1');
                function tryNext() {
                    const current = img.getAttribute('src') || '';
                    const file = current.split(/[/\\]/).pop();
                    let idx = Number(img.getAttribute(triedAttr) || '0');
                    const candidates = [];
                    altRoots.forEach((r) => {
                        const prefix = r + '/';
                        if (!current.startsWith(prefix)) candidates.push(prefix + file);
                    });
                    if (idx >= candidates.length) return; // exhausted
                    img.setAttribute(triedAttr, String(idx + 1));
                    const next = candidates[idx];
                    img.src = next;
                }
                img.addEventListener('error', () => {
                    if (img.complete && img.naturalWidth > 0) return; // already loaded after race
                    tryNext();
                });
                // If still zero after delay with no error fired (some browsers), trigger manually
                setTimeout(() => {
                    if (img.naturalWidth === 0 && !img.hasAttribute(triedAttr)) {
                        tryNext();
                    }
                }, 1200);
            });
    }

    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    function escapeAttr(str) {
        return escapeHTML(str).replace(/`/g, '&#96;');
    }
    /* DEV-OVERLAY-START */
    // Dev-only content editing overlay with schema validation & warning banner
    (function devOverlay() {
        const ADMIN_TOKEN = 'dev';
        function isProductionHost() {
            return /github\.io$/i.test(window.location.hostname);
        }
        function adminHashToken() {
            const h = window.location.hash;
            if (h === '#admin') return ADMIN_TOKEN; // legacy shortcut
            if (h.startsWith('#admin=')) return h.split('=')[1] || '';
            return null;
        }
        const candidateToken = adminHashToken();
        if (isProductionHost() || candidateToken !== ADMIN_TOKEN) return; // exit if not allowed

        injectAdminPanel();

        function injectAdminPanel() {
            // Visual banner
            const banner = document.createElement('div');
            banner.id = 'admin-dev-banner';
            banner.className =
                'fixed top-0 left-0 right-0 bg-red-700 text-white text-center text-xs md:text-sm py-1 px-4 font-semibold tracking-wide shadow-lg z-[60]';
            banner.textContent = 'DEV MODE ACTIVE: Admin Overlay Enabled – Edits are local only';
            document.body.appendChild(banner);

            const panel = document.createElement('div');
            panel.innerHTML = `\n          <div id="admin-panel" class="fixed bottom-4 right-4 w-96 max-h-[80vh] bg-brand-card border border-gray-700 rounded-lg shadow-xl flex flex-col text-sm z-50">\n            <div class="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-t">\n              <strong class="text-white">Content Admin (ephemeral)</strong>\n              <button id="admin-close" class="text-gray-400 hover:text-white" aria-label="Close admin panel">×</button>\n            </div>\n            <textarea id="admin-json" class="flex-1 p-3 bg-black text-gray-200 font-mono resize-none outline-none" aria-label="Editable JSON content"></textarea>\n            <div class="p-2 flex gap-2 flex-wrap">\n              <button id="admin-apply" class="bg-brand-red text-white px-3 py-1 rounded">Apply</button>\n              <button id="admin-copy" class="bg-gray-700 text-white px-3 py-1 rounded">Copy JSON</button>\n              <button id="admin-pretty" class="bg-gray-700 text-white px-3 py-1 rounded">Format</button>\n            </div>\n            <div id="admin-msg" class="px-3 pb-2 text-xs font-mono text-gray-400" aria-live="polite"></div>\n          </div>`;
            document.body.appendChild(panel);
            const ta = document.getElementById('admin-json');
            ta.value = JSON.stringify(window.__PORTFOLIO_DATA__ || {}, null, 2);
            const msgEl = document.getElementById('admin-msg');
            document.getElementById('admin-close').onclick = () => {
                panel.remove();
                banner.remove();
            };
            document.getElementById('admin-copy').onclick = () => {
                navigator.clipboard.writeText(ta.value).catch(() => {});
            };
            document.getElementById('admin-pretty').onclick = () => {
                try {
                    const parsed = JSON.parse(ta.value);
                    ta.value = JSON.stringify(parsed, null, 2);
                } catch (__e) {
                    /* ignore */
                }
            };

            function validateContent(data) {
                const errors = [];
                const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
                const assert = (cond, path, exp) => {
                    if (!cond) errors.push(`${path}: expected ${exp}`);
                };
                if ('summary' in data) assert(Array.isArray(data.summary), 'summary', 'array');
                if (Array.isArray(data.summary)) {
                    data.summary.forEach((s, i) => {
                        assert(isObj(s), `summary[${i}]`, 'object');
                        if (isObj(s)) {
                            assert(typeof s.title === 'string', `summary[${i}].title`, 'string');
                            assert(typeof s.body === 'string', `summary[${i}].body`, 'string');
                        }
                    });
                }
                if ('projects' in data) assert(Array.isArray(data.projects), 'projects', 'array');
                if (Array.isArray(data.projects)) {
                    data.projects.forEach((p, i) => {
                        assert(isObj(p), `projects[${i}]`, 'object');
                        if (isObj(p)) {
                            ['title', 'image', 'description'].forEach((k) =>
                                assert(typeof p[k] === 'string', `projects[${i}].${k}`, 'string')
                            );
                            if (p.tech !== undefined)
                                assert(
                                    Array.isArray(p.tech) &&
                                        p.tech.every((t) => typeof t === 'string'),
                                    `projects[${i}].tech`,
                                    'string[]'
                                );
                        }
                    });
                }
                if ('skills' in data)
                    assert(
                        Array.isArray(data.skills) &&
                            data.skills.every((s) => typeof s === 'string'),
                        'skills',
                        'string[]'
                    );
                if ('publications' in data)
                    assert(Array.isArray(data.publications), 'publications', 'array');
                if (Array.isArray(data.publications)) {
                    data.publications.forEach((p, i) => {
                        assert(isObj(p), `publications[${i}]`, 'object');
                        if (isObj(p)) {
                            ['title', 'image', 'published', 'description', 'link'].forEach((k) =>
                                assert(
                                    typeof p[k] === 'string',
                                    `publications[${i}].${k}`,
                                    'string'
                                )
                            );
                        }
                    });
                }
                return { valid: errors.length === 0, errors };
            }

            document.getElementById('admin-apply').onclick = () => {
                try {
                    const parsed = JSON.parse(ta.value);
                    const { valid, errors } = validateContent(parsed);
                    if (!valid) {
                        msgEl.textContent = 'Validation failed: ' + errors[0];
                        msgEl.classList.remove('text-green-400');
                        msgEl.classList.add('text-red-400');
                        ta.style.borderColor = 'red';
                        setTimeout(() => (ta.style.borderColor = ''), 1500);
                        return;
                    }
                    window.__PORTFOLIO_DATA__ = parsed;
                    renderSummary(parsed.summary || []);
                    renderProjects(parsed.projects || []);
                    renderSkills(parsed.skills || []);
                    renderPublications(parsed.publications || []);
                    msgEl.textContent = 'Applied successfully';
                    msgEl.classList.remove('text-red-400');
                    msgEl.classList.add('text-green-400');
                } catch (__e) {
                    ta.style.borderColor = 'red';
                    setTimeout(() => (ta.style.borderColor = ''), 1200);
                }
            };
        }
    })();
    /* DEV-OVERLAY-END */
    // Mobile menu
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
        const links = mobileMenu.getElementsByTagName('a');
        for (let link of links)
            link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    }

    // Typing animation (respect reduced motion)
    const typingElement = document.querySelector('#hero-title .gradient-text');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const words = ['LLM Specialist', 'AI Researcher', 'Problem Solver'];
    let wordIndex = 0,
        charIndex = 0,
        isDeleting = false;
    function type() {
        if (!typingElement) return;
        const currentWord = words[wordIndex];
        // Respect reduced motion: render one static word if user prefers reduced motion.
        if (prefersReducedMotion) {
            if (!typingElement.textContent) typingElement.textContent = currentWord;
            return;
        }
        const displayText = currentWord.substring(0, charIndex);
        typingElement.innerHTML = `${displayText}<span class="typewriter-cursor" aria-hidden="true"></span>`;
        if (!isDeleting && charIndex < currentWord.length) {
            charIndex++;
            setTimeout(type, 120);
        } else if (isDeleting && charIndex > 0) {
            charIndex--;
            setTimeout(type, 80);
        } else {
            isDeleting = !isDeleting;
            if (!isDeleting) wordIndex = (wordIndex + 1) % words.length;
            setTimeout(type, 1200);
        }
    }

    /* -------------------------------------------------- */
    /* Hero Photo & Summary Cards Enhancements            */
    /* -------------------------------------------------- */
    (function initHeroPhotoAndSummary() {
        const heroPhoto = document.querySelector('.hero-photo');
        // Hero video progressive enhancement
        // Video removed per design update (fallback now static photo). Cleanup any legacy classes.
        if (heroPhoto && !heroPhoto.dataset.enhanced) {
            heroPhoto.dataset.enhanced = 'true';
            // (Ring removed per request)
            // 3D toggle button (added early so user can switch once loaded)
            const toggle3D = document.createElement('button');
            toggle3D.type = 'button';
            toggle3D.className =
                'absolute -bottom-5 left-1/2 -translate-x-1/2 z-10 text-xs px-3 py-1 rounded-md bg-brand-red/80 hover:bg-brand-red text-white shadow focus:outline-none focus-visible:ring ring-brand-red/60 transition';
            toggle3D.textContent = '3D';
            toggle3D.setAttribute('aria-pressed', 'false');
            heroPhoto.appendChild(toggle3D);

            // Particle layer (lightweight custom canvas; skips if prefers-reduced-motion)
            const prMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (!prMotion) {
                const pCanvas = document.createElement('canvas');
                pCanvas.className = 'hero-particles';
                const ctx = pCanvas.getContext('2d');
                heroPhoto.appendChild(pCanvas); // behind ring (z-index:-1 via CSS)
                // Toggle control
                const toggleBtn = document.createElement('button');
                toggleBtn.type = 'button';
                toggleBtn.className = 'hero-particles-toggle';
                toggleBtn.setAttribute('aria-pressed', 'true');
                toggleBtn.title = 'Toggle portrait particles';
                toggleBtn.innerHTML = '<span>Particles</span>';
                heroPhoto.appendChild(toggleBtn);
                let enabled = true;
                toggleBtn.addEventListener('click', () => {
                    enabled = !enabled;
                    toggleBtn.setAttribute('aria-pressed', String(enabled));
                    if (enabled) requestAnimationFrame(tickParticles);
                });
                function resizeParticles() {
                    const r = heroPhoto.getBoundingClientRect();
                    const dpr = window.devicePixelRatio || 1;
                    pCanvas.width = r.width * dpr;
                    pCanvas.height = r.height * dpr;
                    pCanvas.style.width = r.width + 'px';
                    pCanvas.style.height = r.height + 'px';
                }
                resizeParticles();
                window.addEventListener('resize', resizeParticles, { passive: true });
                const BASE_COUNT = 32;
                let PARTICLE_COUNT = BASE_COUNT;
                let idle = false;
                let idleTimer = null;
                function armIdle() {
                    if (idleTimer) clearTimeout(idleTimer);
                    idleTimer = setTimeout(() => (idle = true), 5000);
                    idle = false;
                }
                heroPhoto.addEventListener('pointermove', armIdle);
                armIdle();
                const particles = Array.from({ length: PARTICLE_COUNT }).map(() => {
                    return {
                        a: Math.random() * Math.PI * 2,
                        r: 0.25 + Math.random() * 0.45, // relative radius (0..1) of circle
                        spd: 0.0006 + Math.random() * 0.0012,
                        size: 1 + Math.random() * 2,
                        phase: Math.random() * Math.PI * 2
                    };
                });
                function repopulate(targetCount) {
                    if (targetCount === particles.length) return;
                    if (targetCount < particles.length) {
                        particles.length = targetCount;
                        return;
                    }
                    while (particles.length < targetCount) {
                        particles.push({
                            a: Math.random() * Math.PI * 2,
                            r: 0.25 + Math.random() * 0.45,
                            spd: 0.0006 + Math.random() * 0.0012,
                            size: 1 + Math.random() * 2,
                            phase: Math.random() * Math.PI * 2
                        });
                    }
                }
                // Density shift on hover focus
                heroPhoto.addEventListener('pointerenter', () => {
                    PARTICLE_COUNT = (BASE_COUNT * 1.5) | 0;
                    repopulate(PARTICLE_COUNT);
                });
                heroPhoto.addEventListener('pointerleave', () => {
                    PARTICLE_COUNT = BASE_COUNT;
                    repopulate(PARTICLE_COUNT);
                });
                // Observer to pause when off-screen
                let visible = true;
                if ('IntersectionObserver' in window) {
                    const visObs = new IntersectionObserver(
                        (entries) => {
                            entries.forEach((e) => {
                                visible = e.isIntersecting;
                            });
                        },
                        { threshold: 0.1 }
                    );
                    visObs.observe(heroPhoto);
                }
                function tickParticles(ts) {
                    if (!enabled || idle || !visible) {
                        requestAnimationFrame(tickParticles);
                        return;
                    }
                    const w = pCanvas.width;
                    const h = pCanvas.height;
                    ctx.clearRect(0, 0, w, h);
                    const cx = w / 2;
                    const cy = h / 2;
                    particles.forEach((p) => {
                        p.a += p.spd; // slow angular drift
                        const wobble = Math.sin(ts * 0.0005 + p.phase) * 0.02;
                        const rad = Math.min(cx, cy) * (p.r + wobble);
                        const x = cx + Math.cos(p.a) * rad;
                        const y = cy + Math.sin(p.a) * rad;
                        const g = ctx.createRadialGradient(x, y, 0, x, y, p.size * 5);
                        // Slightly dimmer for accessibility contrast
                        g.addColorStop(0, 'rgba(255,140,110,0.42)');
                        g.addColorStop(1, 'rgba(255,140,110,0)');
                        ctx.fillStyle = g;
                        ctx.beginPath();
                        const dpr = window.devicePixelRatio || 1;
                        ctx.arc(x, y, p.size * dpr, 0, Math.PI * 2);
                        ctx.fill();
                    });
                    requestAnimationFrame(tickParticles);
                }
                requestAnimationFrame(tickParticles);
            }

            // Explicitly set background in case relative path in CSS fails after build
            const imgPath = 'images/website-photo.png';
            heroPhoto.style.setProperty('--hero-photo-url', `url('${imgPath}')`);
            // If CSS failed to load ::after image, we can inline an <img> as fallback
            setTimeout(() => {
                // Check computed style to see if after content has size; if not, append fallback
                if (!heroPhoto.querySelector('img')) {
                    const fallbackImg = document.createElement('img');
                    fallbackImg.src = imgPath;
                    fallbackImg.alt = '';
                    fallbackImg.setAttribute('aria-hidden', 'true');
                    fallbackImg.style.cssText =
                        'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:50%;';
                    heroPhoto.appendChild(fallbackImg);
                }
            }, 400);

            // Intersection observer for reveal
            if (!heroPhoto.classList.contains('is-visible')) {
                if ('IntersectionObserver' in window) {
                    const obs = new IntersectionObserver(
                        (entries, o) => {
                            entries.forEach((e) => {
                                if (e.isIntersecting) {
                                    heroPhoto.classList.add('is-visible');
                                    o.disconnect();
                                }
                            });
                        },
                        { threshold: 0.05 }
                    );
                    obs.observe(heroPhoto);
                    // Fallback timeout in case observer never fires
                    setTimeout(() => heroPhoto.classList.add('is-visible'), 1500);
                } else {
                    heroPhoto.classList.add('is-visible');
                }
            }

            // Tilt interaction
            const prefersReducedMotion = window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches;
            if (!prefersReducedMotion) {
                let raf = null;
                let targetRX = 0,
                    targetRY = 0;
                const damp = 0.12;
                function animateTilt() {
                    const cs = window.getComputedStyle ? window.getComputedStyle(heroPhoto) : null;
                    const currentRX = cs ? parseFloat(cs.getPropertyValue('--tilt-rx')) || 0 : 0;
                    const currentRY = cs ? parseFloat(cs.getPropertyValue('--tilt-ry')) || 0 : 0;
                    const nextRX = currentRX + (targetRX - currentRX) * damp;
                    const nextRY = currentRY + (targetRY - currentRY) * damp;
                    heroPhoto.style.setProperty('--tilt-rx', nextRX + 'deg');
                    heroPhoto.style.setProperty('--tilt-ry', nextRY + 'deg');
                    if (Math.abs(nextRX - targetRX) > 0.01 || Math.abs(nextRY - targetRY) > 0.01) {
                        raf = requestAnimationFrame(animateTilt);
                    } else {
                        raf = null;
                    }
                }
                heroPhoto.addEventListener('pointermove', (e) => {
                    const r = heroPhoto.getBoundingClientRect();
                    const cx = r.left + r.width / 2;
                    const cy = r.top + r.height / 2;
                    const dx = (e.clientX - cx) / r.width; // -0.5..0.5 roughly
                    const dy = (e.clientY - cy) / r.height;
                    const max = 10; // deg
                    targetRY = dx * max;
                    targetRX = -dy * max;
                    if (!raf) raf = requestAnimationFrame(animateTilt);
                });
                heroPhoto.addEventListener('pointerleave', () => {
                    targetRX = 0;
                    targetRY = 0;
                    if (!raf) raf = requestAnimationFrame(animateTilt);
                });
            }

            /* ---------------------- 3D PEDESTAL MODE ---------------------- */
            let hero3DInitialized = false;
            let threeCanvas = null;
            let threeRenderer, threeScene, threeCamera, threeModel, threeFrameId;
            // originalClasses removed (unused)
            const prefersRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            function buildPedestalGeometry(THREE) {
                // Simple pedestal: cylinder + top disk bevel (low poly for perf)
                const group = new THREE.Group();
                const cylGeo = new THREE.CylinderGeometry(1.05, 1.2, 0.4, 48, 1, true);
                const cylMat = new THREE.MeshStandardMaterial({
                    color: 0x1d1d1f,
                    metalness: 0.55,
                    roughness: 0.38,
                    envMapIntensity: 0.8
                });
                const cyl = new THREE.Mesh(cylGeo, cylMat);
                cyl.castShadow = false;
                cyl.receiveShadow = true;
                group.add(cyl);
                const topGeo = new THREE.CircleGeometry(1.02, 48);
                const topMat = new THREE.MeshStandardMaterial({
                    color: 0x272729,
                    metalness: 0.4,
                    roughness: 0.32
                });
                const top = new THREE.Mesh(topGeo, topMat);
                top.rotation.x = -Math.PI / 2;
                top.position.y = 0.2 + 0.001;
                top.receiveShadow = true;
                group.add(top);
                return group;
            }

            function buildPortraitPlane(THREE) {
                const texLoader = new THREE.TextureLoader();
                const tex = texLoader.load('images/website-photo.png');
                tex.colorSpace =
                    THREE.SRGBColorSpace ||
                    (THREE.Texture && THREE.Texture.DEFAULT_COLOR_SPACE) ||
                    undefined;
                const planeGeo = new THREE.PlaneGeometry(2.0, 2.0, 1, 1);
                const mat = new THREE.MeshStandardMaterial({
                    map: tex,
                    roughness: 0.9,
                    metalness: 0.05
                });
                const plane = new THREE.Mesh(planeGeo, mat);
                plane.position.y = 1.45; // stand above pedestal
                plane.castShadow = false;
                plane.receiveShadow = false;
                return plane;
            }

            let resize3DHandler = null;
            function initHero3D(auto = false) {
                if (hero3DInitialized || typeof THREE === 'undefined') return;
                hero3DInitialized = true;
                heroPhoto.classList.add('mode-3d');
                // Add pedestal shadow ellipse element for blending
                const shadowEl = document.createElement('div');
                shadowEl.className = 'hero-pedestal-shadow';
                heroPhoto.appendChild(shadowEl);
                threeCanvas = document.createElement('canvas');
                threeCanvas.className = 'hero-3d';
                heroPhoto.appendChild(threeCanvas);
                const w = heroPhoto.clientWidth;
                const h = heroPhoto.clientHeight;
                threeRenderer = new THREE.WebGLRenderer({
                    canvas: threeCanvas,
                    antialias: true,
                    alpha: true
                });
                threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
                threeRenderer.setSize(w, h);
                threeScene = new THREE.Scene();
                threeCamera = new THREE.PerspectiveCamera(32, w / h, 0.1, 100);
                threeCamera.position.set(0, 1.4, 4.5);
                const hemi = new THREE.HemisphereLight(0xffffff, 0x202020, 0.9);
                threeScene.add(hemi);
                const dir = new THREE.DirectionalLight(0xffe0d0, 1.15);
                dir.position.set(2.4, 3.2, 2.2);
                threeScene.add(dir);
                // Back rim light
                const rim = new THREE.PointLight(0xff8855, 0.8, 8, 2);
                rim.position.set(-2.2, 2.4, -2.5);
                threeScene.add(rim);
                // Subtle environment gradient background (optional)
                const pedestal = buildPedestalGeometry(THREE);
                pedestal.position.y = 0.2;
                threeScene.add(pedestal);
                const portrait = buildPortraitPlane(THREE);
                threeScene.add(portrait);
                threeModel = new THREE.Group();
                threeModel.add(pedestal);
                threeModel.add(portrait);
                threeScene.add(threeModel);
                // Auto slow oscillation
                let t0 =
                    window.performance && window.performance.now
                        ? window.performance.now()
                        : Date.now();
                let manualRotationY = 0; // declare before render to avoid TDZ issues
                function render() {
                    const now =
                        window.performance && window.performance.now
                            ? window.performance.now()
                            : Date.now();
                    const t = now - t0;
                    const base = Math.sin(t * 0.0004) * 0.35;
                    threeModel.rotation.y = base + manualRotationY;
                    if (!prefersRM) {
                        threeModel.position.y = 0.05 + Math.sin(t * 0.0012) * 0.04;
                    }
                    threeRenderer.render(threeScene, threeCamera);
                    threeFrameId = requestAnimationFrame(render);
                }
                render();
                resize3DHandler = function onResize3D() {
                    if (!threeRenderer) return;
                    const w2 = heroPhoto.clientWidth;
                    const h2 = heroPhoto.clientHeight;
                    threeRenderer.setSize(w2, h2);
                    threeCamera.aspect = w2 / h2;
                    threeCamera.updateProjectionMatrix();
                };
                window.addEventListener('resize', resize3DHandler, { passive: true });
                // Interactivity (drag rotate)
                let isPointerDown = false;
                let lastX = 0;
                function onDown(e) {
                    isPointerDown = true;
                    lastX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
                }
                function onMove(e) {
                    if (!isPointerDown) return;
                    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
                    const dx = x - lastX;
                    lastX = x;
                    manualRotationY += dx * 0.005;
                }
                function onUp() {
                    isPointerDown = false;
                }
                threeCanvas.addEventListener('pointerdown', onDown);
                window.addEventListener('pointermove', onMove, { passive: true });
                window.addEventListener('pointerup', onUp, { passive: true });
                threeCanvas.addEventListener('touchstart', onDown, { passive: true });
                window.addEventListener('touchmove', onMove, { passive: true });
                window.addEventListener('touchend', onUp, { passive: true });
                // If auto init hide toggle until ready
                if (auto) toggle3D.setAttribute('aria-pressed', 'true');
            }

            function destroyHero3D() {
                if (!hero3DInitialized) return;
                hero3DInitialized = false;
                heroPhoto.classList.remove('mode-3d');
                if (
                    typeof window !== 'undefined' &&
                    typeof window.cancelAnimationFrame === 'function' &&
                    threeFrameId
                ) {
                    window.cancelAnimationFrame(threeFrameId);
                }
                if (resize3DHandler) window.removeEventListener('resize', resize3DHandler);
                if (threeCanvas) threeCanvas.remove();
                const shadow = heroPhoto.querySelector('.hero-pedestal-shadow');
                if (shadow) shadow.remove();
                // restore ring etc (they remain in DOM, just re-show via CSS)
            }

            toggle3D.addEventListener('click', () => {
                const active = heroPhoto.classList.contains('mode-3d');
                if (active) {
                    // turn OFF 3D
                    destroyHero3D();
                    toggle3D.setAttribute('aria-pressed', 'false');
                } else {
                    if (typeof THREE === 'undefined') {
                        import('./vendor/three.min.js').then(() => initHero3D());
                    } else {
                        initHero3D();
                    }
                    toggle3D.setAttribute('aria-pressed', 'true');
                }
            });

            // Auto-enable 3D pedestal after short delay (simulate museum idol)
            setTimeout(() => {
                if (!hero3DInitialized && typeof THREE !== 'undefined') {
                    initHero3D(true);
                }
            }, 600);
        }

        // Summary cards reveal & pointer highlight tracking
        const summaryContainer = document.getElementById('summary-cards');
        if (summaryContainer && !summaryContainer.dataset.enhanced) {
            summaryContainer.dataset.enhanced = 'true';
            if ('IntersectionObserver' in window) {
                const obs2 = new IntersectionObserver(
                    (entries, o) => {
                        entries.forEach((en) => {
                            if (en.isIntersecting) {
                                summaryContainer.classList.add('is-visible');
                                o.disconnect();
                            }
                        });
                    },
                    { threshold: 0.2 }
                );
                obs2.observe(summaryContainer);
            } else {
                summaryContainer.classList.add('is-visible');
            }
            summaryContainer.addEventListener('pointermove', (_e) => {
                const card = _e.target.closest('.card-hover-effect');
                if (!card) return;
                const r = card.getBoundingClientRect();
                const mx = ((_e.clientX - r.left) / r.width) * 100;
                const my = ((_e.clientY - r.top) / r.height) * 100;
                card.style.setProperty('--mx', mx + '%');
                card.style.setProperty('--my', my + '%');
                // Calculate tilt relative to center (-0.5 .. 0.5) using per-card max tilt variable
                const dx = mx / 100 - 0.5;
                const dy = my / 100 - 0.5;
                const declaredTilt = parseFloat(
                    (window.getComputedStyle
                        ? window.getComputedStyle(card)
                        : { getPropertyValue: () => '5' }
                    ).getPropertyValue('--card-tilt-max')
                );
                const maxTilt = isNaN(declaredTilt) ? 5 : declaredTilt;
                card.style.setProperty('--rx', `${(-dy * maxTilt).toFixed(2)}deg`);
                card.style.setProperty('--ry', `${(dx * maxTilt).toFixed(2)}deg`);
            });

            summaryContainer.addEventListener('pointerleave', (_e) => {
                const cards = summaryContainer.querySelectorAll('.card-hover-effect');
                cards.forEach((c) => {
                    c.style.removeProperty('--rx');
                    c.style.removeProperty('--ry');
                });
            });
        }
    })();

    // Fade-in on scroll
    const faders = document.querySelectorAll('.fade-in-section');
    if ('IntersectionObserver' in window) {
        const appearOnScroll = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                });
            },
            { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
        );
        faders.forEach((f) => appearOnScroll.observe(f));
    } else {
        // Fallback
        faders.forEach((f) => f.classList.add('is-visible'));
    }

    // Section Headings observer (data-sh)
    (function initSectionHeadings() {
        const heads = document.querySelectorAll('.section-head[data-sh]');
        if (!heads.length) return;
        if ('IntersectionObserver' in window) {
            const hObs = new IntersectionObserver(
                (entries, o) => {
                    entries.forEach((en) => {
                        if (en.isIntersecting) {
                            en.target.setAttribute('data-inview', 'true');
                            o.unobserve(en.target);
                            // Start rotating words once in view
                            startAccentRotation(en.target);
                        }
                    });
                },
                { threshold: 0.35, rootMargin: '0px 0px -10%' }
            );
            heads.forEach((h) => hObs.observe(h));
        } else {
            heads.forEach((h) => {
                h.setAttribute('data-inview', 'true');
                startAccentRotation(h);
            });
        }
    })();

    function startAccentRotation(headEl) {
        const accent = headEl.querySelector('.sh-accent[data-words]');
        if (!accent) return;
        const list = (accent.getAttribute('data-words') || '')
            .split('|')
            .map((w) => w.trim())
            .filter(Boolean);
        if (list.length <= 1) return;
        let idx = 0;
        accent.textContent = list[0];
        accent.dataset.rotating = 'true';
        const interval = 3400;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;
        setTimeout(cycle, interval);
        function cycle() {
            accent.classList.remove('sh-rotate-in');
            accent.classList.add('sh-rotate-out');
            const next = list[(idx + 1) % list.length];
            setTimeout(() => {
                idx = (idx + 1) % list.length;
                accent.textContent = next;
                accent.classList.remove('sh-rotate-out');
                accent.classList.add('sh-rotate-in');
            }, 480);
            setTimeout(cycle, interval);
        }
    }

    // Three.js starfield (skipped if reduced motion OR no canvas)
    function initThreeJS() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas || typeof THREE === 'undefined') return;
        if (prefersReducedMotion) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            1,
            1000
        );
        camera.position.z = 1;
        camera.rotation.x = Math.PI / 2;
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const starGeo = new THREE.BufferGeometry();
        const starCount = 4000; // reduced for performance
        const posArray = new Float32Array(starCount * 3);
        for (let i = 0; i < posArray.length; i++) posArray[i] = (Math.random() - 0.5) * 5;
        starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const starMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.005,
            transparent: true
        });
        const stars = new THREE.Points(starGeo, starMaterial);
        scene.add(stars);

        // Passive listeners for perf
        window.addEventListener(
            'resize',
            () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            },
            { passive: true }
        );

        let mouseX = 0,
            mouseY = 0;
        document.addEventListener(
            'mousemove',
            (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
            },
            { passive: true }
        );

        function animate() {
            stars.position.y -= 0.0002;
            stars.rotation.y += 0.0001;
            if (mouseX > 0) {
                stars.rotation.x = -mouseY * 0.00005;
                stars.rotation.y = -mouseX * 0.00005;
            }
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }
        animate();
    }

    // Defer heavy tasks (typing + three) to idle or timeout
    function initDeferred() {
        type();
        initThreeJS();
    }
    if ('requestIdleCallback' in window) {
        requestIdleCallback(initDeferred, { timeout: 2000 });
    } else {
        setTimeout(initDeferred, 200);
    }

    // --- Hard Fallback: ensure sections become visible even if observers or earlier JS fail ---
    setTimeout(() => {
        document.querySelectorAll('.fade-in-section:not(.is-visible)').forEach((el) => {
            el.classList.add('is-visible');
        });
        // If summary failed to render, inject minimal fallback so page never looks empty.
        const sc = document.getElementById('summary-cards');
        if (sc && sc.children.length === 0 && typeof renderSummary === 'function') {
            renderSummary([
                { title: 'Machine Learning Engineering', body: 'Designing robust ML systems.' },
                { title: 'LLM & Retrieval', body: 'Building production-grade AI pipelines.' },
                { title: 'MLOps & Deployment', body: 'Shipping reliable, scalable models.' }
            ]);
            sc.classList.add('is-visible');
        }
    }, 1600);
});

// Visitor Statistics Functionality
function initVisitorStats(contentData) {
    // Read stats from content.json as the authoritative baseline
    const globalStats = contentData && contentData.stats ? contentData.stats : null;

    // Storage keys
    const USER_STAR_KEY = 'portfolio_user_starred';
    const SESSION_KEY = 'portfolio_session_visited';
    const LAST_VISIT_KEY = 'portfolio_last_visit_date';

    // Use content.json values as the current totals (simulating server-side persistence)
    const baselineVisitors = globalStats ? globalStats.visitors : 109;
    const baselineStars = globalStats ? globalStats.stars : 89;

    // Generate a small random increment to simulate activity since content.json was last updated
    // This creates the illusion of ongoing activity while keeping numbers reasonable
    const timeSinceBaseline =
        globalStats && globalStats.lastUpdated
            ? Math.floor(
                  (Date.now() - new Date(globalStats.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
              ) // days
            : Math.floor(Math.random() * 30); // random 0-30 days if no lastUpdated

    const activityMultiplier = Math.max(1, Math.floor(timeSinceBaseline / 7)); // weekly activity
    const visitorIncrement = Math.floor(Math.random() * 3) * activityMultiplier; // 0-2 visitors per week
    const starIncrement =
        Math.floor(Math.random() * 2) * Math.max(1, Math.floor(activityMultiplier / 2)); // fewer stars than visitors

    let totalVisitors = baselineVisitors + visitorIncrement;
    let totalStars = baselineStars + starIncrement;

    // Check user's personal star status
    let hasUserStarred = localStorage.getItem(USER_STAR_KEY) === 'true';

    // Handle session-based visitor increment (only once per session)
    const hasVisitedThisSession = sessionStorage.getItem(SESSION_KEY);
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    const now = new Date();
    const lastVisitDate = lastVisit ? new Date(lastVisit) : null;

    // Count as new visit if:
    // 1. Never visited this session, AND
    // 2. Last visit was more than 6 hours ago (reasonable session timeout)
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    const shouldCountVisit =
        !hasVisitedThisSession && (!lastVisitDate || lastVisitDate < sixHoursAgo);

    if (shouldCountVisit) {
        totalVisitors++;
        localStorage.setItem(LAST_VISIT_KEY, now.toISOString());
        sessionStorage.setItem(SESSION_KEY, 'true');
        console.info('New visitor counted. Current total:', totalVisitors);
    }

    console.info('Visitor stats loaded:', {
        baseline: { visitors: baselineVisitors, stars: baselineStars },
        current: { visitors: totalVisitors, stars: totalStars },
        userStarred: hasUserStarred
    });

    // Create visitor stats UI
    function createVisitorStatsUI() {
        const container = document.createElement('div');
        container.className = 'visitor-stats flex items-center gap-4 text-sm text-gray-300';
        container.setAttribute('aria-label', 'Portfolio statistics');

        // Visitor counter (shows collective total)
        const visitorContainer = document.createElement('div');
        visitorContainer.className = 'flex items-center gap-1';
        visitorContainer.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="m22 21-3-3m0 0a4.5 4.5 0 1 1-6.36-6.36 4.5 4.5 0 0 1 6.36 6.36Z"/>
            </svg>
        `;

        const visitorDisplay = document.createElement('span');
        visitorDisplay.textContent = formatNumber(totalVisitors);
        visitorDisplay.setAttribute('aria-label', totalVisitors + ' total visitors');
        visitorDisplay.setAttribute('title', 'Total cumulative visitors');
        visitorContainer.appendChild(visitorDisplay);

        // Star rating (shows collective total)
        const starContainer = document.createElement('div');
        starContainer.className = 'flex items-center gap-1';

        const starButton = document.createElement('button');
        starButton.className =
            'star-button transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-red/50 rounded ' +
            (hasUserStarred ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400');
        starButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${hasUserStarred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
        `;
        starButton.setAttribute('aria-label', hasUserStarred ? 'Remove your star' : 'Give a star');
        starButton.setAttribute(
            'title',
            hasUserStarred
                ? 'Remove your star from this portfolio'
                : 'Star this portfolio (adds to total)'
        );

        const starDisplay = document.createElement('span');
        starDisplay.textContent = formatNumber(totalStars);
        starDisplay.setAttribute('aria-label', totalStars + ' total stars');
        starDisplay.setAttribute('title', 'Total cumulative stars from all visitors');

        // Star button click handler (updates display and saves user preference)
        starButton.addEventListener('click', function () {
            if (hasUserStarred) {
                // Remove user's star
                totalStars = Math.max(baselineStars, totalStars - 1); // Never go below baseline
                hasUserStarred = false;
                starButton.classList.remove('text-yellow-400');
                starButton.classList.add('text-gray-400', 'hover:text-yellow-400');
                starButton.querySelector('svg').setAttribute('fill', 'none');
                starButton.setAttribute('aria-label', 'Give a star');
                starButton.setAttribute('title', 'Star this portfolio');

                console.info('Star removed. Current total:', totalStars);
            } else {
                // Add user's star
                totalStars++;
                hasUserStarred = true;
                starButton.classList.remove('text-gray-400', 'hover:text-yellow-400');
                starButton.classList.add('text-yellow-400');
                starButton.querySelector('svg').setAttribute('fill', 'currentColor');
                starButton.setAttribute('aria-label', 'Remove your star');
                starButton.setAttribute('title', 'Remove your star from this portfolio');

                console.info('Star added. Current total:', totalStars);
            }

            // Update display
            starDisplay.textContent = formatNumber(totalStars);
            starDisplay.setAttribute('aria-label', totalStars + ' total stars');

            // Save user's star preference (only thing we can persist)
            localStorage.setItem(USER_STAR_KEY, hasUserStarred.toString());

            // Animation feedback
            starButton.style.transform = 'scale(1.3)';
            setTimeout(function () {
                starButton.style.transform = 'scale(1)';
            }, 150);

            // Update mobile version if it exists
            updateMobileStats();
        });

        // Handle keyboard navigation
        starButton.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                starButton.click();
            }
        });

        starContainer.appendChild(starButton);
        starContainer.appendChild(starDisplay);

        container.appendChild(visitorContainer);
        container.appendChild(starContainer);

        return { container, starButton, starDisplay, visitorDisplay };
    }

    // Format number with commas
    function formatNumber(num) {
        return num.toLocaleString();
    }

    // Update mobile stats to match desktop (sync collective totals)
    function updateMobileStats() {
        const mobileContainer = document.getElementById('mobile-visitor-stats-container');
        if (!mobileContainer) return;

        // Clear and recreate mobile version with current collective totals
        mobileContainer.innerHTML = '';
        const mobileStats = createVisitorStatsUI();
        mobileContainer.appendChild(mobileStats.container);
    }

    // Add to desktop navigation
    const desktopContainer = document.getElementById('visitor-stats-container');
    if (desktopContainer) {
        const stats = createVisitorStatsUI();
        desktopContainer.appendChild(stats.container);
    }

    // Add to mobile navigation
    updateMobileStats();

    // Log final state for debugging
    console.info('Visitor stats initialized successfully:', {
        displayedVisitors: totalVisitors,
        displayedStars: totalStars,
        baselineVisitors: baselineVisitors,
        baselineStars: baselineStars,
        userHasStarred: hasUserStarred,
        sessionIncrement: shouldCountVisit ? 1 : 0
    });
}

// Accessibility: focus outline restoration if user tabs
document.addEventListener(
    'keydown',
    (e) => {
        if (e.key === 'Tab') document.documentElement.classList.add('user-tabbing');
    },
    { once: true }
);
