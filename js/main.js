// Main JavaScript file for portfolio project
console.log('Portfolio site loaded');

// Theme toggle logic
(function() {
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
		try { return localStorage.getItem(STORAGE_KEY); } catch(e) { return null; }
	}

	function storeTheme(mode) {
		try { localStorage.setItem(STORAGE_KEY, mode); } catch(e) { /* ignore */ }
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
	// Mobile menu
	const mobileMenuButton = document.getElementById('mobile-menu-button');
	const mobileMenu = document.getElementById('mobile-menu');
	if (mobileMenuButton && mobileMenu) {
		mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
		const links = mobileMenu.getElementsByTagName('a');
		for (let link of links) link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
	}

	// Typing animation (respect reduced motion)
	const typingElement = document.querySelector('#hero-title .gradient-text');
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const words = ['LLM Specialist', 'AI Researcher', 'Problem Solver'];
	let wordIndex = 0, charIndex = 0, isDeleting = false;
	function type() {
		if (!typingElement) return;
		const currentWord = words[wordIndex];
		const displayText = currentWord.substring(0, charIndex);
		typingElement.innerHTML = `${displayText}<span class="typewriter-cursor" aria-hidden="true"></span>`;
		if (prefersReducedMotion) return; // Skip animation for reduced motion users
		if (!isDeleting && charIndex < currentWord.length) {
			charIndex++; setTimeout(type, 120);
		} else if (isDeleting && charIndex > 0) {
			charIndex--; setTimeout(type, 80);
		} else {
			isDeleting = !isDeleting;
			if (!isDeleting) wordIndex = (wordIndex + 1) % words.length;
			setTimeout(type, 1200);
		}
	}

	// Fade-in on scroll
	const faders = document.querySelectorAll('.fade-in-section');
	if ('IntersectionObserver' in window) {
		const appearOnScroll = new IntersectionObserver((entries, obs) => {
			entries.forEach(entry => {
				if (!entry.isIntersecting) return;
				entry.target.classList.add('is-visible');
				obs.unobserve(entry.target);
			});
		}, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
		faders.forEach(f => appearOnScroll.observe(f));
	} else {
		// Fallback
		faders.forEach(f => f.classList.add('is-visible'));
	}

	// Three.js starfield (skipped if reduced motion OR no canvas)
	function initThreeJS() {
		const canvas = document.getElementById('hero-canvas');
		if (!canvas || typeof THREE === 'undefined') return;
		if (prefersReducedMotion) return;
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
		camera.position.z = 1; camera.rotation.x = Math.PI / 2;
		const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		const starGeo = new THREE.BufferGeometry();
		const starCount = 4000; // reduced for performance
		const posArray = new Float32Array(starCount * 3);
		for (let i = 0; i < posArray.length; i++) posArray[i] = (Math.random() - 0.5) * 5;
		starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
		const starMaterial = new THREE.PointsMaterial({ color: 0xaaaaaa, size: 0.005, transparent: true });
		const stars = new THREE.Points(starGeo, starMaterial); scene.add(stars);

		// Passive listeners for perf
		window.addEventListener('resize', () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		}, { passive: true });

		let mouseX = 0, mouseY = 0;
		document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });

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
document.addEventListener('keydown', e => {
	if (e.key === 'Tab') document.documentElement.classList.add('user-tabbing');
}, { once: true });
