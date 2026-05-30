// DOM Elements
const backBtn = document.getElementById('backBtn');
const editProfileBtn = document.getElementById('editProfileBtn');
const profileModal = document.getElementById('profileModal');
const closeProfileModal = document.getElementById('closeProfileModal');
const cancelProfileBtn = document.getElementById('cancelProfileBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const draftBtn = document.getElementById('draftBtn');
const submitBtn = document.getElementById('submitBtn');
const successModal = document.getElementById('successModal');
const closeSuccessBtn = document.getElementById('closeSuccessBtn');
const toastContainer = document.getElementById('toastContainer');

// Profile display elements
const displayName = document.getElementById('displayName');
const displayNid = document.getElementById('displayNid');
const displayPhone = document.getElementById('displayPhone');
const displayEmail = document.getElementById('displayEmail');

// Edit inputs
const editName = document.getElementById('editName');
const editNid = document.getElementById('editNid');
const editPhone = document.getElementById('editPhone');
const editEmail = document.getElementById('editEmail');

// Form fields
const gdType = document.getElementById('gdType');
const incidentDate = document.getElementById('incidentDate');
const incidentTime = document.getElementById('incidentTime');
const incidentLocation = document.getElementById('incidentLocation');
const incidentDescription = document.getElementById('incidentDescription');
const referenceNo = document.getElementById('referenceNo');
const declarationCheck = document.getElementById('declarationCheck');

// File upload
const uploadBox = document.querySelector('.upload-box');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
let uploadedFiles = [];

// Set default full name to "xxxx"
displayName.innerText = 'xxxx';
editName.value = 'xxxx';

// Set today's date as default
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    if (incidentDate) incidentDate.value = today;
}

// Show Toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Load saved draft from localStorage
function loadDraft() {
    const draft = localStorage.getItem('gd_form_draft');
    if (draft) {
        const data = JSON.parse(draft);
        if (data.gdType) gdType.value = data.gdType;
        if (data.incidentDate) incidentDate.value = data.incidentDate;
        if (data.incidentTime) incidentTime.value = data.incidentTime;
        if (data.incidentLocation) incidentLocation.value = data.incidentLocation;
        if (data.incidentDescription) incidentDescription.value = data.incidentDescription;
        if (data.referenceNo) referenceNo.value = data.referenceNo;
        if (data.declaration) declarationCheck.checked = data.declaration;
        showToast('Draft loaded successfully', 'success');
    }
}

// Save draft
function saveDraft() {
    const draftData = {
        gdType: gdType.value,
        incidentDate: incidentDate.value,
        incidentTime: incidentTime.value,
        incidentLocation: incidentLocation.value,
        incidentDescription: incidentDescription.value,
        referenceNo: referenceNo.value,
        declaration: declarationCheck.checked,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('gd_form_draft', JSON.stringify(draftData));
    showToast('Draft saved to local storage', 'success');
}

// Clear draft after submission
function clearDraft() {
    localStorage.removeItem('gd_form_draft');
}

// Validate form
function validateForm() {
    if (!incidentDate.value) {
        showToast('Please select incident date', 'error');
        return false;
    }
    if (!incidentTime.value) {
        showToast('Please select incident time', 'error');
        return false;
    }
    if (!incidentLocation.value.trim()) {
        showToast('Please enter incident location', 'error');
        return false;
    }
    if (!incidentDescription.value.trim()) {
        showToast('Please provide incident description', 'error');
        return false;
    }
    if (!declarationCheck.checked) {
        showToast('Please accept the declaration', 'error');
        return false;
    }
    return true;
}

// Generate random GD reference
function generateGDRef() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `GD-${year}-${random}`;
}

// Submit form
async function submitForm() {
    if (!validateForm()) return;

    const gdReference = generateGDRef();
    const formData = new FormData();
    formData.append('reference', gdReference);
    formData.append('type', gdType.options[gdType.selectedIndex]?.text);
    formData.append('date', incidentDate.value);
    formData.append('time', incidentTime.value);
    formData.append('location', incidentLocation.value);
    formData.append('description', incidentDescription.value);
    formData.append('referenceNo', referenceNo.value);
    formData.append('applicant_name', displayName.innerText);
    formData.append('applicant_nid', displayNid.innerText);

    showToast('Submitting GD report...', 'info');

    try {
        const response = await fetch('backend-php/report.php', {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
            showToast(data.message || 'Report submission failed. Please login.', 'error');
            return;
        }
        
        // Clear draft
        clearDraft();
        
        // Show success modal with reference
        const refNumberDisplay = document.getElementById('refNumberDisplay');
        if (refNumberDisplay) refNumberDisplay.innerText = `Ref: ${gdReference}`;
        successModal.classList.add('active');
        
        // Reset form
        resetForm();
    } catch (error) {
        showToast('Server connection failed.', 'error');
    }
}


function resetForm() {
    setDefaultDate();
    incidentTime.value = '';
    incidentLocation.value = '';
    incidentDescription.value = '';
    referenceNo.value = '';
    declarationCheck.checked = false;
    uploadedFiles = [];
    renderFileList();
}

// File upload handling
uploadBox.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
            showToast(`${file.name} exceeds 5MB limit`, 'error');
            return;
        }
        uploadedFiles.push({ name: file.name, size: file.size });
    });
    renderFileList();
    fileInput.value = '';
});

function renderFileList() {
    fileList.innerHTML = uploadedFiles.map((file, index) => `
        <div class="file-tag">
            <i class="fas fa-file"></i>
            <span>${file.name.substring(0, 20)}</span>
            <i class="fas fa-times" onclick="removeFile(${index})"></i>
        </div>
    `).join('');
}

window.removeFile = function(index) {
    uploadedFiles.splice(index, 1);
    renderFileList();
    showToast('File removed', 'info');
};

// Profile edit modal
editProfileBtn.addEventListener('click', () => {
    editName.value = displayName.innerText;
    editNid.value = displayNid.innerText;
    editPhone.value = displayPhone.innerText;
    editEmail.value = displayEmail.innerText;
    profileModal.classList.add('active');
});

function closeProfileModalFunc() {
    profileModal.classList.remove('active');
}

closeProfileModal.addEventListener('click', closeProfileModalFunc);
cancelProfileBtn.addEventListener('click', closeProfileModalFunc);

saveProfileBtn.addEventListener('click', () => {
    if (editName.value.trim()) displayName.innerText = editName.value.trim();
    if (editNid.value.trim()) displayNid.innerText = editNid.value.trim();
    if (editPhone.value.trim()) displayPhone.innerText = editPhone.value.trim();
    if (editEmail.value.trim()) displayEmail.innerText = editEmail.value.trim();
    closeProfileModalFunc();
    showToast('Profile updated successfully', 'success');
});

// Close modals on overlay click
profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) closeProfileModalFunc();
});

successModal.addEventListener('click', (e) => {
    if (e.target === successModal) successModal.classList.remove('active');
});

closeSuccessBtn.addEventListener('click', () => {
    successModal.classList.remove('active');
});

// Event listeners
backBtn.addEventListener('click', () => {
    window.history.back();
});

draftBtn.addEventListener('click', saveDraft);
submitBtn.addEventListener('click', submitForm);

// Load draft on page load
setDefaultDate();
loadDraft();

// Update progress steps based on form completion
function updateProgressSteps() {
    const steps = document.querySelectorAll('.step');
    const hasIdentity = true; // always true
    const hasIncident = incidentLocation.value.trim() && incidentDescription.value.trim();
    
    if (hasIncident) {
        steps[1]?.classList.add('active');
        steps[2]?.classList.add('active');
    } else if (hasIdentity) {
        steps[1]?.classList.add('active');
    }
}

// Add input listeners to update progress
[incidentLocation, incidentDescription].forEach(field => {
    field?.addEventListener('input', updateProgressSteps);
});

// Initialize progress
updateProgressSteps();