// Browse Lost Status - database-backed page behavior
(function() {
    'use strict';

    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const toast = document.getElementById('toast');
    const notifyBtn = document.getElementById('notifyBtn');
    const messageBtn = document.getElementById('messageBtn');
    const categoryCards = document.querySelectorAll('.category-card');
    const postsGrid = document.getElementById('postsGrid');
    const viewAllCategories = document.getElementById('viewAllCategories');

    let items = [];
    let currentFilter = 'all';
    let currentCategory = '';
    let visibleLimit = 8;

    function showToast(message, isError = false) {
        if (!toast) return;
        toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${escapeHtml(message)}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2400);
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[char]));
    }

    function categoryAlias(category) {
        const key = String(category || '').toLowerCase();
        if (key === 'bag') return 'bags';
        if (key === 'paper' || key === 'document') return 'documents';
        if (key === 'key') return 'keys';
        if (key === 'pet') return 'pets';
        return key;
    }

    function categoryIcon(category) {
        const key = categoryAlias(category);
        if (key === 'electronics') return ['mobile-alt', 'electronics-bg'];
        if (key === 'bags') return ['bag-shopping', 'bag-bg'];
        if (key === 'keys') return ['key', 'keys-bg'];
        if (key === 'documents') return ['id-card', 'docs-bg'];
        if (key === 'pets') return ['paw', 'pets-bg'];
        return ['box-open', 'docs-bg'];
    }

    function isUrgent(item) {
        return ['important', 'emergency'].includes(String(item.priority_level || '').toLowerCase());
    }

    function hasReward(item) {
        return Number(item.reward_amount || 0) > 0;
    }

    function filteredItems() {
        const searchTerm = (searchInput ? searchInput.value : '').toLowerCase().trim();
        return items.filter(item => {
            let filterMatch = true;
            if (currentFilter === 'urgent') filterMatch = isUrgent(item);
            if (currentFilter === 'reward') filterMatch = hasReward(item);
            const categoryMatch = !currentCategory || categoryAlias(item.category) === currentCategory;
            const haystack = `${item.title || ''} ${item.description || ''} ${item.location_name || ''} ${item.category || ''}`.toLowerCase();
            return filterMatch && categoryMatch && (!searchTerm || haystack.includes(searchTerm));
        });
    }

    function updateStats() {
        document.getElementById('totalLost').textContent = items.length;
        document.getElementById('urgentCount').textContent = items.filter(isUrgent).length;
        document.getElementById('rewardCount').textContent = items.filter(hasReward).length;

        categoryCards.forEach(card => {
            const count = items.filter(item => categoryAlias(item.category) === card.dataset.category).length;
            const countEl = card.querySelector('.item-count');
            if (countEl) countEl.textContent = `${count} item${count === 1 ? '' : 's'}`;
        });
    }

    function renderItems() {
        const visible = filteredItems();
        const shown = visible.slice(0, visibleLimit);

        if (!postsGrid) return;
        postsGrid.innerHTML = shown.length ? shown.map(renderCard).join('') : `
            <div class="post-card" style="grid-column:1/-1; padding:2rem; text-align:center;">
                <div class="post-info">
                    <h3>No lost items match your filters</h3>
                    <p class="location">Try a different category, search word, or status.</p>
                </div>
            </div>`;

        if (loadMoreBtn) {
            loadMoreBtn.style.display = visible.length > visibleLimit ? '' : 'none';
        }
        updateStats();
    }

    function renderCard(item) {
        const [icon, bg] = categoryIcon(item.category);
        const urgentHtml = isUrgent(item) ? '<span class="urgency-badge">Urgent</span>' : '';
        const rewardHtml = hasReward(item)
            ? `<div class="reward-badge"><i class="fas fa-taka-sign"></i> Reward: ${Number(item.reward_amount).toLocaleString()} BDT</div>`
            : '';

        return `
            <div class="post-card" data-id="${escapeHtml(item.id)}" data-status="lost" data-category="${escapeHtml(categoryAlias(item.category))}" data-urgency="${isUrgent(item) ? 'urgent' : 'normal'}" data-reward="${hasReward(item)}">
                <div class="card-image">
                    <div class="img-placeholder ${bg}"><i class="fas fa-${icon}"></i></div>
                    <span class="status-badge status-lost">Lost</span>
                    ${urgentHtml}
                    <button class="favorite-btn" type="button"><i class="far fa-heart"></i></button>
                </div>
                <div class="post-info">
                    <h3>${escapeHtml(item.title)}</h3>
                    <p class="location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(item.location_name)}</p>
                    <div class="post-meta">
                        <span class="category-tag"><i class="fas fa-tag"></i> ${escapeHtml(item.category)}</span>
                        <span class="time"><i class="far fa-clock"></i> ${escapeHtml((item.created_at || '').slice(0, 10) || 'Recently')}</span>
                    </div>
                    ${rewardHtml}
                    <div class="contact-hint"><i class="fas fa-info-circle"></i> ${escapeHtml(item.description)}</div>
                </div>
            </div>`;
    }

    function loadItems() {
        fetch('backend-php/browse_listing.php?type=lost', { headers: { Accept: 'application/json' } })
            .then(res => {
                if (!res.ok) throw new Error('Could not load lost items');
                return res.json();
            })
            .then(data => {
                items = Array.isArray(data) ? data : [];
                renderItems();
                showToast('Lost items loaded');
            })
            .catch(error => showToast(error.message || 'Database connection failed', true));
    }

    function initEvents() {
        filterBtns.forEach(btn => btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter || 'all';
            visibleLimit = 8;
            renderItems();
        }));

        if (searchInput) searchInput.addEventListener('input', renderItems);
        if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => {
            visibleLimit += 6;
            renderItems();
        });

        categoryCards.forEach(card => card.addEventListener('click', () => {
            currentCategory = currentCategory === card.dataset.category ? '' : card.dataset.category;
            categoryCards.forEach(c => c.classList.toggle('active', c.dataset.category === currentCategory));
            visibleLimit = 8;
            renderItems();
        }));

        if (postsGrid) postsGrid.addEventListener('click', e => {
            const fav = e.target.closest('.favorite-btn');
            if (fav) {
                fav.classList.toggle('liked');
                fav.querySelector('i').className = fav.classList.contains('liked') ? 'fas fa-heart' : 'far fa-heart';
                showToast(fav.classList.contains('liked') ? 'Item saved to favorites' : 'Removed from favorites');
                return;
            }
            const card = e.target.closest('.post-card[data-id]');
            if (card) window.location.href = `backend-php/post_details_view.php?id=${encodeURIComponent(card.dataset.id)}`;
        });

        if (notifyBtn) notifyBtn.addEventListener('click', () => window.location.href = 'Notification.html');
        if (messageBtn) messageBtn.addEventListener('click', () => window.location.href = 'Conversations.html');
        if (viewAllCategories) viewAllCategories.addEventListener('click', e => {
            e.preventDefault();
            currentCategory = '';
            categoryCards.forEach(c => c.classList.remove('active'));
            renderItems();
        });

        document.querySelectorAll('.nav-item').forEach(item => item.addEventListener('click', () => {
            const text = item.querySelector('span')?.innerText.toLowerCase();
            const routes = { home: 'DashBoard.html', browse: 'Browse Listing.html?type=lost', post: 'Create Post.html', profile: 'Profile Page.html' };
            if (routes[text]) window.location.href = routes[text];
        }));
    }

    initEvents();
    loadItems();
})();
