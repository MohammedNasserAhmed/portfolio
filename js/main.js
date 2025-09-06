// Main JavaScript file for portfolio project
console.log('Portfolio site loaded');

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
        } catch (_e) {
            return null;
        }
    }

    function storeTheme(mode) {
        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch (_e) {
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
            renderSkills(data.skills || []);
            renderPublications(data.publications || []);
            window.__PORTFOLIO_DATA__ = data; // expose for simple admin edits
        })
        .catch(() => {
            // fail silently; original sections remain empty if network error
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
                    )}" class="w-full h-48 object-cover" />\n            <div class="p-6">\n              <h3 class="text-xl font-bold text-white">${escapeHTML(p.title)}</h3>\n              <p class="mt-2 text-brand-gray">${escapeHTML(p.description)}</p>\n              <div class="mt-4 flex flex-wrap gap-2">${(
                        p.tech || []
                    )
                        .map(
                            (t) =>
                                `<span class="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">${escapeHTML(
                                    t
                                )}</span>`
                        )
                        .join('')}\n              </div>\n            </div>\n          </div>`
            )
            .join('');
    }

    function renderSkills(items) {
        const track = document.getElementById('skills-track');
        if (!track) return;
        const tags = items
            .map(
                (s) =>
                    `<span class="skill-tag bg-gray-800 text-gray-300 text-sm font-medium px-5 py-2 rounded-full">${escapeHTML(
                        s
                    )}</span>`
            )
            .join('');
        track.innerHTML = tags + tags; // duplicate for scroll loop effect
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

    // Simple content editing overlay (hash #admin) - non-persistent (console copy JSON)
    if (window.location.hash === '#admin') {
        injectAdminPanel();
    }

    function injectAdminPanel() {
        const panel = document.createElement('div');
        panel.innerHTML = `\n      <div id="admin-panel" class="fixed bottom-4 right-4 w-96 max-h-[80vh] bg-brand-card border border-gray-700 rounded-lg shadow-xl flex flex-col text-sm z-50">\n        <div class="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-t">\n          <strong class="text-white">Content Admin (ephemeral)</strong>\n          <button id="admin-close" class="text-gray-400 hover:text-white">×</button>\n        </div>\n        <textarea id="admin-json" class="flex-1 p-3 bg-black text-gray-200 font-mono resize-none outline-none"></textarea>\n        <div class="p-2 flex gap-2">\n          <button id="admin-apply" class="bg-brand-red text-white px-3 py-1 rounded">Apply</button>\n          <button id="admin-copy" class="bg-gray-700 text-white px-3 py-1 rounded">Copy JSON</button>\n        </div>\n      </div>`;
        document.body.appendChild(panel);
        const ta = document.getElementById('admin-json');
        ta.value = JSON.stringify(window.__PORTFOLIO_DATA__ || {}, null, 2);
        document.getElementById('admin-close').onclick = () => panel.remove();
        document.getElementById('admin-copy').onclick = () => {
            navigator.clipboard.writeText(ta.value).catch(() => {});
        };
        document.getElementById('admin-apply').onclick = () => {
            try {
                const parsed = JSON.parse(ta.value);
                window.__PORTFOLIO_DATA__ = parsed;
                renderSummary(parsed.summary || []);
                renderProjects(parsed.projects || []);
                renderSkills(parsed.skills || []);
                renderPublications(parsed.publications || []);
            } catch (_e) {
                ta.style.borderColor = 'red';
                setTimeout(() => (ta.style.borderColor = ''), 1200);
            }
        };
    }
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
        const displayText = currentWord.substring(0, charIndex);
        typingElement.innerHTML = `${displayText}<span class="typewriter-cursor" aria-hidden="true"></span>`;
        if (prefersReducedMotion) return; // Skip animation for reduced motion users
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
