// DOM Elements
const otpInputs = document.querySelectorAll('.otp-input');
const verifyBtn = document.getElementById('verifyBtn');
const resendBtn = document.getElementById('resendBtn');
const errorMessage = document.getElementById('errorMessage');
const timerSpan = document.getElementById('timer');
const timerContainer = document.getElementById('timerContainer');
const successModal = document.getElementById('successModal');
const errorModal = document.getElementById('errorModal');
const goToDashboardBtn = document.getElementById('goToDashboardBtn');
const closeErrorBtn = document.getElementById('closeErrorBtn');
const whatsappMethod = document.getElementById('whatsappMethod');
const smsMethod = document.getElementById('smsMethod');
const userEmailSpan = document.getElementById('userEmail');
const toastContainer = document.getElementById('toastContainer');

// State Variables
let timer = 60;
let timerInterval = null;
let isResendDisabled = true;
const correctOTP = "123456"; // In production, this would be verified server-side

// Set user email from localStorage or default
const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
userEmailSpan.textContent = userEmail;

// Show Toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Auto-tab between OTP inputs
function handleOtpInput(e, index) {
    const input = e.target;
    const value = input.value;
    
    // Allow only numbers
    input.value = value.replace(/[^0-9]/g, '');
    
    if (input.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
    }
}

function handleOtpKeydown(e, index) {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
        otpInputs[index - 1].focus();
    }
}

// Add event listeners to OTP inputs
otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => handleOtpInput(e, index));
    input.addEventListener('keydown', (e) => handleOtpKeydown(e, index));
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const numbers = pastedData.replace(/[^0-9]/g, '').split('');
        numbers.forEach((num, i) => {
            if (otpInputs[i]) {
                otpInputs[i].value = num;
            }
        });
        if (numbers.length === 6) {
            otpInputs[5].focus();
            setTimeout(() => verifyOTP(), 100);
        }
    });
});

// Get entered OTP
function getEnteredOTP() {
    let otp = '';
    otpInputs.forEach(input => {
        otp += input.value;
    });
    return otp;
}

// Verify OTP
function verifyOTP() {
    const enteredOTP = getEnteredOTP();
    
    if (enteredOTP.length !== 6) {
        showErrorMessage('Please enter the complete 6-digit code');
        return false;
    }
    
    if (enteredOTP === correctOTP) {
        // Success
        errorMessage.classList.remove('show');
        showToast('Verification successful! Redirecting...', 'success');
        showSuccessModal();
        return true;
    } else {
        // Error
        showErrorMessage('Invalid verification code. Please try again.');
        shakeOTPInputs();
        return false;
    }
}

function showErrorMessage(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 3000);
}

function shakeOTPInputs() {
    otpInputs.forEach(input => {
        input.classList.add('error');
        setTimeout(() => {
            input.classList.remove('error');
        }, 300);
    });
}

function showSuccessModal() {
    successModal.classList.add('active');
    
    // Auto redirect after 3 seconds
    setTimeout(() => {
        window.location.href = 'DashBoard.html';
    }, 3000);
}

function showErrorModal(message) {
    const errorModalMessage = document.getElementById('errorModalMessage');
    errorModalMessage.textContent = message || 'Invalid verification code. Please try again.';
    errorModal.classList.add('active');
}

// Start timer
function startTimer() {
    timer = 60;
    isResendDisabled = true;
    resendBtn.disabled = true;
    timerContainer.style.display = 'flex';
    
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        timer--;
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        timerSpan.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timer <= 0) {
            clearInterval(timerInterval);
            isResendDisabled = false;
            resendBtn.disabled = false;
            timerContainer.style.display = 'none';
        }
    }, 1000);
}

// Resend OTP
function resendOTP() {
    if (isResendDisabled) {
        showToast('Please wait before requesting another code', 'error');
        return;
    }
    
    // Simulate sending OTP
    showToast(`New verification code sent to ${userEmail}`, 'success');
    startTimer();
    
    // Clear OTP inputs
    otpInputs.forEach(input => {
        input.value = '';
    });
    otpInputs[0].focus();
}

// Alternative verification methods
function sendViaWhatsApp() {
    const phoneNumber = localStorage.getItem('userPhone') || '+8801XXXXXXXXX';
    showToast(`Verification link sent to ${phoneNumber} via WhatsApp`, 'success');
    setTimeout(() => {
        // Simulate receiving OTP
        otpInputs[0].value = '1';
        otpInputs[1].value = '2';
        otpInputs[2].value = '3';
        otpInputs[3].value = '4';
        otpInputs[4].value = '5';
        otpInputs[5].value = '6';
        showToast('Demo: OTP auto-filled for testing', 'info');
    }, 2000);
}

function sendViaSMS() {
    const phoneNumber = localStorage.getItem('userPhone') || '+8801XXXXXXXXX';
    showToast(`Verification code sent to ${phoneNumber} via SMS`, 'success');
}

// Event Listeners
verifyBtn.addEventListener('click', verifyOTP);

resendBtn.addEventListener('click', resendOTP);

goToDashboardBtn.addEventListener('click', () => {
    window.location.href = 'DashBoard.html';
});

closeErrorBtn.addEventListener('click', () => {
    errorModal.classList.remove('active');
    otpInputs.forEach(input => {
        input.value = '';
    });
    otpInputs[0].focus();
});

whatsappMethod.addEventListener('click', sendViaWhatsApp);
smsMethod.addEventListener('click', sendViaSMS);

// Close modals on overlay click
successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
        window.location.href = 'DashBoard.html';
    }
});

errorModal.addEventListener('click', (e) => {
    if (e.target === errorModal) {
        errorModal.classList.remove('active');
    }
});

// Enter key support
otpInputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            verifyOTP();
        }
    });
});

// Initialize timer on page load
startTimer();

// Focus first input on load
setTimeout(() => {
    otpInputs[0].focus();
}, 100);

// Demo: Auto-fill for testing (remove in production)
// Uncomment below for easier testing
/*
setTimeout(() => {
    if (window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1')) {
        otpInputs[0].value = '1';
        otpInputs[1].value = '2';
        otpInputs[2].value = '3';
        otpInputs[3].value = '4';
        otpInputs[4].value = '5';
        otpInputs[5].value = '6';
    }
}, 500);
*/