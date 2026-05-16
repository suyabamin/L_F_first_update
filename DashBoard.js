// ======================== DASHBOARD.JS ========================
// interactive posts, filtering, counters, like system, load more, animations

document.addEventListener('DOMContentLoaded', () => {
    // ---------- MOCK POST DATA (rich dataset) ----------
    const allPostsData = [
        { id: 1, status: 'lost', title: 'Lost Wallet - Black Leather', category: 'Bag', time: '2 hours ago', emoji: '👛', bg: '#FEF3C7', icon: 'fas fa-briefcase' },
        { id: 2, status: 'found', title: 'iPhone 13 Pro Max (Graphite)', category: 'Electronics', time: '3 hours ago', emoji: '📱', bg: '#E0F2FE', icon: 'fas fa-laptop' },
        { id: 3, status: 'found', title: 'Pixel 8 Pro - Hazel', category: 'Electronics', time: '1 hour ago', emoji: '📲', bg: '#DCFCE7', icon: 'fas fa-mobile-alt' },
        { id: 4, status: 'lost', title: 'North Face Side Bag', category: 'Bag', time: '4 hours ago', emoji: '🎒', bg: '#F3E8FF', icon: 'fas fa-briefcase' },
        { id: 5, status: 'lost', title: 'Missing Tabby Cat - "Milo"', category: 'Pets', time: '5 hours ago', emoji: '🐱', bg: '#FFE4E6', icon: 'fas fa-paw' },
        { id: 6, status: 'found', title: 'Bunch of Keys with USB', category: 'Keys', time: '30 mins ago', emoji: '🔑', bg: '#E0F2FE', icon: 'fas fa-key' },
        { id: 7, status: 'found', title: 'Car Key & House Keys set', category: 'Keys', time: '2 hours ago', emoji: '🔑', bg: '#FEF9C3', icon: 'fas fa-key' },
        { id: 8, status: 'lost', title: 'Beloved Cat - White & Ginger', category: 'Pets', time: '1 hour ago', emoji: '🐾', bg: '#FFEDD5', icon: 'fas fa-paw' },
        { id: 9, status: 'lost', title: 'MacBook Pro 14" Space Gray', category: 'Electronics', time: '6 hours ago', emoji: '💻', bg: '#E6F7F5', icon: 'fas fa-laptop' },
        { id: 10, status: 'found', title: 'Gold Necklace with pendant', category: 'Jewelry', time: '12 hours ago', emoji: '💍', bg: '#FCE7F3', icon: 'fas fa-gem' },
        { id: 11, status: 'found', title: 'Important Passport & Docs', category: 'Documents', time: '1 day ago', emoji: '📄', bg: '#E0F2FE', icon: 'fas fa-file-alt' },
        { id: 12, status: 'lost', title: 'Brown Leather Backpack', category: 'Bag', time: '2 days ago', emoji: '🎒', bg: '#FEF3C7', icon: 'fas fa-bag-shopping' }
    ];

    let currentFilter = 'all';
    let visibleCount = 6;      // initially show 6 posts
    let likedPosts = new Set();  // store liked post IDs

    const postsGrid = document.getElementById('postsGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const loadMoreBtn = document.getElementById('loadMoreBtn').querySelector('button');
    const globalSearch = document.getElementById('globalSearch');
    const statNumbers = document.querySelectorAll('.stat-value');

    // ----- Helper: format relative time smarter -----
    function formatTime(rawTime) {
        return rawTime; // keep as given but with icon
    }

    // ----- render posts based on current filter, search, and visibleCount -----
    function renderPosts() {
        const searchTerm = globalSearch.value.trim().toLowerCase();
        let filtered = [...allPostsData];
        
        // filter by status (lost/found/all)
        if (currentFilter !== 'all') {
            filtered = filtered.filter(post => post.status === currentFilter);
        }
        
        // filter by search (title + category)
        if (searchTerm !== '') {
            filtered = filtered.filter(post => 
                post.title.toLowerCase().includes(searchTerm) || 
                post.category.toLowerCase().includes(searchTerm)
            );
        }
        
        // slice for load more
        const displayedPosts = filtered.slice(0, visibleCount);
        const hasMore = filtered.length > visibleCount;
        
        // toggle load more button visibility
        const loadMoreContainer = document.getElementById('loadMoreBtn');
        if (hasMore) {
            loadMoreContainer.style.display = 'flex';
        } else {
            loadMoreContainer.style.display = 'none';
        }
        
        if (displayedPosts.length === 0) {
            postsGrid.innerHTML = `<div class="no-results" style="grid-column:1/-1; text-align:center; padding:60px;"><i class="fas fa-box-open" style="font-size:48px; opacity:0.5;"></i><p style="margin-top:12px;">No posts match your criteria.</p></div>`;
            return;
        }
        
        // generate HTML
        let postsHTML = '';
        displayedPosts.forEach(post => {
            const isLiked = likedPosts.has(post.id);
            const heartClass = isLiked ? 'fas' : 'far';
            const statusClass = post.status === 'lost' ? 'status-lost' : 'status-found';
            const statusText = post.status === 'lost' ? '⚠️ LOST' : '✅ FOUND';
            
            postsHTML += `
                <div class="post-card" data-id="${post.id}" data-status="${post.status}">
                    <div class="img-placeholder" style="background: ${post.bg};">${post.emoji}</div>
                    <div class="post-info">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                        <h3>${escapeHtml(post.title)}</h3>
                        <p class="category-label"><i class="${post.icon}"></i> Category: ${post.category}</p>
                        <span class="time"><i class="far fa-clock"></i> ${post.time}</span>
                    </div>
                    <i class="${heartClass} fa-heart heart-icon" data-id="${post.id}"></i>
                </div>
            `;
        });
        
        postsGrid.innerHTML = postsHTML;
        
        // reattach heart event listeners
        document.querySelectorAll('.heart-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const postId = parseInt(icon.getAttribute('data-id'));
                if (likedPosts.has(postId)) {
                    likedPosts.delete(postId);
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    icon.style.color = '#CBD5E1';
                    showToast('Removed from favorites');
                } else {
                    likedPosts.add(postId);
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    icon.style.color = '#F43F5E';
                    showToast('Added to favorites ❤️');
                }
            });
        });
        
        // attach click on each post card (simulate navigation)
        document.querySelectorAll('.post-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if(e.target.classList && e.target.classList.contains('heart-icon')) return;
                showToast(`Opening post details... (demo)`);
                // In real project: location.href = '../Post Details/index.html?id=${card.dataset.id}'
            });
        });
    }
    
    // simple escape
    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if(m === '&') return '&amp;';
            if(m === '<') return '&lt;';
            if(m === '>') return '&gt;';
            return m;
        });
    }
    
    // ----- filtering with animation + active class -----
    function setFilter(filterType, btnElement) {
        currentFilter = filterType;
        filterBtns.forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');
        visibleCount = 6;   // reset visible count when filter changes
        renderPosts();
        // smooth scroll to top of posts grid
        postsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // ----- load more functionality -----
    function loadMore() {
        visibleCount += 4;
        renderPosts();
    }
    
    // ----- animated counter for stats -----
    function animateStats() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            let current = 0;
            const increment = target / 55;
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    stat.innerText = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.innerText = target;
                }
            };
            updateCounter();
        });
    }
    
    // ----- toast notification system -----
    let toastTimeout;
    function showToast(message) {
        const toastEl = document.getElementById('toast-message');
        toastEl.innerText = message;
        toastEl.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toastEl.classList.remove('show');
        }, 2000);
    }
    
    // ----- search debouncer -----
    let debounceTimer;
    function onSearchInput() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            visibleCount = 6;
            renderPosts();
        }, 300);
    }
    
    // ----- event listeners for category cards -----
    function setupCategoryListeners() {
        const catCards = document.querySelectorAll('.category-card');
        catCards.forEach(card => {
            card.addEventListener('click', () => {
                const catName = card.getAttribute('data-cat') || card.querySelector('p')?.innerText.toLowerCase();
                showToast(`Showing ${catName} items (demo mode)`);
                // optional: could filter posts by category in real scenario
            });
        });
    }
    
    // ----- side navigation mock interaction -----
    function setupSidebarNav() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                const navType = item.getAttribute('data-nav');
                showToast(`Navigating to ${navType} section (demo)`);
            });
        });
        const notifBtn = document.getElementById('notifBtn');
        if(notifBtn) {
            notifBtn.addEventListener('click', () => showToast('🔔 You have 3 new notifications'));
        }
        const seeAll = document.getElementById('seeAllPostsBtn');
        if(seeAll) seeAll.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('✨ Browse all posts');
        });
        const help = document.querySelector('.help-btn');
        if(help) help.addEventListener('click', () => showToast('Help center coming soon!'));
    }
    
    // ----- INIT ALL -----
    function init() {
        renderPosts();
        animateStats();
        setupCategoryListeners();
        setupSidebarNav();
        
        // filter buttons
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterValue = btn.getAttribute('data-filter');
                setFilter(filterValue, btn);
            });
        });
        
        // load more button
        loadMoreBtn.addEventListener('click', loadMore);
        
        // search event
        globalSearch.addEventListener('input', onSearchInput);
    }
    
    init();
});