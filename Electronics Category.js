// Electronics Category Page - Fully Interactive JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Sample Electronics Data
    const electronicsItems = [
        { id: 1, title: "iPhone 14 Pro Max", category: "Electronics", subCategory: "Phones", status: "lost", location: "Gulshan-2, Dhaka", time: "2 hours ago", emoji: "📱", bg: "#ddeeff", description: "Deep Purple color, has a clear case with a sticker on back. Last seen at Gulshan-2 market.", reward: "5000 BDT reward", contact: "018XXXXXXXX" },
        { id: 2, title: "MacBook Pro 14\"", category: "Electronics", subCategory: "Laptops", status: "lost", location: "Dhanmondi Lake", time: "5 hours ago", emoji: "💻", bg: "#e8f5e9", description: "Space Gray, Apple M2 chip, has a red skin cover on the lid.", reward: "10000 BDT reward", contact: "017XXXXXXXX" },
        { id: 3, title: "Sony WH-1000XM4", category: "Electronics", subCategory: "Audio", status: "found", location: "Bashundhara City Food Court", time: "1 day ago", emoji: "🎧", bg: "#fff3e0", description: "Black, in original carrying case. Found on 3rd floor food court.", contact: "019XXXXXXXX" },
        { id: 4, title: "iPad Air", category: "Electronics", subCategory: "Tablets", status: "lost", location: "Uttara Sector-10", time: "3 hours ago", emoji: "📲", bg: "#f3e5f5", description: "Rose Gold, 64GB, with blue folio case. Has family photos.", reward: "8000 BDT", contact: "016XXXXXXXX" },
        { id: 5, title: "Samsung Galaxy S23", category: "Electronics", subCategory: "Phones", status: "found", location: "Mirpur DOHS", time: "6 hours ago", emoji: "📱", bg: "#e0f7fa", description: "Green color, cracked screen protector. Found near the mosque.", contact: "018XXXXXXXX" },
        { id: 6, title: "Dell XPS 15", category: "Electronics", subCategory: "Laptops", status: "found", location: "Banani 11", time: "2 days ago", emoji: "💻", bg: "#fce4ec", description: "Silver, with developer stickers on the back. Has important work files.", contact: "017XXXXXXXX" },
        { id: 7, title: "Apple Watch Series 8", category: "Electronics", subCategory: "Wearables", status: "lost", location: "Gulshan Avenue", time: "12 hours ago", emoji: "⌚", bg: "#e8eaf6", description: "Starlight, 45mm, with sport band. Lost while jogging.", reward: "3000 BDT", contact: "019XXXXXXXX" },
        { id: 8, title: "Canon EOS 200D", category: "Electronics", subCategory: "Cameras", status: "lost", location: "Suhrawardy Udyan", time: "1 day ago", emoji: "📷", bg: "#fff8e1", description: "Black DSLR with 18-55mm lens. Has event photos from the day.", reward: "15000 BDT", contact: "016XXXXXXXX" },
        { id: 9, title: "Google Pixel Buds Pro", category: "Electronics", subCategory: "Audio", status: "found", location: "Jamuna Future Park", time: "3 days ago", emoji: "🎧", bg: "#e0f2f1", description: "Lemongrass color, in charging case. Found in parking area.", contact: "018XXXXXXXX" },
        { id: 10, title: "Asus ROG Laptop", category: "Electronics", subCategory: "Laptops", status: "lost", location: "Bashundhara R/A", time: "4 hours ago", emoji: "💻", bg: "#f3e5f5", description: "Gaming laptop with RGB keyboard. Lost at a gaming cafe.", reward: "12000 BDT", contact: "017XXXXXXXX" },
        { id: 11, title: "AirPods Pro 2", category: "Electronics", subCategory: "Audio", status: "found", location: "Uttara Bus Stand", time: "5 days ago", emoji: "🎧", bg: "#e8f5e9", description: "White, with engraving 'AM'. Found on bus seat.", contact: "019XXXXXXXX" },
        { id: 12, title: "OnePlus 11", category: "Electronics", subCategory: "Phones", status: "lost", location: "Motijheel", time: "8 hours ago", emoji: "📱", bg: "#ddeeff", description: "Eternal Green, 256GB, has a black silicone case.", reward: "6000 BDT", contact: "016XXXXXXXX" }
    ];

    // DOM Elements
    const productsGrid = document.getElementById('productsGrid');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const sortFilter = document.getElementById('sortFilter');
    const resultsCountSpan = document.getElementById('resultNumber');
    const emptyState = document.getElementById('emptyState');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const itemModal = document.getElementById('itemModal');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const toast = document.getElementById('toast');
    
    // State
    let currentItems = [...electronicsItems];
    let displayedCount = 8;
    let currentView = 'grid';
    let favorites = new Set();
    
    // Load favorites from localStorage
    function loadFavorites() {
        const saved = localStorage.getItem('electronicsFavorites');
        if (saved) {
            favorites = new Set(JSON.parse(saved));
        }
    }
    
    // Save favorites to localStorage
    function saveFavorites() {
        localStorage.setItem('electronicsFavorites', JSON.stringify([...favorites]));
    }
    
    // Filter and sort items
    function filterAndSortItems() {
        let filtered = [...electronicsItems];
        
        // Search filter
        const searchTerm = searchInput?.value.toLowerCase() || '';
        if (searchTerm) {
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(searchTerm) ||
                item.subCategory.toLowerCase().includes(searchTerm) ||
                item.location.toLowerCase().includes(searchTerm)
            );
        }
        
        // Status filter
        const status = statusFilter?.value || 'all';
        if (status !== 'all') {
            filtered = filtered.filter(item => item.status === status);
        }
        
        // Sort
        const sort = sortFilter?.value || 'newest';
        if (sort === 'newest') {
            // Maintain original order (newer first based on time)
            filtered.sort((a, b) => {
                const timeOrder = { 'hour': 1, 'day': 2, 'days': 3 };
                return 0; // Keep as is for demo
            });
        } else if (sort === 'oldest') {
            // Reverse
            filtered.reverse();
        } else if (sort === 'popular') {
            // Random popularity simulation
            filtered.sort(() => Math.random() - 0.5);
        }
        
        return filtered;
    }
    
    // Render items
    function renderItems() {
        const filtered = filterAndSortItems();
        const displayItems = filtered.slice(0, displayedCount);
        const hasMore = filtered.length > displayedCount;
        
        // Update results count
        if (resultsCountSpan) {
            resultsCountSpan.textContent = filtered.length;
        }
        
        // Show/hide empty state
        if (filtered.length === 0) {
            if (productsGrid) productsGrid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
            return;
        }
        
        if (productsGrid) productsGrid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
        
        // Show/hide load more button
        if (loadMoreContainer) {
            loadMoreContainer.style.display = hasMore ? 'flex' : 'none';
        }
        
        // Clear and render
        if (productsGrid) {
            productsGrid.innerHTML = '';
            productsGrid.className = `products-grid ${currentView}-view`;
            
            displayItems.forEach(item => {
                const card = createItemCard(item);
                productsGrid.appendChild(card);
            });
        }
    }
    
    // Create item card DOM element
    function createItemCard(item) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.setAttribute('data-id', item.id);
        
        const isFav = favorites.has(item.id);
        const heartClass = isFav ? 'fas' : 'far';
        
        card.innerHTML = `
            <div class="item-image" style="background: ${item.bg};">
                <span style="font-size: 60px;">${item.emoji}</span>
                <span class="status-badge-card ${item.status}">${item.status === 'lost' ? '⚠️ LOST' : '✅ FOUND'}</span>
                <button class="favorite-btn" data-id="${item.id}">
                    <i class="${heartClass} fa-heart"></i>
                </button>
            </div>
            <div class="item-info">
                <h3 class="item-title">${escapeHtml(item.title)}</h3>
                <div class="item-category">
                    <i class="fas fa-tag"></i> ${item.subCategory}
                </div>
                <div class="item-location">
                    <i class="fas fa-map-marker-alt"></i> ${escapeHtml(item.location)}
                </div>
                <div class="item-time">
                    <i class="far fa-clock"></i> ${item.time}
                </div>
            </div>
        `;
        
        // Add click event for modal
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-btn')) {
                showItemModal(item);
            }
        });
        
        // Add favorite button event
        const favBtn = card.querySelector('.favorite-btn');
        favBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(item.id, favBtn.querySelector('i'));
        });
        
        return card;
    }
    
    // Toggle favorite
    function toggleFavorite(itemId, iconElement) {
        if (favorites.has(itemId)) {
            favorites.delete(itemId);
            if (iconElement) {
                iconElement.classList.remove('fas');
                iconElement.classList.add('far');
            }
            showToast('Removed from favorites', 'info');
        } else {
            favorites.add(itemId);
            if (iconElement) {
                iconElement.classList.remove('far');
                iconElement.classList.add('fas');
            }
            showToast('Added to favorites!', 'success');
        }
        saveFavorites();
    }
    
    // Show item modal
    function showItemModal(item) {
        if (!modalBody) return;
        
        const isFav = favorites.has(item.id);
        const heartClass = isFav ? 'fas' : 'far';
        
        modalBody.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 70px; height: 70px; background: ${item.bg}; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                        ${item.emoji}
                    </div>
                    <div>
                        <span class="status-badge-card ${item.status}" style="display: inline-block; margin-bottom: 8px;">${item.status === 'lost' ? '⚠️ LOST' : '✅ FOUND'}</span>
                        <h2 style="font-size: 24px;">${escapeHtml(item.title)}</h2>
                    </div>
                </div>
                <button class="favorite-btn modal-fav" data-id="${item.id}" style="position: static; background: #f1f5f9;">
                    <i class="${heartClass} fa-heart"></i>
                </button>
            </div>
            
            <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <p style="margin-bottom: 12px;"><strong><i class="fas fa-align-left"></i> Description:</strong></p>
                <p style="color: #64748b; line-height: 1.6;">${escapeHtml(item.description)}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                <div><i class="fas fa-map-marker-alt" style="color: #00cfe8; width: 20px;"></i> <strong>Location:</strong><br>${escapeHtml(item.location)}</div>
                <div><i class="far fa-clock" style="color: #00cfe8;"></i> <strong>Reported:</strong><br>${item.time}</div>
                ${item.reward ? `<div><i class="fas fa-gift" style="color: #f59e0b;"></i> <strong>Reward:</strong><br>${escapeHtml(item.reward)}</div>` : ''}
                <div><i class="fas fa-phone" style="color: #10b981;"></i> <strong>Contact:</strong><br>${escapeHtml(item.contact)}</div>
            </div>
            
            <div style="display: flex; gap: 12px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                <button class="btn btn-primary" id="claimBtn" style="flex: 1;"><i class="fas fa-handshake"></i> Claim / Contact</button>
                <button class="btn btn-secondary" id="shareModalBtn" style="flex: 1;"><i class="fas fa-share"></i> Share</button>
            </div>
        `;
        
        // Add modal favorite button event
        const modalFavBtn = modalBody.querySelector('.modal-fav');
        modalFavBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(item.id, modalFavBtn.querySelector('i'));
        });
        
        // Add claim button event
        const claimBtn = modalBody.querySelector('#claimBtn');
        claimBtn?.addEventListener('click', () => {
            showToast(`Contacting about ${item.title}...`, 'success');
            itemModal?.classList.remove('show');
        });
        
        // Add share button event
        const shareModalBtn = modalBody.querySelector('#shareModalBtn');
        shareModalBtn?.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: item.title,
                    text: `Check out this ${item.status} item: ${item.title}`,
                    url: window.location.href
                });
            } else {
                navigator.clipboard.writeText(window.location.href);
                showToast('Link copied!', 'success');
            }
        });
        
        itemModal?.classList.add('show');
    }
    
    // Load more items
    function loadMore() {
        displayedCount += 4;
        renderItems();
    }
    
    // Reset all filters
    function resetFilters() {
        if (searchInput) searchInput.value = '';
        if (statusFilter) statusFilter.value = 'all';
        if (sortFilter) sortFilter.value = 'newest';
        displayedCount = 8;
        renderItems();
        showToast('Filters reset', 'info');
    }
    
    // Show toast notification
    function showToast(message, type = 'info') {
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = 'toast';
        if (type === 'success') toast.classList.add('success');
        if (type === 'error') toast.classList.add('error');
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }
    
    // Escape HTML
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    
    // Change view (grid/list)
    function setView(view) {
        currentView = view;
        renderItems();
        
        // Update button active states
        if (gridViewBtn && listViewBtn) {
            if (view === 'grid') {
                gridViewBtn.style.background = 'var(--brand)';
                gridViewBtn.style.color = 'white';
                listViewBtn.style.background = 'white';
                listViewBtn.style.color = 'var(--text-muted)';
            } else {
                listViewBtn.style.background = 'var(--brand)';
                listViewBtn.style.color = 'white';
                gridViewBtn.style.background = 'white';
                gridViewBtn.style.color = 'var(--text-muted)';
            }
        }
    }
    
    // Event Listeners
    searchInput?.addEventListener('input', () => {
        displayedCount = 8;
        renderItems();
    });
    
    statusFilter?.addEventListener('change', () => {
        displayedCount = 8;
        renderItems();
    });
    
    sortFilter?.addEventListener('change', () => {
        displayedCount = 8;
        renderItems();
    });
    
    loadMoreBtn?.addEventListener('click', loadMore);
    resetFiltersBtn?.addEventListener('click', resetFilters);
    gridViewBtn?.addEventListener('click', () => setView('grid'));
    listViewBtn?.addEventListener('click', () => setView('list'));
    
    // Modal close
    closeModalBtn?.addEventListener('click', () => {
        itemModal?.classList.remove('show');
    });
    
    itemModal?.addEventListener('click', (e) => {
        if (e.target === itemModal) {
            itemModal.classList.remove('show');
        }
    });
    
    // Keyboard shortcut: Escape to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && itemModal?.classList.contains('show')) {
            itemModal.classList.remove('show');
        }
    });
    
    // Initialize
    loadFavorites();
    renderItems();
    
    // Scroll animation for cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all cards after render
    function observeCards() {
        document.querySelectorAll('.item-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.5s ease';
            observer.observe(card);
        });
    }
    
    // Override render to observe new cards
    const originalRender = renderItems;
    window.renderItems = function() {
        originalRender();
        setTimeout(observeCards, 100);
    };
    renderItems();
    
    console.log('Electronics Category page loaded successfully!');
});