// Mock Search Results Data
const allResults = [
    {
        id: 1,
        title: "Found iPhone 13 Pro",
        description: "Starlight iPhone 13 Pro with clear case found near the campus cafeteria. Owner must confirm lock screen details.",
        category: "electronics",
        status: "found",
        location: "Campus Cafeteria, Dhanmondi",
        distance: "0.3 km",
        matchScore: 98,
        date: "2026-05-15T10:30:00",
        imageIcon: "fa-mobile-screen-button",
        tags: ["match", "nearby"]
    },
    {
        id: 2,
        title: "Found Pixel 8 Pro",
        description: "Google Pixel 8 Pro in Hazel color found at the library entrance. Contact to verify ownership.",
        category: "electronics",
        status: "found",
        location: "Central Library, Dhanmondi",
        distance: "0.5 km",
        matchScore: 85,
        date: "2026-05-15T08:15:00",
        imageIcon: "fa-mobile-alt",
        tags: ["nearby"]
    },
    {
        id: 3,
        title: "Lost Samsung Galaxy S23",
        description: "Lost a Samsung Galaxy S23 Ultra in Phantom Black. Last seen at the bus stop. Reward offered.",
        category: "electronics",
        status: "lost",
        location: "Main Bus Stop, Dhanmondi",
        distance: "0.2 km",
        matchScore: 92,
        date: "2026-05-14T18:45:00",
        imageIcon: "fa-mobile-screen",
        tags: ["match"]
    },
    {
        id: 4,
        title: "Lost Wallet - Brown Leather",
        description: "Brown leather wallet containing ID cards and cash. Lost near the ATM booth.",
        category: "bag",
        status: "lost",
        location: "ATM Booth, Dhanmondi",
        distance: "0.4 km",
        matchScore: 75,
        date: "2026-05-14T14:20:00",
        imageIcon: "fa-wallet",
        tags: []
    },
    {
        id: 5,
        title: "Found Laptop Bag",
        description: "Black HP backpack found near the parking lot. Contains notebooks and charger.",
        category: "bag",
        status: "found",
        location: "Parking Lot, Dhanmondi",
        distance: "0.6 km",
        matchScore: 68,
        date: "2026-05-13T09:00:00",
        imageIcon: "fa-bag-shopping",
        tags: []
    },
    {
        id: 6,
        title: "Lost Cat - Orange Tabby",
        description: "Lost friendly orange tabby cat. Responds to 'Mango'. Missing since morning.",
        category: "pets",
        status: "lost",
        location: "Green Valley Area",
        distance: "1.2 km",
        matchScore: 60,
        date: "2026-05-13T07:30:00",
        imageIcon: "fa-cat",
        tags: []
    },
    {
        id: 7,
        title: "Found Gold Ring",
        description: "Simple elegant gold ring found near the fountain park. Inscription inside.",
        category: "jewelry",
        status: "found",
        location: "Fountain Park, Dhanmondi",
        distance: "0.8 km",
        matchScore: 55,
        date: "2026-05-12T16:00:00",
        imageIcon: "fa-gem",
        tags: []
    },
    {
        id: 8,
        title: "Lost AirPods Pro",
        description: "White AirPods Pro with charging case. Lost in the central library.",
        category: "electronics",
        status: "lost",
        location: "Central Library",
        distance: "0.5 km",
        matchScore: 82,
        date: "2026-05-12T11:00:00",
        imageIcon: "fa-headphones",
        tags: ["match"]
    }
];

// DOM Elements
const searchInput = document.getElementById('searchQuery');
const categoryFilter = document.getElementById('categoryFilter');
const statusFilter = document.getElementById('statusFilter');
const sortBy = document.getElementById('sortBy');
const searchForm = document.getElementById('searchForm');
const resultsGrid = document.getElementById('resultsGrid');
const resultCountSpan = document.getElementById('resultCount');
const loadMoreContainer = document.getElementById('loadMoreContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const emptyState = document.getElementById('emptyState');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const toastContainer = document.getElementById('toastContainer');

// State
let currentResults = [...allResults];
let displayedCount = 6;
let currentFilterChip = 'all';
let currentView = 'grid';

// Initialize
function init() {
    performSearch();
    attachEventListeners();
    updateView();
}

// Show Toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Perform Search
function performSearch() {
    let results = [...allResults];
    
    // Search query filter
    const query = searchInput.value.toLowerCase().trim();
    if (query) {
        results = results.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query) ||
            item.location.toLowerCase().includes(query)
        );
    }
    
    // Category filter
    const category = categoryFilter.value;
    if (category !== 'all') {
        results = results.filter(item => item.category === category);
    }
    
    // Status filter
    const status = statusFilter.value;
    if (status !== 'all') {
        results = results.filter(item => item.status === status);
    }
    
    // Filter chip
    if (currentFilterChip === 'lost') {
        results = results.filter(item => item.status === 'lost');
    } else if (currentFilterChip === 'found') {
        results = results.filter(item => item.status === 'found');
    } else if (currentFilterChip === 'nearby') {
        results = results.filter(item => item.tags.includes('nearby'));
    } else if (currentFilterChip === 'ai-match') {
        results = results.filter(item => item.tags.includes('match'));
    }
    
    // Sort
    const sortValue = sortBy.value;
    if (sortValue === 'newest') {
        results.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortValue === 'oldest') {
        results.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
        results.sort((a, b) => b.matchScore - a.matchScore);
    }
    
    currentResults = results;
    displayedCount = 6;
    renderResults();
}

// Render Results
function renderResults() {
    const visibleResults = currentResults.slice(0, displayedCount);
    const hasMore = currentResults.length > displayedCount;
    
    resultCountSpan.textContent = currentResults.length;
    
    if (currentResults.length === 0) {
        resultsGrid.style.display = 'none';
        emptyState.style.display = 'block';
        loadMoreContainer.style.display = 'none';
        return;
    }
    
    resultsGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    loadMoreContainer.style.display = hasMore ? 'flex' : 'none';
    
    resultsGrid.innerHTML = visibleResults.map((item, index) => `
        <article class="result-card" style="animation-delay: ${index * 0.05}s">
            <div class="card-image">
                <i class="fas ${item.imageIcon}"></i>
            </div>
            <div class="card-content">
                <div class="meta">
                    <span class="pill ${item.status}">${item.status === 'lost' ? 'Lost' : 'Found'}</span>
                    ${item.matchScore >= 80 ? '<span class="pill match">AI Match</span>' : ''}
                    ${item.tags.includes('nearby') ? '<span class="pill nearby">Nearby</span>' : ''}
                </div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.description.substring(0, 100))}${item.description.length > 100 ? '...' : ''}</p>
                <div class="location-info">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${escapeHtml(item.location)}</span>
                    ${item.distance ? `<span>• ${item.distance} away</span>` : ''}
                </div>
                <div class="card-actions">
                    <a href="backend-php/post_details_view.php?id=${item.id}" class="btn-sm btn-primary-sm">
                        <i class="fas fa-eye"></i> View Details
                    </a>
                    <a href="Chat.html" class="btn-sm btn-outline-sm">
                        <i class="fas fa-comment"></i> Chat
                    </a>
                </div>
            </div>
        </article>
    `).join('');
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Load More
function loadMore() {
    displayedCount += 4;
    renderResults();
    showToast(`Showing ${Math.min(displayedCount, currentResults.length)} of ${currentResults.length} results`, 'info');
}

// Reset Filters
function resetFilters() {
    searchInput.value = 'phone near campus';
    categoryFilter.value = 'all';
    statusFilter.value = 'all';
    sortBy.value = 'relevance';
    currentFilterChip = 'all';
    
    document.querySelectorAll('.chip').forEach(chip => {
        chip.classList.remove('active');
        if (chip.dataset.chip === 'all') chip.classList.add('active');
    });
    
    performSearch();
    showToast('All filters reset', 'success');
}

// Clear Search
function clearSearch() {
    searchInput.value = '';
    performSearch();
    showToast('Search cleared', 'info');
}

// Update View (Grid/List)
function updateView() {
    if (currentView === 'list') {
        resultsGrid.classList.add('list-view');
    } else {
        resultsGrid.classList.remove('list-view');
    }
}

// Attach Event Listeners
function attachEventListeners() {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        performSearch();
        showToast('Search updated', 'success');
    });
    
    categoryFilter.addEventListener('change', () => {
        performSearch();
        showToast('Category filter applied', 'info');
    });
    
    statusFilter.addEventListener('change', () => {
        performSearch();
        showToast('Status filter applied', 'info');
    });
    
    sortBy.addEventListener('change', () => {
        performSearch();
        showToast('Results sorted', 'info');
    });
    
    loadMoreBtn.addEventListener('click', loadMore);
    clearSearchBtn.addEventListener('click', clearSearch);
    resetFiltersBtn.addEventListener('click', resetFilters);
    
    // Filter chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentFilterChip = chip.dataset.chip;
            performSearch();
            showToast(`Filter: ${chip.textContent}`, 'info');
        });
    });
    
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            updateView();
            showToast(`${currentView === 'grid' ? 'Grid' : 'List'} view`, 'info');
        });
    });
}

// Initialize page
init();