// Forgot Password - Interactive JavaScript with Form Validation
(function() {
    'use strict';

    // DOM Elements
    const form = document.getElementById('forgotPasswordForm');
    const emailInput = document.getElementById('emailInput');
    const sendBtn = document.getElementById('sendBtn');
    const successMessage = document.getElementById('successMessage');
    const emailError = document.getElementById('emailError');
    const contactSupport = document.getElementById('contactSupport');
    const resendEmail = document.getElementById('resendEmail');
    const toast = document.getElementById('toast');

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

    // Show Input Error
    function showError(input, message) {
        input.classList.add('error');
        emailError.textContent = message;
        emailError.classList.add('show');
    }

    // Clear Error
    function clearError(input) {
        input.classList.remove('error');
        emailError.classList.remove('show');
    }

    // Real-time Validation
    function initRealTimeValidation() {
        emailInput.addEventListener('input', () => {
            if (emailInput.value.trim()) {
                clearError(emailInput);
            }
        });
    }

    // Simulate API Call
    async function sendRecoveryLink(email) {
        // Simulate network delay
        return new Promise((resolve) => {
            setTimeout(() => {
                // In real app, this would be an API call
                console.log('Recovery link sent to:', email);
                resolve({ success: true });
            }, 1500);
        });
    }

    // Handle Form Submit
    async function handleSubmit(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        // Validation
        if (!email) {
            showError(emailInput, 'Email address is required');
            showToast('Please enter your email address', true);
            emailInput.focus();
            return;
        }
        
        if (!validateEmail(email)) {
            showError(emailInput, 'Please enter a valid email address (e.g., name@example.com)');
            showToast('Invalid email format', true);
            emailInput.focus();
            return;
        }
        
        // Clear any existing errors
        clearError(emailInput);
        
        // Show loading state
        const btnText = sendBtn.querySelector('.btn-text');
        const btnLoader = sendBtn.querySelector('.btn-loader');
        const originalText = btnText.textContent;
        
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        sendBtn.disabled = true;
        
        try {
            // Send recovery link
            const result = await sendRecoveryLink(email);
            
            if (result.success) {
                // Show success message
                successMessage.style.display = 'flex';
                successMessage.style.animation = 'slideIn 0.3s ease';
                
                // Clear input
                emailInput.value = '';
                
                // Show toast
                showToast(`Recovery link sent to ${email}. Check your inbox.`, false);
                
                // Auto-hide success message after 5 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
            }
        } catch (error) {
            showToast('Something went wrong. Please try again.', true);
        } finally {
            // Reset button state
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            sendBtn.disabled = false;
        }
    }

    // Handle Contact Support
    function handleContactSupport() {
        showToast('📞 Connecting you to support...', false);
        // In real app, this would open a chat or redirect
        setTimeout(() => {
            showToast('Support team will contact you shortly', false);
        }, 1000);
    }

    // Handle Resend Email
    function handleResendEmail() {
        const email = emailInput.value.trim();
        if (!email || !validateEmail(email)) {
            showToast('Please enter a valid email address first', true);
            emailInput.focus();
            return;
        }
        
        showToast(`Resending recovery link to ${email}...`, false);
        
        // Simulate resend
        setTimeout(() => {
            showToast(`Recovery link resent to ${email}`, false);
            successMessage.style.display = 'flex';
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 4000);
        }, 1000);
    }

    // Navigation Items Animation
    function initNavItems() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (item.getAttribute('href') === '#') {
                    e.preventDefault();
                }
                showToast('Navigation will be available soon', false);
            });
        });
        
        const helpLink = document.querySelector('.help-link');
        if (helpLink) {
            helpLink.addEventListener('click', () => {
                showToast('Help center will open shortly', false);
            });
        }
    }

    // Animate Form Card on Load
    function animateFormCard() {
        const formCard = document.querySelector('.form-card');
        if (formCard) {
            formCard.style.opacity = '0';
            formCard.style.transform = 'translateY(20px)';
            setTimeout(() => {
                formCard.style.transition = 'all 0.5s ease';
                formCard.style.opacity = '1';
                formCard.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    // Add floating label effect
    function initFloatingLabels() {
        const inputs = document.querySelectorAll('.modern-input');
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

    // Keyboard Shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Press Enter to submit when on email field
            if (e.key === 'Enter' && document.activeElement === emailInput) {
                e.preventDefault();
                sendBtn.click();
            }
            
            // Escape to clear email field
            if (e.key === 'Escape' && document.activeElement === emailInput) {
                emailInput.value = '';
                clearError(emailInput);
                showToast('Email field cleared', false);
            }
        });
    }

    // Add demo email suggestion (for demonstration)
    function addDemoHint() {
        // This is just for demo - shows example email
        emailInput.placeholder = "example@mail.com";
        
        // Optional: Add a small hint tooltip
        const wrapper = document.querySelector('.input-wrapper');
        if (wrapper) {
            const hint = document.createElement('div');
            hint.className = 'input-hint';
            hint.innerHTML = '<i class="fas fa-info-circle"></i> Enter your registered email';
            hint.style.cssText = 'font-size: 10px; color: #94a3b8; margin-top: 5px; display: flex; align-items: center; gap: 4px;';
            wrapper.parentElement.appendChild(hint);
        }
    }

    // Welcome Message
    function showWelcome() {
        setTimeout(() => {
            showToast('🔐 Enter your email to reset your password', false);
        }, 600);
    }

    // Initialize Everything
    function init() {
        if (form) {
            form.addEventListener('submit', handleSubmit);
        }
        
        if (contactSupport) {
            contactSupport.addEventListener('click', handleContactSupport);
        }
        
        if (resendEmail) {
            resendEmail.addEventListener('click', handleResendEmail);
        }
        
        initRealTimeValidation();
        initNavItems();
        initFloatingLabels();
        initKeyboardShortcuts();
        addDemoHint();
        animateFormCard();
        showWelcome();
    }

    init();
})();