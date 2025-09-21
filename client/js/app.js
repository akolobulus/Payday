// Payday Platform - Main Application

/**
 * Main application initialization and data management
 */

class PaydayApp {
    constructor() {
        this.data = {
            users: [],
            gigs: [],
            applications: [],
            reviews: [],
            notifications: []
        };
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadData();
        this.generateSampleData();
        this.initializeAPI();
        this.bindGlobalEvents();
        this.hideLoading();
    }

    loadData() {
        // Load data from localStorage
        this.data.users = Utils.storage.get('payday_users', []);
        this.data.gigs = Utils.storage.get('payday_gigs', []);
        this.data.applications = Utils.storage.get('payday_applications', []);
        this.data.reviews = Utils.storage.get('payday_reviews', []);
        this.data.notifications = Utils.storage.get('payday_notifications', []);
        
        // Load current user
        this.currentUser = Utils.storage.get('payday_user', null);
    }

    saveData() {
        Utils.storage.set('payday_users', this.data.users);
        Utils.storage.set('payday_gigs', this.data.gigs);
        Utils.storage.set('payday_applications', this.data.applications);
        Utils.storage.set('payday_reviews', this.data.reviews);
        Utils.storage.set('payday_notifications', this.data.notifications);
    }

    generateSampleData() {
        // Only generate if no data exists
        if (this.data.users.length === 0) {
            this.generateSampleUsers();
            this.generateSampleGigs();
            this.generateSampleApplications();
            this.generateSampleReviews();
            this.saveData();
        }
    }

    generateSampleUsers() {
        const sampleUsers = [
            {
                id: 'user_1',
                email: 'adebayo@unilag.edu.ng',
                password: 'password123',
                firstName: 'Adebayo',
                lastName: 'Ogundimu',
                phone: '08012345678',
                location: 'Lagos',
                userType: 'seeker',
                skills: ['Data Entry', 'Content Writing', 'Research'],
                isVerified: true,
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                avatar: null,
                rating: 4.8,
                completedGigs: 23,
                reliabilityScore: 98
            },
            {
                id: 'user_2',
                email: 'folake@techcorp.ng',
                password: 'password123',
                firstName: 'Folake',
                lastName: 'Adeyemi',
                phone: '08087654321',
                location: 'Lagos',
                userType: 'poster',
                businessName: 'TechCorp Nigeria',
                isVerified: true,
                createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                avatar: null,
                rating: 4.9,
                postedGigs: 15
            },
            {
                id: 'user_3',
                email: 'kemi@student.ui.edu.ng',
                password: 'password123',
                firstName: 'Kemi',
                lastName: 'Afolabi',
                phone: '08098765432',
                location: 'Oyo',
                userType: 'seeker',
                skills: ['Graphic Design', 'Social Media Management', 'Video Editing'],
                isVerified: true,
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                avatar: null,
                rating: 4.9,
                completedGigs: 18,
                reliabilityScore: 95
            },
            {
                id: 'user_4',
                email: 'chidi@abuja.gov.ng',
                password: 'password123',
                firstName: 'Chidi',
                lastName: 'Okwu',
                phone: '08076543210',
                location: 'FCT',
                userType: 'poster',
                businessName: 'Abuja Events Co.',
                isVerified: true,
                createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
                avatar: null,
                rating: 4.7,
                postedGigs: 8
            },
            {
                id: 'user_5',
                email: 'amina@babcock.edu.ng',
                password: 'password123',
                firstName: 'Amina',
                lastName: 'Hassan',
                phone: '08054321098',
                location: 'Ogun',
                userType: 'seeker',
                skills: ['Tutoring', 'Translation', 'Customer Service'],
                isVerified: true,
                createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
                avatar: null,
                rating: 4.6,
                completedGigs: 12,
                reliabilityScore: 92
            }
        ];

        this.data.users = sampleUsers;
    }

    generateSampleGigs() {
        const sampleGigs = [
            {
                id: 'gig_1',
                title: 'Data Entry Assistant Needed',
                description: 'Looking for a reliable person to help with data entry tasks. Must be accurate and detail-oriented. Work involves entering customer information into our database system.',
                budget: 8500,
                category: 'Data Entry',
                location: 'Lagos',
                urgency: 'medium',
                estimatedDuration: '3 hours',
                skillsRequired: ['Data Entry', 'Microsoft Excel'],
                posterId: 'user_2',
                seekerId: null,
                status: 'open',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                completedAt: null,
                applicants: ['user_1'],
                views: 45
            },
            {
                id: 'gig_2',
                title: 'Social Media Content Creator',
                description: 'Need creative individual to create engaging social media posts for our brand. Should understand Nigerian youth culture and trending topics.',
                budget: 12000,
                category: 'Social Media',
                location: 'Lagos',
                urgency: 'high',
                estimatedDuration: '2 days',
                skillsRequired: ['Social Media Management', 'Content Creation', 'Graphic Design'],
                posterId: 'user_2',
                seekerId: 'user_3',
                status: 'assigned',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                completedAt: null,
                applicants: ['user_3', 'user_1'],
                views: 67
            },
            {
                id: 'gig_3',
                title: 'Event Registration Assistant',
                description: 'Help with registration for upcoming tech conference. Must be professional and good with people. Training will be provided.',
                budget: 15000,
                category: 'Event Support',
                location: 'FCT',
                urgency: 'high',
                estimatedDuration: '1 day',
                skillsRequired: ['Customer Service', 'Event Management'],
                posterId: 'user_4',
                seekerId: null,
                status: 'open',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                completedAt: null,
                applicants: ['user_5'],
                views: 32
            },
            {
                id: 'gig_4',
                title: 'Website Content Writing',
                description: 'Write compelling content for startup website. Must have good English and understand tech industry. 5 pages needed.',
                budget: 20000,
                category: 'Content Writing',
                location: 'Lagos',
                urgency: 'low',
                estimatedDuration: '1 week',
                skillsRequired: ['Content Writing', 'SEO', 'Research'],
                posterId: 'user_2',
                seekerId: null,
                status: 'open',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                completedAt: null,
                applicants: [],
                views: 23
            },
            {
                id: 'gig_5',
                title: 'Maths Tutor for High School Students',
                description: 'Online tutoring for WAEC/JAMB preparation. Must be patient and experienced with teaching. Flexible hours.',
                budget: 5000,
                category: 'Tutoring',
                location: 'Ogun',
                urgency: 'medium',
                estimatedDuration: '2 hours/week',
                skillsRequired: ['Tutoring', 'Mathematics', 'Teaching'],
                posterId: 'user_4',
                seekerId: 'user_5',
                status: 'completed',
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                applicants: ['user_5'],
                views: 18
            }
        ];

        this.data.gigs = sampleGigs;
    }

    generateSampleApplications() {
        const sampleApplications = [
            {
                id: 'app_1',
                gigId: 'gig_1',
                seekerId: 'user_1',
                posterId: 'user_2',
                status: 'pending',
                appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                message: 'I have 2+ years experience in data entry and am very detail-oriented. Available to start immediately.'
            },
            {
                id: 'app_2',
                gigId: 'gig_2',
                seekerId: 'user_3',
                posterId: 'user_2',
                status: 'accepted',
                appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                acceptedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                message: 'I specialize in social media content and understand youth culture perfectly. Check my portfolio!'
            },
            {
                id: 'app_3',
                gigId: 'gig_3',
                seekerId: 'user_5',
                posterId: 'user_4',
                status: 'pending',
                appliedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
                message: 'I have customer service experience and am available for the event date. Very punctual and professional.'
            },
            {
                id: 'app_4',
                gigId: 'gig_5',
                seekerId: 'user_5',
                posterId: 'user_4',
                status: 'completed',
                appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                acceptedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
                completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                message: 'Mathematics graduate with tutoring experience. Available for flexible schedule.'
            }
        ];

        this.data.applications = sampleApplications;
    }

    generateSampleReviews() {
        const sampleReviews = [
            {
                id: 'review_1',
                gigId: 'gig_5',
                reviewerId: 'user_4',
                revieweeId: 'user_5',
                rating: 5,
                comment: 'Excellent tutor! Very patient and knowledgeable. My son\'s grades improved significantly.',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                type: 'seeker'
            },
            {
                id: 'review_2',
                gigId: 'gig_5',
                reviewerId: 'user_5',
                revieweeId: 'user_4',
                rating: 5,
                comment: 'Great client! Clear instructions and prompt payment. Would definitely work with again.',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                type: 'poster'
            }
        ];

        this.data.reviews = sampleReviews;
    }

    initializeAPI() {
        // Mock API implementation using local data
        const originalAPI = window.API;

        // Override API methods to use local data
        window.API.register = async (userData) => {
            // Check if user exists
            const existingUser = this.data.users.find(u => u.email === userData.email);
            if (existingUser) {
                throw new Error('User already exists with this email');
            }

            // Create new user
            const newUser = {
                id: Utils.generateId(),
                ...userData,
                isVerified: false,
                createdAt: new Date(),
                rating: 0,
                completedGigs: 0,
                postedGigs: 0,
                reliabilityScore: 100
            };

            this.data.users.push(newUser);
            this.currentUser = newUser;
            this.saveData();

            return { user: newUser };
        };

        window.API.login = async (credentials) => {
            const user = this.data.users.find(u => 
                u.email === credentials.email && u.password === credentials.password
            );

            if (!user) {
                throw new Error('Invalid email or password');
            }

            this.currentUser = user;
            Utils.storage.set('payday_user', user);

            return { user };
        };

        window.API.logout = async () => {
            this.currentUser = null;
            Utils.storage.remove('payday_user');
        };

        window.API.getCurrentUser = () => {
            return this.currentUser;
        };

        window.API.getAvailableGigs = async () => {
            return this.data.gigs.filter(gig => gig.status === 'open');
        };

        window.API.createGig = async (gigData) => {
            if (!this.currentUser || this.currentUser.userType !== 'poster') {
                throw new Error('Only gig posters can create gigs');
            }

            const newGig = {
                id: Utils.generateId(),
                ...gigData,
                posterId: this.currentUser.id,
                seekerId: null,
                status: 'open',
                createdAt: new Date(),
                completedAt: null,
                applicants: [],
                views: 0
            };

            this.data.gigs.push(newGig);
            this.saveData();

            return newGig;
        };

        window.API.applyToGig = async (gigId) => {
            if (!this.currentUser || this.currentUser.userType !== 'seeker') {
                throw new Error('Only gig seekers can apply to gigs');
            }

            const gig = this.data.gigs.find(g => g.id === gigId);
            if (!gig) {
                throw new Error('Gig not found');
            }

            if (gig.applicants.includes(this.currentUser.id)) {
                throw new Error('You have already applied to this gig');
            }

            // Add to applicants
            gig.applicants.push(this.currentUser.id);

            // Create application
            const application = {
                id: Utils.generateId(),
                gigId,
                seekerId: this.currentUser.id,
                posterId: gig.posterId,
                status: 'pending',
                appliedAt: new Date(),
                message: 'I\'m interested in this gig and believe I\'m a great fit!'
            };

            this.data.applications.push(application);
            this.saveData();

            return application;
        };

        window.API.getMyApplications = async () => {
            if (!this.currentUser) return [];
            
            return this.data.applications
                .filter(app => app.seekerId === this.currentUser.id)
                .map(app => {
                    const gig = this.data.gigs.find(g => g.id === app.gigId);
                    return { ...app, gig };
                });
        };

        window.API.getPostedGigs = async () => {
            if (!this.currentUser) return [];
            
            return this.data.gigs.filter(gig => gig.posterId === this.currentUser.id);
        };

        window.API.getGigRecommendations = async () => {
            if (!this.currentUser || this.currentUser.userType !== 'seeker') {
                return [];
            }

            // Simple AI recommendation algorithm
            const userSkills = this.currentUser.skills || [];
            const availableGigs = this.data.gigs.filter(gig => gig.status === 'open');

            return availableGigs
                .map(gig => {
                    // Calculate match score based on skills
                    const commonSkills = gig.skillsRequired.filter(skill => 
                        userSkills.some(userSkill => 
                            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
                            skill.toLowerCase().includes(userSkill.toLowerCase())
                        )
                    );
                    
                    const matchScore = (commonSkills.length / gig.skillsRequired.length) * 100;
                    
                    return {
                        ...gig,
                        matchScore,
                        reasoning: `You have ${commonSkills.length} of ${gig.skillsRequired.length} required skills`,
                        skillsMatch: commonSkills
                    };
                })
                .filter(gig => gig.matchScore > 30)
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, 5);
        };

        window.API.getStats = async () => {
            return {
                totalUsers: this.data.users.length,
                totalGigs: this.data.gigs.length,
                completedGigs: this.data.gigs.filter(g => g.status === 'completed').length,
                totalPayout: this.data.gigs
                    .filter(g => g.status === 'completed')
                    .reduce((sum, g) => sum + g.budget, 0)
            };
        };

        // Keep original methods that don't need override
        window.API.isAuthenticated = originalAPI.isAuthenticated.bind(originalAPI);
        window.API.getUserType = originalAPI.getUserType.bind(originalAPI);
        window.API.isSeeker = originalAPI.isSeeker.bind(originalAPI);
        window.API.isPoster = originalAPI.isPoster.bind(originalAPI);
    }

    bindGlobalEvents() {
        // Handle navigation
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('[data-nav]');
            if (navLink) {
                e.preventDefault();
                const target = navLink.dataset.nav;
                if (target.startsWith('#')) {
                    Utils.scrollToElement(target, 80);
                } else {
                    window.Router.navigate(target);
                }
            }
        });

        // Handle demo account login
        document.addEventListener('click', (e) => {
            if (e.target.id === 'demo-seeker' || e.target.closest('#demo-seeker')) {
                e.preventDefault();
                this.loginDemoAccount('seeker');
            }
            if (e.target.id === 'demo-poster' || e.target.closest('#demo-poster')) {
                e.preventDefault();
                this.loginDemoAccount('poster');
            }
        });

        // Handle mobile menu toggle
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener('click', () => {
                mobileToggle.classList.toggle('active');
                mobileMenu.classList.toggle('active');
            });
        }

        // Close mobile menu on link click
        document.addEventListener('click', (e) => {
            if (e.target.closest('#mobile-menu a')) {
                if (mobileToggle && mobileMenu) {
                    mobileToggle.classList.remove('active');
                    mobileMenu.classList.remove('active');
                }
            }
        });

        // Navbar scroll effect
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                if (window.scrollY > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });

        // Update user info when user changes
        this.updateUserInfo();
    }

    updateUserInfo() {
        const userElements = document.querySelectorAll('[data-user-info]');
        userElements.forEach(element => {
            const info = element.dataset.userInfo;
            if (this.currentUser && this.currentUser[info]) {
                element.textContent = this.currentUser[info];
            }
        });
    }

    hideLoading() {
        setTimeout(() => {
            window.Loading.hideAll();
        }, 1000);
    }

    // Utility methods for components
    getUserById(id) {
        return this.data.users.find(user => user.id === id);
    }

    getGigById(id) {
        return this.data.gigs.find(gig => gig.id === id);
    }

    updateGig(gigId, updates) {
        const gigIndex = this.data.gigs.findIndex(g => g.id === gigId);
        if (gigIndex !== -1) {
            this.data.gigs[gigIndex] = { ...this.data.gigs[gigIndex], ...updates };
            this.saveData();
            return this.data.gigs[gigIndex];
        }
        return null;
    }

    updateApplication(appId, updates) {
        const appIndex = this.data.applications.findIndex(a => a.id === appId);
        if (appIndex !== -1) {
            this.data.applications[appIndex] = { ...this.data.applications[appIndex], ...updates };
            this.saveData();
            return this.data.applications[appIndex];
        }
        return null;
    }

    addReview(reviewData) {
        const review = {
            id: Utils.generateId(),
            ...reviewData,
            createdAt: new Date()
        };
        this.data.reviews.push(review);
        this.saveData();
        return review;
    }

    addNotification(userId, notification) {
        const newNotification = {
            id: Utils.generateId(),
            userId,
            ...notification,
            read: false,
            createdAt: new Date()
        };
        this.data.notifications.push(newNotification);
        this.saveData();
        return newNotification;
    }

    // Demo account login functionality
    async loginDemoAccount(userType) {
        try {
            window.Loading.show('Logging in...');
            
            const demoCredentials = userType === 'seeker' 
                ? { email: 'adebayo@unilag.edu.ng', password: 'password123' }
                : { email: 'folake@techcorp.ng', password: 'password123' };

            // Use the existing login API
            const result = await window.API.login(demoCredentials);
            
            window.Loading.hide();
            
            if (result && result.user) {
                window.Toast.success(
                    'Welcome Back!', 
                    `Logged in as ${result.user.firstName} ${result.user.lastName}`
                );
                
                // Navigate to appropriate dashboard
                const dashboardUrl = result.user.userType === 'seeker' 
                    ? '/dashboard/seeker' 
                    : '/dashboard/poster';
                
                setTimeout(() => {
                    window.Router.navigate(dashboardUrl);
                }, 1000);
            }
        } catch (error) {
            window.Loading.hide();
            window.Toast.error('Login Failed', error.message || 'Something went wrong');
            console.error('Demo login error:', error);
        }
    }
}

// Initialize the app
window.PaydayApp = new PaydayApp();

// Global app reference for easy access
window.App = window.PaydayApp;