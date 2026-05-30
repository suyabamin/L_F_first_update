const listingData = {
    id: null,
    user_id: null,
    title: 'Loading...',
    category: '',
    status: 'Found',
    location: '',
    time: 'Just now',
    postedDate: '—',
    postedBy: '—',
    views: 0,
    description: '',
    refId: '#LF-—',
    slides: [{ icon: 'fa-box', label: 'Item' }],
    isFavorite: false
};

// Global variables
let slideIndex = 0;
let isFavorited = false;
let currentAction = null;

// DOM Elements
const detailTitle = document.getElementById('detailTitle');
const headLoc = document.getElementById('headLoc');
const headTime = document.getElementById('headTime');
const viewCount = document.getElementById('viewCount');
const detailDesc = document.getElementById('detailDesc');
const statusChip = document.getElementById('statusChip');
const categoryChip = document.getElementById('categoryChip');
const chipLocation = document.getElementById('chipLocation');
const mapLocationText = document.getElementById('mapLocationText');
const sumStatus = document.getElementById('sumStatus');
const sumCat = document.getElementById('sumCat');
const refId = document.getElementById('refId');
const postedDate = document.getElementById('postedDate');
const postedBy = document.getElementById('postedBy');
const heroStatusBadge = document.getElementById('heroStatusBadge');
const carouselTrack = document.getElementById('carouselTrack');
const carouselDots = document.getElementById('carouselDots');
const breadCategoryLink = document.getElementById('breadCategoryLink');

// Modal elements
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const confirmModalBtn = document.getElementById('confirmModalBtn');

// Toast function
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Render listing details
function renderListing() {
    detailTitle.textContent = listingData.title;
    headLoc.textContent = listingData.location;
    headTime.textContent = listingData.time;
    viewCount.textContent = listingData.views;
    detailDesc.textContent = listingData.description;
    chipLocation.textContent = listingData.location;
    mapLocationText.textContent = listingData.location;
    sumStatus.textContent = listingData.status;
    sumCat.textContent = listingData.category;
    refId.textContent = listingData.refId;
    postedDate.textContent = listingData.postedDate;
    postedBy.textContent = listingData.postedBy;
    
    // Status badge and chip styling
    const isLost = listingData.status.toLowerCase() === 'lost';
    heroStatusBadge.textContent = listingData.status;
    heroStatusBadge.setAttribute('data-status', listingData.status.toLowerCase());
    
    statusChip.textContent = listingData.status;
    statusChip.classList.add(isLost ? 'chip-lost' : 'chip-found');
    categoryChip.textContent = listingData.category;
    
    // Breadcrumb
    breadCategoryLink.textContent = listingData.category;
    breadCategoryLink.href = `Browse Listing.html?category=${encodeURIComponent(listingData.category)}`;
}

// Render carousel
function renderCarousel() {
    carouselTrack.innerHTML = listingData.slides.map((slide) => `
        <div class="carousel-slide">
            ${slide.src ? `<img src="/${String(slide.src).replace(/^\//, '')}" alt="${slide.label}" style="max-height:220px;border-radius:12px;">` : `<i class="fas ${slide.icon}"></i><span>${slide.label}</span>`}
        </div>
    `).join('');
    
    // Create dots
    carouselDots.innerHTML = listingData.slides.map((_, index) => `
        <div class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
    `).join('');
    
    // Add dot click events
    document.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', () => {
            slideIndex = parseInt(dot.dataset.index);
            updateCarousel();
        });
    });
}

function updateCarousel() {
    carouselTrack.style.transform = `translateX(-${slideIndex * 100}%)`;
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === slideIndex);
    });
}

function slideCarousel(direction) {
    slideIndex = (slideIndex + direction + listingData.slides.length) % listingData.slides.length;
    updateCarousel();
}

// Favorite toggle
async function toggleFavorite() {
    if (!listingData.id) return;
    try {
        const { res, data } = await LF.api('favorite.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_id: listingData.id })
        });
        if (!res.ok) {
            showToast(data?.message || 'Please login to save favorites', 'error');
            if (res.status === 401) setTimeout(() => { window.location.href = 'Login.html'; }, 800);
            return;
        }
        isFavorited = data.favorited;
        listingData.isFavorite = isFavorited;
        const favIcons = document.querySelectorAll('#favBtnTop i, #favBtnSide i');
        favIcons.forEach((icon) => {
            icon.classList.toggle('far', !isFavorited);
            icon.classList.toggle('fas', isFavorited);
        });
        showToast(isFavorited ? 'Added to favorites' : 'Removed from favorites', 'success');
    } catch {
        showToast('Could not update favorites', 'error');
    }
}

// Modal functions
function openModal(action, title, message) {
    currentAction = action;
    modalTitle.textContent = title;
    modalContent.innerHTML = `<p>${message}</p>`;
    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
    currentAction = null;
}

function confirmModalAction() {
    if (currentAction === 'chat') {
        showToast('Opening conversation...', 'info');
        try {
            const { res, data } = await LF.api('start_conversation.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: listingData.id }) });
            if (!res.ok || !data?.success) {
                showToast(data?.message || 'Could not start conversation', 'error');
                if (res.status === 401) setTimeout(() => { window.location.href = 'Login.html'; }, 600);
                return;
            }
            const convId = data.conversation_id;
            showToast('Opening chat...', 'success');
            setTimeout(() => { window.location.href = `Chat.html?conversation_id=${convId}`; }, 250);
        } catch (err) {
            showToast('Server error while starting conversation', 'error');
        }
    } else if (currentAction === 'claim') {
        window.location.href = `Claim Item.html?item_id=${listingData.id}`;
    } else if (currentAction === 'report') {
        LF.api('report.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_id: listingData.id, reason: 'Suspicious listing', details: 'Reported from post details page' })
        }).then(({ res, data }) => {
            showToast(res.ok ? (data.message || 'Report submitted.') : (data?.message || 'Report failed'), res.ok ? 'success' : 'error');
        });
        closeModal();
    } else if (currentAction === 'share') {
        navigator.clipboard.writeText(window.location.href);
        showToast('🔗 Link copied to clipboard!', 'success');
        closeModal();
    } else if (currentAction === 'support') {
        showToast('📧 Support email: support@lostfound.com', 'success');
        closeModal();
    } else if (currentAction === 'directions') {
        showToast(`🗺️ Opening maps for: ${listingData.location}`, 'success');
        closeModal();
    }
}

// Event listeners
document.getElementById('prevBtn')?.addEventListener('click', () => slideCarousel(-1));
document.getElementById('nextBtn')?.addEventListener('click', () => slideCarousel(1));
document.getElementById('favBtnTop')?.addEventListener('click', toggleFavorite);
document.getElementById('favBtnSide')?.addEventListener('click', toggleFavorite);

document.getElementById('chatBtn')?.addEventListener('click', () => {
    openModal('chat', 'Start Conversation', 'You are about to chat with the owner about this item. Would you like to proceed?');
});

document.getElementById('claimBtn')?.addEventListener('click', () => {
    openModal('claim', 'Claim Item', 'To claim this item, you will need to provide proof of ownership. Do you want to continue with the claim process?');
});

document.getElementById('reportBtn')?.addEventListener('click', () => {
    openModal('report', 'Report Listing', 'Please describe why you are reporting this listing. Our moderation team will review it.');
});

document.getElementById('shareBtn')?.addEventListener('click', () => {
    openModal('share', 'Share Listing', 'Share this listing with others to help reunite items with their owners.');
});

document.getElementById('supportBtn')?.addEventListener('click', () => {
    openModal('support', 'Contact Support', 'Our support team is available 24/7. How can we help you with this listing?');
});

document.getElementById('openMapBtn')?.addEventListener('click', () => {
    openModal('directions', 'Get Directions', `Opening maps for: ${listingData.location}. You will be redirected to Google Maps.`);
});

// Modal close handlers
closeModalBtn?.addEventListener('click', closeModal);
cancelModalBtn?.addEventListener('click', closeModal);
confirmModalBtn?.addEventListener('click', confirmModalAction);
modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

// Handle back button for breadcrumb category
breadCategoryLink?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast(`Browsing ${listingData.category} category`, 'info');
    setTimeout(() => {
        window.location.href = breadCategoryLink.href;
    }, 500);
});

async function loadListingFromApi() {
    const id = LF.getParam('id');
    if (!id) {
        showToast('No item id in URL', 'error');
        return;
    }
    try {
        const item = await LF.fetchItem(id);
        listingData.id = item.id;
        listingData.user_id = item.user_id;
        listingData.title = item.title;
        listingData.category = item.category;
        listingData.status = item.item_type === 'lost' ? 'Lost' : 'Found';
        listingData.location = item.location_name || item.location;
        listingData.time = item.timeAgo || LF.formatTimeAgo(item.created_at);
        listingData.postedDate = new Date(item.created_at).toLocaleDateString();
        listingData.postedBy = item.postedBy || item.full_name || 'User';
        listingData.views = item.view_count || 0;
        listingData.description = item.description;
        listingData.refId = `#LF-${item.id}`;
        isFavorited = !!item.isFavorite;
        listingData.slides = (item.images && item.images.length)
            ? item.images.map((src, i) => ({ icon: 'fa-image', label: `Photo ${i + 1}`, src }))
            : [{ icon: LF.categoryIcon(item.category).replace('fa-solid ', 'fa-').replace('fa-regular ', 'fa-'), label: item.category }];
        renderListing();
        renderCarousel();
        updateCarousel();
        if (isFavorited) {
            document.querySelectorAll('#favBtnTop i, #favBtnSide i').forEach((icon) => {
                icon.classList.remove('far');
                icon.classList.add('fas');
            });
        }
    } catch (error) {
        showToast(error.message || 'Could not load listing', 'error');
    }
}

document.addEventListener('DOMContentLoaded', loadListingFromApi);