// Payday Platform - Page Templates

/**
 * Page templates for the Payday platform
 */

window.Pages = {
    home: () => `
        <!-- Navigation -->
        <nav id="navbar" class="navbar">
            <div class="nav-container">
                <div class="nav-brand">
                    <img src="/attached_assets/20250819_104458-removebg-preview_1755623157202.png" alt="Payday Logo" class="nav-logo">
                    <span class="nav-title">Payday</span>
                </div>
                
                <!-- Mobile Menu Toggle -->
                <button id="mobile-menu-toggle" class="mobile-menu-toggle" data-testid="button-mobile-menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                
                <!-- Desktop Navigation -->
                <div class="nav-links desktop-only">
                    <a href="#how-it-works" data-nav="#how-it-works" data-testid="nav-how-it-works">How it Works</a>
                    <a href="#benefits" data-nav="#benefits" data-testid="nav-benefits">Benefits</a>
                    <a href="#testimonials" data-nav="#testimonials" data-testid="nav-testimonials">Stories</a>
                    <a href="#contact" data-nav="#contact" data-testid="nav-contact">Contact</a>
                    <button id="nav-login" class="btn btn-outline guest-only" data-testid="button-login">Login</button>
                    <button id="nav-signup" class="btn btn-primary guest-only" data-testid="button-signup">Get Started</button>
                    <button id="nav-dashboard" class="btn btn-primary auth-only" data-nav="/dashboard/seeker" style="display: none;" data-testid="button-dashboard">Dashboard</button>
                    <button id="nav-logout" class="btn btn-outline auth-only" onclick="window.Auth.logout()" style="display: none;" data-testid="button-logout">Logout</button>
                </div>
            </div>
            
            <!-- Mobile Menu -->
            <div id="mobile-menu" class="mobile-menu">
                <a href="#how-it-works" data-nav="#how-it-works" data-testid="mobile-nav-how-it-works">How it Works</a>
                <a href="#benefits" data-nav="#benefits" data-testid="mobile-nav-benefits">Benefits</a>
                <a href="#testimonials" data-nav="#testimonials" data-testid="mobile-nav-testimonials">Stories</a>
                <a href="#contact" data-nav="#contact" data-testid="mobile-nav-contact">Contact</a>
                <button id="mobile-login" class="btn btn-outline mobile-btn guest-only" data-testid="button-mobile-login">Login</button>
                <button id="mobile-signup" class="btn btn-primary mobile-btn guest-only" data-testid="button-mobile-signup">Get Started</button>
                <button id="mobile-dashboard" class="btn btn-primary mobile-btn auth-only" data-nav="/dashboard/seeker" style="display: none;" data-testid="button-mobile-dashboard">Dashboard</button>
                <button id="mobile-logout" class="btn btn-outline mobile-btn auth-only" onclick="window.Auth.logout()" style="display: none;" data-testid="button-mobile-logout">Logout</button>
            </div>
        </nav>

        <!-- Hero Section -->
        <section id="hero" class="hero section" style="padding-top: 100px;">
            <div class="container">
                <div class="grid grid-2 items-center" style="gap: 3rem;">
                    <div class="hero-text">
                        <h1 class="hero-title" style="font-size: 3rem; font-weight: 800; line-height: 1.1; margin-bottom: 1.5rem;">
                            Turn Your Skills Into 
                            <span class="text-gradient">Instant Income</span>
                        </h1>
                        <p class="hero-subtitle" style="font-size: 1.25rem; color: var(--gray-600); margin-bottom: 2rem; line-height: 1.6;">
                            Nigeria's #1 platform for same-day paying gigs. Connect with verified opportunities, 
                            get paid instantly, and eliminate broke days forever.
                        </p>
                        <div class="hero-stats" style="display: flex; gap: 2rem; margin-bottom: 2rem; flex-wrap: wrap;">
                            <div class="stat">
                                <span class="stat-number" style="display: block; font-size: 1.5rem; font-weight: 700; color: var(--payday-blue);">15K+</span>
                                <span class="stat-label" style="font-size: 0.875rem; color: var(--gray-500);">Active Users</span>
                            </div>
                            <div class="stat">
                                <span class="stat-number" style="display: block; font-size: 1.5rem; font-weight: 700; color: var(--payday-blue);">₦2.5M+</span>
                                <span class="stat-label" style="font-size: 0.875rem; color: var(--gray-500);">Paid Out Daily</span>
                            </div>
                            <div class="stat">
                                <span class="stat-number" style="display: block; font-size: 1.5rem; font-weight: 700; color: var(--payday-blue);">4.8★</span>
                                <span class="stat-label" style="font-size: 0.875rem; color: var(--gray-500);">User Rating</span>
                            </div>
                        </div>
                        <div class="hero-actions" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                            <button id="hero-signup" class="btn btn-primary btn-lg" data-testid="button-hero-signup">
                                Start Earning Today
                            </button>
                            <button id="hero-demo" class="btn btn-outline btn-lg" data-testid="button-hero-demo">
                                Watch Demo
                            </button>
                        </div>
                        <p class="hero-guarantee" style="font-size: 0.875rem; color: var(--gray-600);">
                            🔒 Guaranteed same-day payment • 📱 Works on any phone • ✅ Verified gigs only
                        </p>
                    </div>
                    <div class="hero-visual">
                        <div class="phone-mockup" style="max-width: 300px; margin: 0 auto;">
                            <div class="phone-frame" style="background: linear-gradient(135deg, var(--payday-blue), var(--payday-dark-blue)); padding: 1rem; border-radius: 2rem; box-shadow: var(--shadow-xl);">
                                <div class="phone-screen" style="background: white; border-radius: 1.5rem; padding: 1.5rem; min-height: 400px;">
                                    <div class="app-preview">
                                        <div class="preview-header" style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                                            <div class="preview-avatar" style="width: 40px; height: 40px; background: var(--payday-light-blue); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--payday-blue);">K</div>
                                            <div class="preview-info">
                                                <p class="preview-name" style="font-weight: 600; margin: 0;">Kemi A.</p>
                                                <p class="preview-location" style="font-size: 0.875rem; color: var(--gray-500); margin: 0;">Lagos, Nigeria</p>
                                            </div>
                                            <div class="preview-badge" style="background: var(--payday-yellow); padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; margin-left: auto;">4.9★</div>
                                        </div>
                                        <div class="preview-gig" style="background: var(--gray-50); border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
                                            <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">Data Entry Assistant</h4>
                                            <p class="preview-pay" style="font-weight: 600; color: var(--payday-blue); margin: 0 0 0.5rem 0;">₦8,500 • 3 hours</p>
                                            <div class="preview-status" style="color: var(--success); font-size: 0.875rem; font-weight: 500;">✅ Completed & Paid</div>
                                        </div>
                                        <div class="preview-earnings" style="text-align: center; padding: 1rem; background: linear-gradient(135deg, var(--success), #059669); color: white; border-radius: 0.5rem;">
                                            <p style="margin: 0; font-size: 0.875rem; opacity: 0.9;">Today's Earnings</p>
                                            <p style="margin: 0; font-size: 1.5rem; font-weight: 700;">₦23,500</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Trust Badges -->
        <section class="trust-section section" style="background: white; border-top: 1px solid var(--gray-200); border-bottom: 1px solid var(--gray-200);">
            <div class="container">
                <div class="trust-badges" style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap;">
                    <div class="trust-badge" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; background: var(--gray-50); border-radius: 0.5rem;">
                        <div class="trust-icon" style="font-size: 1.25rem;">🔒</div>
                        <span style="font-weight: 500;">Secure Payments</span>
                    </div>
                    <div class="trust-badge" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; background: var(--gray-50); border-radius: 0.5rem;">
                        <div class="trust-icon" style="font-size: 1.25rem;">⚡</div>
                        <span style="font-weight: 500;">Instant Payouts</span>
                    </div>
                    <div class="trust-badge" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; background: var(--gray-50); border-radius: 0.5rem;">
                        <div class="trust-icon" style="font-size: 1.25rem;">✅</div>
                        <span style="font-weight: 500;">Verified Gigs</span>
                    </div>
                    <div class="trust-badge" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; background: var(--gray-50); border-radius: 0.5rem;">
                        <div class="trust-icon" style="font-size: 1.25rem;">🇳🇬</div>
                        <span style="font-weight: 500;">Made for Nigeria</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Problem Section -->
        <section id="problem" class="problem-section section">
            <div class="container">
                <div class="section-header">
                    <h2>End the "Broke Days" Crisis</h2>
                    <p>Millions of Nigerian students and fresh graduates struggle with irregular income</p>
                </div>
                <div class="grid grid-3" style="margin-bottom: 3rem;">
                    <div class="card" style="text-align: center; padding: 2rem;">
                        <div class="problem-icon" style="font-size: 3rem; margin-bottom: 1rem;">📱</div>
                        <h3>Limited Opportunities</h3>
                        <p>Few legitimate platforms offer flexible, quick work for students</p>
                    </div>
                    <div class="card" style="text-align: center; padding: 2rem;">
                        <div class="problem-icon" style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
                        <h3>Delayed Payments</h3>
                        <p>Even when gigs exist, payments can take weeks to arrive</p>
                    </div>
                    <div class="card" style="text-align: center; padding: 2rem;">
                        <div class="problem-icon" style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                        <h3>Trust Issues</h3>
                        <p>Fear of scams and unreliable job posters prevents participation</p>
                    </div>
                </div>
                <div class="impact-stats" style="display: flex; justify-content: center; gap: 3rem; flex-wrap: wrap;">
                    <div class="impact-stat" style="text-align: center;">
                        <span class="impact-number" style="display: block; font-size: 3rem; font-weight: 800; color: var(--payday-blue);">70%</span>
                        <span class="impact-text" style="color: var(--gray-600);">of Nigerian students rely on irregular financial support</span>
                    </div>
                    <div class="impact-stat" style="text-align: center;">
                        <span class="impact-number" style="display: block; font-size: 3rem; font-weight: 800; color: var(--payday-blue);">40M</span>
                        <span class="impact-text" style="color: var(--gray-600);">Nigerian youths need flexible income opportunities</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- How It Works Section -->
        <section id="how-it-works" class="how-it-works section" style="background: white;">
            <div class="container">
                <div class="section-header">
                    <h2>How Payday Works</h2>
                    <p>Get started in minutes, get paid the same day</p>
                </div>
                <div class="grid grid-4">
                    <div class="step-card card" style="text-align: center; padding: 2rem; position: relative;">
                        <div class="step-number" style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); width: 30px; height: 30px; background: var(--payday-blue); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">1</div>
                        <div class="step-icon" style="font-size: 3rem; margin: 1rem 0;">📝</div>
                        <h3>Create Your Profile</h3>
                        <p>Quick 2-minute setup with skills verification and video intro</p>
                    </div>
                    <div class="step-card card" style="text-align: center; padding: 2rem; position: relative;">
                        <div class="step-number" style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); width: 30px; height: 30px; background: var(--payday-blue); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">2</div>
                        <div class="step-icon" style="font-size: 3rem; margin: 1rem 0;">🔍</div>
                        <h3>Find Perfect Gigs</h3>
                        <p>AI matches you with gigs based on skills, location, and availability</p>
                    </div>
                    <div class="step-card card" style="text-align: center; padding: 2rem; position: relative;">
                        <div class="step-number" style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); width: 30px; height: 30px; background: var(--payday-blue); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">3</div>
                        <div class="step-icon" style="font-size: 3rem; margin: 1rem 0;">📹</div>
                        <h3>Quick Video Interview</h3>
                        <p>Connect instantly with gig posters for clarity and trust</p>
                    </div>
                    <div class="step-card card" style="text-align: center; padding: 2rem; position: relative;">
                        <div class="step-number" style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); width: 30px; height: 30px; background: var(--payday-blue); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">4</div>
                        <div class="step-icon" style="font-size: 3rem; margin: 1rem 0;">✅</div>
                        <h3>Complete & Get Paid</h3>
                        <p>Finish the work, confirm completion, receive payment instantly</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section id="benefits" class="features-section section">
            <div class="container">
                <div class="section-header">
                    <h2>Why Choose Payday?</h2>
                    <p>Built specifically for Nigerian youth with features that matter</p>
                </div>
                <div class="grid grid-3">
                    <div class="feature-card card" style="padding: 2rem; border: 2px solid var(--payday-blue); background: var(--payday-light-blue);">
                        <div class="feature-icon" style="font-size: 3rem; margin-bottom: 1rem;">💰</div>
                        <h3>Instant Pay Guarantee</h3>
                        <p>Escrow-backed system ensures same-day payouts once work is confirmed</p>
                    </div>
                    <div class="feature-card card" style="padding: 2rem;">
                        <div class="feature-icon" style="font-size: 3rem; margin-bottom: 1rem;">📹</div>
                        <h3>Live Video Interviews</h3>
                        <p>Real-time verification and discussion before starting any gig</p>
                    </div>
                    <div class="feature-card card" style="padding: 2rem;">
                        <div class="feature-icon" style="font-size: 3rem; margin-bottom: 1rem;">🤖</div>
                        <h3>AI Job Matching</h3>
                        <p>Smart recommendations based on your skills, location, and preferences</p>
                    </div>
                    <div class="feature-card card" style="padding: 2rem;">
                        <div class="feature-icon" style="font-size: 3rem; margin-bottom: 1rem;">⭐</div>
                        <h3>Reviews & Ratings</h3>
                        <p>Build your reputation with verified reviews from completed gigs</p>
                    </div>
                    <div class="feature-card card" style="padding: 2rem;">
                        <div class="feature-icon" style="font-size: 3rem; margin-bottom: 1rem;">🏆</div>
                        <h3>Reliability Scores</h3>
                        <p>Gamified system rewards consistency and quality work</p>
                    </div>
                    <div class="feature-card card" style="padding: 2rem;">
                        <div class="feature-icon" style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
                        <h3>Escrow Protection</h3>
                        <p>Secure funds until job completion protects both parties</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Testimonials Section -->
        <section id="testimonials" class="testimonials section" style="background: white;">
            <div class="container">
                <div class="section-header">
                    <h2>Real Stories, Real Impact</h2>
                    <p>See how Payday is changing lives across Nigeria</p>
                </div>
                <div class="grid grid-3">
                    <div class="testimonial-card card" style="padding: 2rem;">
                        <div class="testimonial-header" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <div class="testimonial-avatar" style="width: 50px; height: 50px; background: var(--payday-light-blue); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--payday-blue);">A</div>
                            <div class="testimonial-info">
                                <h4 style="margin: 0;">Adebayo S.</h4>
                                <p style="margin: 0; font-size: 0.875rem; color: var(--gray-600);">Computer Science Student, UNILAG</p>
                                <div class="rating" style="color: var(--payday-yellow);">⭐⭐⭐⭐⭐</div>
                            </div>
                        </div>
                        <p class="testimonial-text" style="font-style: italic; margin-bottom: 1rem;">
                            "Payday saved my semester! Made ₦45,000 in my first week doing data entry and tutoring. 
                            The instant payment feature is a game-changer."
                        </p>
                        <div class="testimonial-stats" style="display: flex; gap: 1rem;">
                            <span class="stat badge badge-primary">₦127K earned</span>
                            <span class="stat badge badge-primary">23 gigs completed</span>
                        </div>
                    </div>
                    <div class="testimonial-card card" style="padding: 2rem;">
                        <div class="testimonial-header" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <div class="testimonial-avatar" style="width: 50px; height: 50px; background: var(--payday-light-blue); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--payday-blue);">F</div>
                            <div class="testimonial-info">
                                <h4 style="margin: 0;">Folake O.</h4>
                                <p style="margin: 0; font-size: 0.875rem; color: var(--gray-600);">SME Owner, Marketing</p>
                                <div class="rating" style="color: var(--payday-yellow);">⭐⭐⭐⭐⭐</div>
                            </div>
                        </div>
                        <p class="testimonial-text" style="font-style: italic; margin-bottom: 1rem;">
                            "As a gig poster, I love the video interview feature. I can quickly assess candidates 
                            and find the perfect match for my social media projects."
                        </p>
                        <div class="testimonial-stats" style="display: flex; gap: 1rem;">
                            <span class="stat badge badge-primary">15 successful hires</span>
                            <span class="stat badge badge-primary">4.9★ rating</span>
                        </div>
                    </div>
                    <div class="testimonial-card card" style="padding: 2rem;">
                        <div class="testimonial-header" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <div class="testimonial-avatar" style="width: 50px; height: 50px; background: var(--payday-light-blue); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--payday-blue);">K</div>
                            <div class="testimonial-info">
                                <h4 style="margin: 0;">Kemi A.</h4>
                                <p style="margin: 0; font-size: 0.875rem; color: var(--gray-600);">Undergraduate, Economics</p>
                                <div class="rating" style="color: var(--payday-yellow);">⭐⭐⭐⭐⭐</div>
                            </div>
                        </div>
                        <p class="testimonial-text" style="font-style: italic; margin-bottom: 1rem;">
                            "The AI recommendations are spot-on! Only shows me gigs I can actually do well. 
                            My reliability score is 98% and climbing."
                        </p>
                        <div class="testimonial-stats" style="display: flex; gap: 1rem;">
                            <span class="stat badge badge-primary">₦89K earned</span>
                            <span class="stat badge badge-primary">98% reliability</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="cta-section section" style="background: linear-gradient(135deg, var(--payday-blue), var(--payday-dark-blue)); color: white; text-align: center;">
            <div class="container">
                <div class="cta-content">
                    <h2 style="color: white; margin-bottom: 1rem;">Ready to End Your Broke Days?</h2>
                    <p style="color: rgba(255, 255, 255, 0.9); font-size: 1.25rem; margin-bottom: 2rem;">Join thousands of Nigerian youth earning instant income through verified gigs</p>
                    <div class="cta-actions" style="display: flex; justify-content: center; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
                        <button id="cta-signup" class="btn btn-lg" style="background: var(--payday-yellow); color: var(--payday-dark-blue); border: none;" data-testid="button-cta-signup">
                            Start Earning Today
                        </button>
                        <button id="cta-learn-more" class="btn btn-outline btn-lg" style="border-color: white; color: white;" data-testid="button-cta-learn">
                            Learn More
                        </button>
                    </div>
                    <div class="cta-guarantee">
                        <p style="color: rgba(255, 255, 255, 0.9);">✅ No upfront fees • ✅ Instant verification • ✅ Same-day payments guaranteed</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Contact Section -->
        <section id="contact" class="contact-section section">
            <div class="container">
                <div class="section-header">
                    <h2>Get In Touch</h2>
                    <p>Have questions? We're here to help you succeed</p>
                </div>
                <div class="grid grid-2" style="gap: 3rem;">
                    <div class="contact-info">
                        <div class="contact-item" style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 2rem;">
                            <div class="contact-icon" style="font-size: 1.5rem; margin-top: 0.25rem;">📧</div>
                            <div>
                                <h4 style="margin: 0 0 0.5rem 0;">Email Support</h4>
                                <p style="margin: 0 0 0.25rem 0; font-weight: 600;">support@payday.ng</p>
                                <span class="response-time" style="font-size: 0.875rem; color: var(--gray-600);">Response within 2 hours</span>
                            </div>
                        </div>
                        <div class="contact-item" style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 2rem;">
                            <div class="contact-icon" style="font-size: 1.5rem; margin-top: 0.25rem;">📱</div>
                            <div>
                                <h4 style="margin: 0 0 0.5rem 0;">WhatsApp Support</h4>
                                <p style="margin: 0 0 0.25rem 0; font-weight: 600;">+234 801 234 5678</p>
                                <span class="response-time" style="font-size: 0.875rem; color: var(--gray-600);">Available 24/7</span>
                            </div>
                        </div>
                        <div class="contact-item" style="display: flex; align-items: flex-start; gap: 1rem;">
                            <div class="contact-icon" style="font-size: 1.5rem; margin-top: 0.25rem;">🏢</div>
                            <div>
                                <h4 style="margin: 0 0 0.5rem 0;">Office</h4>
                                <p style="margin: 0 0 0.25rem 0; font-weight: 600;">Lagos, Abuja, Port Harcourt</p>
                                <span class="response-time" style="font-size: 0.875rem; color: var(--gray-600);">Expanding nationwide</span>
                            </div>
                        </div>
                    </div>
                    <form id="contact-form" class="contact-form card" style="padding: 2rem;">
                        <div class="form-group">
                            <label for="contact-name" class="form-label">Your Name</label>
                            <input type="text" id="contact-name" name="name" class="form-input" required data-testid="input-contact-name">
                        </div>
                        <div class="form-group">
                            <label for="contact-email" class="form-label">Email Address</label>
                            <input type="email" id="contact-email" name="email" class="form-input" required data-testid="input-contact-email">
                        </div>
                        <div class="form-group">
                            <label for="contact-subject" class="form-label">Subject</label>
                            <select id="contact-subject" name="subject" class="form-select" required data-testid="select-contact-subject">
                                <option value="">Select a topic</option>
                                <option value="general">General Inquiry</option>
                                <option value="support">Technical Support</option>
                                <option value="partnership">Partnership</option>
                                <option value="feedback">Feedback</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="contact-message" class="form-label">Message</label>
                            <textarea id="contact-message" name="message" rows="4" class="form-textarea" required data-testid="textarea-contact-message"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;" data-testid="button-contact-submit">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer" style="background: var(--gray-900); color: white; padding: 3rem 0 1rem;">
            <div class="container">
                <div class="footer-content grid grid-4" style="margin-bottom: 2rem;">
                    <div class="footer-brand">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                            <img src="/attached_assets/20250819_104458-removebg-preview_1755623157202.png" alt="Payday Logo" style="width: 32px; height: 32px;">
                            <h3 style="margin: 0; color: white;">Payday</h3>
                        </div>
                        <p style="color: var(--gray-300); margin-bottom: 1rem;">Turn your skills into instant income</p>
                        <div class="social-links" style="display: flex; gap: 1rem;">
                            <a href="#" style="color: var(--gray-300);" data-testid="link-social-twitter">Twitter</a>
                            <a href="#" style="color: var(--gray-300);" data-testid="link-social-instagram">Instagram</a>
                            <a href="#" style="color: var(--gray-300);" data-testid="link-social-linkedin">LinkedIn</a>
                        </div>
                    </div>
                    <div class="footer-column">
                        <h4 style="color: white; margin-bottom: 1rem;">Platform</h4>
                        <a href="#how-it-works" style="display: block; color: var(--gray-300); margin-bottom: 0.5rem;" data-nav="#how-it-works">How it Works</a>
                        <a href="#benefits" style="display: block; color: var(--gray-300); margin-bottom: 0.5rem;" data-nav="#benefits">Benefits</a>
                        <a href="#" style="display: block; color: var(--gray-300); margin-bottom: 0.5rem;">Pricing</a>
                        <a href="#" style="display: block; color: var(--gray-300); margin-bottom: 0.5rem;">Safety</a>
                    </div>
                    <div class="footer-column">
                        <h4 style="color: white; margin-bottom: 1rem;">Support</h4>
                        <a href="#" style="display: block; color: var(--gray-300); margin-bottom: 0.5rem;">Help Center</a>
                        <a href="#contact" style="display: block; color: var(--gray-300); margin-bottom: 0.5rem;" data-nav="#contact">Contact Us</a>
                        <a href="#" style="display: block; color: var(--gray-300); margin-bottom: 0.5rem;">Community</a>
                        <a href="#" style="display: block; color: var(--gray-300); margin-bottom: 0.5rem;">Status</a>
                    </div>
                    <div class="footer-column">
                        <h4 style="color: white; margin-bottom: 1rem;">Legal</h4>
                        <a href="#" style="display: block; color: var(--gray-300); margin-bottom: 0.5rem;">Terms of Service</a>
                        <a href="#" style="display: block; color: var(--gray-300); margin-bottom: 0.5rem;">Privacy Policy</a>
                        <a href="#" style="display: block; color: var(--gray-300); margin-bottom: 0.5rem;">Cookie Policy</a>
                        <a href="#" style="display: block; color: var(--gray-300); margin-bottom: 0.5rem;">Compliance</a>
                    </div>
                </div>
                <div class="footer-bottom" style="border-top: 1px solid var(--gray-700); padding-top: 1rem; text-align: center;">
                    <p style="color: var(--gray-400); margin: 0;">&copy; 2025 Payday Nigeria. All rights reserved.</p>
                    <p style="color: var(--gray-400); margin: 0.5rem 0 0 0;">Made with ❤️ for Nigerian youth</p>
                </div>
            </div>
        </footer>
    `,

    notFound: () => `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 2rem;">
            <div>
                <h1 style="font-size: 4rem; font-weight: 800; color: var(--payday-blue); margin-bottom: 1rem;">404</h1>
                <h2 style="margin-bottom: 1rem;">Page Not Found</h2>
                <p style="margin-bottom: 2rem; color: var(--gray-600);">The page you're looking for doesn't exist.</p>
                <button class="btn btn-primary" onclick="window.Router.navigate('/')">Go Home</button>
            </div>
        </div>
    `
};