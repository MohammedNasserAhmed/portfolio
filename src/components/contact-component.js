import { logInfo, handleError } from '../utils/helpers.js';

export class ContactComponent {
    constructor() {
        this.form = null;
        this.submitBtn = null;
        this.statusDiv = null;
        this.isSubmitting = false;
    }

    init() {
        this.form = document.getElementById('contact-form');
        if (!this.form) return;

        this.submitBtn = this.form.querySelector('button[type="submit"]');
        this.statusDiv = document.getElementById('contact-status');

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Add floating label effects
        this.setupFloatingLabels();
    }

    setupFloatingLabels() {
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            // Check initial state
            if (input.value) {
                input.parentElement.classList.add('has-value');
            }

            input.addEventListener('focus', () => {
                input.parentElement.classList.add('is-focused');
            });

            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('is-focused');
                if (input.value) {
                    input.parentElement.classList.add('has-value');
                } else {
                    input.parentElement.classList.remove('has-value');
                }
            });
            
            input.addEventListener('input', () => {
                 if (input.value) {
                    input.parentElement.classList.add('has-value');
                } else {
                    input.parentElement.classList.remove('has-value');
                }
            });
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (this.isSubmitting) return;

        this.isSubmitting = true;
        this.updateButtonState('loading');
        this.clearStatus();

        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send message');
            }

            this.showStatus('success', 'Message sent successfully! I will get back to you soon.');
            this.form.reset();
            this.resetFloatingLabels();
            this.updateButtonState('success');
            
            // Reset button after delay
            setTimeout(() => {
                this.updateButtonState('idle');
            }, 3000);

        } catch (error) {
            console.error('Contact form error:', error);
            this.showStatus('error', 'Failed to send message. Please try again later.');
            this.updateButtonState('error');
            
             setTimeout(() => {
                this.updateButtonState('idle');
            }, 3000);
        } finally {
            this.isSubmitting = false;
        }
    }

    updateButtonState(state) {
        if (!this.submitBtn) return;

        const originalText = this.submitBtn.getAttribute('data-original-text') || this.submitBtn.textContent;
        if (!this.submitBtn.getAttribute('data-original-text')) {
            this.submitBtn.setAttribute('data-original-text', originalText);
        }

        switch (state) {
            case 'loading':
                this.submitBtn.disabled = true;
                this.submitBtn.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                `;
                break;
            case 'success':
                this.submitBtn.disabled = false;
                this.submitBtn.classList.add('bg-green-600', 'hover:bg-green-700');
                this.submitBtn.classList.remove('bg-brand-red', 'hover:bg-red-700');
                this.submitBtn.innerHTML = `
                    <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Sent!
                `;
                break;
            case 'error':
                this.submitBtn.disabled = false;
                this.submitBtn.classList.add('bg-red-600', 'hover:bg-red-700');
                this.submitBtn.classList.remove('bg-brand-red', 'hover:bg-red-700');
                this.submitBtn.textContent = 'Error';
                break;
            case 'idle':
            default:
                this.submitBtn.disabled = false;
                this.submitBtn.classList.remove('bg-green-600', 'hover:bg-green-700', 'bg-red-600', 'hover:bg-red-700');
                this.submitBtn.classList.add('bg-brand-red', 'hover:bg-red-700');
                this.submitBtn.textContent = originalText;
                break;
        }
    }

    showStatus(type, message) {
        if (!this.statusDiv) return;

        this.statusDiv.className = `mt-4 p-4 rounded-lg ${
            type === 'success' ? 'bg-green-900/50 text-green-200 border border-green-800' : 'bg-red-900/50 text-red-200 border border-red-800'
        }`;
        this.statusDiv.textContent = message;
        this.statusDiv.classList.remove('hidden');
    }

    clearStatus() {
        if (!this.statusDiv) return;
        this.statusDiv.classList.add('hidden');
        this.statusDiv.textContent = '';
    }

    resetFloatingLabels() {
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.parentElement.classList.remove('has-value', 'is-focused');
        });
    }
}
