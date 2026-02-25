// Utility functions
const API_BASE = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => {
    return localStorage.getItem('studyPlannerToken');
};

// Check if user is authenticated
const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;
    
    // Simple token validation (you could add JWT expiration check here)
    return true;
};

// Redirect to login if not authenticated
const requireAuth = () => {
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return false;
    }
    return true;
};

// Show notification
const showNotification = (message, type = 'error') => {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        ${type === 'error' ? 'background: #EF4444;' : 'background: #10B981;'}
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
};

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Format date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    // Add authorization header if token exists
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

// Test API connection
const testAPIConnection = async () => {
    try {
        const response = await fetch(`${API_BASE}/test`);
        const data = await response.json();
        console.log('API connection test:', data);
        return true;
    } catch (error) {
        console.error('API connection failed:', error);
        return false;
    }
};

// Initialize API test when utils loads
document.addEventListener('DOMContentLoaded', () => {
    testAPIConnection();
});