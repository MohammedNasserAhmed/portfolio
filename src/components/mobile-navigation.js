// Mobile navigation component
export class MobileNavigation {
    constructor() {
        this.menuButton = null;
        this.menu = null;
        this.isOpen = false;
    }
    
    init() {
        this.menuButton = document.getElementById('mobile-menu-button');
        this.menu = document.getElementById('mobile-menu');
        
        if (this.menuButton && this.menu) {
            this.bindEvents();
        }
    }
    
    bindEvents() {
        // Menu toggle
        this.menuButton.addEventListener('click', () => {
            this.toggle();
        });
        
        // Close menu when clicking on links
        const links = this.menu.getElementsByTagName('a');
        Array.from(links).forEach(link => {
            link.addEventListener('click', () => {
                this.close();
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (this.isOpen && 
                !this.menu.contains(event.target) && 
                !this.menuButton.contains(event.target)) {
                this.close();
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isOpen) {
                this.close();
                this.menuButton.focus();
            }
        });
        
        // Handle resize - close menu on desktop breakpoint
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && this.isOpen) {
                this.close();
            }
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.menu.classList.remove('hidden');
        this.isOpen = true;
        this.menuButton.setAttribute('aria-expanded', 'true');
        
        // Trap focus within menu
        this.trapFocus();
        
        // Update icon
        this.updateMenuIcon();
    }
    
    close() {
        this.menu.classList.add('hidden');
        this.isOpen = false;
        this.menuButton.setAttribute('aria-expanded', 'false');
        
        // Update icon
        this.updateMenuIcon();
    }
    
    updateMenuIcon() {
        const icon = this.menuButton.querySelector('svg');
        if (!icon) return;
        
        if (this.isOpen) {
            // Change to X icon
            icon.innerHTML = `
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            `;
        } else {
            // Change to hamburger icon
            icon.innerHTML = `
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
            `;
        }
    }
    
    trapFocus() {
        const focusableElements = this.menu.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Focus first element
        firstElement.focus();
        
        const handleTabKey = (event) => {
            if (event.key !== 'Tab') return;
            
            if (event.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        };
        
        this.menu.addEventListener('keydown', handleTabKey);
        
        // Remove listener when menu closes
        const removeListener = () => {
            this.menu.removeEventListener('keydown', handleTabKey);
        };
        
        // Store reference to remove later
        this.currentTabHandler = removeListener;
    }
}