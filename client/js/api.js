// Payday Platform - API Interface

/**
 * API client for communicating with the Payday backend
 */

class PaydayAPI {
    constructor() {
        this.baseURL = window.location.origin;
        this.currentUser = null;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        // Add body if provided and method is not GET
        if (options.body && config.method !== 'GET') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            
            // Handle non-JSON responses
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${text}`);
                }
                return text;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST request
    async post(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body,
        });
    }

    // PUT request
    async put(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body,
        });
    }

    // PATCH request
    async patch(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body,
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Authentication methods
    async register(userData) {
        try {
            const response = await this.post('/api/auth/register', userData);
            if (response.user) {
                this.currentUser = response.user;
                Utils.storage.set('payday_user', response.user);
            }
            return response;
        } catch (error) {
            throw new Error(error.message || 'Registration failed');
        }
    }

    async login(credentials) {
        try {
            const response = await this.post('/api/auth/login', credentials);
            if (response.user) {
                this.currentUser = response.user;
                Utils.storage.set('payday_user', response.user);
            }
            return response;
        } catch (error) {
            throw new Error(error.message || 'Login failed');
        }
    }

    async logout() {
        try {
            await this.post('/api/auth/logout');
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            this.currentUser = null;
            Utils.storage.remove('payday_user');
        }
    }

    // User profile methods
    async getProfile() {
        try {
            const user = await this.get('/api/user/profile');
            this.currentUser = user;
            Utils.storage.set('payday_user', user);
            return user;
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch profile');
        }
    }

    async updateProfile(userData) {
        try {
            const user = await this.put('/api/user/profile', userData);
            this.currentUser = user;
            Utils.storage.set('payday_user', user);
            return user;
        } catch (error) {
            throw new Error(error.message || 'Failed to update profile');
        }
    }

    // Gig methods
    async getAvailableGigs() {
        try {
            return await this.get('/api/gigs/available');
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch available gigs');
        }
    }

    async getGig(gigId) {
        try {
            return await this.get(`/api/gigs/${gigId}`);
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch gig details');
        }
    }

    async createGig(gigData) {
        try {
            return await this.post('/api/gigs', gigData);
        } catch (error) {
            throw new Error(error.message || 'Failed to create gig');
        }
    }

    async updateGig(gigId, gigData) {
        try {
            return await this.put(`/api/gigs/${gigId}`, gigData);
        } catch (error) {
            throw new Error(error.message || 'Failed to update gig');
        }
    }

    async deleteGig(gigId) {
        try {
            return await this.delete(`/api/gigs/${gigId}`);
        } catch (error) {
            throw new Error(error.message || 'Failed to delete gig');
        }
    }

    async applyToGig(gigId) {
        try {
            return await this.post(`/api/gigs/${gigId}/apply`);
        } catch (error) {
            throw new Error(error.message || 'Failed to apply to gig');
        }
    }

    async getMyApplications() {
        try {
            return await this.get('/api/gigs/my-applications');
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch applications');
        }
    }

    async getPostedGigs() {
        try {
            return await this.get('/api/gigs/posted');
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch posted gigs');
        }
    }

    async updateGigStatus(gigId, status, seekerId = null) {
        try {
            return await this.patch(`/api/gigs/${gigId}/status`, { status, seekerId });
        } catch (error) {
            throw new Error(error.message || 'Failed to update gig status');
        }
    }

    // AI-powered methods
    async getGigRecommendations() {
        try {
            return await this.get('/api/gigs/recommendations');
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch recommendations');
        }
    }

    async getGigAnalysis() {
        try {
            return await this.get('/api/gigs/analysis');
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch gig analysis');
        }
    }

    async analyzeJobMatch(gigId) {
        try {
            return await this.post(`/api/gigs/${gigId}/analyze-match`);
        } catch (error) {
            throw new Error(error.message || 'Failed to analyze job match');
        }
    }

    // Reviews and ratings methods
    async getReviews(userId) {
        try {
            return await this.get(`/api/users/${userId}/reviews`);
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch reviews');
        }
    }

    async createReview(gigId, reviewData) {
        try {
            return await this.post(`/api/gigs/${gigId}/review`, reviewData);
        } catch (error) {
            throw new Error(error.message || 'Failed to create review');
        }
    }

    async getUserRating(userId) {
        try {
            return await this.get(`/api/users/${userId}/rating`);
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch user rating');
        }
    }

    // Statistics and analytics
    async getStats() {
        try {
            return await this.get('/api/stats');
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch statistics');
        }
    }

    async getDashboardData() {
        try {
            return await this.get('/api/dashboard');
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch dashboard data');
        }
    }

    // Search functionality
    async searchGigs(query, filters = {}) {
        try {
            const params = new URLSearchParams({ 
                q: query, 
                ...filters 
            });
            return await this.get(`/api/gigs/search?${params}`);
        } catch (error) {
            throw new Error(error.message || 'Search failed');
        }
    }

    async searchUsers(query, type = 'all') {
        try {
            const params = new URLSearchParams({ q: query, type });
            return await this.get(`/api/users/search?${params}`);
        } catch (error) {
            throw new Error(error.message || 'User search failed');
        }
    }

    // Notification methods
    async getNotifications() {
        try {
            return await this.get('/api/notifications');
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch notifications');
        }
    }

    async markNotificationRead(notificationId) {
        try {
            return await this.patch(`/api/notifications/${notificationId}/read`);
        } catch (error) {
            throw new Error(error.message || 'Failed to mark notification as read');
        }
    }

    // Contact methods
    async sendContactMessage(messageData) {
        try {
            return await this.post('/api/contact', messageData);
        } catch (error) {
            throw new Error(error.message || 'Failed to send message');
        }
    }

    // Utility methods
    getCurrentUser() {
        if (!this.currentUser) {
            this.currentUser = Utils.storage.get('payday_user');
        }
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.getCurrentUser();
    }

    getUserType() {
        const user = this.getCurrentUser();
        return user ? user.userType : null;
    }

    isSeeker() {
        return this.getUserType() === 'seeker';
    }

    isPoster() {
        return this.getUserType() === 'poster';
    }

    // Initialize user from storage
    init() {
        this.currentUser = Utils.storage.get('payday_user');
        return this.currentUser;
    }
}

// Create global API instance
window.API = new PaydayAPI();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.API.init();
});