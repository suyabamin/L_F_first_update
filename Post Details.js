// Enhanced Listing Data with more details
const listingData = {
    title: localStorage.getItem("lf_latest_title") || "Found iPhone 13 Pro Max",
    category: "Electronics",
    status: "Found",
    location: "Dhanmondi Lake, Road #2, Dhaka",
    time: "3 hours ago",
    postedDate: "May 15, 2026",
    postedBy: "Ahmed Hossain",
    views: 142,
    description: "A pristine iPhone 13 Pro Max (Graphite) was found near the Dhanmondi Lake walking path. The device has a clear case with a small sticker. Owner must confirm lock screen pattern, Apple ID, or provide proof of purchase to claim. Please reach out with accurate details for verification.",
    refId: `#LF-${Math.floor(Math.random() * 10000)}`,
    slides: [
        { icon: "fa-mobile-screen-button", label: "Device Front" },
        { icon: "fa-receipt", label: "Proof Available" },
        { icon: "fa-location-dot", label: "Location Map" }
    ]
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
    carouselTrack.innerHTML = listingData.slides.map((slide, index) => `
        <div class="carousel-slide">
            <i class="fas ${slide.icon}"></i>
            <span>${slide.label}</span>
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
function toggleFavorite() {
    isFavorited = !isFavorited;
    const favIcons = document.querySelectorAll('#favBtnTop i, #favBtnSide i');
    favIcons.forEach(icon => {
        icon.classList.toggle('far');
        icon.classList.toggle('fas');
    });
    showToast(isFavorited ? '❤️ Added to favorites' : '💔 Removed from favorites', 'success');
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
        showToast('💬 Redirecting to chat...', 'success');
        setTimeout(() => {
            window.location.href = 'Chat.html';
        }, 500);
    } else if (currentAction === 'claim') {
        showToast('📋 Claim request submitted. Owner will contact you.', 'success');
        closeModal();
    } else if (currentAction === 'report') {
        showToast('🚩 Report submitted. Our team will review.', 'success');
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

// Initialize page
function init() {
    renderListing();
    renderCarousel();
    updateCarousel();
    showToast('📱 Listing loaded successfully', 'success');
}

init();