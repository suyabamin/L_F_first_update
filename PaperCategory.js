// ---------- PAPER DOCUMENT DATASET (Rich & Realistic) ----------
const postsDataset = [
    { id: 1, title: "Lost Academic Certificate", category: "paper", status: "lost", icon: "📜", timeAgo: "45 minutes ago", date: "2025-04-10T08:30:00", desc: "Bachelor's degree certificate", location: "Library Hall" },
    { id: 2, title: "Found NID Card", category: "paper", status: "found", icon: "🪪", timeAgo: "2 hours ago", date: "2025-04-09T22:15:00", desc: "National ID card with holder name", location: "Metro Station" },
    { id: 3, title: "Lost Birth Certificate", category: "paper", status: "lost", icon: "📋", timeAgo: "3 hours ago", date: "2025-04-09T19:00:00", desc: "Original copy with seal", location: "City Hall" },
    { id: 4, title: "Found Passport Copy", category: "paper", status: "found", icon: "🛂", timeAgo: "1 hour ago", date: "2025-04-10T10:20:00", desc: "Biometric passport photocopy", location: "Airport Lounge" },
    { id: 5, title: "Lost Important Contract", category: "paper", status: "lost", icon: "📑", timeAgo: "5 hours ago", date: "2025-04-09T15:45:00", desc: "Signed legal agreement", location: "Business Center" },
    { id: 6, title: "Found University ID", category: "paper", status: "found", icon: "🎓", timeAgo: "30 mins ago", date: "2025-04-10T13:10:00", desc: "Student ID with photo", location: "Cafeteria" },
    { id: 7, title: "Lost Prescription", category: "paper", status: "lost", icon: "💊", timeAgo: "1 day ago", date: "2025-04-09T09:00:00", desc: "Medical prescription", location: "Pharmacy" },
    { id: 8, title: "Found Notebook (Journal)", category: "paper", status: "found", icon: "📓", timeAgo: "4 hours ago", date: "2025-04-10T07:30:00", desc: "Handwritten notes", location: "Study Room" },
    // additional categories to demonstrate full filtering + interaction (electronics, pets etc)
    { id: 9, title: "Lost iPhone 14", category: "electronics", status: "lost", icon: "📱", timeAgo: "6 hours ago", date: "2025-04-09T14:00:00", desc: "Black silicon case", location: "Gym" },
    { id: 10, title: "Found Gold Watch", category: "electronics", status: "found", icon: "⌚", timeAgo: "1 day ago", date: "2025-04-08T20:00:00", desc: "Smart watch", location: "Park" },
    { id: 11, title: "Lost Cat (Whiskers)", category: "pets", status: "lost", icon: "🐱", timeAgo: "2 days ago", date: "2025-04-08T12:00:00", desc: "Orange tabby", location: "Greenwood Ave" },
    { id: 12, title: "Found Laptop Bag", category: "bag", status: "found", icon: "💼", timeAgo: "12 hours ago", date: "2025-04-09T21:00:00", desc: "Messenger bag with documents", location: "Bus Stop" },
    { id: 13, title: "Lost Car Keys", category: "key", status: "lost", icon: "🔑", timeAgo: "3 hours ago", date: "2025-04-10T09:15:00", desc: "Toyota keychain", location: "Parking Lot" },
];

// DOM references
let currentCategory = "paper";      // default as per paper focus
let currentStatus = "all";
let currentSearch = "";
let currentSort = "newest";

const postsContainer = document.getElementById("postsDynamicGrid");
const emptyStateDiv = document.getElementById("emptyState");
const totalPaperSpan = document.getElementById("totalPaperCount");
const resetBtn = document.getElementById("resetFiltersBtn");

// Helper: Update paper count (only visible paper category count)
function updatePaperStats() {
    const paperItems = postsDataset.filter(item => item.category === "paper");
    totalPaperSpan.innerText = paperItems.length;
}

// Render posts based on filters
function renderPosts() {
    let filtered = [...postsDataset];
    
    // Category filter: if category is "all", show all, else match category
    if (currentCategory !== "all") {
        filtered = filtered.filter(post => post.category === currentCategory);
    }
    
    // Status filter
    if (currentStatus !== "all") {
        filtered = filtered.filter(post => post.status === currentStatus);
    }
    
    // Search filter (title + desc)
    if (currentSearch.trim() !== "") {
        const query = currentSearch.toLowerCase();
        filtered = filtered.filter(post => 
            post.title.toLowerCase().includes(query) || 
            post.desc.toLowerCase().includes(query) ||
            post.location.toLowerCase().includes(query)
        );
    }
    
    // Sorting
    filtered.sort((a,b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return currentSort === "newest" ? dateB - dateA : dateA - dateB;
    });
    
    // Render or empty state
    if (filtered.length === 0) {
        postsContainer.innerHTML = "";
        emptyStateDiv.style.display = "flex";
        emptyStateDiv.style.flexDirection = "column";
        emptyStateDiv.style.alignItems = "center";
        return;
    }
    
    emptyStateDiv.style.display = "none";
    postsContainer.innerHTML = filtered.map(post => `
        <div class="post-card-item" data-id="${post.id}" data-category="${post.category}" data-status="${post.status}">
            <div class="card-header-img" style="background: #f8fbfd;">
                <span style="font-size: 3rem;">${post.icon}</span>
            </div>
            <div class="post-content">
                <span class="status-chip ${post.status === 'lost' ? 'status-lost-badge' : 'status-found-badge'}">
                    ${post.status === 'lost' ? '⚠️ LOST' : '✅ FOUND'}
                </span>
                <h3 class="post-title">${escapeHtml(post.title)}</h3>
                <div class="category-meta">
                    <i class="fas fa-tag"></i> Category: ${post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                    <i class="fas fa-map-pin"></i> ${post.location}
                </div>
                <p style="font-size: 0.85rem; color: #5f7f8f; margin: 8px 0;">${escapeHtml(post.desc)}</p>
                <div class="time-meta">
                    <i class="far fa-clock"></i> ${post.timeAgo}
                </div>
                <i class="far fa-heart heart-like" data-id="${post.id}"></i>
            </div>
        </div>
    `).join('');
    
    attachLikeEvents();
}

// XSS protection
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Like interactivity
function attachLikeEvents() {
    document.querySelectorAll('.heart-like').forEach(heart => {
        heart.removeEventListener('click', handleLikeClick);
        heart.addEventListener('click', handleLikeClick);
    });
}

function handleLikeClick(e) {
    e.stopPropagation();
    const icon = e.currentTarget;
    icon.classList.toggle('far');
    icon.classList.toggle('fas');
    icon.classList.toggle('liked');
    if (icon.classList.contains('fas')) {
        icon.style.color = '#ff5c5c';
        // subtle animation via class
        icon.style.transform = 'scale(1.1)';
        setTimeout(() => { if(icon) icon.style.transform = ''; }, 200);
    } else {
        icon.style.color = '#cbdbe0';
    }
}

// Event listeners: category chips
function initFilters() {
    // Category chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active-chip'));
            chip.classList.add('active-chip');
            const catValue = chip.getAttribute('data-category');
            currentCategory = catValue;
            renderPosts();
        });
    });
    
    // Status tabs
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active-status'));
            btn.classList.add('active-status');
            currentStatus = btn.getAttribute('data-status');
            renderPosts();
        });
    });
    
    // Search input
    const searchInput = document.getElementById('smartSearch');
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        renderPosts();
    });
    
    // Sort select
    const sortSelect = document.getElementById('sortByDate');
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderPosts();
    });
    
    // Reset button functionality (full reset)
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            currentCategory = "paper";
            currentStatus = "all";
            currentSearch = "";
            currentSort = "newest";
            document.getElementById('smartSearch').value = "";
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active-chip'));
            const defaultPaperChip = document.querySelector('.filter-chip[data-category="paper"]');
            if(defaultPaperChip) defaultPaperChip.classList.add('active-chip');
            document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active-status'));
            const allStatusBtn = document.querySelector('.status-btn[data-status="all"]');
            if(allStatusBtn) allStatusBtn.classList.add('active-status');
            document.getElementById('sortByDate').value = "newest";
            renderPosts();
        });
    }
}

// initial call
updatePaperStats();
initFilters();
renderPosts();