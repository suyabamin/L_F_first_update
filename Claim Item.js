// Claim Item - Interactive JavaScript with Form Validation
(function() {
    'use strict';

    // DOM Elements
    const claimForm = document.getElementById('claimForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const proofDetailsInput = document.getElementById('proofDetails');
    const confirmCheckbox = document.getElementById('confirmCheck');
    const cancelBtn = document.getElementById('cancelBtn');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const refIdSpan = document.getElementById('refId');
    const submitDateSpan = document.getElementById('submitDate');
    const toast = document.getElementById('toast');
    const claimItemIdInput = document.getElementById('claimItemId');

    // Error message elements
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const phoneError = document.getElementById('phoneError');
    const proofError = document.getElementById('proofError');
    const confirmError = document.getElementById('confirmError');

    // Show Toast
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

    // Validate Phone (Bangladesh format)
    function validatePhone(phone) {
        const re = /^(?:\+880|0|00880)?1[3-9]\d{8}$/;
        return re.test(phone);
    }

    // Validate Form
    function validateForm() {
        let isValid = true;
        
        // Name validation
        if (!fullNameInput.value.trim()) {
            nameError.textContent = 'Full name is required';
            nameError.classList.add('show');
            fullNameInput.classList.add('error');
            isValid = false;
        } else if (fullNameInput.value.trim().length < 3) {
            nameError.textContent = 'Name must be at least 3 characters';
            nameError.classList.add('show');
            fullNameInput.classList.add('error');
            isValid = false;
        } else {
            nameError.classList.remove('show');
            fullNameInput.classList.remove('error');
        }
        
        // Email validation
        if (!emailInput.value.trim()) {
            emailError.textContent = 'Email address is required';
            emailError.classList.add('show');
            emailInput.classList.add('error');
            isValid = false;
        } else if (!validateEmail(emailInput.value.trim())) {
            emailError.textContent = 'Please enter a valid email address';
            emailError.classList.add('show');
            emailInput.classList.add('error');
            isValid = false;
        } else {
            emailError.classList.remove('show');
            emailInput.classList.remove('error');
        }
        
        // Phone validation
        if (!phoneInput.value.trim()) {
            phoneError.textContent = 'Phone number is required';
            phoneError.classList.add('show');
            phoneInput.classList.add('error');
            isValid = false;
        } else if (!validatePhone(phoneInput.value.trim())) {
            phoneError.textContent = 'Please enter a valid Bangladesh phone number (e.g., 017XXXXXXXX)';
            phoneError.classList.add('show');
            phoneInput.classList.add('error');
            isValid = false;
        } else {
            phoneError.classList.remove('show');
            phoneInput.classList.remove('error');
        }
        
        // Proof details validation
        if (!proofDetailsInput.value.trim()) {
            proofError.textContent = 'Please provide ownership proof details';
            proofError.classList.add('show');
            proofDetailsInput.classList.add('error');
            isValid = false;
        } else if (proofDetailsInput.value.trim().length < 20) {
            proofError.textContent = 'Please provide at least 20 characters of detailed description';
            proofError.classList.add('show');
            proofDetailsInput.classList.add('error');
            isValid = false;
        } else {
            proofError.classList.remove('show');
            proofDetailsInput.classList.remove('error');
        }
        
        // Checkbox validation
        if (!confirmCheckbox.checked) {
            confirmError.textContent = 'You must confirm that you are the rightful owner';
            confirmError.classList.add('show');
            isValid = false;
        } else {
            confirmError.classList.remove('show');
        }
        
        return isValid;
    }

    // Generate Reference ID
    function generateReferenceId() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `CLM-${year}${month}${day}-${random}`;
    }

    // Format Date
    function formatDate() {
        const now = new Date();
        return now.toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short'
        });
    }

    // Show Success Modal
    function showSuccessModal() {
        const refId = generateReferenceId();
        const submitDate = formatDate();
        
        if (refIdSpan) refIdSpan.textContent = refId;
        if (submitDateSpan) submitDateSpan.textContent = submitDate;
        
        if (successModal) {
            successModal.classList.add('show');
        }
    }

    // Hide Modal
    function hideModal() {
        if (successModal) {
            successModal.classList.remove('show');
        }
    }

    // Reset Form
    function resetForm() {
        claimForm.reset();
        fullNameInput.classList.remove('error');
        emailInput.classList.remove('error');
        phoneInput.classList.remove('error');
        proofDetailsInput.classList.remove('error');
        
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => {
            error.classList.remove('show');
        });
    }

    // Handle Form Submit
    function handleSubmit(e) {
        e.preventDefault();
        
        if (validateForm()) {
            const params = new URLSearchParams(window.location.search);
            const itemId = params.get('item_id') || params.get('id') || '1';
            if (claimItemIdInput) {
                claimItemIdInput.value = itemId;
            }

            // Collect form data
            const formData = {
                fullName: fullNameInput.value.trim(),
                email: emailInput.value.trim(),
                phone: phoneInput.value.trim(),
                nid: document.getElementById('nid')?.value.trim() || '',
                proofDetails: proofDetailsInput.value.trim(),
                additionalInfo: document.getElementById('additionalInfo')?.value.trim() || '',
                submittedAt: new Date().toISOString()
            };
            
            showToast('Submitting claim...', false);
            const body = new FormData(claimForm);
            fetch(claimForm.action, {
                method: 'POST',
                body,
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
            })
                .then((r) => r.json().then((data) => ({ res: r, data })))
                .then(({ res, data }) => {
                    if (!res.ok || !data.success) {
                        showToast(data.message || 'Claim failed. Please login.', true);
                        if (res.status === 401) setTimeout(() => { window.location.href = 'Login.html'; }, 900);
                        return;
                    }
                    showSuccessModal();
                    showToast('Claim submitted successfully!', false);
                    resetForm();
                })
                .catch(() => showToast('Server connection failed.', true));
            return;
            
            // Reset form
            resetForm();
            
            // Show toast
            showToast('✓ Claim submitted successfully! Check your email for confirmation', false);
        } else {
            showToast('Please fix the errors in the form', true);
            // Scroll to first error
            const firstError = document.querySelector('.error-message.show');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    // Handle Cancel
    function handleCancel() {
        if (confirm('Are you sure you want to cancel? Your entered information will be lost.')) {
            resetForm();
            showToast('Form cleared', false);
        }
    }

    // Real-time validation helpers
    function addRealTimeValidation() {
        fullNameInput.addEventListener('input', () => {
            if (fullNameInput.value.trim()) {
                nameError.classList.remove('show');
                fullNameInput.classList.remove('error');
            }
        });
        
        emailInput.addEventListener('input', () => {
            if (emailInput.value.trim() && validateEmail(emailInput.value.trim())) {
                emailError.classList.remove('show');
                emailInput.classList.remove('error');
            }
        });
        
        phoneInput.addEventListener('input', () => {
            if (phoneInput.value.trim() && validatePhone(phoneInput.value.trim())) {
                phoneError.classList.remove('show');
                phoneInput.classList.remove('error');
            }
        });
        
        proofDetailsInput.addEventListener('input', () => {
            if (proofDetailsInput.value.trim().length >= 20) {
                proofError.classList.remove('show');
                proofDetailsInput.classList.remove('error');
            }
        });
        
        confirmCheckbox.addEventListener('change', () => {
            if (confirmCheckbox.checked) {
                confirmError.classList.remove('show');
            }
        });
    }

    // Nav Link Handlers
    function initNavLinks() {
        const navLinks = document.querySelectorAll('.nav-list a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href') === '#') {
                    e.preventDefault();
                    showToast('Navigation coming soon', false);
                }
            });
        });
    }

    // Keyboard Shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape to close modal
            if (e.key === 'Escape' && successModal && successModal.classList.contains('show')) {
                hideModal();
            }
        });
    }

    // Close modal on outside click
    function initModalClose() {
        if (successModal) {
            successModal.addEventListener('click', (e) => {
                if (e.target === successModal) {
                    hideModal();
                }
            });
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', hideModal);
        }
    }

    // Animate Stats (if any)
    function animateElements() {
        const elements = document.querySelectorAll('.item-summary, .card, .process-steps');
        elements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // Welcome Message
    function showWelcome() {
        setTimeout(() => {
            showToast('📝 Fill out the form to claim your lost item', false);
        }, 800);
    }

    // Initialize Everything
    function init() {
        if (claimForm) {
            claimForm.addEventListener('submit', handleSubmit);
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', handleCancel);
        }
        
        addRealTimeValidation();
        initNavLinks();
        initKeyboardShortcuts();
        initModalClose();
        animateElements();
        showWelcome();
    }

    init();
})();
