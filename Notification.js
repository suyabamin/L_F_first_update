// Notification Data loaded from MySQL.
let notifications = [];

// DOM Elements
const notificationsContainer = document.getElementById('notificationsContainer');
const emptyState = document.getElementById('emptyState');
const loadMoreContainer = document.getElementById('loadMoreContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const markAllReadBtn = document.getElementById('markAllReadBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const unreadTotalSpan = document.getElementById('unreadTotal');
const unreadCountSpan = document.getElementById('unreadCount');
const toastContainer = document.getElementById('toastContainer');

// State
let currentFilter = 'all';
let displayedCount = 6;
let unreadCount = notifications.filter(n => !n.read).length;

// Icon mapping
const iconMap = {
  match: { icon: 'fa-robot', class: 'icon-match' },
  message: { icon: 'fa-comment-dots', class: 'icon-message' },
  claim: { icon: 'fa-hand-holding-heart', class: 'icon-claim' },
  system: { icon: 'fa-bell', class: 'icon-system' }
};

// Show Toast
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// Format time
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

// Update unread counters
function updateUnreadCounters() {
  unreadCount = notifications.filter(n => !n.read).length;
  unreadTotalSpan.textContent = unreadCount;
  unreadCountSpan.textContent = unreadCount;
}

// Mark notification as read
async function markAsRead(id) {
  const notif = notifications.find(n => n.id === id);
  if (notif && !notif.read) {
    await fetch('backend-php/notification_read.php', {
      method: 'POST',
      body: new URLSearchParams({ id }),
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }).catch(() => {});
    notif.read = true;
    updateUnreadCounters();
    renderNotifications();
    showToast('Marked as read', 'success');
  }
}

// Mark all as read
async function markAllAsRead() {
  let markedCount = 0;
  notifications.forEach(notif => {
    if (!notif.read) {
      notif.read = true;
      markedCount++;
    }
  });
  if (markedCount > 0) {
    await fetch('backend-php/notification_read.php', {
      method: 'POST',
      body: new URLSearchParams({ all: '1' }),
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }).catch(() => {});
    updateUnreadCounters();
    renderNotifications();
    showToast(`Marked ${markedCount} notification${markedCount > 1 ? 's' : ''} as read`, 'success');
  } else {
    showToast('No unread notifications', 'info');
  }
}

// Render notifications
function renderNotifications() {
  let filtered = [...notifications];
  
  if (currentFilter === 'unread') {
    filtered = filtered.filter(n => !n.read);
  } else if (currentFilter === 'read') {
    filtered = filtered.filter(n => n.read);
  }
  
  const hasMore = filtered.length > displayedCount;
  const visibleNotifs = filtered.slice(0, displayedCount);
  
  if (visibleNotifs.length === 0) {
    notificationsContainer.style.display = 'none';
    emptyState.style.display = 'block';
    loadMoreContainer.style.display = 'none';
    return;
  }
  
  notificationsContainer.style.display = 'flex';
  emptyState.style.display = 'none';
  loadMoreContainer.style.display = hasMore ? 'flex' : 'none';
  
  notificationsContainer.innerHTML = visibleNotifs.map((notif, index) => {
    const iconData = iconMap[notif.type] || iconMap.system;
    
    return `
      <div class="notification-card ${!notif.read ? 'unread' : ''}" data-id="${notif.id}" style="animation-delay: ${index * 0.05}s">
        <div class="notif-icon ${iconData.class}">
          <i class="fas ${iconData.icon}"></i>
        </div>
        <div class="notif-content">
          <div class="notif-header">
            <div class="notif-title">
              ${escapeHtml(notif.title)}
              ${!notif.read ? '<span class="notif-badge">New</span>' : ''}
            </div>
            <div class="notif-time">
              <i class="far fa-clock"></i> ${formatTimeAgo(notif.timestamp)}
            </div>
          </div>
          <div class="notif-description">
            ${escapeHtml(notif.description)}
          </div>
          <div class="notif-actions">
            <a href="${notif.actionLink}" class="btn-sm btn-sm-primary">${escapeHtml(notif.actionText)}</a>
            ${!notif.read ? `<button class="btn-sm btn-sm-outline" onclick="markAsRead(${notif.id})">Mark as Read</button>` : ''}
          </div>
        </div>
        ${!notif.read ? `<div class="mark-read-indicator" onclick="markAsRead(${notif.id})"><i class="fas fa-check-circle"></i></div>` : ''}
      </div>
    `;
  }).join('');
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Load more
function loadMore() {
  displayedCount += 4;
  renderNotifications();
  showToast(`Showing ${displayedCount} notifications`, 'info');
}

// Filter tabs
function initFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      displayedCount = 6;
      renderNotifications();
      showToast(`Showing ${tab.textContent.trim()}`, 'info');
    });
  });
}

// Settings modal
function openSettingsModal() {
  settingsModal.classList.add('active');
  // Load saved settings
  const emailToggle = localStorage.getItem('notif_email') !== 'false';
  const whatsappToggle = localStorage.getItem('notif_whatsapp') !== 'false';
  const pushToggle = localStorage.getItem('notif_push') !== 'false';
  const aiToggle = localStorage.getItem('notif_ai') !== 'false';
  
  document.getElementById('emailToggle').checked = emailToggle;
  document.getElementById('whatsappToggle').checked = whatsappToggle;
  document.getElementById('pushToggle').checked = pushToggle;
  document.getElementById('aiToggle').checked = aiToggle;
}

function closeSettingsModal() {
  settingsModal.classList.remove('active');
}

function saveSettings() {
  const emailToggle = document.getElementById('emailToggle').checked;
  const whatsappToggle = document.getElementById('whatsappToggle').checked;
  const pushToggle = document.getElementById('pushToggle').checked;
  const aiToggle = document.getElementById('aiToggle').checked;
  
  localStorage.setItem('notif_email', emailToggle);
  localStorage.setItem('notif_whatsapp', whatsappToggle);
  localStorage.setItem('notif_push', pushToggle);
  localStorage.setItem('notif_ai', aiToggle);
  
  closeSettingsModal();
  showToast('Settings saved successfully!', 'success');
}

async function loadNotifications() {
  try {
    const response = await fetch('backend-php/notifications.php', {
      headers: { 'Accept': 'application/json' }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      window.location.href = 'Login.html';
      return;
    }
    notifications = data.notifications.map((notif) => ({
      ...notif,
      timestamp: new Date(notif.createdAt || Date.now())
    }));
    updateUnreadCounters();
    renderNotifications();
  } catch (error) {
    showToast('Could not load notifications from database.', 'error');
  }
}

// Simulate new notification (for demo)
function simulateNewNotification() {
  setInterval(() => {
    const newNotif = {
      id: Date.now(),
      title: "New AI Match Found!",
      description: "A new item matching your preferences was just posted nearby.",
      type: "match",
      time: "Just now",
      timestamp: new Date(),
      read: false,
      actionLink: "Browse Listing.html",
      actionText: "View Match"
    };
    notifications.unshift(newNotif);
    updateUnreadCounters();
    renderNotifications();
    showToast('🔔 New notification received!', 'success');
  }, 45000); // Every 45 seconds for demo
}

// Event listeners
markAllReadBtn.addEventListener('click', markAllAsRead);
settingsBtn.addEventListener('click', openSettingsModal);
closeSettingsBtn.addEventListener('click', closeSettingsModal);
cancelSettingsBtn.addEventListener('click', closeSettingsModal);
saveSettingsBtn.addEventListener('click', saveSettings);
loadMoreBtn.addEventListener('click', loadMore);

// Close modal on overlay click
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) closeSettingsModal();
});

// Make markAsRead globally accessible
window.markAsRead = markAsRead;

// Initialize
function init() {
  initFilters();
  loadNotifications();
  // Uncomment to enable demo notifications
  // simulateNewNotification();
}

init();
