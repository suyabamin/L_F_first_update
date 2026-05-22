// Login Page - Interactive JavaScript with Validation
(function() {
    'use strict';

    // DOM Elements
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const togglePassword = document.getElementById('togglePassword');
    const signinBtn = document.getElementById('signinBtn');
    const loginForm = document.getElementById('loginForm');
    const rememberMe = document.getElementById('rememberMe');
    const googleBtn = document.getElementById('googleBtn');
    const facebookBtn = document.getElementById('facebookBtn');
    const toast = document.getElementById('toast');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    // Show Toast Notification
    function showToast(message, isError = false) {
        toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${message}`;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Validate Email
    function validateEmail(email) {
        const re = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
        return re.test(email);
    }

    // Validate Password
    function validatePassword(password) {
        return password.length >= 6;
    }

    // Show Field Error
    function showFieldError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    // Clear Field Error
    function clearFieldError(input, errorElement) {
        input.classList.remove('error');
        errorElement.classList.remove('show');
    }

    // Validate Form
    function validateForm() {
        let isValid = true;
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Email validation
        if (!email) {
            showFieldError(emailInput, emailError, 'Email address is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            showFieldError(emailInput, emailError, 'Please enter a valid email address (e.g., name@example.com)');
            isValid = false;
        } else {
            clearFieldError(emailInput, emailError);
        }

        // Password validation
        if (!password) {
            showFieldError(passwordInput, passwordError, 'Password is required');
            isValid = false;
        } else if (!validatePassword(password)) {
            showFieldError(passwordInput, passwordError, 'Password must be at least 6 characters');
            isValid = false;
        } else {
            clearFieldError(passwordInput, passwordError);
        }

        return isValid;
    }

    // Handle Login
    function demoUser(email) {
        return {
            id: 2,
            username: 'rahim',
            fullName: 'Rahim Ahmed',
            email,
            phone: '+8801711000001',
            country: 'BD',
            location: 'BD',
            avatar: '',
            role: 'user',
            isVerified: true,
            preferences: {
                email: true,
                push: true,
                sms: false,
                marketing: false
            }
        };
    }

    function demoAdmin(email) {
        return {
            id: 1,
            username: 'admin',
            fullName: 'System Admin',
            email,
            phone: '+8801711000000',
            country: 'BD',
            location: 'Dhaka, Bangladesh',
            avatar: '',
            role: 'admin',
            isVerified: true,
            preferences: {
                email: true,
                push: true,
                sms: false,
                marketing: false
            }
        };
    }

    function saveSession(user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('current_user', JSON.stringify(user));
    }

    function canUseDemoLogin(email, password) {
        return email.toLowerCase() === 'rahim@example.com' && password === 'password';
    }

    function canUseDemoAdminLogin(email, password) {
        return email.toLowerCase() === 'admin@lostfound.local' && password === 'password';
    }

    function finishLogin(user, redirect) {
        saveSession(user);
        showToast('Login successful!', false);
        const next = new URLSearchParams(window.location.search).get('next');
        window.location.href = next || redirect || 'DashBoard.html';
    }

    async function handleLogin(e) {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Please fix the errors in the form', true);
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (rememberMe.checked) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        const btnText = signinBtn.querySelector('.btn-text');
        const btnLoader = signinBtn.querySelector('.btn-loader');
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        signinBtn.disabled = true;

        try {
            if (window.location.protocol === 'file:') {
                throw new Error('Open http://127.0.0.1:8000/Login.html instead of opening this file directly.');
            }

            const response = await fetch(new URL(loginForm.getAttribute('action'), window.location.origin), {
                method: 'POST',
                body: new FormData(loginForm),
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                showToast(data.message || 'Invalid email or password.', true);
                return;
            }

            finishLogin(data.user, data.redirect);
        } catch (error) {
            if (canUseDemoAdminLogin(email, password)) {
                finishLogin(demoAdmin(email), 'Admin panel.html');
                return;
            }
            if (canUseDemoLogin(email, password)) {
                finishLogin(demoUser(email), 'DashBoard.html');
                return;
            }

            showToast(error.message || 'Server connection failed. Use rahim@example.com / password or admin@lostfound.local / password for local demo login.', true);
        } finally {
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            signinBtn.disabled = false;
        }
    }

    // Toggle Password Visibility
    function initPasswordToggle() {
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                const icon = togglePassword.querySelector('i');
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            });
        }
    }

    // Real-time Validation
    function initRealTimeValidation() {
        emailInput.addEventListener('input', () => {
            if (emailInput.value.trim()) {
                clearFieldError(emailInput, emailError);
            }
        });
        
        passwordInput.addEventListener('input', () => {
            if (passwordInput.value.trim()) {
                clearFieldError(passwordInput, passwordError);
            }
        });
    }

    // Load Remembered Email
    function loadRememberedEmail() {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail && emailInput) {
            emailInput.value = rememberedEmail;
            rememberMe.checked = true;
        }
    }

    // Social Login Handlers
    function initSocialLogin() {
        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                showToast('Google login feature coming soon!', false);
            });
        }
        
        if (facebookBtn) {
            facebookBtn.addEventListener('click', () => {
                showToast('Facebook login feature coming soon!', false);
            });
        }
    }

    // Keyboard Shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Press Enter to submit when on form fields
            if (e.key === 'Enter' && (document.activeElement === emailInput || document.activeElement === passwordInput)) {
                e.preventDefault();
                signinBtn.click();
            }
        });
    }

    // Floating Label Effect
    function initFloatingLabels() {
        const inputs = document.querySelectorAll('.input-wrapper input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('focused');
                }
            });
        });
    }

    // Animate Elements on Load
    function animateOnLoad() {
        const brandSection = document.querySelector('.brand-section');
        const formSection = document.querySelector('.form-section');
        
        if (brandSection) {
            brandSection.style.animation = 'slideInLeft 0.6s ease';
        }
        if (formSection) {
            formSection.style.animation = 'slideInRight 0.6s ease';
        }
    }

    // Add backend login hint
    function addDemoHint() {
        const formContainer = document.querySelector('.form-container');
        if (formContainer && !document.querySelector('.demo-hint')) {
            const hint = document.createElement('div');
            hint.className = 'demo-hint';
            hint.style.cssText = `
                margin-top: 16px;
                padding: 10px;
                background: #f0fdf4;
                border-radius: 12px;
                font-size: 12px;
                text-align: center;
                color: #065f46;
                border: 1px solid #d1fae5;
            `;
            hint.innerHTML = '<i class="fas fa-info-circle"></i> Use your registered MySQL account to sign in.';
            formContainer.appendChild(hint);
        }
    }

    // Welcome Message
    function showWelcome() {
        setTimeout(() => {
            showToast('👋 Welcome back! Please login to continue', false);
        }, 500);
    }

    // Initialize Everything
    function init() {
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        initPasswordToggle();
        initRealTimeValidation();
        loadRememberedEmail();
        initSocialLogin();
        initKeyboardShortcuts();
        initFloatingLabels();
        animateOnLoad();
        addDemoHint();
        showWelcome();
    }

    init();
})();
