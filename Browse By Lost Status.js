// Browse By Lost Status - Interactive JavaScript
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
    const viewAllCategories = document.getElementById('viewAllCategories');

    let currentFilter = 'all';
    let currentPage = 1;

    // Show Toast Notification
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
        const urgent = Array.from(posts).filter(p => p.dataset.urgency === 'urgent').length;
        const withReward = Array.from(posts).filter(p => p.dataset.reward === 'true').length;
        
        document.getElementById('totalLost').textContent = total;
        document.getElementById('urgentCount').textContent = urgent;
        document.getElementById('rewardCount').textContent = withReward;
    }

    // Apply Filters (Search + Urgency + Reward + Category)
    function applyFilters() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const posts = document.querySelectorAll('.post-card');
        let visibleCount = 0;
        
        posts.forEach(post => {
            const title = post.querySelector('h3')?.innerText.toLowerCase() || '';
            const location = post.querySelector('.location')?.innerText.toLowerCase() || '';
            const category = post.dataset.category;
            const isUrgent = post.dataset.urgency === 'urgent';
            const hasReward = post.dataset.reward === 'true';
            
            let filterMatch = true;
            if (currentFilter === 'urgent') {
                filterMatch = isUrgent;
            } else if (currentFilter === 'reward') {
                filterMatch = hasReward;
            }
            
            const searchMatch = searchTerm === '' || title.includes(searchTerm) || location.includes(searchTerm);
            
            if (filterMatch && searchMatch) {
                post.style.display = '';
                visibleCount++;
            } else {
                post.style.display = 'none';
            }
        });
        
        updateStats();
        
        if (searchTerm !== '') {
            showToast(`🔍 Found ${visibleCount} matching lost items`, false);
        }
    }

    // Filter by Urgency/Reward Status
    function initFilters() {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                applyFilters();
                
                let message = '';
                if (currentFilter === 'all') message = 'Showing all lost items';
                else if (currentFilter === 'urgent') message = 'Showing urgent lost items only';
                else message = 'Showing items with rewards only';
                showToast(message, false);
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
                    showToast('Removed from saved items', false);
                } else {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    btn.classList.add('liked');
                    showToast('Item saved to favorites! You will be notified if found', false);
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
                const newPosts = createMockPosts(3);
                newPosts.forEach(post => {
                    if (postsGrid) {
                        postsGrid.appendChild(post);
                    }
                });
                updateStats();
                initFavorites(); // Re-initialize favorites for new posts
                showToast(`Loaded ${newPosts.length} more lost items`, false);
                
                currentPage++;
                if (currentPage >= 4) {
                    loadMoreBtn.disabled = true;
                    loadMoreBtn.style.opacity = '0.5';
                    loadMoreBtn.innerHTML = '<i class="fas fa-check"></i> No more items to load';
                }
            });
        }
    }

    // Create Mock Posts
    function createMockPosts(count) {
        const newPosts = [];
        const lostItems = [
            { title: "Samsung Galaxy Watch", category: "electronics", location: "Banani, Dhaka", icon: "clock", bg: "electronics-bg", urgency: "normal", reward: "true", rewardAmt: "4,000" },
            { title: "Travel Backpack", category: "bags", location: "Jatrabari, Dhaka", icon: "bag-shopping", bg: "bag-bg", urgency: "urgent", reward: "false", rewardAmt: "" },
            { title: "Office ID Card", category: "documents", location: "Paltan, Dhaka", icon: "id-card", bg: "docs-bg", urgency: "urgent", reward: "true", rewardAmt: "2,000" },
            { title: "House Keys Set", category: "keys", location: "Shahbag, Dhaka", icon: "key", bg: "keys-bg", urgency: "normal", reward: "false", rewardAmt: "" }
        ];
        
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * lostItems.length);
            const item = lostItems[randomIndex];
            const postDiv = document.createElement('div');
            postDiv.className = 'post-card';
            postDiv.setAttribute('data-status', 'lost');
            postDiv.setAttribute('data-category', item.category);
            postDiv.setAttribute('data-urgency', item.urgency);
            postDiv.setAttribute('data-reward', item.reward);
            
            const urgencyHtml = item.urgency === 'urgent' ? '<span class="urgency-badge">Urgent</span>' : '';
            const rewardHtml = item.reward === 'true' ? `<div class="reward-badge"><i class="fas fa-taka-sign"></i> Reward: ${item.rewardAmt} BDT</div>` : '';
            const contactHtml = '<div class="contact-hint"><i class="fas fa-info-circle"></i> Last seen: Near ' + item.location.split(',')[0] + '</div>';
            
            postDiv.innerHTML = `
                <div class="card-image">
                    <div class="img-placeholder ${item.bg}">
                        <i class="fas fa-${item.icon}"></i>
                    </div>
                    <span class="status-badge status-lost">Lost</span>
                    ${urgencyHtml}
                    <button class="favorite-btn"><i class="far fa-heart"></i></button>
                </div>
                <div class="post-info">
                    <h3>${item.title}</h3>
                    <p class="location"><i class="fas fa-map-marker-alt"></i> ${item.location}</p>
                    <div class="post-meta">
                        <span class="category-tag"><i class="fas fa-tag"></i> ${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
                        <span class="time"><i class="far fa-clock"></i> Just now</span>
                    </div>
                    ${rewardHtml}
                    ${contactHtml}
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
                showToast(`Showing ${category} category lost items`, false);
                
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 200);
            });
        });
    }

    // Header Button Handlers
    function initHeaderButtons() {
        if (notifyBtn) {
            notifyBtn.addEventListener('click', () => {
                showToast('🔔 You have 5 new notifications about lost items', false);
            });
        }
        
        if (messageBtn) {
            messageBtn.addEventListener('click', () => {
                showToast('💬 You have 2 new messages from people who found your items', false);
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

    // Post Card Click Handler
    function initPostCards() {
        if (postsGrid) {
            postsGrid.addEventListener('click', (e) => {
                const postCard = e.target.closest('.post-card');
                if (postCard && !e.target.closest('.favorite-btn')) {
                    const title = postCard.querySelector('h3')?.innerText;
                    const hasReward = postCard.dataset.reward === 'true';
                    if (hasReward) {
                        showToast(`💰 Reward offered for: ${title}. Contact the owner to help!`, false);
                    } else {
                        showToast(`📋 Viewing details for: ${title}. Help spread the word!`, false);
                    }
                }
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
                    showToast('🔍 Search activated - Type to find lost items', false);
                }
            }
            
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.value = '';
                applyFilters();
                showToast('Search cleared', false);
            }
            
            // Number shortcuts for filters (1=All, 2=Urgent, 3=Reward)
            if (!e.ctrlKey && !e.metaKey) {
                const num = parseInt(e.key);
                if (num === 1 && filterBtns[0]) filterBtns[0].click();
                if (num === 2 && filterBtns[1]) filterBtns[1].click();
                if (num === 3 && filterBtns[2]) filterBtns[2].click();
            }
        });
    }

    // Animate Stats on Load
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

    // View All Categories Handler
    function initViewAllCategories() {
        if (viewAllCategories) {
            viewAllCategories.addEventListener('click', (e) => {
                e.preventDefault();
                showToast('📂 Viewing all categories...', false);
            });
        }
    }

    // Welcome Message
    function showWelcome() {
        setTimeout(() => {
            showToast('🔍 Welcome! Browse lost items and help reunite them with their owners', false);
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
        initPostCards();
        initKeyboardShortcuts();
        initViewAllCategories();
        animateStats();
        showWelcome();
    }

    // Start the application
    init();
})();