// Payday Platform - Router Module

/**
 * Simple client-side router for the Payday platform
 */

class PaydayRouter {
    constructor() {
        this.routes = {};
        this.currentRoute = '';
        this.init();
    }

    init() {
        this.defineRoutes();
        this.bindEvents();
        this.handleRoute();
    }

    defineRoutes() {
        this.routes = {
            '/': () => this.renderHome(),
            '/dashboard/seeker': () => this.renderSeekerDashboard(),
            '/dashboard/poster': () => this.renderPosterDashboard(),
            '/profile': () => this.renderProfile(),
            '/gig/:id': (id) => this.renderGigDetails(id),
            '/search': () => this.renderSearch(),
            '/help': () => this.renderHelp(),
            '/about': () => this.renderAbout()
        };
    }

    bindEvents() {
        // Handle back/forward browser buttons
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[data-route]')) {
                e.preventDefault();
                this.navigate(e.target.getAttribute('data-route'));
            }
        });
    }

    navigate(path) {
        window.history.pushState({}, '', path);
        this.handleRoute();
    }

    handleRoute() {
        const path = window.location.pathname;
        this.currentRoute = path;
        
        // Check if route requires authentication
        if (this.requiresAuth(path) && !window.API.isAuthenticated()) {
            window.Auth.openLoginModal();
            return;
        }

        // Find matching route
        const route = this.findRoute(path);
        if (route) {
            route.handler(route.params);
        } else {
            this.render404();
        }

        // Update navigation state
        this.updateNavigation();
    }

    requiresAuth(path) {
        const authRoutes = ['/dashboard/seeker', '/dashboard/poster', '/profile'];
        return authRoutes.some(route => path.startsWith(route));
    }

    findRoute(path) {
        // Check exact matches first
        if (this.routes[path]) {
            return { handler: this.routes[path], params: null };
        }

        // Check parametric routes
        for (const [routePath, handler] of Object.entries(this.routes)) {
            if (routePath.includes(':')) {
                const routeParts = routePath.split('/');
                const pathParts = path.split('/');

                if (routeParts.length === pathParts.length) {
                    let match = true;
                    const params = {};

                    for (let i = 0; i < routeParts.length; i++) {
                        if (routeParts[i].startsWith(':')) {
                            const paramName = routeParts[i].slice(1);
                            params[paramName] = pathParts[i];
                        } else if (routeParts[i] !== pathParts[i]) {
                            match = false;
                            break;
                        }
                    }

                    if (match) {
                        return { handler, params };
                    }
                }
            }
        }

        return null;
    }

    updateNavigation() {
        // Update active nav links
        document.querySelectorAll('[data-route]').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-route') === this.currentRoute) {
                link.classList.add('active');
            }
        });

        // Show/hide appropriate navigation elements
        const isAuthenticated = window.API.isAuthenticated();
        const userType = window.API.getUserType();

        document.querySelectorAll('.auth-only').forEach(el => {
            el.style.display = isAuthenticated ? 'block' : 'none';
        });

        document.querySelectorAll('.guest-only').forEach(el => {
            el.style.display = !isAuthenticated ? 'block' : 'none';
        });

        document.querySelectorAll('.seeker-only').forEach(el => {
            el.style.display = userType === 'seeker' ? 'block' : 'none';
        });

        document.querySelectorAll('.poster-only').forEach(el => {
            el.style.display = userType === 'poster' ? 'block' : 'none';
        });
    }

    renderHome() {
        const container = document.getElementById('app-container');
        if (window.Pages && window.Pages.home) {
            container.innerHTML = window.Pages.home();
            // Initialize home page functionality
            this.initHomePage();
        } else {
            container.innerHTML = '<div>Loading...</div>';
            console.error('Pages.home not available');
        }
    }

    renderSeekerDashboard() {
        const container = document.getElementById('app-container');
        container.innerHTML = window.Pages.seekerDashboard();
    }

    renderPosterDashboard() {
        const container = document.getElementById('app-container');
        container.innerHTML = window.Pages.posterDashboard();
    }

    renderProfile() {
        const container = document.getElementById('app-container');
        container.innerHTML = window.Pages.profile();
    }

    renderGigDetails(gigId) {
        const container = document.getElementById('app-container');
        container.innerHTML = window.Pages.gigDetails(gigId);
    }

    renderSearch() {
        const container = document.getElementById('app-container');
        container.innerHTML = window.Pages.search();
    }

    renderHelp() {
        const container = document.getElementById('app-container');
        container.innerHTML = window.Pages.help();
    }

    renderAbout() {
        const container = document.getElementById('app-container');
        container.innerHTML = window.Pages.about();
    }

    render404() {
        const container = document.getElementById('app-container');
        container.innerHTML = window.Pages.notFound();
    }

    initHomePage() {
        // Scroll to sections
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                const target = document.getElementById(targetId);
                if (target) {
                    Utils.scrollToElement(target, 80);
                }
            });
        });

        // Initialize contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm(e);
            });
        }

        // Initialize hero actions
        document.getElementById('hero-demo')?.addEventListener('click', () => {
            this.showDemo();
        });

        // Initialize stats animation
        this.animateStats();
    }

    handleContactForm(e) {
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        // Simulate sending message
        setTimeout(() => {
            window.Toast.success('Message Sent', 'Thank you for contacting us! We\'ll get back to you soon.');
            e.target.reset();
        }, 1000);
    }

    showDemo() {
        // Create demo modal
        const demoModal = document.createElement('div');
        demoModal.className = 'modal-overlay active';
        demoModal.innerHTML = `
            <div class="modal">
                <button class="modal-close">&times;</button>
                <div class="modal-header">
                    <h2 class="modal-title">Payday Demo</h2>
                    <p class="modal-description">See how Payday works in action</p>
                </div>
                <div class="modal-content">
                    <div class="demo-container">
                        <div class="demo-step active" data-step="1">
                            <h3>Step 1: Create Your Profile</h3>
                            <div class="demo-mockup">
                                <div class="phone-screen">
                                    <div class="demo-form">
                                        <h4>Join Payday</h4>
                                        <div class="demo-inputs">
                                            <div class="demo-input">Adebayo Ogundimu</div>
                                            <div class="demo-input">adebayo@unilag.edu.ng</div>
                                            <div class="demo-input">Data Entry, Content Writing</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="demo-step" data-step="2">
                            <h3>Step 2: Find Perfect Gigs</h3>
                            <div class="demo-mockup">
                                <div class="phone-screen">
                                    <div class="demo-gigs">
                                        <div class="demo-gig highlighted">
                                            <h4>Data Entry Assistant</h4>
                                            <p>₦8,500 • 3 hours</p>
                                            <div class="demo-match">98% Match</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="demo-step" data-step="3">
                            <h3>Step 3: Video Interview</h3>
                            <div class="demo-mockup">
                                <div class="phone-screen">
                                    <div class="demo-video">
                                        <div class="video-placeholder">📹 Live Interview</div>
                                        <p>Quick chat with Sarah from TechCorp</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="demo-step" data-step="4">
                            <h3>Step 4: Get Paid Instantly</h3>
                            <div class="demo-mockup">
                                <div class="phone-screen">
                                    <div class="demo-payment">
                                        <div class="payment-success">✅ Work Completed</div>
                                        <div class="payment-amount">₦8,500</div>
                                        <div class="payment-status">Paid Instantly</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="demo-controls">
                        <button class="btn btn-outline" id="demo-prev">Previous</button>
                        <div class="demo-dots">
                            <span class="demo-dot active" data-step="1"></span>
                            <span class="demo-dot" data-step="2"></span>
                            <span class="demo-dot" data-step="3"></span>
                            <span class="demo-dot" data-step="4"></span>
                        </div>
                        <button class="btn btn-primary" id="demo-next">Next</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(demoModal);
        
        // Initialize demo controls
        this.initDemoControls(demoModal);
    }

    initDemoControls(modal) {
        let currentStep = 1;
        const totalSteps = 4;

        const updateDemo = () => {
            modal.querySelectorAll('.demo-step').forEach(step => {
                step.classList.remove('active');
            });
            modal.querySelectorAll('.demo-dot').forEach(dot => {
                dot.classList.remove('active');
            });

            modal.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
            modal.querySelector(`.demo-dot[data-step="${currentStep}"]`).classList.add('active');

            modal.querySelector('#demo-prev').disabled = currentStep === 1;
            modal.querySelector('#demo-next').textContent = currentStep === totalSteps ? 'Get Started' : 'Next';
        };

        modal.querySelector('#demo-prev').addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateDemo();
            }
        });

        modal.querySelector('#demo-next').addEventListener('click', () => {
            if (currentStep < totalSteps) {
                currentStep++;
                updateDemo();
            } else {
                modal.remove();
                window.Auth.openSignupModal();
            }
        });

        modal.querySelectorAll('.demo-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                currentStep = parseInt(dot.dataset.step);
                updateDemo();
            });
        });

        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        updateDemo();
    }

    animateStats() {
        const stats = document.querySelectorAll('.stat-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateNumber(entry.target);
                }
            });
        });

        stats.forEach(stat => observer.observe(stat));
    }

    animateNumber(element) {
        const target = element.textContent;
        const isNaira = target.includes('₦');
        const isStar = target.includes('★');
        
        let finalNumber;
        let suffix = '';
        
        if (isNaira) {
            finalNumber = parseFloat(target.replace('₦', '').replace('M+', ''));
            suffix = 'M+';
        } else if (isStar) {
            finalNumber = parseFloat(target.replace('★', ''));
            suffix = '★';
        } else {
            finalNumber = parseInt(target.replace('K+', ''));
            suffix = 'K+';
        }

        let current = 0;
        const increment = finalNumber / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= finalNumber) {
                current = finalNumber;
                clearInterval(timer);
            }
            
            if (isNaira) {
                element.textContent = `₦${current.toFixed(1)}${suffix}`;
            } else if (isStar) {
                element.textContent = `${current.toFixed(1)}${suffix}`;
            } else {
                element.textContent = `${Math.floor(current)}${suffix}`;
            }
        }, 20);
    }
}

// Initialize router
window.Router = new PaydayRouter();