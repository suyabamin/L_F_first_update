// Reviews Data
let reviews = [
    {
        id: 1,
        name: "Khorshed Alam",
        avatar: "https://ui-avatars.com/api/?background=1aa9bb&color=fff&size=60&name=Khorshed+Alam",
        rating: 4.5,
        text: "This app is superb! The AI matching feature helped me find my lost wallet within hours. Highly recommended!",
        helpful: 12,
        date: "2026-05-15",
        sentiment: "positive"
    },
    {
        id: 2,
        name: "Amin Hossain",
        avatar: "https://ui-avatars.com/api/?background=118699&color=fff&size=60&name=Amin+Hossain",
        rating: 4.7,
        text: "Fast response and very organized process. The claim handling was smooth and professional.",
        helpful: 8,
        date: "2026-05-14",
        sentiment: "positive"
    },
    {
        id: 3,
        name: "Rita Das",
        avatar: "https://ui-avatars.com/api/?background=4ecdc4&color=fff&size=60&name=Rita+Das",
        rating: 4.2,
        text: "Clean interface and useful tracking features. The review flow could be shorter though.",
        helpful: 5,
        date: "2026-05-13",
        sentiment: "positive"
    },
    {
        id: 4,
        name: "Shahidul Islam",
        avatar: "https://ui-avatars.com/api/?background=31535a&color=fff&size=60&name=Shahidul+Islam",
        rating: 2.5,
        text: "The app has potential but needs improvement in response time. Had to wait longer for verification.",
        helpful: 3,
        date: "2026-05-12",
        sentiment: "needs"
    }
];

let currentFilter = "all";
let selectedRating = 0;

// DOM Elements
const reviewsContainer = document.getElementById('reviewsContainer');
const filterChips = document.querySelectorAll('.filter-chip');
const starBtns = document.querySelectorAll('.star-btn');
const ratingValueInput = document.getElementById('ratingValue');
const reviewForm = document.getElementById('reviewForm');
const reviewerName = document.getElementById('reviewerName');
const reviewText = document.getElementById('reviewText');
const overallScoreSpan = document.getElementById('overallScore');
const totalReviewsSpan = document.getElementById('totalReviews');
const positivePercentSpan = document.getElementById('positivePercent');
const newReviewsSpan = document.getElementById('newReviews');
const happyUsersSpan = document.getElementById('happyUsers');
const toastContainer = document.getElementById('toastContainer');

// Show Toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Calculate Statistics
function calculateStats() {
    const total = reviews.length;
    const avgScore = reviews.reduce((sum, r) => sum + r.rating, 0) / total;
    const positiveCount = reviews.filter(r => r.rating >= 4).length;
    const positivePercent = Math.round((positiveCount / total) * 100);
    
    overallScoreSpan.textContent = avgScore.toFixed(2);
    totalReviewsSpan.textContent = total;
    positivePercentSpan.textContent = `${positivePercent}%`;
    newReviewsSpan.textContent = total;
    happyUsersSpan.textContent = reviews.filter(r => r.rating >= 4).length;
}

// Render Reviews
function renderReviews() {
    let filtered = [...reviews];
    
    if (currentFilter === 'positive') {
        filtered = filtered.filter(r => r.rating >= 4);
    } else if (currentFilter === 'needs') {
        filtered = filtered.filter(r => r.rating < 4);
    }
    
    if (filtered.length === 0) {
        reviewsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fa-regular fa-comment" style="font-size: 48px; color: var(--muted); opacity: 0.5;"></i>
                <p style="margin-top: 12px;">No reviews found</p>
            </div>
        `;
        return;
    }
    
    reviewsContainer.innerHTML = filtered.map((review, index) => `
        <div class="review-card animate-up" style="animation-delay: ${index * 0.05}s">
            <div class="review-header">
                <img src="${review.avatar}" alt="${review.name}" class="review-avatar">
                <div>
                    <div class="review-name">${escapeHtml(review.name)}</div>
                    <div class="review-stars">
                        ${renderStars(review.rating)}
                        <span style="margin-left: 8px; font-size: 12px;">(${review.rating})</span>
                    </div>
                </div>
            </div>
            <p class="review-text">${escapeHtml(review.text)}</p>
            <div class="review-footer">
                <button class="helpful-btn" onclick="markHelpful(${review.id})">
                    <i class="fa-regular fa-thumbs-up"></i> Helpful (${review.helpful})
                </button>
                <button class="helpful-btn" onclick="shareReview(${review.id})">
                    <i class="fa-regular fa-share-from-square"></i> Share
                </button>
            </div>
        </div>
    `).join('');
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fa-solid fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalf) {
            stars += '<i class="fa-solid fa-star-half-alt"></i>';
        } else {
            stars += '<i class="fa-regular fa-star"></i>';
        }
    }
    return stars;
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Star Rating Input
starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const rating = parseInt(btn.dataset.rating);
        selectedRating = rating;
        ratingValueInput.value = rating;
        
        starBtns.forEach((star, index) => {
            const starIcon = star.querySelector('i');
            if (index < rating) {
                starIcon.classList.remove('fa-regular');
                starIcon.classList.add('fa-solid');
                star.classList.add('active');
            } else {
                starIcon.classList.remove('fa-solid');
                starIcon.classList.add('fa-regular');
                star.classList.remove('active');
            }
        });
    });
});

// Submit Review
reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = reviewerName.value.trim();
    const text = reviewText.value.trim();
    
    if (!name) {
        showToast('Please enter your name', 'error');
        return;
    }
    if (selectedRating === 0) {
        showToast('Please select a rating', 'error');
        return;
    }
    if (!text) {
        showToast('Please enter your review', 'error');
        return;
    }
    
    const newReview = {
        id: reviews.length + 1,
        name: name,
        avatar: `https://ui-avatars.com/api/?background=1aa9bb&color=fff&size=60&name=${encodeURIComponent(name)}`,
        rating: selectedRating,
        text: text,
        helpful: 0,
        date: new Date().toISOString(),
        sentiment: selectedRating >= 4 ? 'positive' : 'needs'
    };
    
    reviews.unshift(newReview);
    calculateStats();
    renderReviews();
    
    // Reset form
    reviewerName.value = '';
    reviewText.value = '';
    selectedRating = 0;
    ratingValueInput.value = 0;
    starBtns.forEach(star => {
        star.querySelector('i').classList.remove('fa-solid');
        star.querySelector('i').classList.add('fa-regular');
        star.classList.remove('active');
    });
    
    showToast('Review submitted successfully!', 'success');
    
    // Animate rating bars
    animateBars();
});

// Filter Reviews
filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.dataset.filter;
        renderReviews();
        showToast(`Showing ${chip.textContent} reviews`, 'info');
    });
});

// Helpful function
window.markHelpful = function(id) {
    const review = reviews.find(r => r.id === id);
    if (review) {
        review.helpful++;
        renderReviews();
        showToast('Thanks for your feedback!', 'success');
    }
};

// Share function
window.shareReview = function(id) {
    const review = reviews.find(r => r.id === id);
    if (review) {
        navigator.clipboard.writeText(`"${review.text}" - ${review.name}`);
        showToast('Review link copied to clipboard!', 'success');
    }
};

// Animate rating bars on load
function animateBars() {
    const bars = document.querySelectorAll('.bar-fill');
    bars.forEach(bar => {
        const percent = bar.dataset.percent;
        setTimeout(() => {
            bar.style.width = `${percent}%`;
        }, 100);
    });
}

// Initialize
function init() {
    calculateStats();
    renderReviews();
    animateBars();
}

init();