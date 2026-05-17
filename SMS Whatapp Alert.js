// Alert Data
const alertsData = [
    {
        id: 1,
        type: "match",
        title: "AI Match Detected: Lost Key",
        description: "A finder has reported a possible match for your lost keys. Contact them via WhatsApp to verify.",
        time: "2 minutes ago",
        icon: "user-magnifying-glass",
        iconBg: "blue-bg",
        aiMatch: true,
        actions: ["details"]
    },
    {
        id: 2,
        type: "nearby",
        title: "SMS / Map Alert: Red Bag",
        description: "New lost post: 'Red Bag near UIU Cafeteria'. Check if this matches your lost item.",
        time: "15 minutes ago",
        icon: "bullhorn",
        iconBg: "teal-bg",
        aiMatch: true,
        actions: ["details", "map"]
    },
    {
        id: 3,
        type: "chat",
        title: "Chat Invitation: MD. Rakib Hasan (Finder)",
        description: "Someone found an item matching your description. Start a conversation to arrange pickup.",
        time: "1 hour ago",
        icon: "user-circle",
        iconBg: "avatar-bg",
        aiMatch: false,
        actions: ["chat"]
    },
    {
        id: 4,
        type: "whatsapp",
        title: "WhatsApp Alert: Found Wallet",
        description: "A wallet matching your description was found. The finder has shared photos via WhatsApp.",
        time: "3 hours ago",
        icon: "fa-whatsapp",
        iconBg: "whatsapp-bg",
        aiMatch: true,
        actions: ["whatsapp", "details"]
    }
];

// DOM Elements
const alertsContainer = document.getElementById('alertsContainer');
const emptyState = document.getElementById('emptyState');
const alertCountSpan = document.getElementById('alertCount');
const tabs = document.querySelectorAll('.tab');
const toastContainer = document.getElementById('toastContainer');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const editNumberBtn = document.getElementById('editNumberBtn');
const numberModal = document.getElementById('numberModal');
const closeNumberModal = document.getElementById('closeNumberModal');
const cancelNumberBtn = document.getElementById('cancelNumberBtn');
const saveNumberBtn = document.getElementById('saveNumberBtn');
const countryCode = document.getElementById('countryCode');
const phoneNumber = document.getElementById('phoneNumber');
const radiusSlider = document.getElementById('radiusSlider');
const radiusValue = document.getElementById('radiusValue');
const minimizeSettings = document.getElementById('minimizeSettings');
const settingsContent = document.getElementById('settingsContent');

let currentTab = 'sms';

// Show Toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Render Alerts
function renderAlerts() {
    let filteredAlerts = [...alertsData];
    
    if (currentTab === 'sms') {
        filteredAlerts = alertsData.filter(a => a.type !== 'email');
    } else if (currentTab === 'email') {
        filteredAlerts = [];
    } else if (currentTab === 'map') {
        filteredAlerts = alertsData.filter(a => a.actions.includes('map'));
    }
    
    if (filteredAlerts.length === 0) {
        alertsContainer.style.display = 'none';
        emptyState.style.display = 'block';
        alertCountSpan.textContent = '0';
        return;
    }
    
    alertsContainer.style.display = 'flex';
    emptyState.style.display = 'none';
    alertCountSpan.textContent = filteredAlerts.length;
    
    alertsContainer.innerHTML = filteredAlerts.map((alert, index) => {
        let actionButtons = '';
        if (alert.actions.includes('details')) {
            actionButtons += `<button class="btn btn-details" onclick="handleAction('details', ${alert.id})">VIEW DETAILS</button>`;
        }
        if (alert.actions.includes('map')) {
            actionButtons += `<button class="btn btn-map" onclick="handleAction('map', ${alert.id})">VIEW ON MAP</button>`;
        }
        if (alert.actions.includes('chat')) {
            actionButtons += `<button class="btn btn-chat" onclick="handleAction('chat', ${alert.id})">OPEN CHAT</button>`;
        }
        if (alert.actions.includes('whatsapp')) {
            actionButtons += `<button class="btn btn-whatsapp" onclick="handleAction('whatsapp', ${alert.id})"><i class="fab fa-whatsapp"></i> WHATSAPP</button>`;
        }
        
        const iconMap = {
            'user-magnifying-glass': 'fa-user-magnifying-glass',
            'bullhorn': 'fa-bullhorn',
            'user-circle': 'fa-user-circle',
            'fa-whatsapp': 'fab fa-whatsapp'
        };
        
        return `
            <div class="alert-card" style="animation-delay: ${index * 0.05}s">
                <div class="card-icon ${alert.iconBg}">
                    <i class="${iconMap[alert.icon]}"></i>
                    ${alert.icon === 'fa-whatsapp' ? '<i class="fab fa-whatsapp whatsapp-small"></i>' : ''}
                </div>
                <div class="card-info">
                    <div class="card-title-row">
                        <h3>${escapeHtml(alert.title)}</h3>
                        ${alert.aiMatch ? '<span class="ai-tag"><i class="fas fa-robot"></i> AI Match</span>' : ''}
                    </div>
                    <p>${escapeHtml(alert.description)}</p>
                    <div class="card-footer">
                        <span class="timestamp"><i class="far fa-clock"></i> ${alert.time}</span>
                        <div class="button-group">${actionButtons}</div>
                    </div>
                </div>
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

// Action Handlers
window.handleAction = function(action, id) {
    const alert = alertsData.find(a => a.id === id);
    if (action === 'details') {
        showToast(`Opening details for: ${alert.title}`, 'info');
        setTimeout(() => {
            window.location.href = 'backend-php/post_details_view.php';
        }, 800);
    } else if (action === 'map') {
        showToast(`Opening map for location`, 'info');
        setTimeout(() => {
            window.location.href = 'Map View.html';
        }, 800);
    } else if (action === 'chat') {
        showToast(`Opening chat with ${alert.title.split(':')[1] || 'finder'}`, 'success');
        setTimeout(() => {
            window.location.href = 'Chat.html';
        }, 800);
    } else if (action === 'whatsapp') {
        window.open('https://wa.me/8801712345678?text=Hi%2C%20I%20saw%20your%20alert%20about%20the%20lost%20item', '_blank');
        showToast('Opening WhatsApp...', 'success');
    }
};

// Tab switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTab = tab.dataset.tab;
        renderAlerts();
        showToast(`Showing ${tab.textContent.trim()}`, 'info');
    });
});

// Save Settings
function saveSettings() {
    const settings = {
        whatsapp: document.getElementById('whatsappToggle').checked,
        sms: document.getElementById('smsToggle').checked,
        push: document.getElementById('pushToggle').checked,
        email: document.getElementById('emailToggle').checked,
        whatsappMethod: document.getElementById('whatsappMethodToggle').checked,
        frequency: document.getElementById('frequencySelect').value,
        radius: document.getElementById('radiusSlider').value
    };
    localStorage.setItem('alert_settings', JSON.stringify(settings));
    showToast('Settings saved successfully!', 'success');
}

// Load Settings
function loadSettings() {
    const saved = localStorage.getItem('alert_settings');
    if (saved) {
        const settings = JSON.parse(saved);
        if (document.getElementById('whatsappToggle')) document.getElementById('whatsappToggle').checked = settings.whatsapp;
        if (document.getElementById('smsToggle')) document.getElementById('smsToggle').checked = settings.sms;
        if (document.getElementById('pushToggle')) document.getElementById('pushToggle').checked = settings.push;
        if (document.getElementById('emailToggle')) document.getElementById('emailToggle').checked = settings.email;
        if (document.getElementById('whatsappMethodToggle')) document.getElementById('whatsappMethodToggle').checked = settings.whatsappMethod;
        if (document.getElementById('frequencySelect')) document.getElementById('frequencySelect').value = settings.frequency;
        if (document.getElementById('radiusSlider')) document.getElementById('radiusSlider').value = settings.radius;
        if (radiusValue) radiusValue.textContent = `${settings.radius} km`;
    }
}

// Phone Number Modal
editNumberBtn.addEventListener('click', () => {
    numberModal.classList.add('active');
});

function closeNumberModalFunc() {
    numberModal.classList.remove('active');
}

closeNumberModal.addEventListener('click', closeNumberModalFunc);
cancelNumberBtn.addEventListener('click', closeNumberModalFunc);

saveNumberBtn.addEventListener('click', () => {
    const code = countryCode.value;
    const number = phoneNumber.value;
    if (number && number.length >= 10) {
        const fullNumber = `${code} ${number}`;
        document.querySelector('.verified-box strong').textContent = fullNumber;
        localStorage.setItem('verified_number', fullNumber);
        showToast('Phone number updated successfully!', 'success');
        closeNumberModalFunc();
    } else {
        showToast('Please enter a valid phone number', 'error');
    }
});

// Radius Slider
radiusSlider.addEventListener('input', () => {
    radiusValue.textContent = `${radiusSlider.value} km`;
});

// Minimize Settings
let settingsMinimized = false;
minimizeSettings.addEventListener('click', () => {
    settingsMinimized = !settingsMinimized;
    if (settingsMinimized) {
        settingsContent.style.display = 'none';
        minimizeSettings.innerHTML = '<i class="fas fa-chevron-left"></i>';
        document.querySelector('.settings-panel').style.width = '60px';
    } else {
        settingsContent.style.display = 'block';
        minimizeSettings.innerHTML = '<i class="fas fa-chevron-right"></i>';
        document.querySelector('.settings-panel').style.width = '320px';
    }
});

saveSettingsBtn.addEventListener('click', saveSettings);

// Load saved phone number
const savedNumber = localStorage.getItem('verified_number');
if (savedNumber && document.querySelector('.verified-box strong')) {
    document.querySelector('.verified-box strong').textContent = savedNumber;
}

// Initialize
loadSettings();
renderAlerts();

// Auto-refresh alerts every 30 seconds (demo)
setInterval(() => {
    showToast('Checking for new alerts...', 'info');
}, 30000);

// Number modal close on overlay click
numberModal.addEventListener('click', (e) => {
    if (e.target === numberModal) closeNumberModalFunc();
});