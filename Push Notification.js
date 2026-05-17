// Notification Data
const notificationsData = [
    {
        id: 1,
        title: "AI Match Found!",
        message: "An item matching your 'Black Wallet' description has been posted near UIU Cafeteria.",
        time: "2 minutes ago",
        timestamp: new Date(Date.now() - 2 * 60000),
        type: "match",
        icon: "fa-robot",
        read: false,
        link: "backend-php/post_details_view.php"
    },
    {
        id: 2,
        title: "Nearby Alert",
        message: "Keys found near your current GPS location. Check the map for details.",
        time: "15 minutes ago",
        timestamp: new Date(Date.now() - 15 * 60000),
        type: "nearby",
        icon: "fa-location-dot",
        read: false,
        link: "Map View.html"
    },
    {
        id: 3,
        title: "New Message",
        message: "Ahmed Hossain sent you a message about the 'Lost Cat' listing.",
        time: "1 hour ago",
        timestamp: new Date(Date.now() - 60 * 60000),
        type: "message",
        icon: "fa-comment-dots",
        read: false,
        link: "Chat.html"
    },
    {
        id: 4,
        title: "Claim Update",
        message: "Your claim for 'Found iPhone 13' has been approved. Contact the owner now.",
        time: "3 hours ago",
        timestamp: new Date(Date.now() - 180 * 60000),
        type: "claim",
        icon: "fa-hand-holding-heart",
        read: true,
        link: "Claim Item.html"
    },
    {
        id: 5,
        title: "New Listing Alert",
        message: "A new 'Lost Laptop Bag' was posted in your area. View details.",
        time: "5 hours ago",
        timestamp: new Date(Date.now() - 300 * 60000),
        type: "match",
        icon: "fa-bullhorn",
        read: true,
        link: "backend-php/post_details_view.php"
    },
    {
        id: 6,
        title: "Weekly Summary",
        message: "You had 8 new matches this week. Keep helping the community!",
        time: "1 day ago",
        timestamp: new Date(Date.now() - 86400000),
        type: "promo",
        icon: "fa-chart-line",
        read: true,
        link: "DashBoard.html"
    },
    {
        id: 7,
        title: "Verification Complete",
        message: "Your account has been verified. You can now post unlimited listings.",
        time: "2 days ago",
        timestamp: new Date(Date.now() - 172800000),
        type: "promo",
        icon: "fa-shield-alt",
        read: true,
        link: "Profile Page.html"
    },
    {
        id: 8,
        title: "Found Item Alert",
        message: "Someone found your lost 'Brown Wallet'. View and claim now.",
        time: "3 days ago",
        timestamp: new Date(Date.now() - 259200000),
        type: "match",
        icon: "fa-magnifying-glass",
        read: true,
        link: "backend-php/post_details_view.php"
    }
];

// DOM Elements
const notificationGrid = document.getElementById('notificationGrid');
const emptyState = document.getElementById('emptyState');
const unreadCountSpan = document.getElementById('unreadCount');
const unreadBadge = document.getElementById('unreadBadge');
const totalStats = document.getElementById('totalStats');
const unreadStats = document.getElementById('unreadStats');
const weekStats = document.getElementById('weekStats');
const markAllBtn = document.getElementById('markAllBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const themeToggle = document.getElementById('themeToggle');
const logoutBtn = document.getElementById('logoutBtn');
const toastContainer = document.getElementById('toastContainer');

let currentFilter = 'all';
let notifications = [...notificationsData];

// Helper Functions
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

function getIconClass(type) {
    const iconMap = {
        match: 'icon-match',
        nearby: 'icon-nearby',
        message: 'icon-message',
        claim: 'icon-claim',
        promo: 'icon-promo'
    };
    return iconMap[type] || 'icon-match';
}

function getIconType(type) {
    const iconMap = {
        match: 'fa-robot',
        nearby: 'fa-location-dot',
        message: 'fa-comment-dots',
        claim: 'fa-hand-holding-heart',
        promo: 'fa-megaphone'
    };
    return iconMap[type] || 'fa-bell';
}

function updateStats() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const weekCount = notifications.filter(n => n.timestamp > new Date(Date.now() - 7 * 86400000)).length;
    
    unreadCountSpan.textContent = unreadCount;
    unreadBadge.textContent = unreadCount;
    unreadBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    totalStats.textContent = notifications.length;
    unreadStats.textContent = unreadCount;
    weekStats.textContent = weekCount;
}

function renderNotifications() {
    let filtered = [...notifications];
    
    if (currentFilter === 'unread') {
        filtered = filtered.filter(n => !n.read);
    } else if (currentFilter === 'read') {
        filtered = filtered.filter(n => n.read);
    }
    
    if (filtered.length === 0) {
        notificationGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    notificationGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    notificationGrid.innerHTML = filtered.map(notif => `
        <div class="notif-card ${!notif.read ? 'unread' : ''}" data-id="${notif.id}">
            <div class="card-icon ${getIconClass(notif.type)}">
                <i class="fas ${getIconType(notif.type)}"></i>
            </div>
            <div class="card-info">
                <h3>${escapeHtml(notif.title)}</h3>
                <p>${escapeHtml(notif.message)}</p>
                <span class="time"><i class="far fa-clock"></i> ${formatTimeAgo(notif.timestamp)}</span>
                <div class="card-actions">
                    <button class="btn-primary" onclick="viewNotification(${notif.id})">View Details</button>
                    ${!notif.read ? `<button class="btn-primary" style="background:transparent;color:var(--primary);border:1px solid var(--primary);margin-left:10px;" onclick="markAsRead(${notif.id})">Mark as Read</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Mark single notification as read
window.markAsRead = function(id) {
    const notif = notifications.find(n => n.id === id);
    if (notif && !notif.read) {
        notif.read = true;
        renderNotifications();
        updateStats();
        showToast('Marked as read', 'success');
    }
};

// View notification
window.viewNotification = function(id) {
    const notif = notifications.find(n => n.id === id);
    if (notif && !notif.read) {
        notif.read = true;
        renderNotifications();
        updateStats();
    }
    showToast(`Opening: ${notif.title}`, 'info');
    // Simulate navigation
    setTimeout(() => {
        if (notif.link) {
            window.location.href = notif.link;
        }
    }, 500);
};

// Mark all as read
function markAllAsRead() {
    let markedCount = 0;
    notifications.forEach(notif => {
        if (!notif.read) {
            notif.read = true;
            markedCount++;
        }
    });
    if (markedCount > 0) {
        renderNotifications();
        updateStats();
        showToast(`Marked ${markedCount} notification${markedCount > 1 ? 's' : ''} as read`, 'success');
    } else {
        showToast('No unread notifications', 'info');
    }
}

// Filter tabs
function initFilters() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            renderNotifications();
        });
    });
}

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('notif_settings');
    if (saved) {
        const settings = JSON.parse(saved);
        document.querySelectorAll('.setting-checkbox').forEach(checkbox => {
            const settingKey = checkbox.closest('.setting-item').dataset.setting;
            if (settings[settingKey] !== undefined) {
                checkbox.checked = settings[settingKey];
            }
        });
    }
}

// Save settings
function saveSettings() {
    const settings = {};
    document.querySelectorAll('.setting-checkbox').forEach(checkbox => {
        const settingKey = checkbox.closest('.setting-item').dataset.setting;
        settings[settingKey] = checkbox.checked;
    });
    localStorage.setItem('notif_settings', JSON.stringify(settings));
    showToast('Notification preferences saved', 'success');
}

// Dark mode toggle
function initDarkMode() {
    const darkMode = localStorage.getItem('dark_mode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('dark_mode', isDark);
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i><span>Light Mode</span>' : '<i class="fas fa-moon"></i><span>Dark Mode</span>';
        showToast(isDark ? 'Dark mode enabled' : 'Light mode enabled', 'info');
    });
}

// Logout
function initLogout() {
    logoutBtn.addEventListener('click', () => {
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'Landing Page.html';
        }, 1000);
    });
}

// Simulate new notification (for demo)
function simulateNewNotification() {
    setInterval(() => {
        const newNotif = {
            id: Date.now(),
            title: "New Alert!",
            message: "A new item matching your preferences was just posted nearby.",
            time: "Just now",
            timestamp: new Date(),
            type: "match",
            icon: "fa-bullhorn",
            read: false,
            link: "Browse Listing.html"
        };
        notifications.unshift(newNotif);
        renderNotifications();
        updateStats();
        showToast('🔔 New notification received!', 'success');
    }, 30000); // Every 30 seconds for demo
}

// Initialize
markAllBtn.addEventListener('click', markAllAsRead);
saveSettingsBtn.addEventListener('click', saveSettings);
initFilters();
loadSettings();
initDarkMode();
initLogout();
renderNotifications();
updateStats();

// Start demo notifications (comment out if not needed)
// simulateNewNotification();