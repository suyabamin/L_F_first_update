// Edit Profile - Fully Interactive JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const locationInput = document.getElementById('location');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const deactivateBtn = document.getElementById('deactivateBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
    const removeAvatarBtn = document.getElementById('removeAvatarBtn');
    const avatarInput = document.getElementById('avatarInput');
    const avatarImage = document.getElementById('avatarImage');
    const toast = document.getElementById('toast');
    
    // Modal Elements
    const successModal = document.getElementById('successModal');
    const deactivateModal = document.getElementById('deactivateModal');
    const deleteModal = document.getElementById('deleteModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const confirmDeactivateBtn = document.getElementById('confirmDeactivateBtn');
    const cancelDeactivateBtn = document.getElementById('cancelDeactivateBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    
    // Password section toggle
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordFields = document.getElementById('passwordFields');
    
    // Password strength
    const strengthProgress = document.getElementById('strengthProgress');
    const strengthText = document.getElementById('strengthText');
    
    // State
    let currentAvatar = 'https://ui-avatars.com/api/?name=Alex+Morgan&background=00cfe8&color=fff&bold=true&size=120';
    let selectedAvatarFile = null;
    
    // Toggle password visibility for all fields
    document.querySelectorAll('.toggle-visibility').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const targetInput = document.getElementById(targetId);
            const icon = btn.querySelector('i');
            
            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                targetInput.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    });
    
    // Toggle password section
    if (togglePasswordBtn && passwordFields) {
        let isPasswordOpen = false;
        togglePasswordBtn.addEventListener('click', () => {
            isPasswordOpen = !isPasswordOpen;
            if (isPasswordOpen) {
                passwordFields.classList.add('show');
                togglePasswordBtn.querySelector('i').classList.remove('fa-chevron-down');
                togglePasswordBtn.querySelector('i').classList.add('fa-chevron-up');
            } else {
                passwordFields.classList.remove('show');
                togglePasswordBtn.querySelector('i').classList.remove('fa-chevron-up');
                togglePasswordBtn.querySelector('i').classList.add('fa-chevron-down');
            }
        });
    }
    
    // Password strength checker
    function checkPasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;
        
        let width = (strength / 4) * 100;
        let color, text;
        
        switch (strength) {
            case 0:
                width = 0;
                color = '#cbd5e1';
                text = 'Password strength: Not entered';
                break;
            case 1:
                color = '#ef4444';
                text = 'Password strength: Weak';
                break;
            case 2:
                color = '#f59e0b';
                text = 'Password strength: Fair';
                break;
            case 3:
                color = '#10b981';
                text = 'Password strength: Good';
                break;
            case 4:
                color = '#00cfe8';
                text = 'Password strength: Strong';
                break;
        }
        
        if (strengthProgress) {
            strengthProgress.style.width = `${width}%`;
            strengthProgress.style.background = color;
        }
        if (strengthText) strengthText.textContent = text;
        
        return strength;
    }
    
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', () => {
            checkPasswordStrength(newPasswordInput.value);
        });
    }
    
    // Avatar upload
    if (uploadAvatarBtn && avatarInput) {
        uploadAvatarBtn.addEventListener('click', () => avatarInput.click());
        
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    showToast('Please select an image file', 'error');
                    return;
                }
                if (file.size > 2 * 1024 * 1024) {
                    showToast('Image size should be less than 2MB', 'error');
                    return;
                }
                
                selectedAvatarFile = file;
                const reader = new FileReader();
                reader.onload = (event) => {
                    currentAvatar = event.target.result;
                    avatarImage.src = currentAvatar;
                    showToast('Avatar updated!', 'success');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Remove avatar
    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', () => {
            selectedAvatarFile = null;
            currentAvatar = 'https://ui-avatars.com/api/?name=Alex+Morgan&background=00cfe8&color=fff&bold=true&size=120';
            avatarImage.src = currentAvatar;
            showToast('Avatar removed', 'info');
        });
    }
    
    // Validation functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePhone(phone) {
        // Simple phone validation - at least 8 digits
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 8 || phone === '';
    }
    
    function validateForm() {
        const fullName = fullNameInput?.value.trim();
        const email = emailInput?.value.trim();
        const phone = phoneInput?.value.trim();
        const newPassword = newPasswordInput?.value;
        const confirmPassword = confirmPasswordInput?.value;
        
        if (!fullName) {
            showToast('Please enter your full name', 'error');
            fullNameInput?.focus();
            return false;
        }
        
        if (fullName.length < 3) {
            showToast('Name must be at least 3 characters', 'error');
            return false;
        }
        
        if (!email) {
            showToast('Please enter your email address', 'error');
            emailInput?.focus();
            return false;
        }
        
        if (!validateEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return false;
        }
        
        if (phone && !validatePhone(phone)) {
            showToast('Please enter a valid phone number', 'error');
            return false;
        }
        
        // Password validation if trying to change
        if (newPassword && newPassword.length > 0) {
            if (!currentPasswordInput?.value) {
                showToast('Please enter current password to change it', 'error');
                currentPasswordInput?.focus();
                return false;
            }
            
            if (newPassword.length < 6) {
                showToast('New password must be at least 6 characters', 'error');
                return false;
            }
            
            if (newPassword !== confirmPassword) {
                showToast('New passwords do not match', 'error');
                return false;
            }
        }
        
        return true;
    }
    
    // Save profile
    async function saveProfile() {
        if (!validateForm()) return;
        
        const form = new FormData();
        form.set('fullName', fullNameInput?.value.trim() || '');
        form.set('email', emailInput?.value.trim() || '');
        form.set('phone', phoneInput?.value.trim() || '');
        form.set('location', locationInput?.value.trim() || '');
        if (selectedAvatarFile) {
            form.append('avatarFile', selectedAvatarFile);
        } else {
            form.set('avatar', currentAvatar.includes('ui-avatars.com') ? '' : currentAvatar);
        }
        form.set('emailNotif', document.getElementById('emailNotif')?.checked ? 'true' : 'false');
        form.set('pushNotif', document.getElementById('pushNotif')?.checked ? 'true' : 'false');
        form.set('smsNotif', document.getElementById('smsNotif')?.checked ? 'true' : 'false');
        form.set('marketingNotif', document.getElementById('marketingNotif')?.checked ? 'true' : 'false');
        if (currentPasswordInput?.value && newPasswordInput?.value) {
            form.set('currentPassword', currentPasswordInput.value);
            form.set('newPassword', newPasswordInput.value);
        }

        saveBtn.disabled = true;
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
            localStorage.setItem('current_user', JSON.stringify(data.user));
            showToast('Profile updated successfully!', 'success');
            if (successModal) successModal.classList.add('show');
            triggerConfetti();
        } catch (error) {
            showToast('Server connection failed while saving profile.', 'error');
        } finally {
            saveBtn.disabled = false;
        }
    }
    
    // Confetti effect
    function triggerConfetti() {
        const colors = ['#00cfe8', '#10b981', '#f59e0b', '#8b5cf6'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -10px;
                border-radius: 2px;
                pointer-events: none;
                z-index: 2000;
                animation: confettiFall ${1.5 + Math.random() * 2}s linear forwards;
            `;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }
    }
    
    // Add confetti animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confettiFall {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Reset/Discard changes
    function discardChanges() {
        if (confirm('Discard all unsaved changes?')) {
            resetFormToOriginal();
            showToast('Changes discarded', 'info');
        }
    }
    
    async function resetFormToOriginal() {
        await loadProfileData();
        if (currentPasswordInput) currentPasswordInput.value = '';
        if (newPasswordInput) newPasswordInput.value = '';
        if (confirmPasswordInput) confirmPasswordInput.value = '';
        if (strengthProgress) strengthProgress.style.width = '0%';
        if (strengthText) strengthText.textContent = 'Password strength: Not entered';
    }
    
    // Show toast
    function showToast(message, type = 'info') {
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = 'toast';
        if (type === 'success') toast.classList.add('success');
        if (type === 'error') toast.classList.add('error');
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }
    
    // Logout
    async function logout() {
        if (confirm('Are you sure you want to logout?')) {
            showToast('Logging out...', 'info');
            await fetch('backend-php/logout.php', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }).catch(() => {});
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('current_user');
            window.location.href = 'Login.html';
        }
    }
    
    // Deactivate account
    function deactivateAccount() {
        if (deactivateModal) {
            deactivateModal.classList.add('show');
        }
    }
    
    function confirmDeactivate() {
        showToast('Account deactivated. You can reactivate by logging in.', 'success');
        if (deactivateModal) deactivateModal.classList.remove('show');
        setTimeout(() => {
            alert('Redirecting to login page...');
        }, 1000);
    }
    
    // Delete account permanently
    function confirmDeleteAccount() {
        if (deleteModal) {
            deleteModal.classList.add('show');
        }
    }
    
    async function performDeleteAccount() {
        if (!window.confirm('This will delete your account permanently. Continue?')) {
            return;
        }

        if (deleteModal) deleteModal.classList.remove('show');
        showToast('Deleting your account...', 'info');
        try {
            const response = await fetch('backend-php/delete-account.php', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                showToast(data.message || 'Account deletion failed.', 'error');
                return;
            }

            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('current_user');
            showToast('Account deleted. Redirecting to login.', 'success');
            setTimeout(() => {
                window.location.href = 'Login.html';
            }, 1200);
        } catch (error) {
            showToast('Server error while deleting account.', 'error');
        }
    }
    
    // Load saved profile data
    async function loadProfileData() {
        try {
            const response = await fetch('backend-php/me.php', { headers: { 'Accept': 'application/json' } });
            const data = await response.json();
            if (!response.ok || !data.success) {
                window.location.href = 'Login.html';
                return;
            }
            const profile = data.user;
            const avatar = profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'User')}&background=00cfe8&color=fff&bold=true&size=120`;
            if (fullNameInput) fullNameInput.value = profile.fullName || '';
            if (emailInput) emailInput.value = profile.email || '';
            if (phoneInput) phoneInput.value = profile.phone || '';
            if (locationInput) locationInput.value = profile.location || '';
            currentAvatar = avatar;
            avatarImage.src = currentAvatar;
            if (document.getElementById('emailNotif')) document.getElementById('emailNotif').checked = profile.preferences?.email !== false;
            if (document.getElementById('pushNotif')) document.getElementById('pushNotif').checked = profile.preferences?.push !== false;
            if (document.getElementById('smsNotif')) document.getElementById('smsNotif').checked = profile.preferences?.sms === true;
            if (document.getElementById('marketingNotif')) document.getElementById('marketingNotif').checked = profile.preferences?.marketing === true;
        } catch (error) {
            showToast('Could not load profile from database.', 'error');
        }
    }
    
    // Event Listeners
    saveBtn?.addEventListener('click', saveProfile);
    cancelBtn?.addEventListener('click', discardChanges);
    logoutBtn?.addEventListener('click', logout);
    deactivateBtn?.addEventListener('click', deactivateAccount);
    deleteAccountBtn?.addEventListener('click', confirmDeleteAccount);
    
    // Modal listeners
    closeModalBtn?.addEventListener('click', () => {
        if (successModal) successModal.classList.remove('show');
    });
    
    confirmDeactivateBtn?.addEventListener('click', confirmDeactivate);
    cancelDeactivateBtn?.addEventListener('click', () => {
        if (deactivateModal) deactivateModal.classList.remove('show');
    });
    
    confirmDeleteBtn?.addEventListener('click', performDeleteAccount);
    cancelDeleteBtn?.addEventListener('click', () => {
        if (deleteModal) deleteModal.classList.remove('show');
    });
    
    // Close modals on background click
    [successModal, deactivateModal, deleteModal].forEach(modal => {
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveProfile();
        }
        if (e.key === 'Escape') {
            if (successModal?.classList.contains('show')) successModal.classList.remove('show');
            if (deactivateModal?.classList.contains('show')) deactivateModal.classList.remove('show');
            if (deleteModal?.classList.contains('show')) deleteModal.classList.remove('show');
        }
    });
    
    // Real-time validation for email
    emailInput?.addEventListener('blur', () => {
        const email = emailInput.value.trim();
        if (email && !validateEmail(email)) {
            showToast('Invalid email format', 'error');
            emailInput.style.borderColor = '#ef4444';
        } else {
            emailInput.style.borderColor = '#e2e8f0';
        }
    });
    
    emailInput?.addEventListener('input', () => {
        emailInput.style.borderColor = '#e2e8f0';
    });
    
    // Confirm password real-time check
    confirmPasswordInput?.addEventListener('input', () => {
        const newPwd = newPasswordInput?.value || '';
        const confirmPwd = confirmPasswordInput.value;
        
        if (confirmPwd && newPwd !== confirmPwd) {
            confirmPasswordInput.style.borderColor = '#ef4444';
        } else {
            confirmPasswordInput.style.borderColor = '#e2e8f0';
        }
    });
    
    // Initialize
    loadProfileData();
    
    // Animate cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.animate-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease';
        observer.observe(card);
    });
    
    console.log('Edit Profile page loaded successfully!');
});
