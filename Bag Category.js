// Bag Category Page - Interactive JavaScript
(function() {
    'use strict';

    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const favoriteBtns = document.querySelectorAll('.favorite-btn');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const toast = document.getElementById('toast');
    const notifyBtn = document.getElementById('notifyBtn');
    const messageBtn = document.getElementById('messageBtn');
    const categoryCards = document.querySelectorAll('.category-card');
    const postsGrid = document.getElementById('postsGrid');

    let currentFilter = 'all';
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
        const posts = document.querySelectorAll('.post-card');
        const total = posts.length;
        const lost = Array.from(posts).filter(p => p.dataset.status === 'lost').length;
        const found = total - lost;
        
        document.getElementById('totalItems').textContent = total;
        document.getElementById('lostCount').textContent = lost;
        document.getElementById('foundCount').textContent = found;
    }

    // Apply Filters (Search + Status)
    function applyFilters() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const posts = document.querySelectorAll('.post-card');
        let visibleCount = 0;
        
        posts.forEach(post => {
            const title = post.dataset.title?.toLowerCase() || '';
            const location = post.querySelector('.location')?.innerText.toLowerCase() || '';
            const statusMatch = currentFilter === 'all' || post.dataset.status === currentFilter;
            const searchMatch = searchTerm === '' || title.includes(searchTerm) || location.includes(searchTerm);
            
            if (statusMatch && searchMatch) {
                post.style.display = '';
                visibleCount++;
            } else {
                post.style.display = 'none';
            }
        });
        
        updateStats();
        
        if (searchTerm !== '') {
            showToast(`🔍 Found ${visibleCount} matching items`, false);
        }
    }

    // Filter Posts by Status
    function initFilters() {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                applyFilters();
                showToast(`Showing: ${currentFilter === 'all' ? 'All Items' : currentFilter === 'lost' ? 'Lost Items' : 'Found Items'}`, false);
            });
        });
    }

    // Favorite Button Toggle
    function initFavorites() {
        favoriteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const icon = btn.querySelector('i');
                const isLiked = icon.classList.contains('fas');
                
                if (isLiked) {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    btn.classList.remove('liked');
                    showToast('Removed from favorites', false);
                } else {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    btn.classList.add('liked');
                    showToast('Added to favorites! ❤️', false);
                }
            });
        });
    }

    // Search Functionality
    function initSearch() {
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                applyFilters();
            });
        }
    }

    // Load More Posts
    function initLoadMore() {
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                const newPosts = createMockPosts(2);
                newPosts.forEach(post => {
                    if (postsGrid) {
                        postsGrid.appendChild(post);
                    }
                });
                updateStats();
                initFavorites(); // Re-initialize favorites for new posts
                showToast(`Loaded ${newPosts.length} new items`, false);
                
                currentPage++;
                if (currentPage >= 4) {
                    loadMoreBtn.disabled = true;
                    loadMoreBtn.style.opacity = '0.5';
                    loadMoreBtn.innerHTML = '<i class="fas fa-check"></i> No more items';
                }
            });
        }
    }

    // Create Mock Posts
    function createMockPosts(count) {
        const newPosts = [];
        const bagItems = [
            { title: "Lost Tote Bag", location: "Banani, Dhaka", type: "lost", icon: "bag-shopping", bg: "#fff3e0" },
            { title: "Found Messenger Bag", location: "Mohakhali, Dhaka", type: "found", icon: "briefcase", bg: "#e8f5e9" },
            { title: "Lost Duffel Bag", location: "Airport, Dhaka", type: "lost", icon: "suitcase", bg: "#fce4ec" },
            { title: "Found Camera Bag", location: "Dhanmondi, Dhaka", type: "found", icon: "camera", bg: "#e0f2f1" }
        ];
        
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * bagItems.length);
            const item = bagItems[randomIndex];
            const postDiv = document.createElement('div');
            postDiv.className = 'post-card';
            postDiv.setAttribute('data-status', item.type);
            postDiv.setAttribute('data-category', 'bag');
            postDiv.setAttribute('data-title', item.title);
            
            const statusClass = item.type === 'lost' ? 'status-lost' : 'status-found';
            const statusText = item.type === 'lost' ? 'Lost' : 'Found';
            const badgeClass = item.type === 'lost' ? 'reward-badge' : 'claimed-badge';
            const badgeText = item.type === 'lost' ? 'Reward Available' : 'Verified Found';
            
            postDiv.innerHTML = `
                <div class="card-image">
                    <div class="img-placeholder" style="background: ${item.bg};">
                        <i class="fas fa-${item.icon}"></i>
                    </div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                    <button class="favorite-btn"><i class="far fa-heart"></i></button>
                </div>
                <div class="post-info">
                    <h3>${item.title}</h3>
                    <p class="location"><i class="fas fa-map-marker-alt"></i> ${item.location}</p>
                    <div class="post-meta">
                        <span class="category-tag"><i class="fas fa-tag"></i> Bag</span>
                        <span class="time"><i class="far fa-clock"></i> Just now</span>
                    </div>
                    <div class="${badgeClass}">${badgeText}</div>
                </div>
            `;
            postDiv.style.animation = 'slideIn 0.3s ease';
            newPosts.push(postDiv);
        }
        return newPosts;
    }

    // Category Card Click Handler
    function initCategoryCards() {
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                showToast(`Showing ${category} category`, false);
                // In a real app, this would filter by category
            });
        });
    }

    // Header Button Handlers
    function initHeaderButtons() {
        if (notifyBtn) {
            notifyBtn.addEventListener('click', () => {
                showToast('🔔 You have 3 new notifications', false);
            });
        }
        
        if (messageBtn) {
            messageBtn.addEventListener('click', () => {
                showToast('💬 No new messages', false);
            });
        }
    }

    // Nav Item Handlers
    function initNavItems() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                const text = item.querySelector('span')?.innerText || 'Home';
                showToast(`Navigating to ${text}...`, false);
            });
        });
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

    // Post Card Click Handler
    function initPostCards() {
        if (postsGrid) {
            postsGrid.addEventListener('click', (e) => {
                const postCard = e.target.closest('.post-card');
                if (postCard && !e.target.closest('.favorite-btn')) {
                    const title = postCard.querySelector('h3')?.innerText;
                    showToast(`📋 Viewing details for: ${title}`, false);
                }
            });
        }
    }

    // Real-time Stats Animation
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
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
            showToast('👋 Welcome to Bag Category! Find lost bags or report found items', false);
        }, 800);
    }

    // Initialize Everything
    function init() {
        updateStats();
        initFilters();
        initFavorites();
        initSearch();
        initLoadMore();
        initCategoryCards();
        initHeaderButtons();
        initNavItems();
        initKeyboardShortcuts();
        initPostCards();
        animateStats();
        showWelcome();
    }

    // Start the application
    init();
})();