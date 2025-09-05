// Payday Platform - UI Components

/**
 * Reusable UI components for the Payday platform
 */

// Toast Notification System
class ToastManager {
    constructor() {
        this.container = document.getElementById('toast-container') || this.createContainer();
        this.toasts = [];
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    show(type, title, message, duration = 5000) {
        const toast = this.createToast(type, title, message);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Trigger show animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto remove
        setTimeout(() => this.remove(toast), duration);

        return toast;
    }

    createToast(type, title, message) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">&times;</button>
        `;

        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.remove(toast);
        });

        return toast;
    }

    remove(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300);
    }

    success(title, message, duration) {
        return this.show('success', title, message, duration);
    }

    error(title, message, duration) {
        return this.show('error', title, message, duration);
    }

    warning(title, message, duration) {
        return this.show('warning', title, message, duration);
    }

    info(title, message, duration) {
        return this.show('info', title, message, duration);
    }

    clear() {
        this.toasts.forEach(toast => this.remove(toast));
    }
}

// Modal Manager
class ModalManager {
    constructor() {
        this.activeModal = null;
    }

    create(config) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal" style="max-width: ${config.maxWidth || '500px'}">
                ${config.closable !== false ? '<button class="modal-close">&times;</button>' : ''}
                ${config.title ? `
                    <div class="modal-header">
                        <h2 class="modal-title">${config.title}</h2>
                        ${config.description ? `<p class="modal-description">${config.description}</p>` : ''}
                    </div>
                ` : ''}
                <div class="modal-content">
                    ${config.content}
                </div>
                ${config.actions ? `
                    <div class="modal-footer">
                        ${config.actions}
                    </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(modal);

        if (config.closable !== false) {
            modal.querySelector('.modal-close').addEventListener('click', () => {
                this.close(modal);
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close(modal);
                }
            });
        }

        return modal;
    }

    show(modal) {
        this.activeModal = modal;
        modal.classList.add('active');
    }

    close(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentElement) {
                modal.parentElement.removeChild(modal);
            }
            if (this.activeModal === modal) {
                this.activeModal = null;
            }
        }, 300);
    }

    confirm(title, message, onConfirm, onCancel) {
        const modal = this.create({
            title,
            content: `<p>${message}</p>`,
            actions: `
                <button class="btn btn-outline" id="confirm-cancel">Cancel</button>
                <button class="btn btn-error" id="confirm-ok">Confirm</button>
            `,
            closable: false
        });

        modal.querySelector('#confirm-cancel').addEventListener('click', () => {
            this.close(modal);
            if (onCancel) onCancel();
        });

        modal.querySelector('#confirm-ok').addEventListener('click', () => {
            this.close(modal);
            if (onConfirm) onConfirm();
        });

        this.show(modal);
        return modal;
    }

    alert(title, message, onOk) {
        const modal = this.create({
            title,
            content: `<p>${message}</p>`,
            actions: `<button class="btn btn-primary" id="alert-ok">OK</button>`
        });

        modal.querySelector('#alert-ok').addEventListener('click', () => {
            this.close(modal);
            if (onOk) onOk();
        });

        this.show(modal);
        return modal;
    }
}

// Loading Manager
class LoadingManager {
    constructor() {
        this.spinner = document.getElementById('loading-spinner');
        this.activeLoaders = 0;
    }

    show(message = 'Loading...') {
        this.activeLoaders++;
        if (this.spinner) {
            this.spinner.querySelector('p').textContent = message;
            this.spinner.classList.remove('hidden');
        }
    }

    hide() {
        this.activeLoaders = Math.max(0, this.activeLoaders - 1);
        if (this.activeLoaders === 0 && this.spinner) {
            this.spinner.classList.add('hidden');
        }
    }

    hideAll() {
        this.activeLoaders = 0;
        if (this.spinner) {
            this.spinner.classList.add('hidden');
        }
    }
}

// Dropdown Component
class Dropdown {
    constructor(element, options = {}) {
        this.element = element;
        this.options = options;
        this.isOpen = false;
        this.selectedValue = options.defaultValue || '';
        this.init();
    }

    init() {
        this.element.innerHTML = `
            <div class="dropdown-trigger">
                <span class="dropdown-text">${this.options.placeholder || 'Select option'}</span>
                <span class="dropdown-arrow">▼</span>
            </div>
            <div class="dropdown-menu">
                ${this.options.items.map(item => `
                    <div class="dropdown-item" data-value="${item.value}">
                        ${item.label}
                    </div>
                `).join('')}
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const trigger = this.element.querySelector('.dropdown-trigger');
        const menu = this.element.querySelector('.dropdown-menu');

        trigger.addEventListener('click', () => this.toggle());

        menu.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-item')) {
                this.select(e.target.dataset.value, e.target.textContent);
            }
        });

        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.close();
            }
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.element.querySelector('.dropdown-trigger').classList.add('active');
        this.element.querySelector('.dropdown-menu').classList.add('active');
    }

    close() {
        this.isOpen = false;
        this.element.querySelector('.dropdown-trigger').classList.remove('active');
        this.element.querySelector('.dropdown-menu').classList.remove('active');
    }

    select(value, label) {
        this.selectedValue = value;
        this.element.querySelector('.dropdown-text').textContent = label;
        this.element.querySelector('.dropdown-item.selected')?.classList.remove('selected');
        this.element.querySelector(`[data-value="${value}"]`).classList.add('selected');
        this.close();

        if (this.options.onChange) {
            this.options.onChange(value, label);
        }
    }

    getValue() {
        return this.selectedValue;
    }

    setValue(value) {
        const item = this.element.querySelector(`[data-value="${value}"]`);
        if (item) {
            this.select(value, item.textContent);
        }
    }
}

// Tabs Component
class Tabs {
    constructor(element) {
        this.element = element;
        this.activeTab = null;
        this.init();
    }

    init() {
        this.bindEvents();
        
        // Activate first tab by default
        const firstTab = this.element.querySelector('.tab-trigger');
        if (firstTab) {
            this.activateTab(firstTab.dataset.tab);
        }
    }

    bindEvents() {
        this.element.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-trigger')) {
                this.activateTab(e.target.dataset.tab);
            }
        });
    }

    activateTab(tabId) {
        // Deactivate all tabs
        this.element.querySelectorAll('.tab-trigger').forEach(trigger => {
            trigger.classList.remove('active');
        });
        this.element.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Activate selected tab
        const trigger = this.element.querySelector(`[data-tab="${tabId}"]`);
        const content = this.element.querySelector(`#${tabId}`);

        if (trigger && content) {
            trigger.classList.add('active');
            content.classList.add('active');
            this.activeTab = tabId;
        }
    }

    getActiveTab() {
        return this.activeTab;
    }
}

// Accordion Component
class Accordion {
    constructor(element) {
        this.element = element;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        this.element.addEventListener('click', (e) => {
            if (e.target.classList.contains('accordion-trigger')) {
                this.toggle(e.target);
            }
        });
    }

    toggle(trigger) {
        const content = trigger.nextElementSibling;
        const isActive = trigger.classList.contains('active');

        if (isActive) {
            trigger.classList.remove('active');
            content.classList.remove('active');
        } else {
            trigger.classList.add('active');
            content.classList.add('active');
        }
    }

    expand(index) {
        const triggers = this.element.querySelectorAll('.accordion-trigger');
        if (triggers[index]) {
            this.toggle(triggers[index]);
        }
    }

    collapse(index) {
        const triggers = this.element.querySelectorAll('.accordion-trigger');
        if (triggers[index] && triggers[index].classList.contains('active')) {
            this.toggle(triggers[index]);
        }
    }
}

// Rating Component
class Rating {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            maxRating: 5,
            currentRating: 0,
            interactive: false,
            onChange: null,
            ...options
        };
        this.init();
    }

    init() {
        this.render();
        if (this.options.interactive) {
            this.bindEvents();
        }
    }

    render() {
        this.element.className = `rating ${this.options.interactive ? 'rating-interactive' : ''}`;
        this.element.innerHTML = '';

        for (let i = 1; i <= this.options.maxRating; i++) {
            const star = document.createElement('span');
            star.className = `rating-star ${i <= this.options.currentRating ? '' : 'empty'}`;
            star.textContent = '★';
            star.dataset.rating = i;
            this.element.appendChild(star);
        }
    }

    bindEvents() {
        this.element.addEventListener('click', (e) => {
            if (e.target.classList.contains('rating-star')) {
                this.setRating(parseInt(e.target.dataset.rating));
            }
        });

        this.element.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('rating-star')) {
                this.highlightStars(parseInt(e.target.dataset.rating));
            }
        });

        this.element.addEventListener('mouseleave', () => {
            this.render();
        });
    }

    highlightStars(rating) {
        this.element.querySelectorAll('.rating-star').forEach((star, index) => {
            star.className = `rating-star ${index < rating ? '' : 'empty'}`;
        });
    }

    setRating(rating) {
        this.options.currentRating = rating;
        this.render();
        
        if (this.options.onChange) {
            this.options.onChange(rating);
        }
    }

    getRating() {
        return this.options.currentRating;
    }
}

// Progress Component
class Progress {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            value: 0,
            max: 100,
            animated: true,
            ...options
        };
        this.init();
    }

    init() {
        this.element.className = 'progress';
        this.element.innerHTML = '<div class="progress-bar"></div>';
        this.bar = this.element.querySelector('.progress-bar');
        this.setValue(this.options.value);
    }

    setValue(value) {
        this.options.value = Math.max(0, Math.min(value, this.options.max));
        const percentage = (this.options.value / this.options.max) * 100;
        
        if (this.options.animated) {
            this.bar.style.transition = 'width 0.3s ease';
        }
        
        this.bar.style.width = `${percentage}%`;
    }

    getValue() {
        return this.options.value;
    }
}

// Initialize global component instances
window.Toast = new ToastManager();
window.Modal = new ModalManager();
window.Loading = new LoadingManager();

// Component factory functions
window.Components = {
    Dropdown: (element, options) => new Dropdown(element, options),
    Tabs: (element) => new Tabs(element),
    Accordion: (element) => new Accordion(element),
    Rating: (element, options) => new Rating(element, options),
    Progress: (element, options) => new Progress(element, options)
};

// Auto-initialize components on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize tabs
    document.querySelectorAll('.tabs').forEach(tabs => {
        new Tabs(tabs);
    });

    // Initialize accordions
    document.querySelectorAll('.accordion').forEach(accordion => {
        new Accordion(accordion);
    });

    // Initialize ratings
    document.querySelectorAll('.rating[data-rating]').forEach(rating => {
        const currentRating = parseFloat(rating.dataset.rating) || 0;
        const interactive = rating.hasAttribute('data-interactive');
        new Rating(rating, { currentRating, interactive });
    });

    // Initialize progress bars
    document.querySelectorAll('.progress[data-value]').forEach(progress => {
        const value = parseFloat(progress.dataset.value) || 0;
        const max = parseFloat(progress.dataset.max) || 100;
        new Progress(progress, { value, max });
    });
});