// Payday Platform - Authentication Module

/**
 * Authentication handling for the Payday platform
 */

class AuthManager {
    constructor() {
        this.modals = {};
        this.init();
    }

    init() {
        this.createAuthModals();
        this.bindEvents();
    }

    createAuthModals() {
        this.createLoginModal();
        this.createSignupModal();
    }

    createLoginModal() {
        const modalHTML = `
            <div id="login-modal" class="modal-overlay">
                <div class="modal">
                    <button class="modal-close" data-testid="button-close-login">&times;</button>
                    <div class="modal-header">
                        <h2 class="modal-title">Welcome Back</h2>
                        <p class="modal-description">Sign in to your Payday account</p>
                    </div>
                    <div class="modal-content">
                        <form id="login-form" class="space-y-4">
                            <div class="form-group">
                                <label for="login-email" class="form-label">Email Address</label>
                                <input 
                                    type="email" 
                                    id="login-email" 
                                    name="email" 
                                    class="form-input" 
                                    required 
                                    data-testid="input-login-email"
                                    placeholder="Enter your email"
                                >
                                <div class="form-error" id="login-email-error"></div>
                            </div>
                            <div class="form-group">
                                <label for="login-password" class="form-label">Password</label>
                                <input 
                                    type="password" 
                                    id="login-password" 
                                    name="password" 
                                    class="form-input" 
                                    required 
                                    data-testid="input-login-password"
                                    placeholder="Enter your password"
                                >
                                <div class="form-error" id="login-password-error"></div>
                            </div>
                            <div class="flex items-center justify-between">
                                <label class="flex items-center gap-2">
                                    <input type="checkbox" class="form-checkbox" id="remember-me">
                                    <span class="text-sm">Remember me</span>
                                </label>
                                <a href="#" class="text-sm text-primary">Forgot password?</a>
                            </div>
                            <button 
                                type="submit" 
                                class="btn btn-primary w-full" 
                                data-testid="button-login-submit"
                            >
                                <span class="btn-text">Sign In</span>
                                <div class="btn-loader hidden">
                                    <div class="spinner"></div>
                                </div>
                            </button>
                            <div class="text-center">
                                <p class="text-secondary">
                                    Don't have an account? 
                                    <button 
                                        type="button" 
                                        class="text-primary font-semibold" 
                                        id="switch-to-signup"
                                        data-testid="link-switch-to-signup"
                                    >
                                        Sign up
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modals.login = Utils.$('#login-modal');
    }

    createSignupModal() {
        const modalHTML = `
            <div id="signup-modal" class="modal-overlay">
                <div class="modal">
                    <button class="modal-close" data-testid="button-close-signup">&times;</button>
                    <div class="modal-header">
                        <h2 class="modal-title">Join Payday</h2>
                        <p class="modal-description">Start earning money today</p>
                    </div>
                    <div class="modal-content">
                        <form id="signup-form" class="space-y-4">
                            <!-- User Type Selection -->
                            <div class="form-group">
                                <label class="form-label">I want to:</label>
                                <div class="grid grid-2 gap-3">
                                    <label class="user-type-card">
                                        <input 
                                            type="radio" 
                                            name="userType" 
                                            value="seeker" 
                                            class="form-radio" 
                                            checked
                                            data-testid="radio-user-type-seeker"
                                        >
                                        <div class="user-type-content">
                                            <div class="text-2xl mb-2">💼</div>
                                            <h4>Find Gigs</h4>
                                            <p class="text-sm text-secondary">Earn money with your skills</p>
                                        </div>
                                    </label>
                                    <label class="user-type-card">
                                        <input 
                                            type="radio" 
                                            name="userType" 
                                            value="poster" 
                                            class="form-radio"
                                            data-testid="radio-user-type-poster"
                                        >
                                        <div class="user-type-content">
                                            <div class="text-2xl mb-2">🏢</div>
                                            <h4>Post Gigs</h4>
                                            <p class="text-sm text-secondary">Hire talented youth</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <!-- Personal Information -->
                            <div class="grid grid-2 gap-3">
                                <div class="form-group">
                                    <label for="signup-firstname" class="form-label">First Name</label>
                                    <input 
                                        type="text" 
                                        id="signup-firstname" 
                                        name="firstName" 
                                        class="form-input" 
                                        required 
                                        data-testid="input-signup-firstname"
                                        placeholder="Your first name"
                                    >
                                    <div class="form-error" id="signup-firstname-error"></div>
                                </div>
                                <div class="form-group">
                                    <label for="signup-lastname" class="form-label">Last Name</label>
                                    <input 
                                        type="text" 
                                        id="signup-lastname" 
                                        name="lastName" 
                                        class="form-input" 
                                        required 
                                        data-testid="input-signup-lastname"
                                        placeholder="Your last name"
                                    >
                                    <div class="form-error" id="signup-lastname-error"></div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="signup-email" class="form-label">Email Address</label>
                                <input 
                                    type="email" 
                                    id="signup-email" 
                                    name="email" 
                                    class="form-input" 
                                    required 
                                    data-testid="input-signup-email"
                                    placeholder="your.email@example.com"
                                >
                                <div class="form-error" id="signup-email-error"></div>
                            </div>

                            <div class="form-group">
                                <label for="signup-phone" class="form-label">Phone Number</label>
                                <input 
                                    type="tel" 
                                    id="signup-phone" 
                                    name="phone" 
                                    class="form-input" 
                                    required 
                                    data-testid="input-signup-phone"
                                    placeholder="08012345678"
                                >
                                <div class="form-error" id="signup-phone-error"></div>
                            </div>

                            <div class="form-group">
                                <label for="signup-location" class="form-label">Location</label>
                                <select 
                                    id="signup-location" 
                                    name="location" 
                                    class="form-select" 
                                    required 
                                    data-testid="select-signup-location"
                                >
                                    <option value="">Select your state</option>
                                </select>
                                <div class="form-error" id="signup-location-error"></div>
                            </div>

                            <!-- Skills for Seekers -->
                            <div class="form-group" id="skills-section">
                                <label class="form-label">Your Skills</label>
                                <div class="skills-container">
                                    <div class="selected-skills" id="selected-skills"></div>
                                    <input 
                                        type="text" 
                                        id="skills-input" 
                                        class="form-input" 
                                        placeholder="Type skills and press Enter"
                                        data-testid="input-signup-skills"
                                    >
                                    <div class="popular-skills" id="popular-skills"></div>
                                </div>
                                <div class="form-error" id="signup-skills-error"></div>
                            </div>

                            <!-- Business Name for Posters -->
                            <div class="form-group hidden" id="business-section">
                                <label for="signup-business" class="form-label">Business/Organization Name</label>
                                <input 
                                    type="text" 
                                    id="signup-business" 
                                    name="businessName" 
                                    class="form-input" 
                                    data-testid="input-signup-business"
                                    placeholder="Your business name"
                                >
                                <div class="form-error" id="signup-business-error"></div>
                            </div>

                            <div class="grid grid-2 gap-3">
                                <div class="form-group">
                                    <label for="signup-password" class="form-label">Password</label>
                                    <input 
                                        type="password" 
                                        id="signup-password" 
                                        name="password" 
                                        class="form-input" 
                                        required 
                                        data-testid="input-signup-password"
                                        placeholder="Create a strong password"
                                    >
                                    <div class="form-error" id="signup-password-error"></div>
                                </div>
                                <div class="form-group">
                                    <label for="signup-confirm-password" class="form-label">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        id="signup-confirm-password" 
                                        name="confirmPassword" 
                                        class="form-input" 
                                        required 
                                        data-testid="input-signup-confirm-password"
                                        placeholder="Confirm your password"
                                    >
                                    <div class="form-error" id="signup-confirm-password-error"></div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="flex items-start gap-2">
                                    <input 
                                        type="checkbox" 
                                        class="form-checkbox mt-1" 
                                        name="agreeToTerms" 
                                        required
                                        data-testid="checkbox-agree-terms"
                                    >
                                    <span class="text-sm">
                                        I agree to the <a href="#" class="text-primary">Terms of Service</a> 
                                        and <a href="#" class="text-primary">Privacy Policy</a>
                                    </span>
                                </label>
                                <div class="form-error" id="signup-terms-error"></div>
                            </div>

                            <button 
                                type="submit" 
                                class="btn btn-primary w-full" 
                                data-testid="button-signup-submit"
                            >
                                <span class="btn-text">Create Account</span>
                                <div class="btn-loader hidden">
                                    <div class="spinner"></div>
                                </div>
                            </button>

                            <div class="text-center">
                                <p class="text-secondary">
                                    Already have an account? 
                                    <button 
                                        type="button" 
                                        class="text-primary font-semibold" 
                                        id="switch-to-login"
                                        data-testid="link-switch-to-login"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modals.signup = Utils.$('#signup-modal');
        this.initSignupModal();
    }

    initSignupModal() {
        // Populate states
        const locationSelect = Utils.$('#signup-location');
        Utils.getNigerianStates().forEach(state => {
            const option = Utils.createElement('option', { value: state }, state);
            locationSelect.appendChild(option);
        });

        // Initialize skills
        this.initSkillsInput();
        
        // Handle user type changes
        Utils.$$('input[name="userType"]').forEach(radio => {
            Utils.on(radio, 'change', (e) => {
                this.handleUserTypeChange(e.target.value);
            });
        });
    }

    initSkillsInput() {
        const skillsInput = Utils.$('#skills-input');
        const selectedSkillsContainer = Utils.$('#selected-skills');
        const popularSkillsContainer = Utils.$('#popular-skills');
        let selectedSkills = [];

        // Create popular skills buttons
        const popularSkills = Utils.getPopularSkills();
        popularSkills.forEach(skill => {
            const skillBtn = Utils.createElement('button', {
                type: 'button',
                className: 'skill-tag',
                textContent: skill
            });
            
            Utils.on(skillBtn, 'click', () => {
                this.addSkill(skill, selectedSkills, selectedSkillsContainer);
                skillBtn.style.display = 'none';
            });
            
            popularSkillsContainer.appendChild(skillBtn);
        });

        // Handle skill input
        Utils.on(skillsInput, 'keydown', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                e.preventDefault();
                this.addSkill(e.target.value.trim(), selectedSkills, selectedSkillsContainer);
                e.target.value = '';
            }
        });
    }

    addSkill(skill, selectedSkills, container) {
        if (!selectedSkills.includes(skill) && selectedSkills.length < 10) {
            selectedSkills.push(skill);
            
            const skillTag = Utils.createElement('div', {
                className: 'selected-skill-tag'
            }, `
                <span>${skill}</span>
                <button type="button" class="remove-skill" data-skill="${skill}">×</button>
            `);
            
            Utils.on(skillTag.querySelector('.remove-skill'), 'click', (e) => {
                const skillToRemove = e.target.dataset.skill;
                const index = selectedSkills.indexOf(skillToRemove);
                if (index > -1) {
                    selectedSkills.splice(index, 1);
                    skillTag.remove();
                    
                    // Show in popular skills again
                    const popularSkillBtn = Utils.$$('.skill-tag').find(btn => 
                        btn.textContent === skillToRemove
                    );
                    if (popularSkillBtn) {
                        popularSkillBtn.style.display = 'inline-block';
                    }
                }
            });
            
            container.appendChild(skillTag);
            
            // Update hidden input
            const hiddenInput = Utils.$('#skills-hidden') || Utils.createElement('input', {
                type: 'hidden',
                name: 'skills',
                id: 'skills-hidden'
            });
            hiddenInput.value = JSON.stringify(selectedSkills);
            if (!Utils.$('#skills-hidden')) {
                container.appendChild(hiddenInput);
            }
        }
    }

    handleUserTypeChange(userType) {
        const skillsSection = Utils.$('#skills-section');
        const businessSection = Utils.$('#business-section');
        
        if (userType === 'seeker') {
            skillsSection.classList.remove('hidden');
            businessSection.classList.add('hidden');
            Utils.$('#signup-business').removeAttribute('required');
        } else {
            skillsSection.classList.add('hidden');
            businessSection.classList.remove('hidden');
            Utils.$('#signup-business').setAttribute('required', '');
        }
    }

    bindEvents() {
        // Login modal events
        Utils.on('#nav-login', 'click', () => this.openLoginModal());
        Utils.on('#mobile-login', 'click', () => this.openLoginModal());
        Utils.on('#switch-to-signup', 'click', () => this.switchToSignup());
        Utils.on('#login-modal .modal-close', 'click', () => this.closeModal('login'));
        Utils.on('#login-modal', 'click', (e) => {
            if (e.target === e.currentTarget) this.closeModal('login');
        });

        // Signup modal events
        Utils.on('#nav-signup', 'click', () => this.openSignupModal());
        Utils.on('#mobile-signup', 'click', () => this.openSignupModal());
        Utils.on('#hero-signup', 'click', () => this.openSignupModal());
        Utils.on('#cta-signup', 'click', () => this.openSignupModal());
        Utils.on('#switch-to-login', 'click', () => this.switchToLogin());
        Utils.on('#signup-modal .modal-close', 'click', () => this.closeModal('signup'));
        Utils.on('#signup-modal', 'click', (e) => {
            if (e.target === e.currentTarget) this.closeModal('signup');
        });

        // Form submissions
        Utils.on('#login-form', 'submit', (e) => this.handleLogin(e));
        Utils.on('#signup-form', 'submit', (e) => this.handleSignup(e));

        // Close modals on escape
        Utils.on(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    openLoginModal() {
        this.closeAllModals();
        this.modals.login.classList.add('active');
        Utils.$('#login-email').focus();
    }

    openSignupModal() {
        this.closeAllModals();
        this.modals.signup.classList.add('active');
        Utils.$('#signup-firstname').focus();
    }

    switchToSignup() {
        this.closeModal('login');
        setTimeout(() => this.openSignupModal(), 150);
    }

    switchToLogin() {
        this.closeModal('signup');
        setTimeout(() => this.openLoginModal(), 150);
    }

    closeModal(type) {
        if (this.modals[type]) {
            this.modals[type].classList.remove('active');
            this.clearErrors();
        }
    }

    closeAllModals() {
        Object.values(this.modals).forEach(modal => {
            modal.classList.remove('active');
        });
        this.clearErrors();
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        // Validate input
        if (!this.validateLoginForm(credentials)) {
            return;
        }

        this.setLoading('login', true);

        try {
            const response = await window.API.login(credentials);
            
            window.Toast.success('Login Successful', `Welcome back, ${response.user.firstName}!`);
            this.closeModal('login');
            
            // Redirect to appropriate dashboard
            const dashboardPath = response.user.userType === 'seeker' ? '/dashboard/seeker' : '/dashboard/poster';
            window.Router.navigate(dashboardPath);
            
        } catch (error) {
            window.Toast.error('Login Failed', error.message);
        } finally {
            this.setLoading('login', false);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        // Get skills from hidden input
        const skillsInput = Utils.$('#skills-hidden');
        const skills = skillsInput ? JSON.parse(skillsInput.value || '[]') : [];
        
        const userData = {
            email: formData.get('email'),
            password: formData.get('password'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            phone: formData.get('phone'),
            location: formData.get('location'),
            userType: formData.get('userType'),
            skills: formData.get('userType') === 'seeker' ? skills : [],
            businessName: formData.get('userType') === 'poster' ? formData.get('businessName') : null
        };

        // Validate input
        if (!this.validateSignupForm(userData, formData.get('confirmPassword'))) {
            return;
        }

        this.setLoading('signup', true);

        try {
            const response = await window.API.register(userData);
            
            window.Toast.success('Account Created', `Welcome to Payday, ${response.user.firstName}!`);
            this.closeModal('signup');
            
            // Redirect to appropriate dashboard
            const dashboardPath = response.user.userType === 'seeker' ? '/dashboard/seeker' : '/dashboard/poster';
            window.Router.navigate(dashboardPath);
            
        } catch (error) {
            window.Toast.error('Registration Failed', error.message);
        } finally {
            this.setLoading('signup', false);
        }
    }

    validateLoginForm(credentials) {
        this.clearErrors();
        let isValid = true;

        if (!credentials.email) {
            this.showError('login-email', 'Email is required');
            isValid = false;
        } else if (!Utils.isEmail(credentials.email)) {
            this.showError('login-email', 'Please enter a valid email address');
            isValid = false;
        }

        if (!credentials.password) {
            this.showError('login-password', 'Password is required');
            isValid = false;
        }

        return isValid;
    }

    validateSignupForm(userData, confirmPassword) {
        this.clearErrors();
        let isValid = true;

        if (!userData.firstName) {
            this.showError('signup-firstname', 'First name is required');
            isValid = false;
        }

        if (!userData.lastName) {
            this.showError('signup-lastname', 'Last name is required');
            isValid = false;
        }

        if (!userData.email) {
            this.showError('signup-email', 'Email is required');
            isValid = false;
        } else if (!Utils.isEmail(userData.email)) {
            this.showError('signup-email', 'Please enter a valid email address');
            isValid = false;
        }

        if (!userData.phone) {
            this.showError('signup-phone', 'Phone number is required');
            isValid = false;
        } else if (!Utils.isPhoneNumber(userData.phone)) {
            this.showError('signup-phone', 'Please enter a valid Nigerian phone number');
            isValid = false;
        }

        if (!userData.location) {
            this.showError('signup-location', 'Please select your state');
            isValid = false;
        }

        if (userData.userType === 'seeker' && userData.skills.length === 0) {
            this.showError('signup-skills', 'Please add at least one skill');
            isValid = false;
        }

        if (userData.userType === 'poster' && !userData.businessName) {
            this.showError('signup-business', 'Business name is required');
            isValid = false;
        }

        if (!userData.password) {
            this.showError('signup-password', 'Password is required');
            isValid = false;
        } else if (userData.password.length < 6) {
            this.showError('signup-password', 'Password must be at least 6 characters long');
            isValid = false;
        }

        if (userData.password !== confirmPassword) {
            this.showError('signup-confirm-password', 'Passwords do not match');
            isValid = false;
        }

        return isValid;
    }

    showError(fieldId, message) {
        const errorElement = Utils.$(`#${fieldId}-error`);
        const inputElement = Utils.$(`#${fieldId}`);
        
        if (errorElement) {
            errorElement.textContent = message;
        }
        
        if (inputElement) {
            inputElement.classList.add('error');
        }
    }

    clearErrors() {
        Utils.$$('.form-error').forEach(error => {
            error.textContent = '';
        });
        
        Utils.$$('.form-input.error, .form-select.error').forEach(input => {
            input.classList.remove('error');
        });
    }

    setLoading(type, isLoading) {
        const submitBtn = Utils.$(`#${type}-form button[type="submit"]`);
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.classList.add('hidden');
            btnLoader.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
    }

    async logout() {
        try {
            await window.API.logout();
            window.Toast.success('Logged Out', 'You have been successfully logged out');
            window.Router.navigate('/');
        } catch (error) {
            window.Toast.error('Logout Failed', error.message);
        }
    }
}

// Initialize auth manager
window.Auth = new AuthManager();