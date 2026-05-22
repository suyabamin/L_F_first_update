// Profile page backed by the API through backend-php compatibility endpoints.
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

let userData = null;
let userStats = {};
let pendingAvatar = '';

function defaultAvatar(name, size = 80) {
    return `https://ui-avatars.com/api/?background=536FFE&color=fff&size=${size}&name=${encodeURIComponent(name || 'User')}`;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function applyUserData() {
    const name = userData.fullName || userData.username || 'User';
    const avatar = userData.avatar || defaultAvatar(name);

    userNameDisplay.textContent = name;
    profileName.textContent = name;
    fullNameInput.value = name;
    usernameInput.value = userData.username ? `@${userData.username.replace(/^@+/, '')}` : '';
    emailInput.value = userData.email || '';
    phoneInput.value = userData.phone || '';
    locationInput.value = userData.location || '';
    avatarImg.src = avatar;
    avatarPreview.src = avatar;
    pendingAvatar = avatar;

    document.getElementById('statPosts').textContent = userStats.posts || 0;
    document.getElementById('statFavorites').textContent = userStats.favorites || 0;
    document.getElementById('statClaims').textContent = userStats.claims || 0;
    document.getElementById('statJoined').textContent = userData.createdAt ? new Date(userData.createdAt).getFullYear() : new Date().getFullYear();

    notifToggle.checked = userData.preferences?.email !== false;
    darkModeToggle.checked = localStorage.getItem('profile_dark_mode') === 'true';
    languageSelect.value = localStorage.getItem('profile_language') || 'en';
    document.body.classList.toggle('dark-mode', darkModeToggle.checked);
}

async function loadUserData() {
    try {
        const response = await fetch('backend-php/me.php', {
            headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
            window.location.href = 'Login.html';
            return;
        }

        userData = data.user;
        userStats = data.stats || {};
        localStorage.setItem('current_user', JSON.stringify(userData));
        applyUserData();
    } catch (error) {
        showToast('Could not load profile. Please check the server.', 'error');
    }
}

async function saveProfile() {
    if (!fullNameInput.value.trim() || !emailInput.value.trim()) {
        showToast('Name and email are required.', 'error');
        return;
    }

    const form = new FormData();
    form.set('username', usernameInput.value.replace(/^@+/, '').trim());
    form.set('fullName', fullNameInput.value.trim());
    form.set('email', emailInput.value.trim());
    form.set('phone', phoneInput.value.trim());
    form.set('location', locationInput.value.trim());
    form.set('avatar', pendingAvatar.includes('ui-avatars.com') ? '' : pendingAvatar);
    form.set('emailNotif', notifToggle.checked ? 'true' : 'false');
    form.set('pushNotif', 'true');
    form.set('smsNotif', 'false');
    form.set('marketingNotif', 'false');

    saveProfileBtn.disabled = true;
    try {
        const response = await fetch('backend-php/profile.php', {
            method: 'POST',
            body: form,
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
            showToast(data.message || 'Profile update failed.', 'error');
            return;
        }

        userData = data.user || data.userData || data.user;
        if (!userData && data.success) {
            await loadUserData();
        } else {
            localStorage.setItem('current_user', JSON.stringify(userData));
            applyUserData();
        }
        showToast(data.message || 'Profile saved successfully!', 'success');
    } catch (error) {
        showToast('Server connection failed while saving profile.', 'error');
    } finally {
        saveProfileBtn.disabled = false;
    }
}

async function logout() {
    if (window.LF?.logout) {
        await window.LF.logout();
        return;
    }
    try {
        await fetch('backend-php/logout.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
    } finally {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('current_user');
        localStorage.removeItem('registered_user');
        window.location.href = 'Login.html';
    }
}

darkModeToggle.addEventListener('change', (e) => {
    localStorage.setItem('profile_dark_mode', e.target.checked ? 'true' : 'false');
    document.body.classList.toggle('dark-mode', e.target.checked);
    showToast(e.target.checked ? 'Dark mode enabled' : 'Light mode enabled', 'info');
});

notifToggle.addEventListener('change', () => {
    showToast(notifToggle.checked ? 'Email notifications enabled' : 'Email notifications disabled', 'info');
});

languageSelect.addEventListener('change', (e) => {
    localStorage.setItem('profile_language', e.target.value);
    showToast(`Language changed to ${e.target.options[e.target.selectedIndex].text}`, 'info');
});

logoutBtn.addEventListener('click', logout);
saveProfileBtn.addEventListener('click', saveProfile);

avatarMain.addEventListener('click', () => avatarModal.classList.add('active'));
closeAvatarModal.addEventListener('click', () => avatarModal.classList.remove('active'));
cancelAvatarBtn.addEventListener('click', () => avatarModal.classList.remove('active'));
avatarModal.addEventListener('click', (e) => {
    if (e.target === avatarModal) avatarModal.classList.remove('active');
});

uploadBtn.addEventListener('click', () => avatarInput.click());
avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        showToast('Please choose an image file.', 'error');
        return;
    }
    if (file.size > 700 * 1024) {
        showToast('Choose an image below 700KB for this demo database.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        pendingAvatar = event.target.result;
        avatarPreview.src = pendingAvatar;
    };
    reader.readAsDataURL(file);
});

removeAvatarBtn.addEventListener('click', () => {
    pendingAvatar = defaultAvatar(fullNameInput.value);
    avatarPreview.src = pendingAvatar;
});

saveAvatarBtn.addEventListener('click', () => {
    avatarImg.src = pendingAvatar;
    avatarModal.classList.remove('active');
    showToast('Profile picture ready. Click Save Changes to store it.', 'info');
});

const darkModeStyle = document.createElement('style');
darkModeStyle.textContent = `
    body.dark-mode { background: #0f172a; }
    body.dark-mode .main-body { background: #0f172a; }
    body.dark-mode .top-bar { background: rgba(30, 41, 59, 0.95); border-bottom-color: #334155; }
    body.dark-mode .card-large,
    body.dark-mode .card-small,
    body.dark-mode .card-wide { background: #1e293b; }
    body.dark-mode .card-title { color: #f1f5f9; }
    body.dark-mode .styled-input { background: #334155; border-color: #475569; color: #f1f5f9; }
    body.dark-mode .input-group label { color: #94a3b8; }
    body.dark-mode .menu-row { border-bottom-color: #334155; }
    body.dark-mode .menu-left { color: #cbd5e1; }
    body.dark-mode .activity-item { border-bottom-color: #334155; }
    body.dark-mode .activity-content p { color: #cbd5e1; }
    body.dark-mode .breadcrumb { color: #94a3b8; }
    body.dark-mode .user-pill { background: #334155; }
`;
document.head.appendChild(darkModeStyle);

loadUserData();
