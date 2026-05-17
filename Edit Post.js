// Edit Post - Fully Interactive JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const titleInput = document.getElementById('title');
    const descInput = document.getElementById('desc');
    const locationInput = document.getElementById('location');
    const categorySelect = document.getElementById('category');
    const statusSelect = document.getElementById('status');
    const dateInput = document.getElementById('date');
    const contactInput = document.getElementById('contact');
    const rewardInput = document.getElementById('reward');
    const saveBtn = document.getElementById('saveBtn');
    const discardBtn = document.getElementById('discardBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const favoriteBtn = document.getElementById('favoriteBtn');
    const shareBtn = document.getElementById('shareBtn');
    const previewBtn = document.getElementById('previewBtn');
    const fileInput = document.getElementById('fileInput');
    const photoGrid = document.getElementById('photoGrid');
    const toast = document.getElementById('toast');
    const charCountSpan = document.getElementById('charCount');
    const charProgressBar = document.getElementById('charProgressBar');
    
    // Modal Elements
    const successModal = document.getElementById('successModal');
    const deleteModal = document.getElementById('deleteModal');
    const viewListingBtn = document.getElementById('viewListingBtn');
    const continueEditBtn = document.getElementById('continueEditBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    
    // State
    let isFavorite = false;
    let selectedImages = [];
    const MAX_IMAGES = 5;
    const MAX_CHARS = 1000;
    
    // Sample existing images (simulating loaded post data)
    let existingImages = [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=200',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200',
    ];
    
    // Initialize character counter
    if (descInput && charCountSpan && charProgressBar) {
        const updateCharCounter = () => {
            const length = descInput.value.length;
            charCountSpan.textContent = length;
            const percentage = (length / MAX_CHARS) * 100;
            charProgressBar.style.width = `${Math.min(percentage, 100)}%`;
            
            if (length > MAX_CHARS) {
                descInput.value = descInput.value.slice(0, MAX_CHARS);
                charCountSpan.textContent = MAX_CHARS;
                showToast('Character limit reached!', 'warning');
            }
            
            // Color coding
            if (length > MAX_CHARS * 0.9) {
                charCountSpan.style.color = '#ef4444';
                charProgressBar.style.background = '#ef4444';
            } else if (length > MAX_CHARS * 0.7) {
                charCountSpan.style.color = '#f59e0b';
                charProgressBar.style.background = '#f59e0b';
            } else {
                charCountSpan.style.color = '#64748b';
                charProgressBar.style.background = 'linear-gradient(90deg, #00cfe8, #00b4cc)';
            }
        };
        
        descInput.addEventListener('input', updateCharCounter);
        updateCharCounter();
    }
    
    // Initialize photo gallery
    function renderPhotoGallery() {
        if (!photoGrid) return;
        
        photoGrid.innerHTML = '';
        
        // Display existing images
        existingImages.forEach((imgSrc, index) => {
            const photoBox = document.createElement('div');
            photoBox.className = 'photo-box';
            photoBox.innerHTML = `
                <img src="${imgSrc}" alt="Item photo ${index + 1}">
                <button class="photo-del" data-index="${index}" data-type="existing">
                    <i class="fas fa-times"></i>
                </button>
                <button class="favorite-overlay" onclick="event.stopPropagation(); toggleImageFavorite(this)">
                    <i class="far fa-heart"></i>
                </button>
            `;
            photoGrid.appendChild(photoBox);
        });
        
        // Display newly uploaded images
        selectedImages.forEach((img, index) => {
            const photoBox = document.createElement('div');
            photoBox.className = 'photo-box';
            photoBox.innerHTML = `
                <img src="${img.data}" alt="Uploaded photo ${index + 1}">
                <button class="photo-del" data-index="${index}" data-type="new">
                    <i class="fas fa-times"></i>
                </button>
                <button class="favorite-overlay" onclick="event.stopPropagation(); toggleImageFavorite(this)">
                    <i class="far fa-heart"></i>
                </button>
            `;
            photoGrid.appendChild(photoBox);
        });
        
        // Add delete handlers
        document.querySelectorAll('.photo-del').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                const type = btn.dataset.type;
                
                if (type === 'existing') {
                    existingImages.splice(index, 1);
                } else {
                    selectedImages.splice(index, 1);
                }
                renderPhotoGallery();
                showToast('Photo removed', 'info');
            });
        });
    }
    
    // Image upload handling
    function handleImageUpload(files) {
        const fileArray = Array.from(files);
        const totalImages = existingImages.length + selectedImages.length;
        const remainingSlots = MAX_IMAGES - totalImages;
        
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
                    file: file,
                    name: file.name
                });
                renderPhotoGallery();
            };
            reader.readAsDataURL(file);
        });
        
        if (fileInput) fileInput.value = '';
    }
    
    // File input handler
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleImageUpload(e.target.files);
            }
        });
    }
    
    // Upload placeholder click
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    if (uploadPlaceholder) {
        uploadPlaceholder.addEventListener('click', () => {
            if (fileInput) fileInput.click();
        });
    }
    
    // Toggle favorite for main button
    function toggleMainFavorite() {
        isFavorite = !isFavorite;
        const icon = favoriteBtn?.querySelector('i');
        const span = favoriteBtn?.querySelector('span');
        
        if (icon) {
            if (isFavorite) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                span.textContent = 'Saved to Favorites';
                favoriteBtn.classList.add('is-favorite');
                showToast('Added to favorites!', 'success');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                span.textContent = 'Add to Favorites';
                favoriteBtn.classList.remove('is-favorite');
                showToast('Removed from favorites', 'info');
            }
        }
    }
    
    // Global toggleImageFavorite function for images
    window.toggleImageFavorite = function(button) {
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.toggle('far');
            icon.classList.toggle('fas');
            if (icon.classList.contains('fas')) {
                showToast('Image saved to favorites', 'success');
            } else {
                showToast('Image removed from favorites', 'info');
            }
        }
    };
    
    // Save changes
    function saveChanges() {
        // Validate required fields
        const title = titleInput?.value.trim();
        const description = descInput?.value.trim();
        const location = locationInput?.value.trim();
        
        if (!title) {
            showToast('Please enter a title', 'error');
            titleInput?.focus();
            return;
        }
        
        if (title.length < 5) {
            showToast('Title must be at least 5 characters', 'error');
            return;
        }
        
        if (!description) {
            showToast('Please add a description', 'error');
            descInput?.focus();
            return;
        }
        
        if (description.length < 20) {
            showToast('Please provide more details (minimum 20 characters)', 'error');
            return;
        }
        
        if (!location) {
            showToast('Please specify a location', 'error');
            locationInput?.focus();
            return;
        }
        
        // Collect all data
        const updatedPost = {
            id: 'LF-90210',
            title: title,
            category: categorySelect?.value,
            status: statusSelect?.value,
            description: description,
            location: location,
            date: dateInput?.value,
            contact: contactInput?.value,
            reward: rewardInput?.value,
            images: [...existingImages, ...selectedImages.map(img => img.data)],
            updatedAt: new Date().toISOString()
        };
        
        // Save to localStorage
        let posts = JSON.parse(localStorage.getItem('lostFoundPosts') || '[]');
        const postIndex = posts.findIndex(p => p.id === 'LF-90210');
        if (postIndex !== -1) {
            posts[postIndex] = { ...posts[postIndex], ...updatedPost };
        } else {
            posts.unshift(updatedPost);
        }
        localStorage.setItem('lostFoundPosts', JSON.stringify(posts));
        localStorage.setItem('lastEditedPost', JSON.stringify(updatedPost));
        
        showToast('Changes saved successfully!', 'success');
        
        // Show success modal
        if (successModal) {
            successModal.classList.add('show');
        }
        
        // Trigger confetti
        triggerConfetti();
    }
    
    // Confetti effect
    function triggerConfetti() {
        const colors = ['#00cfe8', '#10b981', '#f59e0b', '#8b5cf6'];
        for (let i = 0; i < 60; i++) {
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
    
    // Discard changes
    function discardChanges() {
        if (confirm('Discard all unsaved changes?')) {
            resetFormToOriginal();
            showToast('Changes discarded', 'info');
        }
    }
    
    function resetFormToOriginal() {
        if (titleInput) titleInput.value = 'Found: Black Leather Wallet';
        if (descInput) descInput.value = 'Found near the food court on the third floor. Contains a local transit card and some cash. Please describe the brand and any distinctive marks to claim. Reward offered for honest return.';
        if (locationInput) locationInput.value = 'Food Court, 3rd Floor, Bashundhara City';
        if (categorySelect) categorySelect.value = 'personal';
        if (statusSelect) statusSelect.value = 'found';
        if (dateInput) dateInput.value = '2024-01-15';
        if (contactInput) contactInput.value = '+880 1XXX-XXXXXX';
        if (rewardInput) rewardInput.value = 'Small reward offered';
        
        existingImages = [
            'https://images.unsplash.com/photo-1627123424574-724758594e93?w=200',
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200',
        ];
        selectedImages = [];
        renderPhotoGallery();
        
        if (descInput) {
            const event = new Event('input');
            descInput.dispatchEvent(event);
        }
    }
    
    // Share post
    function sharePost() {
        const title = titleInput?.value || 'Lost & Found Item';
        if (navigator.share) {
            navigator.share({
                title: 'Lost & Found Listing',
                text: `Check out this item: ${title}`,
                url: window.location.href
            }).catch(() => showToast('Share cancelled', 'info'));
        } else {
            navigator.clipboard.writeText(window.location.href);
            showToast('Link copied to clipboard!', 'success');
        }
    }
    
    // Preview listing
    function previewListing() {
        showToast('Opening preview...', 'info');
        setTimeout(() => {
            // In production, open preview modal or new tab
            alert('Preview Mode:\n\n' + 
                  `Title: ${titleInput?.value}\n` +
                  `Category: ${categorySelect?.value}\n` +
                  `Status: ${statusSelect?.value}\n` +
                  `Location: ${locationInput?.value}\n` +
                  `Description: ${descInput?.value?.substring(0, 100)}...`);
        }, 300);
    }
    
    // Delete post
    function confirmDelete() {
        if (deleteModal) {
            deleteModal.classList.add('show');
        }
    }
    
    function performDelete() {
        // Remove from localStorage
        let posts = JSON.parse(localStorage.getItem('lostFoundPosts') || '[]');
        posts = posts.filter(p => p.id !== 'LF-90210');
        localStorage.setItem('lostFoundPosts', JSON.stringify(posts));
        
        showToast('Post deleted permanently', 'error');
        
        setTimeout(() => {
            // In production: window.location.href = 'Browse Listing.html';
            if (deleteModal) deleteModal.classList.remove('show');
            alert('Redirecting to listings page...');
        }, 800);
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
    
    // Event Listeners
    saveBtn?.addEventListener('click', saveChanges);
    discardBtn?.addEventListener('click', discardChanges);
    deleteBtn?.addEventListener('click', confirmDelete);
    favoriteBtn?.addEventListener('click', toggleMainFavorite);
    shareBtn?.addEventListener('click', sharePost);
    previewBtn?.addEventListener('click', previewListing);
    
    // Modal buttons
    viewListingBtn?.addEventListener('click', () => {
        if (successModal) successModal.classList.remove('show');
        showToast('Viewing your listing...', 'success');
    });
    
    continueEditBtn?.addEventListener('click', () => {
        if (successModal) successModal.classList.remove('show');
        showToast('Continue editing', 'info');
    });
    
    confirmDeleteBtn?.addEventListener('click', performDelete);
    cancelDeleteBtn?.addEventListener('click', () => {
        if (deleteModal) deleteModal.classList.remove('show');
    });
    
    // Close modals on background click
    [successModal, deleteModal].forEach(modal => {
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
            saveChanges();
        }
        if (e.key === 'Escape') {
            if (successModal?.classList.contains('show')) successModal.classList.remove('show');
            if (deleteModal?.classList.contains('show')) deleteModal.classList.remove('show');
        }
    });
    
    // Auto-save draft
    let autoSaveTimer;
    function startAutoSave() {
        autoSaveTimer = setInterval(() => {
            const draft = {
                title: titleInput?.value,
                description: descInput?.value,
                location: locationInput?.value,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('editDraft', JSON.stringify(draft));
            console.log('Draft auto-saved');
        }, 30000);
    }
    
    // Load draft if exists
    function loadDraft() {
        const draft = localStorage.getItem('editDraft');
        if (draft) {
            const draftData = JSON.parse(draft);
            if (draftData.title && confirm('Load your saved draft?')) {
                if (titleInput) titleInput.value = draftData.title;
                if (descInput) descInput.value = draftData.description;
                if (locationInput) locationInput.value = draftData.location;
                if (descInput) {
                    const event = new Event('input');
                    descInput.dispatchEvent(event);
                }
                showToast('Draft loaded!', 'success');
                localStorage.removeItem('editDraft');
            }
        }
    }
    
    // Initialize
    renderPhotoGallery();
    startAutoSave();
    loadDraft();
    
    // Update view count animation
    const viewCountSpan = document.getElementById('viewCount');
    if (viewCountSpan) {
        animateValue(viewCountSpan, 380, 412, 1000);
    }
    
    function animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                clearInterval(timer);
                current = end;
            }
            element.textContent = Math.floor(current);
        }, 16);
    }
    
    // Status change animation
    statusSelect?.addEventListener('change', () => {
        const value = statusSelect.value;
        let message = '';
        if (value === 'lost') message = '⚠️ Status changed to Lost';
        else if (value === 'found') message = '✅ Status changed to Found';
        else message = '🔵 Status changed to Resolved';
        showToast(message, 'info');
    });
    
    console.log('Edit Post page loaded successfully!');
});