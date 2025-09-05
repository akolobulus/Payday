// Payday Platform - Utility Functions

/**
 * Utility functions for the Payday platform
 */

// DOM utilities
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Create element with attributes and content
const createElement = (tag, attributes = {}, content = '') => {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key.startsWith('data-')) {
            element.setAttribute(key, value);
        } else {
            element[key] = value;
        }
    });
    
    if (content) {
        element.innerHTML = content;
    }
    
    return element;
};

// Event listener helpers
const on = (element, event, handler) => {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        element.addEventListener(event, handler);
    }
};

const off = (element, event, handler) => {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        element.removeEventListener(event, handler);
    }
};

// Debounce function
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function
const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Format currency for Nigerian Naira
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

// Format numbers with commas
const formatNumber = (num) => {
    return new Intl.NumberFormat('en-NG').format(num);
};

// Date formatting utilities
const formatDate = (date, options = {}) => {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return new Intl.DateTimeFormat('en-NG', { ...defaultOptions, ...options }).format(new Date(date));
};

const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate(date);
};

// String utilities
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const truncate = (str, length = 100) => {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
};

const slugify = (str) => {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

// Array utilities
const unique = (array) => [...new Set(array)];

const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
        const group = item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});
};

const sortBy = (array, key, direction = 'asc') => {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        
        if (direction === 'desc') {
            return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
    });
};

// Validation utilities
const isEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isPhoneNumber = (phone) => {
    // Nigerian phone number validation
    const phoneRegex = /^(\+234|234|0)?[789]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

const isStrongPassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

// Local storage utilities
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
};

// URL utilities
const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
};

const setQueryParam = (key, value) => {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
};

const removeQueryParam = (key) => {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.replaceState({}, '', url);
};

// Device detection
const isMobile = () => {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

const isAndroid = () => {
    return /Android/.test(navigator.userAgent);
};

// Network status
const getNetworkStatus = () => {
    return {
        online: navigator.onLine,
        connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
        effectiveType: navigator.connection?.effectiveType || 'unknown'
    };
};

// Performance utilities
const measurePerformance = (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
};

// Error handling utilities
const handleError = (error, context = '') => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    
    // Log to external service in production
    if (window.location.hostname !== 'localhost') {
        // Send to error reporting service
        // reportError(error, context);
    }
};

// Copy to clipboard
const copyToClipboard = async (text) => {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
};

// Generate unique ID
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Smooth scroll to element
const scrollToElement = (element, offset = 0) => {
    if (typeof element === 'string') {
        element = $(element);
    }
    
    if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
};

// Load image with promise
const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

// Format file size
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Nigerian-specific utilities
const formatNigerianPhone = (phone) => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('234')) {
        return '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
        return '+234' + cleaned.slice(1);
    } else if (cleaned.length === 10) {
        return '+234' + cleaned;
    }
    
    return phone; // Return original if can't format
};

const getNigerianStates = () => {
    return [
        'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
        'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
        'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
        'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
        'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
    ];
};

const getPopularSkills = () => {
    return [
        'Data Entry', 'Content Writing', 'Social Media Management', 'Virtual Assistant',
        'Customer Service', 'Graphic Design', 'Web Development', 'Digital Marketing',
        'Translation', 'Tutoring', 'Video Editing', 'Photography', 'Event Planning',
        'Research', 'Transcription', 'Bookkeeping', 'Sales', 'UI/UX Design',
        'Mobile App Development', 'SEO', 'Copywriting', 'Project Management'
    ];
};

// Export utilities for use in other modules
window.Utils = {
    $, $$, createElement, on, off, debounce, throttle,
    formatCurrency, formatNumber, formatDate, formatRelativeTime,
    capitalize, truncate, slugify,
    unique, groupBy, sortBy,
    isEmail, isPhoneNumber, isStrongPassword,
    storage,
    getQueryParams, setQueryParam, removeQueryParam,
    isMobile, isIOS, isAndroid,
    getNetworkStatus,
    measurePerformance, handleError,
    copyToClipboard, generateId, scrollToElement,
    loadImage, formatFileSize,
    formatNigerianPhone, getNigerianStates, getPopularSkills
};