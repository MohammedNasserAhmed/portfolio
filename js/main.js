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
    // Dynamic content injection
    const isArabic = document.documentElement.lang === 'ar';
    const contentPath = isArabic ? '../data/content.ar.json' : 'data/content.json';
    fetch(contentPath)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((data) => {
            renderSummary(data.summary || []);
            renderProjects(data.projects || []);
            // Prefer rich skillsData if available; fallback to basic skills array
            const skillsSource = Array.isArray(data.skillsData)
                ? data.skillsData
                : data.skills || [];
            renderSkills(skillsSource);
            renderPublications(data.publications || []);
            window.__PORTFOLIO_DATA__ = data; // expose for simple admin edits
        })
        .catch((err) => {
            console.warn('Content fetch failed:', err);
        });

    function renderSummary(items) {
        const container = document.getElementById('summary-cards');
        if (!container) return;
        container.innerHTML = items
            .map(
                (s) =>
                    `\n            <div class="bg-brand-card p-6 rounded-lg shadow-lg card-hover-effect border border-gray-800">\n              <h3 class="text-xl font-bold text-brand-red mb-2">${escapeHTML(
                        s.title
                    )}</h3>\n              <p class="text-brand-gray">${escapeHTML(s.body)}</p>\n            </div>`
            )
            .join('');
    }

    function renderProjects(items) {
        const container = document.getElementById('projects-grid');
        if (!container) return;
        container.innerHTML = items
            .map(
                (p) =>
                    `\n          <div class="bg-brand-card rounded-lg shadow-lg overflow-hidden card-hover-effect border border-gray-800">\n            <img src="${escapeAttr(p.image)}" alt="${escapeAttr(
                        p.title
                    )}" class="w-full h-48 object-cover" />\n            <div class="p-6">\n              <h3 class="text-xl font-bold text-white flex items-start justify-between gap-2">${escapeHTML(
                        p.title
                    )}${
                        p.githubUrl
                            ? `<a href="${escapeAttr(
                                  p.githubUrl
                              )}" class="text-gray-400 hover:text-white" target="_blank" rel="noopener" aria-label="GitHub repository for ${escapeAttr(
                                  p.title
                              )}">\n                                  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' class='w-5 h-5'><path d='M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.93c.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.13-3.2.7-3.88-1.36-3.88-1.36-.53-1.35-1.3-1.71-1.3-1.71-1.07-.73.08-.72.08-.72 1.18.08 1.8 1.21 1.8 1.21 1.05 1.79 2.76 1.27 3.43.97.11-.76.41-1.27.75-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.19a11.1 11.1 0 0 1 2.9-.39 11.1 11.1 0 0 1 2.9.39c2.2-1.5 3.17-1.19 3.17-1.19.63 1.59.24 2.76.12 3.05.75.81 1.2 1.84 1.2 3.1 0 4.43-2.69 5.41-5.25 5.69.42.37.8 1.1.8 2.22 0 1.6-.02 2.88-.02 3.27 0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z'/></svg>`
                            : ''
                    }</h3>\n              <p class="mt-2 text-brand-gray">${escapeHTML(p.description)}</p>\n              <div class="mt-4 flex flex-wrap gap-2">${(
                        p.tech || []
                    )
                        .map(
                            (t) =>
                                `<span class="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">${escapeHTML(
                                    t
                                )}</span>`
                        )
                        .join('')}\n              </div>\n              ${
                        p.githubUrl
                            ? `<div class='mt-4'><a href='${escapeAttr(
                                  p.githubUrl
                              )}' class='text-brand-red text-sm font-semibold hover:underline' target='_blank' rel='noopener'>View on GitHub →</a></div>`
                            : ''
                    }\n            </div>\n          </div>`
            )
            .join('');
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
            MLflow: 'images/skills/mlflow.svg'
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
                b.addEventListener('click', (e) => {
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
            // Tooltip info via data-title attribute (will use native title for simplicity)
            const tooltip = `${skill.name} — ${skill.level || ''} (${skill.percent}%)\nXP: ${skill.xp || 'n/a'}\nCategory: ${skill.category}`;
            btn.setAttribute('title', tooltip.trim());

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

    const activeSkillFilters = new Set();
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
    }

    function updateProjectFiltering() {
        const grid = document.getElementById('projects-grid');
        if (!grid) return;
        const cards = Array.from(grid.children);
        const filters = Array.from(activeSkillFilters);
        const filtering = filters.length > 0;
        let matchedTotal = 0;
        if (filtering) grid.classList.add('filtering');
        else grid.classList.remove('filtering');
        cards.forEach((card) => {
            const techBadges = Array.from(card.querySelectorAll('span')).map((s) =>
                (s.textContent || '').toLowerCase()
            );
            const show = !filtering || filters.some((f) => techBadges.includes(f.toLowerCase()));
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
        const list = document.getElementById('publications-list');
        if (!list) return;
        list.innerHTML = items
            .map(
                (pub) =>
                    `\n        <div class="bg-brand-card p-6 rounded-lg shadow-lg flex flex-col md:flex-row gap-6 card-hover-effect border border-gray-800">\n          <img src="${escapeAttr(pub.image)}" alt="${escapeAttr(
                        pub.title
                    )}" class="w-full md:w-1/4 h-auto rounded-md object-cover" />\n          <div class="flex-1">\n            <p class="text-sm text-gray-500">Published: ${escapeHTML(
                        pub.published
                    )}</p>\n            <h3 class="text-xl font-bold text-white mt-1">${escapeHTML(pub.title)}</h3>\n            <p class="mt-2 text-brand-gray">${escapeHTML(pub.description)}</p>\n            <a href="${escapeAttr(pub.link)}" class="text-brand-red font-semibold mt-4 inline-block hover:underline">Read More &rarr;</a>\n          </div>\n        </div>`
            )
            .join('');
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
});

// Accessibility: focus outline restoration if user tabs
document.addEventListener(
    'keydown',
    (e) => {
        if (e.key === 'Tab') document.documentElement.classList.add('user-tabbing');
    },
    { once: true }
);
