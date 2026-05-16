// Browse Listings - Interactive JavaScript
(function() {
    'use strict';

    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const statusFilters = document.querySelectorAll('[data-filter]');
    const categoryFilters = document.querySelectorAll('[data-category]');
    const sortSelect = document.getElementById('sortSelect');
    const viewBtns = document.querySelectorAll('.view-btn');
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const saveBtns = document.querySelectorAll('.save-btn');
    const contactBtns = document.querySelectorAll('.contact-btn');
    const toast = document.getElementById('toast');

    let currentStatusFilter = 'all';
    let currentCategoryFilter = 'all';
    let currentView = 'grid';
    let currentPage = 1;
    const itemsPerPage = 6;

    // Show Toast
    function showToast(message, isError = false) {
        toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${message}`;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Update Statistics
    function updateStats() {
        const cards = document.querySelectorAll('.listing-card');
        const total = cards.length;
        const lost = Array.from(cards).filter(c => c.dataset.status === 'lost').length;
        const found = total - lost;
        const resolved = 6; // Mock resolved count
        
        document.getElementById('totalListings').textContent = total;
        document.getElementById('lostCount').textContent = lost;
        document.getElementById('foundCount').textContent = found;
        document.getElementById('resolvedCount').textContent = resolved;
    }

    // Apply All Filters
    function applyFilters() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const cards = document.querySelectorAll('.listing-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
            const title = card.dataset.title?.toLowerCase() || '';
            const description = card.querySelector('p')?.innerText.toLowerCase() || '';
            const location = card.querySelector('.location')?.innerText.toLowerCase() || '';
            const status = card.dataset.status;
            const category = card.dataset.category;
            
            const statusMatch = currentStatusFilter === 'all' || status === currentStatusFilter;
            const categoryMatch = currentCategoryFilter === 'all' || category === currentCategoryFilter;
            const searchMatch = searchTerm === '' || title.includes(searchTerm) || description.includes(searchTerm) || location.includes(searchTerm);
            
            if (statusMatch && categoryMatch && searchMatch) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        updateStats();
        
        if (searchTerm !== '') {
            showToast(`🔍 Found ${visibleCount} matching listings`, false);
        }
    }

    // Sort Listings
    function sortListings() {
        const container = document.getElementById('gridView');
        const cards = Array.from(document.querySelectorAll('.listing-card'));
        const sortValue = sortSelect.value;
        
        cards.sort((a, b) => {
            const timeA = a.querySelector('.time')?.innerText || '';
            const timeB = b.querySelector('.time')?.innerText || '';
            
            if (sortValue === 'newest') {
                return -1;
            } else if (sortValue === 'oldest') {
                return 1;
            }
            return 0;
        });
        
        cards.forEach(card => container.appendChild(card));
        showToast(`Sorted by: ${sortSelect.options[sortSelect.selectedIndex].text}`, false);
    }

    // Status Filter Handlers
    function initStatusFilters() {
        const statusFilterBtns = document.querySelectorAll('[data-filter]');
        statusFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                statusFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentStatusFilter = btn.dataset.filter;
                applyFilters();
                showToast(`Showing: ${currentStatusFilter === 'all' ? 'All Items' : currentStatusFilter === 'lost' ? 'Lost Items' : 'Found Items'}`, false);
            });
        });
    }

    // Category Filter Handlers
    function initCategoryFilters() {
        const categoryFilterBtns = document.querySelectorAll('[data-category]');
        categoryFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategoryFilter = btn.dataset.category;
                applyFilters();
                showToast(`Category: ${currentCategoryFilter === 'all' ? 'All Categories' : btn.innerText}`, false);
            });
        });
    }

    // Save/Favorite Button
    function initSaveButtons() {
        saveBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const icon = btn.querySelector('i');
                const isSaved = btn.classList.contains('saved');
                
                if (isSaved) {
                    btn.classList.remove('saved');
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    showToast('Removed from saved items', false);
                } else {
                    btn.classList.add('saved');
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    showToast('Saved to your bookmarks!', false);
                }
            });
        });
    }

    // Contact Button Handler
    function initContactButtons() {
        contactBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.listing-card');
                const title = card.querySelector('h3')?.innerText || 'item';
                showToast(`💬 Opening chat about "${title}"...`, false);
            });
        });
    }

    // View Toggle (Grid/List)
    function initViewToggle() {
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentView = btn.dataset.view;
                
                if (currentView === 'grid') {
                    gridView.classList.add('active');
                    gridView.style.display = 'grid';
                    if (listView) listView.style.display = 'none';
                } else {
                    gridView.classList.remove('active');
                    gridView.style.display = 'none';
                    if (listView) {
                        listView.style.display = 'flex';
                        populateListView();
                    }
                }
                showToast(`${currentView === 'grid' ? 'Grid' : 'List'} view activated`, false);
            });
        });
    }

    // Populate List View
    function populateListView() {
        if (!listView) return;
        const cards = document.querySelectorAll('.listing-card');
        listView.innerHTML = '';
        
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.classList.add('list-item');
            clone.style.display = 'flex';
            clone.style.flexDirection = 'row';
            clone.querySelector('.card-image').style.width = '120px';
            clone.querySelector('.card-image').style.height = '120px';
            listView.appendChild(clone);
        });
    }

    // Load More Items
    function initLoadMore() {
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                const newCards = createMockCards(2);
                const container = document.getElementById('gridView');
                
                newCards.forEach(card => {
                    if (container) container.appendChild(card);
                });
                
                updateStats();
                initSaveButtons();
                initContactButtons();
                showToast(`Loaded ${newCards.length} new listings`, false);
                
                currentPage++;
                if (currentPage >= 4) {
                    loadMoreBtn.disabled = true;
                    loadMoreBtn.style.opacity = '0.5';
                    loadMoreBtn.innerHTML = '<i class="fa-solid fa-check"></i> No more listings';
                }
            });
        }
    }

    // Create Mock Cards
    function createMockCards(count) {
        const newCards = [];
        const mockItems = [
            { status: 'lost', category: 'electronics', title: 'Lost Smart Watch', desc: 'Samsung Galaxy Watch lost at the gym', location: 'Banani, Dhaka', icon: 'clock', bg: 'electronics-bg' },
            { status: 'found', category: 'document', title: 'Found Student ID', desc: 'Student ID card found near cafeteria', location: 'UIU Campus, Dhaka', icon: 'id-card', bg: 'document-bg' },
            { status: 'lost', category: 'key', title: 'Lost House Keys', desc: 'Set of 4 keys with red keychain', location: 'Gulshan, Dhaka', icon: 'key', bg: 'key-bg' }
        ];
        
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * mockItems.length);
            const item = mockItems[randomIndex];
            const card = document.createElement('article');
            card.className = 'listing-card';
            card.setAttribute('data-status', item.status);
            card.setAttribute('data-category', item.category);
            card.setAttribute('data-title', item.title);
            
            card.innerHTML = `
                <div class="card-badge ${item.status}">${item.status === 'lost' ? 'Lost' : 'Found'}</div>
                <div class="card-image">
                    <div class="image-placeholder ${item.bg}">
                        <i class="fa-solid fa-${item.icon}"></i>
                    </div>
                    <button class="save-btn"><i class="fa-regular fa-bookmark"></i></button>
                </div>
                <div class="card-content">
                    <div class="card-meta">
                        <span class="category-tag"><i class="fa-solid fa-tag"></i> ${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
                        <span class="time"><i class="fa-regular fa-clock"></i> Just now</span>
                    </div>
                    <h3>${item.title}</h3>
                    <p>${item.desc}</p>
                    <div class="location"><i class="fa-solid fa-location-dot"></i> ${item.location}</div>
                    <div class="card-footer">
                        <a href="../Post Details/index.html" class="btn-details">View Details <i class="fa-solid fa-arrow-right"></i></a>
                        <button class="contact-btn"><i class="fa-regular fa-message"></i> Contact</button>
                    </div>
                </div>
            `;
            card.style.animation = 'fadeInUp 0.4s ease';
            newCards.push(card);
        }
        return newCards;
    }

    // Search Functionality
    function initSearch() {
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                applyFilters();
            });
        }
    }

    // Keyboard Shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (searchInput) {
                    searchInput.focus();
                    showToast('🔍 Search activated', false);
                }
            }
            
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.value = '';
                applyFilters();
                showToast('Search cleared', false);
            }
        });
    }

    // Nav Link Handlers
    function initNavLinks() {
        const navLinks = document.querySelectorAll('.nav-list a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href') === '#') {
                    e.preventDefault();
                    showToast('Navigation coming soon', false);
                }
            });
        });
        
        const brand = document.querySelector('.brand');
        if (brand) {
            brand.addEventListener('click', (e) => {
                e.preventDefault();
                showToast('Returning to home...', false);
            });
        }
    }

    // Card Click Handler
    function initCardClick() {
        const cards = document.querySelectorAll('.listing-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.save-btn') && !e.target.closest('.contact-btn') && !e.target.closest('.btn-details')) {
                    const title = card.querySelector('h3')?.innerText;
                    showToast(`📋 Viewing details for: ${title}`, false);
                }
            });
        });
    }

    // Animate Stats
    function animateStats() {
        const statValues = document.querySelectorAll('.stat-value');
        statValues.forEach(stat => {
            const target = parseInt(stat.innerText);
            let current = 0;
            const increment = target / 30;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    stat.innerText = target;
                    clearInterval(timer);
                } else {
                    stat.innerText = Math.floor(current);
                }
            }, 30);
        });
    }

    // Welcome Message
    function showWelcome() {
        setTimeout(() => {
            showToast('🔍 Welcome to Browse Listings! Find lost items or help return found ones', false);
        }, 800);
    }

    // Initialize Everything
    function init() {
        initStatusFilters();
        initCategoryFilters();
        initSaveButtons();
        initContactButtons();
        initViewToggle();
        initLoadMore();
        initSearch();
        initKeyboardShortcuts();
        initNavLinks();
        initCardClick();
        updateStats();
        animateStats();
        showWelcome();
        
        if (sortSelect) {
            sortSelect.addEventListener('change', sortListings);
        }
    }

    init();
})();