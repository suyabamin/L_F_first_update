// Pet Data Collection
const petsData = [
    { id: 1, name: "Max", type: "dog", breed: "Golden Retriever", status: "lost", location: "Central Park", date: "2 hours ago", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400", color: "Golden", contact: "+1 234 567 890" },
    { id: 2, name: "Luna", type: "cat", breed: "Siamese", status: "lost", location: "Maple Street", date: "5 hours ago", image: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400", color: "Cream", contact: "+1 234 567 891" },
    { id: 3, name: "Coco", type: "bird", breed: "Cockatiel", status: "found", location: "Community Center", date: "1 day ago", image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400", color: "Grey/Yellow", contact: "+1 234 567 892" },
    { id: 4, name: "Rocky", type: "dog", breed: "German Shepherd", status: "found", location: "Veterinary Clinic", date: "3 hours ago", image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=400", color: "Black/Tan", contact: "+1 234 567 893" },
    { id: 5, name: "Whiskers", type: "cat", breed: "Maine Coon", status: "lost", location: "Oakwood Avenue", date: "8 hours ago", image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400", color: "Orange", contact: "+1 234 567 894" },
    { id: 6, name: "Kiwi", type: "bird", breed: "Parakeet", status: "lost", location: "Sunset Boulevard", date: "12 hours ago", image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400", color: "Green", contact: "+1 234 567 895" },
    { id: 7, name: "Bella", type: "dog", breed: "Labrador", status: "found", location: "Dog Park", date: "30 mins ago", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400", color: "Yellow", contact: "+1 234 567 896" },
    { id: 8, name: "Milo", type: "other", breed: "Rabbit", status: "lost", location: "Garden Square", date: "4 hours ago", image: "https://images.unsplash.com/photo-1535241749838-299277b6305f?w=400", color: "White", contact: "+1 234 567 897" }
];

let currentFilter = {
    status: 'all',
    category: 'all',
    search: ''
};

let displayedCount = 6;

// DOM Elements
const postsGrid = document.getElementById('postsGrid');
const loadMoreContainer = document.getElementById('loadMoreContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const resetCategoryBtn = document.getElementById('resetCategoryBtn');
const toastContainer = document.getElementById('toastContainer');

// Initialize
function init() {
    renderPosts();
    attachEventListeners();
    createParticles();
    updateCategoryCounts();
}

// Render Posts
function renderPosts() {
    let filtered = [...petsData];
    
    // Filter by status
    if (currentFilter.status !== 'all') {
        filtered = filtered.filter(pet => pet.status === currentFilter.status);
    }
    
    // Filter by category (pet type)
    if (currentFilter.category !== 'all') {
        filtered = filtered.filter(pet => pet.type === currentFilter.category);
    }
    
    // Filter by search
    if (currentFilter.search) {
        const searchTerm = currentFilter.search.toLowerCase();
        filtered = filtered.filter(pet => 
            pet.name.toLowerCase().includes(searchTerm) ||
            pet.breed.toLowerCase().includes(searchTerm) ||
            pet.location.toLowerCase().includes(searchTerm)
        );
    }
    
    // Pagination
    const hasMore = filtered.length > displayedCount;
    const visiblePosts = filtered.slice(0, displayedCount);
    
    if (filtered.length === 0) {
        postsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px;">
                <i class="fas fa-paw" style="font-size: 48px; color: #ccc;"></i>
                <h3>No pets found</h3>
                <p>Try adjusting your filters or check back later</p>
            </div>
        `;
        loadMoreContainer.style.display = 'none';
        return;
    }
    
    postsGrid.innerHTML = visiblePosts.map(pet => `
        <article class="pet-card" data-id="${pet.id}" style="animation-delay: ${Math.random() * 0.1}s">
            <div class="card-img">
                <img src="${pet.image}" alt="${pet.name}" loading="lazy">
                <div class="status-overlay status-${pet.status}">${pet.status === 'lost' ? 'Lost' : 'Found'}</div>
                <div class="heart-icon" data-id="${pet.id}">
                    <i class="far fa-heart"></i>
                </div>
            </div>
            <div class="card-content">
                <h3>${escapeHtml(pet.name)}</h3>
                <div class="pet-details">
                    <span><i class="fas fa-paw"></i> ${pet.breed}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${pet.location}</span>
                </div>
                <div class="pet-details">
                    <span><i class="fas fa-palette"></i> ${pet.color}</span>
                    <span><i class="fas fa-tag"></i> ${pet.type === 'dog' ? 'Dog' : pet.type === 'cat' ? 'Cat' : pet.type === 'bird' ? 'Bird' : 'Other'}</span>
                </div>
                <div class="card-footer">
                    <span class="time"><i class="far fa-clock"></i> ${pet.date}</span>
                    <button class="contact-btn" data-contact="${pet.contact}" data-name="${pet.name}">
                        <i class="fas fa-comment-dots"></i> Contact
                    </button>
                </div>
            </div>
        </article>
    `).join('');
    
    loadMoreContainer.style.display = hasMore ? 'flex' : 'none';
    
    // Re-attach heart and contact events
    attachCardEvents();
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function attachCardEvents() {
    // Heart icons
    document.querySelectorAll('.heart-icon').forEach(heart => {
        heart.removeEventListener('click', heartClickHandler);
        heart.addEventListener('click', heartClickHandler);
    });
    
    // Contact buttons
    document.querySelectorAll('.contact-btn').forEach(btn => {
        btn.removeEventListener('click', contactClickHandler);
        btn.addEventListener('click', contactClickHandler);
    });
}

function heartClickHandler(e) {
    e.stopPropagation();
    const icon = this.querySelector('i');
    icon.classList.toggle('far');
    icon.classList.toggle('fas');
    this.classList.toggle('liked');
    showToast(icon.classList.contains('fas') ? '❤️ Added to favorites' : '💔 Removed from favorites');
}

function contactClickHandler(e) {
    const contact = this.dataset.contact;
    const name = this.dataset.name;
    showToast(`📞 Contacting about ${name}: ${contact}`, 3000);
}

// Show Toast
function showToast(message, duration = 2000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

// Attach Event Listeners
function attachEventListeners() {
    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter.status = tab.dataset.status;
            displayedCount = 6;
            renderPosts();
            showToast(`Showing ${currentFilter.status === 'all' ? 'all' : currentFilter.status} pets`);
        });
    });
    
    // Category filters
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active-category'));
            card.classList.add('active-category');
            currentFilter.category = card.dataset.category;
            displayedCount = 6;
            renderPosts();
            const categoryName = card.querySelector('p').innerText;
            showToast(`Filtered by: ${categoryName}`);
        });
    });
    
    // Search input
    searchInput.addEventListener('input', (e) => {
        currentFilter.search = e.target.value;
        displayedCount = 6;
        renderPosts();
    });
    
    // Clear search
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentFilter.search = '';
        displayedCount = 6;
        renderPosts();
        showToast('Search cleared');
    });
    
    // Reset all filters
    resetCategoryBtn.addEventListener('click', () => {
        currentFilter = { status: 'all', category: 'all', search: '' };
        searchInput.value = '';
        displayedCount = 6;
        
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.filter-tab[data-status="all"]').classList.add('active');
        
        document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active-category'));
        document.querySelector('.category-card[data-category="all"]').classList.add('active-category');
        
        renderPosts();
        showToast('✨ All filters reset');
    });
    
    // Load more
    loadMoreBtn.addEventListener('click', () => {
        displayedCount += 4;
        renderPosts();
        showToast('Loading more pets...');
    });
}

// Update category counts
function updateCategoryCounts() {
    const counts = {
        all: petsData.length,
        dog: petsData.filter(p => p.type === 'dog').length,
        cat: petsData.filter(p => p.type === 'cat').length,
        bird: petsData.filter(p => p.type === 'bird').length,
        other: petsData.filter(p => p.type === 'other').length
    };
    
    document.querySelectorAll('.category-card').forEach(card => {
        const category = card.dataset.category;
        const countSpan = card.querySelector('.count');
        if (countSpan && counts[category]) {
            countSpan.textContent = counts[category];
        }
    });
}

// Floating particles effect
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `rgba(0, 180, 216, ${Math.random() * 0.3})`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${Math.random() * 15 + 10}s linear infinite`;
        particle.style.opacity = Math.random() * 0.5;
        container.appendChild(particle);
    }
}

// Add float keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
        10% { opacity: 0.5; }
        90% { opacity: 0.5; }
        100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize on load
document.addEventListener('DOMContentLoaded', init);