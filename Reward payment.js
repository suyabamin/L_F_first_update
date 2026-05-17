// DOM Elements
const backBtn = document.getElementById('backBtn');
const rewardAmount = document.getElementById('rewardAmount');
const summaryAmount = document.getElementById('summaryAmount');
const totalAmount = document.getElementById('totalAmount');
const confirmBtn = document.getElementById('confirmPaymentBtn');
const paymentModal = document.getElementById('paymentModal');
const successModal = document.getElementById('successModal');
const closeSuccessBtn = document.getElementById('closeSuccessBtn');
const clearAmountBtn = document.getElementById('clearAmountBtn');
const mobileNumberContainer = document.getElementById('mobileNumberContainer');
const mobileNumber = document.getElementById('mobileNumber');
const toastContainer = document.getElementById('toastContainer');
const progressFill = document.querySelector('.progress-fill');
const transactionIdSpan = document.getElementById('transactionId');

let selectedMethod = null;
let progressInterval = null;

// Quick amount buttons
document.querySelectorAll('.quick-amount').forEach(btn => {
    btn.addEventListener('click', () => {
        const amount = btn.dataset.amount;
        rewardAmount.value = amount;
        updateAmountSummary();
        showToast(`Amount set to ৳ ${parseInt(amount).toLocaleString()}`, 'success');
    });
});

// Update amount summary
function updateAmountSummary() {
    let amount = parseInt(rewardAmount.value) || 0;
    if (amount < 10) amount = 10;
    summaryAmount.textContent = `৳ ${amount.toLocaleString()}`;
    totalAmount.textContent = `৳ ${amount.toLocaleString()}`;
}

rewardAmount.addEventListener('input', () => {
    let value = parseInt(rewardAmount.value);
    if (value < 0) rewardAmount.value = 0;
    updateAmountSummary();
});

clearAmountBtn.addEventListener('click', () => {
    rewardAmount.value = '';
    updateAmountSummary();
    rewardAmount.focus();
});

// Payment method selection
document.querySelectorAll('.method-tile').forEach(tile => {
    tile.addEventListener('click', () => {
        document.querySelectorAll('.method-tile').forEach(t => t.classList.remove('selected'));
        tile.classList.add('selected');
        selectedMethod = tile.dataset.method;
        
        // Show/hide mobile number field for mobile payments
        const mobileMethods = ['bkash', 'nagad', 'rocket'];
        if (mobileMethods.includes(selectedMethod)) {
            mobileNumberContainer.style.display = 'block';
        } else {
            mobileNumberContainer.style.display = 'none';
        }
        
        showToast(`${tile.querySelector('span').textContent} selected`, 'success');
    });
});

// Show toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Generate random transaction ID
function generateTransactionId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'TRX-';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Simulate payment processing
function processPayment() {
    const amount = parseInt(rewardAmount.value) || 0;
    
    if (amount < 50) {
        showToast('Minimum reward amount is 50 BDT', 'error');
        return false;
    }
    
    if (!selectedMethod) {
        showToast('Please select a payment method', 'error');
        return false;
    }
    
    const mobileMethods = ['bkash', 'nagad', 'rocket'];
    if (mobileMethods.includes(selectedMethod)) {
        const mobile = mobileNumber.value;
        if (!mobile || mobile.length < 10) {
            showToast('Please enter a valid mobile number', 'error');
            return false;
        }
    }
    
    return true;
}

// Start payment processing modal
function startPayment() {
    if (!processPayment()) return;
    
    paymentModal.classList.add('active');
    const modalTitle = document.querySelector('#paymentModal h3');
    const modalMessage = document.querySelector('#paymentModal p');
    
    let progress = 0;
    progressFill.style.width = '0%';
    
    progressInterval = setInterval(() => {
        progress += 10;
        progressFill.style.width = `${progress}%`;
        
        if (progress === 30) {
            modalTitle.textContent = 'Verifying Payment';
            modalMessage.textContent = 'Connecting to secure gateway...';
        } else if (progress === 60) {
            modalTitle.textContent = 'Processing Transaction';
            modalMessage.textContent = 'Please do not close this window...';
        } else if (progress >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
                paymentModal.classList.remove('active');
                showSuccessModal();
            }, 500);
        }
    }, 200);
}

// Show success modal
function showSuccessModal() {
    const transactionId = generateTransactionId();
    transactionIdSpan.textContent = transactionId;
    
    // Save to localStorage
    const paymentRecord = {
        transactionId: transactionId,
        amount: parseInt(rewardAmount.value),
        method: selectedMethod,
        mobile: mobileNumber.value,
        timestamp: new Date().toISOString()
    };
    
    const payments = JSON.parse(localStorage.getItem('reward_payments') || '[]');
    payments.push(paymentRecord);
    localStorage.setItem('reward_payments', JSON.stringify(payments));
    
    successModal.classList.add('active');
    showToast('Payment completed successfully!', 'success');
}

// Close success modal
closeSuccessBtn.addEventListener('click', () => {
    successModal.classList.remove('active');
    // Redirect or reset form
    setTimeout(() => {
        window.location.href = 'DashBoard.html';
    }, 500);
});

// Confirm payment
confirmBtn.addEventListener('click', startPayment);

// Back button
backBtn.addEventListener('click', () => {
    window.history.back();
});

// Close modals on overlay click
paymentModal.addEventListener('click', (e) => {
    if (e.target === paymentModal) {
        if (progressInterval) clearInterval(progressInterval);
        paymentModal.classList.remove('active');
        showToast('Payment cancelled', 'error');
    }
});

successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
        successModal.classList.remove('active');
    }
});

// Mobile number formatting
mobileNumber.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    e.target.value = value;
});

// Initialize default selected method (bKash)
document.querySelector('.method-tile[data-method="bkash"]').click();

// Update summary on load
updateAmountSummary();

// Add ripple effect to buttons
document.querySelectorAll('.method-tile, .btn-confirm-payment, .quick-amount').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = `${e.clientX - rect.left}px`;
        ripple.style.top = `${e.clientY - rect.top}px`;
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple styles
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .ripple {
        position: absolute;
        width: 100px;
        height: 100px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: rippleAnim 0.6s ease-out;
        pointer-events: none;
    }
    @keyframes rippleAnim {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);