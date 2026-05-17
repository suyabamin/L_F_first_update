// DOM Elements
const navBack = document.getElementById('nav-back');
const startBtn = document.getElementById('startBtn');
const takeBtn = document.getElementById('takeBtn');
const retakeBtn = document.getElementById('retakeBtn');
const submitBtn = document.getElementById('submitBtn');
const goToDashboardBtn = document.getElementById('goToDashboardBtn');
const successModal = document.getElementById('successModal');
const nidInput = document.getElementById('nidInput');
const dobInput = document.getElementById('dobInput');
const reviewPreview = document.getElementById('reviewPreview');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const cameraPreview = document.getElementById('cameraPreview');
const placeholderAvatar = document.getElementById('placeholderAvatar');
const toastContainer = document.getElementById('toastContainer');

// State
let currentStep = 0;
let stream = null;
let capturedImage = null;
let isCameraActive = false;

// Show Toast
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// Step Management
function showStep(step) {
  if (step < 0 || step > 2) return;
  
  // Hide all steps
  document.querySelectorAll('.nid-step').forEach(s => s.classList.add('hidden'));
  document.getElementById(`step-${step}`).classList.remove('hidden');
  
  // Update dots
  document.querySelectorAll('.dot').forEach((dot, index) => {
    if (index === step) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
  
  currentStep = step;
  
  // Handle camera on step 1
  if (step === 1) {
    startCamera();
  } else if (step === 0 && isCameraActive) {
    stopCamera();
  }
}

// Camera Functions
async function startCamera() {
  if (isCameraActive) return;
  
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
    isCameraActive = true;
    
    if (placeholderAvatar) {
      placeholderAvatar.style.display = 'none';
    }
    if (cameraPreview) {
      cameraPreview.style.display = 'block';
    }
    
    showToast('Camera activated. Position your face in the frame.', 'success');
  } catch (err) {
    console.error('Camera error:', err);
    showToast('Unable to access camera. Please check permissions.', 'error');
    
    if (placeholderAvatar) {
      placeholderAvatar.style.display = 'flex';
    }
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  isCameraActive = false;
}

function capturePhoto() {
  if (!video.videoWidth || !video.videoHeight) {
    showToast('Camera not ready. Please wait.', 'error');
    return;
  }
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  capturedImage = canvas.toDataURL('image/jpeg', 0.8);
  reviewPreview.src = capturedImage;
  
  stopCamera();
  showStep(2);
  showToast('Photo captured successfully!', 'success');
}

// Validation Functions
function validateNID(nid) {
  const nidRegex = /^\d{17}$/;
  return nidRegex.test(nid);
}

function validateDOB(dob) {
  const dobRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19[0-9]{2}|20[0-9]{2})$/;
  return dobRegex.test(dob);
}

function submitVerification() {
  const nid = nidInput.value.trim();
  const dob = dobInput.value.trim();
  
  if (!nid) {
    showToast('Please enter your NID number', 'error');
    nidInput.focus();
    return false;
  }
  
  if (!validateNID(nid)) {
    showToast('Please enter a valid 17-digit NID number', 'error');
    nidInput.focus();
    return false;
  }
  
  if (!dob) {
    showToast('Please enter your date of birth', 'error');
    dobInput.focus();
    return false;
  }
  
  if (!validateDOB(dob)) {
    showToast('Please enter a valid date of birth (DD/MM/YYYY)', 'error');
    dobInput.focus();
    return false;
  }
  
  if (!capturedImage) {
    showToast('Please take a selfie before submitting', 'error');
    showStep(1);
    return false;
  }
  
  return true;
}

function processVerification() {
  if (!submitVerification()) return;
  
  // Store verification data
  const verificationData = {
    nid: nidInput.value.trim(),
    dob: dobInput.value.trim(),
    selfie: capturedImage,
    verifiedAt: new Date().toISOString()
  };
  
  localStorage.setItem('nid_verification', JSON.stringify(verificationData));
  localStorage.setItem('isVerified', 'true');
  
  showSuccessModal();
}

function showSuccessModal() {
  successModal.classList.add('active');
  
  // Auto redirect after 3 seconds
  setTimeout(() => {
    window.location.href = 'DashBoard.html';
  }, 3000);
}

// Event Listeners
startBtn.addEventListener('click', () => {
  const nid = nidInput.value.trim();
  const dob = dobInput.value.trim();
  
  if (!nid) {
    showToast('Please enter your NID number first', 'error');
    nidInput.focus();
    return;
  }
  
  if (!validateNID(nid)) {
    showToast('Please enter a valid 17-digit NID number', 'error');
    return;
  }
  
  if (!dob) {
    showToast('Please enter your date of birth', 'error');
    dobInput.focus();
    return;
  }
  
  if (!validateDOB(dob)) {
    showToast('Please enter a valid date of birth (DD/MM/YYYY)', 'error');
    return;
  }
  
  showStep(1);
});

takeBtn.addEventListener('click', capturePhoto);
retakeBtn.addEventListener('click', () => {
  showStep(1);
});
submitBtn.addEventListener('click', processVerification);

// Back button
navBack.addEventListener('click', () => {
  if (currentStep > 0) {
    showStep(currentStep - 1);
  } else {
    window.history.back();
  }
});

// Dot navigation
document.querySelectorAll('.dot').forEach(dot => {
  dot.addEventListener('click', () => {
    const step = parseInt(dot.dataset.step);
    if (step <= currentStep) {
      showStep(step);
    } else {
      showToast('Please complete the current step first', 'error');
    }
  });
});

// Go to dashboard
goToDashboardBtn.addEventListener('click', () => {
  window.location.href = 'DashBoard.html';
});

// Success modal close on overlay click
successModal.addEventListener('click', (e) => {
  if (e.target === successModal) {
    window.location.href = 'DashBoard.html';
  }
});

// Format DOB input
dobInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length >= 2 && value.length < 4) {
    value = value.slice(0, 2) + '/' + value.slice(2);
  } else if (value.length >= 4) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4, 8);
  }
  e.target.value = value;
});

// Restrict NID to numbers only
nidInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 17);
});

// Initialize
showStep(0);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
});