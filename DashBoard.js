// ======================== DASHBOARD.JS ========================
// interactive posts, filtering, counters, like system, load more, animations

document.addEventListener('DOMContentLoaded', () => {
    const routes = {
        home: 'DashBoard.html',
        browse: 'Browse Listing.html',
        post: 'Create Post.html',
        profile: 'Profile Page.html',
        notifications: 'Notification.html',
        help: 'User Feedback.html'
    };

    let allPostsData = [];
    const bgPalette = ['#FEF3C7', '#E0F2FE', '#DCFCE7', '#F3E8FF', '#FFE4E6', '#E6F7F5', '#FCE7F3'];

    async function loadPostsFromDatabase() {
        try {
            const { res, data } = await fetch('backend-php/dashboard_posts.php', {
                headers: { Accept: 'application/json' }
            }).then(async (r) => ({ res: r, data: await r.json() }));
            if (!res.ok || !data.success) return;
            allPostsData = (data.posts || []).map((post, index) => ({
                id: post.id,
                status: post.status,
                title: post.title,
                category: post.category,
                time: post.time,
                emoji: window.LF ? LF.postEmoji(post.category) : '📦',
                bg: bgPalette[index % bgPalette.length],
                icon: window.LF ? LF.categoryIcon(post.category) : 'fas fa-box'
            }));
            visibleCount = 6;
            renderPosts();
        } catch {
            // keep empty state if database unavailable
        }
    }

    let currentFilter = 'all';
    let visibleCount = 6;      // initially show 6 posts
    let likedPosts = new Set();  // store liked post IDs

    const postsGrid = document.getElementById('postsGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const loadMoreBtn = document.getElementById('loadMoreBtn').querySelector('button');
    const globalSearch = document.getElementById('globalSearch');
    const statNumbers = document.querySelectorAll('.stat-value');
    const notifBadge = document.querySelector('.notif-badge');
    const userNameEl = document.querySelector('.user-name');
    const avatarImg = document.querySelector('.user-avatar img');
    const categoryLinks = {
        electronics: 'Electronics Category.html',
        pets: 'pet category.html',
        bag: 'Bag Category.html',
        key: 'Key Category.html',
        paper: 'PaperCategory.html',
        jewelry: 'backend-php/browse_listing_view.php?category=jewelry'
    };

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
        
        // staggered entrance: set small delays so cards animate sequentially
        document.querySelectorAll('.post-card').forEach((card, idx) => {
            card.style.setProperty('--delay', `${(idx % 12) * 0.04}s`);
        });
        document.querySelectorAll('.category-card').forEach((card, idx) => {
            card.style.setProperty('--delay', `${(idx % 8) * 0.03}s`);
        });

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
        
        // attach click on each post card
        document.querySelectorAll('.post-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if(e.target.classList && e.target.classList.contains('heart-icon')) return;
                window.location.href = `Post Details.html?id=${card.dataset.id}`;
            });
        });

        // slight micro-interactions for images and icons
        document.querySelectorAll('.img-placeholder').forEach((img, i) => {
            img.style.transition = 'transform 0.45s cubic-bezier(.2,.9,.3,1)';
            img.addEventListener('mouseenter', () => img.style.transform = 'translateY(-6px) scale(1.02)');
            img.addEventListener('mouseleave', () => img.style.transform = 'translateY(0) scale(1)');
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

    async function loadSessionUser() {
        try {
            const response = await fetch('backend-php/me.php', { headers: { 'Accept': 'application/json' } });
            const data = await response.json();
            if (!response.ok || !data.success) return;

            const user = data.user;
            localStorage.setItem('current_user', JSON.stringify(user));
            if (userNameEl) userNameEl.textContent = (user.fullName || user.username || 'User').split(' ')[0];
            if (avatarImg) {
                avatarImg.src = user.avatar || `https://ui-avatars.com/api/?background=0D9488&color=fff&rounded=true&bold=true&size=40&name=${encodeURIComponent(user.fullName || user.username || 'User')}`;
            }
            if (notifBadge) notifBadge.textContent = data.stats?.unread || 0;
        } catch (error) {
            // Dashboard still works as a public demo if the session endpoint is unavailable.
        }
    }

    async function loadCategoryStats() {
        try {
            const response = await fetch('backend-php/category_stats.php', { headers: { 'Accept': 'application/json' } });
            const data = await response.json();
            if (!response.ok || !data.success) return;

            document.querySelectorAll('#categoryGrid .category-card').forEach(card => {
                const category = card.dataset.cat;
                const count = data.counts?.[category] ?? 0;
                const label = count === 1 ? 'item' : 'items';
                const countEl = card.querySelector('.cat-count');
                if (countEl) countEl.textContent = `${count} ${label}`;
            });
        } catch (error) {
            // Keep the static labels if the database endpoint is unavailable.
        }
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
        const catCards = document.querySelectorAll('#categoryGrid .category-card');
        catCards.forEach(card => {
            card.addEventListener('click', () => {
                const catName = card.getAttribute('data-cat');
                window.location.href = categoryLinks[catName] || `backend-php/browse_listing_view.php?category=${encodeURIComponent(catName)}`;
            });
        });
    }
    
    // ----- side navigation -----
    function setupSidebarNav() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const navType = item.getAttribute('data-nav');
                if (routes[navType]) {
                    window.location.href = routes[navType];
                }
            });
        });

        const notifBtn = document.getElementById('notifBtn');
        if (notifBtn) {
            notifBtn.addEventListener('click', () => {
                window.location.href = routes.notifications;
            });
        }

        const seeAll = document.getElementById('seeAllPostsBtn');
        if (seeAll) seeAll.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'backend-php/browse_listing_view.php';
        });

        const help = document.querySelector('.help-btn');
        if (help) help.addEventListener('click', () => {
            window.location.href = routes.help;
        });
    }
    // ----- INIT ALL -----
    function init() {
        loadSessionUser();
        loadCategoryStats();
        loadPostsFromDatabase();
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
        globalSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const q = globalSearch.value.trim();
                window.location.href = `backend-php/browse_listing_view.php${q ? `?q=${encodeURIComponent(q)}` : ''}`;
            }
        });
    }
    
    init();
});
