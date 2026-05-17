// DOM Elements
const usernameInput = document.getElementById('username');
const fullnameInput = document.getElementById('fullname');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const countrySelect = document.getElementById('country');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');
const termsCheck = document.getElementById('termsCheck');
const createBtn = document.getElementById('createAccountBtn');
const registerForm = document.getElementById('registerForm');
const termsModal = document.getElementById('termsModal');
const successModal = document.getElementById('successModal');
const termsLink = document.getElementById('termsLink');
const privacyLink = document.getElementById('privacyLink');
const closeTermsModal = document.getElementById('closeTermsModal');
const acceptTermsBtn = document.getElementById('acceptTermsBtn');
const goToDashboardBtn = document.getElementById('goToDashboardBtn');
const toastContainer = document.getElementById('toastContainer');

// Error spans
const errorFields = {
    username: document.getElementById('usernameError'),
    fullname: document.getElementById('fullnameError'),
    email: document.getElementById('emailError'),
    phone: document.getElementById('phoneError'),
    country: document.getElementById('countryError'),
    password: document.getElementById('passwordError'),
    confirm: document.getElementById('confirmError'),
    gender: document.getElementById('genderError'),
    dob: document.getElementById('dobError'),
    terms: document.getElementById('termsError')
};

// Password strength elements
const strengthBars = document.querySelectorAll('.strength-bar');
const strengthText = document.querySelector('.strength-text');

// Populate DOB selects
function populateDOB() {
    // Days
    const daySelect = document.getElementById('dobDay');
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }
    
    // Years (1900 to current year)
    const yearSelect = document.getElementById('dobYear');
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1900; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
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

// Clear error styling
function clearError(inputId) {
    const input = document.getElementById(inputId);
    if (input) input.classList.remove('error');
    if (errorFields[inputId]) errorFields[inputId].textContent = '';
}

// Set error
function setError(inputId, message) {
    const input = document.getElementById(inputId);
    if (input) input.classList.add('error');
    if (errorFields[inputId]) errorFields[inputId].textContent = message;
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthClasses = ['', 'weak', 'fair', 'good', 'strong'];
    
    strengthBars.forEach((bar, index) => {
        if (index < strength) {
            bar.classList.add(strengthClasses[strength]);
            bar.style.background = '';
        } else {
            bar.classList.remove('weak', 'fair', 'good', 'strong');
            bar.style.background = '#E4E7EC';
        }
    });
    
    strengthText.textContent = strengthLevels[strength] || 'Enter password';
    strengthText.style.color = strength >= 3 ? 'var(--success)' : 'var(--text-muted)';
    
    return strength;
}

// Password match check
function checkPasswordMatch() {
    const password = passwordInput.value;
    const confirm = confirmInput.value;
    if (confirm && password !== confirm) {
        setError('confirm', 'Passwords do not match');
        return false;
    } else {
        clearError('confirm');
        return true;
    }
}

// Validate email format
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate phone (basic)
function isValidPhone(phone) {
    return phone.length >= 8;
}

// Validate form
function validateForm() {
    let isValid = true;
    
    // Username
    if (!usernameInput.value.trim()) {
        setError('username', 'Username is required');
        isValid = false;
    } else if (usernameInput.value.length < 3) {
        setError('username', 'Username must be at least 3 characters');
        isValid = false;
    } else {
        clearError('username');
    }
    
    // Full Name
    if (!fullnameInput.value.trim()) {
        setError('fullname', 'Full name is required');
        isValid = false;
    } else {
        clearError('fullname');
    }
    
    // Email
    if (!emailInput.value.trim()) {
        setError('email', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
        setError('email', 'Enter a valid email address');
        isValid = false;
    } else {
        clearError('email');
    }
    
    // Phone
    if (!phoneInput.value.trim()) {
        setError('phone', 'Phone number is required');
        isValid = false;
    } else if (!isValidPhone(phoneInput.value)) {
        setError('phone', 'Enter a valid phone number');
        isValid = false;
    } else {
        clearError('phone');
    }
    
    // Country
    if (!countrySelect.value) {
        setError('country', 'Please select your country');
        isValid = false;
    } else {
        clearError('country');
    }
    
    // Password
    if (!passwordInput.value) {
        setError('password', 'Password is required');
        isValid = false;
    } else if (passwordInput.value.length < 6) {
        setError('password', 'Password must be at least 6 characters');
        isValid = false;
    } else {
        clearError('password');
    }
    
    // Confirm Password
    if (!confirmInput.value) {
        setError('confirm', 'Please confirm your password');
        isValid = false;
    } else if (passwordInput.value !== confirmInput.value) {
        setError('confirm', 'Passwords do not match');
        isValid = false;
    } else {
        clearError('confirm');
    }
    
    // Gender
    const selectedGender = document.querySelector('input[name="gender"]:checked');
    if (!selectedGender) {
        errorFields.gender.textContent = 'Please select your gender';
        isValid = false;
    } else {
        errorFields.gender.textContent = '';
    }
    
    // DOB
    const day = document.getElementById('dobDay').value;
    const month = document.getElementById('dobMonth').value;
    const year = document.getElementById('dobYear').value;
    if (!day || !month || !year) {
        errorFields.dob.textContent = 'Please enter your date of birth';
        isValid = false;
    } else {
        errorFields.dob.textContent = '';
    }
    
    // Terms
    if (!termsCheck.checked) {
        errorFields.terms.textContent = 'You must agree to the terms and conditions';
        isValid = false;
    } else {
        errorFields.terms.textContent = '';
    }
    
    return isValid;
}

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        const icon = btn.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

// Password strength listener
passwordInput.addEventListener('input', () => {
    checkPasswordStrength(passwordInput.value);
    checkPasswordMatch();
});

confirmInput.addEventListener('input', checkPasswordMatch);

// Create account through PHP fetch request
async function createAccount(e) {
    e.preventDefault();

    if (!validateForm()) {
        showToast('Please fix the errors in the form', 'error');
        return;
    }

    const day = String(document.getElementById('dobDay').value).padStart(2, '0');
    const month = String(document.getElementById('dobMonth').value).padStart(2, '0');
    const year = document.getElementById('dobYear').value;
    const dobInput = document.getElementById('dob');
    if (dobInput) {
        dobInput.value = `${year}-${month}-${day}`;
    }

    const originalButtonHtml = createBtn.innerHTML;
    createBtn.disabled = true;
    createBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Creating...';
    showToast('Creating account...', 'info');

    try {
        const response = await fetch(registerForm.action, {
            method: 'POST',
            body: new FormData(registerForm),
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            showToast(data.message || 'Registration failed. Please try again.', 'error');
            return;
        }

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('registered_user', JSON.stringify(data.user));
        showToast('Account created successfully!', 'success');

        if (successModal) {
            successModal.classList.add('active');
        }

        setTimeout(() => {
            window.location.href = data.redirect || 'DashBoard.html';
        }, 1200);
    } catch (error) {
        showToast('Server connection failed. Open the project through localhost/XAMPP.', 'error');
    } finally {
        createBtn.disabled = false;
        createBtn.innerHTML = originalButtonHtml;
    }
}

// Modal handlers
function openTermsModal() {
    termsModal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

termsLink.addEventListener('click', (e) => {
    e.preventDefault();
    openTermsModal();
});

privacyLink.addEventListener('click', (e) => {
    e.preventDefault();
    openTermsModal();
});

closeTermsModal.addEventListener('click', () => closeModal(termsModal));
acceptTermsBtn.addEventListener('click', () => {
    termsCheck.checked = true;
    closeModal(termsModal);
    showToast('Terms accepted', 'success');
});

termsModal.addEventListener('click', (e) => {
    if (e.target === termsModal) closeModal(termsModal);
});

successModal.addEventListener('click', (e) => {
    if (e.target === successModal) closeModal(successModal);
});

goToDashboardBtn.addEventListener('click', () => {
    window.location.href = 'DashBoard.html';
});

if (registerForm) {
    registerForm.addEventListener('submit', createAccount);
}

// Real-time validation on blur
usernameInput.addEventListener('blur', () => {
    if (usernameInput.value && usernameInput.value.length < 3) {
        setError('username', 'Username must be at least 3 characters');
    } else if (usernameInput.value) {
        clearError('username');
    }
});

emailInput.addEventListener('blur', () => {
    if (emailInput.value && !isValidEmail(emailInput.value)) {
        setError('email', 'Enter a valid email address');
    } else if (emailInput.value) {
        clearError('email');
    }
});

// Initialize
populateDOB();
checkPasswordStrength('');

// Social buttons demo
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showToast('Social login coming soon', 'info');
    });
});
