// Animation and effects manager
import { APP_CONFIG, PERFORMANCE_CONFIG } from '../config/app-config.js';
import { handleError, ErrorTypes, logInfo } from '../utils/helpers.js';

/**
 * Manages all animations and visual effects in the portfolio
 * @class AnimationManager
 */
class AnimationManager {
    /**
     * Create an animation manager instance
     * @constructor
     */
    constructor() {
        /** @type {boolean} Whether user prefers reduced motion */
        this.prefersReducedMotion = PERFORMANCE_CONFIG.prefersReducedMotion();
        
        /** @type {number|null} Current animation frame ID */
        this.animationFrameId = null;
        
        /** @type {Map<string, Function>} Active animations and their cleanup functions */
        this.activeAnimations = new Map();
        
        /** @type {boolean} Initialization state */
        this.isInitialized = false;
        
        logInfo('AnimationManager created');
    }
    
    /**
     * Initialize all animations
     * @returns {void}
     * @throws {Error} When animation initialization fails
     */
    init() {
        if (this.isInitialized) {
            logInfo('AnimationManager already initialized');
            return;
        }
        
        try {
            this.initTypingAnimation();
            this.initStarfield();
            this.initFadeInAnimations();
            this.initSectionHeadings();
            
            this.isInitialized = true;
            logInfo('AnimationManager initialized successfully');
            
        } catch (error) {
            throw handleError(
                error,
                'Failed to initialize AnimationManager',
                ErrorTypes.ANIMATION
            );
        }
    }
    
    /**
     * Initialize typing animation for hero section
     * @private
     * @returns {void}
     */
    initTypingAnimation() {
        const typingElement = document.querySelector('#hero-title .gradient-text');
        if (!typingElement) return;
        
        const config = APP_CONFIG.animation.typing;
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        const type = () => {
            const currentWord = config.words[wordIndex];
            
            // Respect reduced motion preference
            if (this.prefersReducedMotion) {
                if (!typingElement.textContent) {
                    typingElement.textContent = currentWord;
                }
                return;
            }
            
            const displayText = currentWord.substring(0, charIndex);
            typingElement.innerHTML = `${displayText}<span class="typewriter-cursor" aria-hidden="true"></span>`;
            
            if (!isDeleting && charIndex < currentWord.length) {
                charIndex++;
                setTimeout(type, config.typeSpeed);
            } else if (isDeleting && charIndex > 0) {
                charIndex--;
                setTimeout(type, config.deleteSpeed);
            } else {
                isDeleting = !isDeleting;
                if (!isDeleting) {
                    wordIndex = (wordIndex + 1) % config.words.length;
                }
                setTimeout(type, config.delay);
            }
        };
        
        type();
    }
    
    // Three.js starfield background
    initStarfield() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas || typeof THREE === 'undefined' || this.prefersReducedMotion) {
            return;
        }
        
        const config = APP_CONFIG.animation.starfield;
        
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
        
        // Create starfield
        const starGeo = new THREE.BufferGeometry();
        const posArray = new Float32Array(config.starCount * 3);
        for (let i = 0; i < posArray.length; i++) {
            posArray[i] = (Math.random() - 0.5) * 5;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.005,
            transparent: true
        });
        
        const stars = new THREE.Points(starGeo, starMaterial);
        scene.add(stars);
        
        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;
        
        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        
        document.addEventListener('mousemove', handleMouseMove, { passive: true });
        
        // Resize handler
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        
        window.addEventListener('resize', handleResize, { passive: true });
        
        // Animation loop
        const animate = () => {
            stars.position.y -= config.starSpeed;
            stars.rotation.y += config.rotationSpeed;
            
            if (mouseX > 0) {
                stars.rotation.x = -mouseY * config.mouseInfluence;
                stars.rotation.y = -mouseX * config.mouseInfluence;
            }
            
            renderer.render(scene, camera);
            this.animationFrameId = requestAnimationFrame(animate);
        };
        
        animate();
        
        // Store cleanup function
        this.activeAnimations.set('starfield', () => {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            document.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
        });
    }
    
    // Fade-in animation for sections
    initFadeInAnimations() {
        const elements = document.querySelectorAll('.fade-in-section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, PERFORMANCE_CONFIG.observers.fadeIn);
        
        elements.forEach(element => observer.observe(element));
        
        // Fallback for browsers without IntersectionObserver
        if (!('IntersectionObserver' in window)) {
            elements.forEach(element => element.classList.add('is-visible'));
        }
    }
    
    // Section heading animations with word rotation
    initSectionHeadings() {
        const headings = document.querySelectorAll('.section-head[data-sh]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.setAttribute('data-inview', 'true');
                    this.startAccentRotation(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, PERFORMANCE_CONFIG.observers.sections);
        
        headings.forEach(heading => observer.observe(heading));
        
        // Fallback
        if (!('IntersectionObserver' in window)) {
            headings.forEach(heading => {
                heading.setAttribute('data-inview', 'true');
                this.startAccentRotation(heading);
            });
        }
    }
    
    startAccentRotation(headElement) {
        const accent = headElement.querySelector('.sh-accent[data-words]');
        if (!accent) return;
        
        const words = accent.getAttribute('data-words')
            .split('|')
            .map(w => w.trim())
            .filter(Boolean);
            
        if (words.length <= 1 || this.prefersReducedMotion) return;
        
        let index = 0;
        accent.textContent = words[0];
        accent.dataset.rotating = 'true';
        
        const rotateWords = () => {
            accent.classList.add('sh-rotate-out');
            
            setTimeout(() => {
                index = (index + 1) % words.length;
                accent.textContent = words[index];
                accent.classList.remove('sh-rotate-out');
                accent.classList.add('sh-rotate-in');
            }, 480);
            
            setTimeout(rotateWords, 3400);
        };
        
        setTimeout(rotateWords, 3400);
    }
    
    // Cleanup all animations
    destroy() {
        this.activeAnimations.forEach(cleanup => cleanup());
        this.activeAnimations.clear();
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}

export { AnimationManager };