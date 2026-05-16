// DOM Elements
const userNameDisplay = document.getElementById('userNameDisplay');
const profileName = document.getElementById('profileName');
const fullNameInput = document.getElementById('fullName');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const locationInput = document.getElementById('location');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const notifToggle = document.getElementById('notifToggle');
const languageSelect = document.getElementById('languageSelect');
const logoutBtn = document.getElementById('logoutBtn');
const avatarMain = document.getElementById('avatarMain');
const avatarModal = document.getElementById('avatarModal');
const closeAvatarModal = document.getElementById('closeAvatarModal');
const cancelAvatarBtn = document.getElementById('cancelAvatarBtn');
const saveAvatarBtn = document.getElementById('saveAvatarBtn');
const uploadBtn = document.getElementById('uploadBtn');
const avatarInput = document.getElementById('avatarInput');
const removeAvatarBtn = document.getElementById('removeAvatarBtn');
const avatarPreview = document.getElementById('avatarPreview');
const avatarImg = document.getElementById('avatarImg');
const toastContainer = document.getElementById('toastContainer');

// User Data
let userData = {
    fullName: 'John Doe',
    username: '@johndoe',
    email: 'john.doe@example.com',
    phone: '+880 1XXX-XXXXXX',
    location: 'Dhaka, Bangladesh',
    avatar: 'https://ui-avatars.com/api/?background=536FFE&color=fff&size=80&name=John+Doe',
    darkMode: false,
    notifications: true,
    language: 'en'
};

// Load saved data from localStorage
function loadUserData() {
    const saved = localStorage.getItem('profile_user_data');
    if (saved) {
        userData = JSON.parse(saved);
    }
    applyUserData();
}

// Apply user data to UI
function applyUserData() {
    userNameDisplay.textContent = userData.fullName;
    profileName.textContent = userData.fullName;
    fullNameInput.value = userData.fullName;
    usernameInput.value = userData.username;
    emailInput.value = userData.email;
    phoneInput.value = userData.phone;
    locationInput.value = userData.location;
    avatarImg.src = userData.avatar;
    avatarPreview.src = userData.avatar;
    darkModeToggle.checked = userData.darkMode;
    notifToggle.checked = userData.notifications;
    languageSelect.value = userData.language;
    
    // Apply dark mode if enabled
    if (userData.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem('profile_user_data', JSON.stringify(userData));
    showToast('Profile saved successfully!', 'success');
}

// Show Toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Save Profile Changes
function saveProfile() {
    userData.fullName = fullNameInput.value;
    userData.username = usernameInput.value;
    userData.email = emailInput.value;
    userData.phone = phoneInput.value;
    userData.location = locationInput.value;
    
    // Update avatar URL if name changed
    const newAvatarUrl = `https://ui-avatars.com/api/?background=536FFE&color=fff&size=80&name=${encodeURIComponent(userData.fullName)}`;
    if (!userData.avatar.includes('blob:')) {
        userData.avatar = newAvatarUrl;
        avatarImg.src = newAvatarUrl;
    }
    
    applyUserData();
    saveUserData();
    showToast('Profile updated successfully!', 'success');
}

// Dark Mode Toggle
darkModeToggle.addEventListener('change', (e) => {
    userData.darkMode = e.target.checked;
    if (userData.darkMode) {
        document.body.classList.add('dark-mode');
        showToast('Dark mode enabled', 'info');
    } else {
        document.body.classList.remove('dark-mode');
        showToast('Light mode enabled', 'info');
    }
    saveUserData();
});

// Notifications Toggle
notifToggle.addEventListener('change', (e) => {
    userData.notifications = e.target.checked;
    showToast(userData.notifications ? 'Notifications enabled' : 'Notifications disabled', 'info');
    saveUserData();
});

// Language Change
languageSelect.addEventListener('change', (e) => {
    userData.language = e.target.value;
    showToast(`Language changed to ${e.target.options[e.target.selectedIndex].text}`, 'info');
    saveUserData();
});

// Logout
logoutBtn.addEventListener('click', () => {
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1000);
});

// Avatar Modal
avatarMain.addEventListener('click', () => {
    avatarModal.classList.add('active');
});

function closeModal() {
    avatarModal.classList.remove('active');
}

closeAvatarModal.addEventListener('click', closeModal);
cancelAvatarBtn.addEventListener('click', closeModal);

avatarModal.addEventListener('click', (e) => {
    if (e.target === avatarModal) closeModal();
});

// Upload Avatar
uploadBtn.addEventListener('click', () => {
    avatarInput.click();
});

avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const imgData = event.target.result;
            avatarPreview.src = imgData;
        };
        reader.readAsDataURL(file);
    }
});

// Remove Avatar
removeAvatarBtn.addEventListener('click', () => {
    const defaultAvatar = `https://ui-avatars.com/api/?background=536FFE&color=fff&size=80&name=${encodeURIComponent(userData.fullName)}`;
    avatarPreview.src = defaultAvatar;
    showToast('Avatar removed', 'info');
});

// Save Avatar
saveAvatarBtn.addEventListener('click', () => {
    userData.avatar = avatarPreview.src;
    avatarImg.src = userData.avatar;
    saveUserData();
    closeModal();
    showToast('Profile picture updated!', 'success');
});

// Save profile button
saveProfileBtn.addEventListener('click', saveProfile);

// Add dark mode styles dynamically
const darkModeStyle = document.createElement('style');
darkModeStyle.textContent = `
    body.dark-mode {
        background: #0f172a;
    }
    body.dark-mode .main-body {
        background: #0f172a;
    }
    body.dark-mode .top-bar {
        background: rgba(30, 41, 59, 0.95);
        border-bottom-color: #334155;
    }
    body.dark-mode .card-large,
    body.dark-mode .card-small,
    body.dark-mode .card-wide {
        background: #1e293b;
    }
    body.dark-mode .card-title {
        color: #f1f5f9;
    }
    body.dark-mode .styled-input {
        background: #334155;
        border-color: #475569;
        color: #f1f5f9;
    }
    body.dark-mode .input-group label {
        color: #94a3b8;
    }
    body.dark-mode .menu-row {
        border-bottom-color: #334155;
    }
    body.dark-mode .menu-left {
        color: #cbd5e1;
    }
    body.dark-mode .activity-item {
        border-bottom-color: #334155;
    }
    body.dark-mode .activity-content p {
        color: #cbd5e1;
    }
    body.dark-mode .breadcrumb {
        color: #94a3b8;
    }
    body.dark-mode .user-pill {
        background: #334155;
    }
`;
document.head.appendChild(darkModeStyle);

// Initialize
loadUserData();

// Animate stats counting
function animateStats() {
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(stat => {
        const finalValue = parseInt(stat.textContent);
        if (!isNaN(finalValue)) {
            let current = 0;
            const increment = finalValue / 30;
            const timer = setInterval(() => {
                current += increment;
                if (current >= finalValue) {
                    stat.textContent = finalValue;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, 30);
        }
    });
}

animateStats();