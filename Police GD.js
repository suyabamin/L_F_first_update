// Floating Shields Animation
function createFloatingShields() {
    const container = document.getElementById('floatingShields');
    for (let i = 0; i < 25; i++) {
        const shield = document.createElement('div');
        shield.innerHTML = '<i class="fas fa-shield-alt"></i>';
        shield.style.position = 'absolute';
        shield.style.left = Math.random() * 100 + '%';
        shield.style.top = Math.random() * 100 + '%';
        shield.style.fontSize = Math.random() * 20 + 12 + 'px';
        shield.style.color = `rgba(13, 148, 136, ${Math.random() * 0.15})`;
        shield.style.animation = `floatShield ${Math.random() * 20 + 15}s linear infinite`;
        shield.style.pointerEvents = 'none';
        container.appendChild(shield);
    }
}

// Add float animation dynamically
const styleShield = document.createElement('style');
styleShield.textContent = `
    @keyframes floatShield {
        0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
        10% { opacity: 0.6; }
        90% { opacity: 0.6; }
        100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; }
    }
`;
document.head.appendChild(styleShield);

// Live Clock Update
function updateClock() {
    const clockSpan = document.getElementById('clockTime');
    if (!clockSpan) return;
    const now = new Date();
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    clockSpan.textContent = now.toLocaleTimeString('en-US', options);
}
setInterval(updateClock, 1000);
updateClock();

// Toast Notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Modal Handling
const modalOverlay = document.getElementById('modalOverlay');
const fileGDBtn = document.getElementById('fileGDBtn');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const submitGDBtn = document.getElementById('submitGDBtn');

function openModal() {
    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
    // Clear form fields
    document.getElementById('fullName').value = '';
    document.getElementById('idProof').value = '';
    document.getElementById('location').value = '';
    document.getElementById('description').value = '';
    document.getElementById('consentCheck').checked = false;
}

fileGDBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
});

modalCloseBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);

// Close modal on overlay click
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

// Submit GD Form
submitGDBtn.addEventListener('click', () => {
    const fullName = document.getElementById('fullName').value.trim();
    const idProof = document.getElementById('idProof').value.trim();
    const location = document.getElementById('location').value.trim();
    const description = document.getElementById('description').value.trim();
    const consent = document.getElementById('consentCheck').checked;

    if (!fullName || !idProof || !location || !description) {
        showToast('❌ Please fill all required fields', 'error');
        return;
    }
    if (!consent) {
        showToast('⚠️ Please confirm the declaration', 'error');
        return;
    }

    // Simulate submission
    showToast('📋 GD submitted successfully! Reference: GD-' + Math.floor(Math.random() * 10000), 'success');
    closeModal();
});

// Guide Button - Show procedure info
const guideBtn = document.getElementById('guideBtn');
guideBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('📖 Required documents: ID proof, incident photos, ownership proof. Visit nearest PS for verification.', 'info');
});

// Track Button
const trackBtn = document.getElementById('trackBtn');
trackBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('🔍 Track your GD using the reference ID sent on registered mobile.', 'info');
});

// Emergency Button
const emergencyBtn = document.getElementById('emergencyBtn');
emergencyBtn.addEventListener('click', () => {
    showToast('📞 Connecting to Emergency Dispatch (100)... Stay safe.', 'success');
    // Simulate call
    setTimeout(() => {
        showToast('🚔 Police dispatched to your location. Do not panic.', 'success');
    }, 1500);
});

// Back Button
const backBtn = document.getElementById('backBtn');
backBtn.addEventListener('click', () => {
    window.history.back();
});

// Initialize floating shields
createFloatingShields();

// Add hover animation for matrix items
document.querySelectorAll('.matrix-item').forEach(item => {
    item.addEventListener('click', (e) => {
        if (item.id === 'fileGDBtn') return; // already handled
        if (item.id !== 'fileGDBtn' && item.id !== 'guideBtn' && item.id !== 'trackBtn') {
            e.preventDefault();
            showToast('🔐 Feature coming soon. Stay tuned.', 'info');
        }
    });
});

// Animated counter for status badge (optional)
const statusBadge = document.querySelector('.status-badge');
if (statusBadge) {
    statusBadge.style.transition = 'all 0.2s';
}