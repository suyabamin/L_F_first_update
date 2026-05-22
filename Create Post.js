// Create Post - Fully Interactive JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const titleInput = document.getElementById('title');
    const createPostForm = document.getElementById('createPostForm');
    const descInput = document.getElementById('desc');
    const locationInput = document.getElementById('location');
    const dateInput = document.getElementById('date');
    const contactInput = document.getElementById('contact');
    const publishBtn = document.getElementById('publishBtn');
    const discardBtn = document.getElementById('discardBtn');
    const helpBtn = document.getElementById('helpBtn');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewGrid = document.getElementById('previewGrid');
    const charCountSpan = document.getElementById('charCount');
    const charProgressBar = document.getElementById('charProgressBar');
    const toast = document.getElementById('toast');
    const successModal = document.getElementById('successModal');
    const viewPostBtn = document.getElementById('viewPostBtn');
    const createAnotherBtn = document.getElementById('createAnotherBtn');
    
    // Custom Select
    const customSelect = document.getElementById('categorySelect');
    const selectTrigger = customSelect?.querySelector('.select-trigger');
    const selectOptions = document.querySelectorAll('.select-option');
    const categoryHidden = document.getElementById('category');
    
    // State
    let selectedImages = [];
    let currentCategory = 'electronics';
    let currentStatus = 'lost';
    const MAX_IMAGES = 5;
    const MAX_CHARS = 500;
    
    // Set default date to today
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    // Character counter for description
    if (descInput && charCountSpan && charProgressBar) {
        descInput.addEventListener('input', () => {
            const length = descInput.value.length;
            charCountSpan.textContent = length;
            const percentage = (length / MAX_CHARS) * 100;
            charProgressBar.style.width = `${Math.min(percentage, 100)}%`;
            
            if (length > MAX_CHARS) {
                descInput.value = descInput.value.slice(0, MAX_CHARS);
                charCountSpan.textContent = MAX_CHARS;
                showToast('Character limit reached!', 'warning');
            }
            
            // Color change when approaching limit
            if (length > MAX_CHARS * 0.9) {
                charCountSpan.style.color = '#ef4444';
                charProgressBar.style.background = '#ef4444';
            } else if (length > MAX_CHARS * 0.7) {
                charCountSpan.style.color = '#f59e0b';
                charProgressBar.style.background = '#f59e0b';
            } else {
                charCountSpan.style.color = '#64748b';
                charProgressBar.style.background = 'linear-gradient(90deg, #00cfe8, #8b5cf6)';
            }
        });
    }
    
    // Custom Select functionality
    if (customSelect && selectTrigger) {
        selectTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            customSelect.classList.toggle('open');
        });
        
        selectOptions.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                const icon = option.dataset.icon;
                const text = option.textContent.trim();
                
                currentCategory = value;
                categoryHidden.value = value;
                
                // Update trigger display
                selectTrigger.innerHTML = `
                    <i class="fas ${icon}"></i>
                    <span>${text}</span>
                    <i class="fas fa-chevron-down"></i>
                `;
                
                customSelect.classList.remove('open');
                showToast(`Category changed to ${text}`, 'info');
            });
        });
        
        // Close select when clicking outside
        document.addEventListener('click', () => {
            customSelect.classList.remove('open');
        });
    }
    
    // Status toggle
    const lostRadio = document.getElementById('lost');
    const foundRadio = document.getElementById('found');
    
    if (lostRadio && foundRadio) {
        lostRadio.addEventListener('change', () => {
            if (lostRadio.checked) currentStatus = 'lost';
        });
        foundRadio.addEventListener('change', () => {
            if (foundRadio.checked) currentStatus = 'found';
        });
    }
    
    // Image handling
    function handleFiles(files) {
        const fileArray = Array.from(files);
        const remainingSlots = MAX_IMAGES - selectedImages.length;
        
        if (fileArray.length > remainingSlots) {
            showToast(`You can only add ${remainingSlots} more image(s)`, 'warning');
            return;
        }
        
        fileArray.forEach(file => {
            if (!file.type.startsWith('image/')) {
                showToast('Only image files are allowed', 'error');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                showToast('Image size should be less than 5MB', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                selectedImages.push({
                    id: Date.now() + Math.random(),
                    data: e.target.result,
                    file: file
                });
                renderPreviewGrid();
            };
            reader.readAsDataURL(file);
        });
        
        // Keep the native file input value so PHP can receive images[] on submit.
    }
    
    function renderPreviewGrid() {
        if (!previewGrid) return;
        
        previewGrid.innerHTML = '';
        selectedImages.forEach((img, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${img.data}" alt="Preview ${index + 1}">
                <button class="preview-remove" data-id="${img.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            previewGrid.appendChild(previewItem);
        });
        
        // Add remove functionality
        document.querySelectorAll('.preview-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseFloat(btn.dataset.id);
                selectedImages = selectedImages.filter(img => img.id !== id);
                renderPreviewGrid();
                showToast('Image removed', 'info');
            });
        });
    }
    
    // Drop zone functionality
    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFiles(e.target.files);
            }
        });
        
        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length) {
                handleFiles(files);
            }
        });
    }
    
    // Form validation
    function validateForm() {
        const title = titleInput?.value.trim();
        const description = descInput?.value.trim();
        const location = locationInput?.value.trim();
        
        if (!title) {
            showToast('Please enter an item title', 'error');
            titleInput?.focus();
            return false;
        }
        
        if (title.length < 5) {
            showToast('Title must be at least 5 characters', 'error');
            return false;
        }
        
        if (!description) {
            showToast('Please add a description', 'error');
            descInput?.focus();
            return false;
        }
        
        if (description.length < 20) {
            showToast('Please provide more details (minimum 20 characters)', 'error');
            return false;
        }
        
        if (!location) {
            showToast('Please specify a location', 'error');
            locationInput?.focus();
            return false;
        }
        
        return true;
    }
    
    async function publishPost(e) {
        e.preventDefault();
        if (!validateForm()) return;

        const formData = new FormData(createPostForm);
        formData.delete('images[]');
        selectedImages.forEach((image) => formData.append('images[]', image.file));

        publishBtn.disabled = true;
        showToast('Publishing post...', 'info');

        try {
            const response = await fetch(createPostForm.action, {
                method: 'POST',
                body: formData,
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                showToast(data.message || 'Could not publish post. Please login first.', 'error');
                if (response.status === 401) setTimeout(() => { window.location.href = 'Login.html'; }, 900);
                return;
            }
            localStorage.removeItem('postDraft');
            if (successModal) successModal.classList.add('show');
            triggerConfetti();
            viewPostBtn.onclick = () => { window.location.href = data.redirect || `Post Details.html?id=${data.id}`; };
        } catch {
            showToast('Server connection failed. Run: npm start', 'error');
        } finally {
            publishBtn.disabled = false;
        }
    }
    
    // Confetti effect on success
    function triggerConfetti() {
        const colors = ['#00cfe8', '#8b5cf6', '#10b981', '#f59e0b'];
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
                animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
            `;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }
    }
    
    // Add confetti animation style
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
    
    // Reset form
    function resetForm() {
        if (titleInput) titleInput.value = '';
        if (descInput) {
            descInput.value = '';
            charCountSpan.textContent = '0';
            charProgressBar.style.width = '0%';
        }
        if (locationInput) locationInput.value = '';
        if (contactInput) contactInput.value = '';
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
        
        // Reset category
        currentCategory = 'electronics';
        categoryHidden.value = 'electronics';
        if (selectTrigger) {
            selectTrigger.innerHTML = `
                <i class="fas fa-laptop"></i>
                <span>Electronics</span>
                <i class="fas fa-chevron-down"></i>
            `;
        }
        
        // Reset status
        if (lostRadio) lostRadio.checked = true;
        currentStatus = 'lost';
        
        // Clear images
        selectedImages = [];
        if (previewGrid) previewGrid.innerHTML = '';
        
        showToast('Form has been reset', 'info');
    }
    
    // Show toast notification
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
    
    // Event listeners
    createPostForm?.addEventListener('submit', publishPost);
    discardBtn?.addEventListener('click', resetForm);
    
    // Modal buttons
    viewPostBtn?.addEventListener('click', () => {
        if (successModal) successModal.classList.remove('show');
        showToast('Redirecting to post details...', 'success');
        // Simulate navigation
        setTimeout(() => {
            // In production: window.location.href = 'backend-php/post_details_view.php';
        }, 500);
    });
    
    createAnotherBtn?.addEventListener('click', () => {
        if (successModal) successModal.classList.remove('show');
        resetForm();
        showToast('Ready for your next post!', 'success');
    });
    
    // Close modal on background click
    successModal?.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.classList.remove('show');
        }
    });
    
    // Help button
    helpBtn?.addEventListener('click', () => {
        showToast('📞 Support team is online! Chat with us.', 'info');
    });
    
    // Live preview of title in console (for demo)
    titleInput?.addEventListener('input', (e) => {
        const preview = e.target.value;
        if (preview.length > 0) {
            // Just for demo - shows title is being typed
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            createPostForm?.requestSubmit();
        }
        if (e.key === 'Escape' && successModal?.classList.contains('show')) {
            successModal.classList.remove('show');
        }
    });
    
    // Auto-save draft functionality
    let autoSaveInterval;
    function startAutoSave() {
        autoSaveInterval = setInterval(() => {
            const title = titleInput?.value.trim();
            if (title && title.length > 0) {
                const draft = {
                    title: titleInput?.value,
                    description: descInput?.value,
                    location: locationInput?.value,
                    date: dateInput?.value,
                    contact: contactInput?.value,
                    category: currentCategory,
                    status: currentStatus,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('postDraft', JSON.stringify(draft));
                console.log('Draft auto-saved');
            }
        }, 30000); // Auto-save every 30 seconds
    }
    
    // Load draft if exists
    function loadDraft() {
        const draft = localStorage.getItem('postDraft');
        if (draft) {
            const draftData = JSON.parse(draft);
            if (draftData.title && confirm('Load your saved draft?')) {
                if (titleInput) titleInput.value = draftData.title;
                if (descInput) descInput.value = draftData.description;
                if (locationInput) locationInput.value = draftData.location;
                if (dateInput && draftData.date) dateInput.value = draftData.date;
                if (contactInput) contactInput.value = draftData.contact;
                if (descInput) {
                    const event = new Event('input');
                    descInput.dispatchEvent(event);
                }
                showToast('Draft loaded!', 'success');
                localStorage.removeItem('postDraft');
            }
        }
    }
    
    startAutoSave();
    loadDraft();
    
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
    
    console.log('Create Post page loaded successfully!');
});
