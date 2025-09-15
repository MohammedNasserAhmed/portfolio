/**
 * ImageGuard - runtime verification & recovery for critical section images
 * Ensures publications & project visuals do not silently fall back to unrelated hero/placeholder images.
 */
const HERO_IMAGE_PATTERN = /website-photo\.png$/i;
const PLACEHOLDER_PATTERN = /placeholder\.(svg|png)$/i;

function uniqueId() {
    return Math.random().toString(36).slice(2);
}

/**
 * Attempt to reload an image once with a cache-busting query param.
 * @param {HTMLImageElement} img
 */
function cacheBust(img) {
    try {
        const url = new URL(img.src, window.location.origin);
        url.searchParams.set('v', Date.now().toString(36));
        img.dataset.cacheBust = '1';
        img.src = url.toString();
    } catch {
        // ignore
    }
}

/**
 * For project cards, background images are stored in --lid-bg CSS var.
 * We inspect the computed style and attempt a recovery if missing / hero fallback.
 */
function verifyProjectCards() {
    const cards = document.querySelectorAll('.project-card.has-lid');
    cards.forEach((card) => {
        const lid = card.querySelector('.project-lid');
        if (!lid) return;
        const style = getComputedStyle(lid);
        const bg = style.getPropertyValue('--lid-bg') || '';
        if (!bg) return;

        // If background references hero portrait (should never be used here) mark & neutralize.
        if (HERO_IMAGE_PATTERN.test(bg)) {
            lid.classList.add('img-guard-fallback');
            // Replace hero with placeholder background (non-intrusive gradient)
            card.style.setProperty('--lid-bg', 'linear-gradient(135deg,#2a2a2a,#444)');
        }
    });
}

/**
 * Verify publication images; if they ended up as hero/placeholder unexpectedly, try one recovery.
 */
function verifyPublicationImages() {
    const imgs = document.querySelectorAll(
        '#publications-hero img.thumb, #publications-grid img.cover'
    );
    imgs.forEach((img) => {
        if (img.dataset.guardChecked === '1') return;
        img.dataset.guardChecked = '1';

        const original = img.getAttribute('src') || '';

        if (HERO_IMAGE_PATTERN.test(original)) {
            // If hero is used here, that's wrong. Try alt roots if not already attempted by component recovery.
            if (!img.dataset.cacheBust) {
                cacheBust(img);
            } else {
                // Last resort: swap to placeholder (semantic indication)
                img.src = 'images/placeholder.svg';
                img.alt = (img.alt || 'Publication') + ' (image unavailable)';
                img.classList.add('img-guard-fallback');
            }
        }

        // If placeholder persists after load, annotate for diagnostics
        img.addEventListener('load', () => {
            if (PLACEHOLDER_PATTERN.test(img.currentSrc)) {
                img.classList.add('img-guard-fallback');
            }
        });
    });
}

/**
 * Public entrypoint: run guard once after primary content render & again after a short delay.
 */
export function runImageGuard() {
    try {
        verifyPublicationImages();
        verifyProjectCards();
        // Re-run shortly after to catch late-loaded assets
        setTimeout(() => {
            verifyPublicationImages();
            verifyProjectCards();
        }, 1800);
    } catch (e) {
        console.warn('[ImageGuard] runtime check failed:', e);
    }
}

// Optional: expose for dev tools
if (typeof window !== 'undefined') {
    window.__imageGuard = { runImageGuard };
}
