// Conversations - Interactive JavaScript
(function() {
    'use strict';

    // DOM Elements
    const searchInput = document.getElementById('searchConversations');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const conversationsList = document.getElementById('conversationsList');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const filterBtn = document.getElementById('filterBtn');
    const newConversationBtn = document.getElementById('newConversationBtn');
    const startNewBtn = document.getElementById('startNewBtn');
    const emptyState = document.getElementById('emptyState');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    const actionMenu = document.getElementById('actionMenu');
    const toast = document.getElementById('toast');

    let currentFilter = 'all';
    let currentPage = 1;
    let activeConversationId = null;

    // Conversation data for loading more
    const mockConversations = [
        { person: "Michael Lee", item: "Lost Wallet", lastMessage: "Please let me know if you found it", time: "2024-06-15T08:00:00", status: "active", unread: true, avatar: "men/91.jpg", itemType: "lost", itemIcon: "wallet" },
        { person: "Jessica Wong", item: "Found AirPods", lastMessage: "Describe the case color", time: "2024-06-14T20:00:00", status: "active", unread: false, avatar: "women/96.jpg", itemType: "found", itemIcon: "headphones" },
        { person: "David Chen", item: "Lost Passport", lastMessage: "Last seen at the airport", time: "2024-06-14T12:00:00", status: "urgent", unread: true, avatar: "men/75.jpg", itemType: "lost", itemIcon: "passport" }
    ];

    // Show Toast
    function showToast(message, isError = false) {
        toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${message}`;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Update Stats
    function updateStats() {
        const conversations = document.querySelectorAll('.conversation-card');
        const total = conversations.length;
        const unread = document.querySelectorAll('.conversation-card.unread').length;
        const active = document.querySelectorAll('.conversation-card .status.active').length;
        
        document.getElementById('totalConversations').textContent = total;
        document.getElementById('unreadCount').textContent = unread;
        document.getElementById('activeNow').textContent = active;
    }

    // Filter Conversations
    function applyFilters() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const conversations = document.querySelectorAll('.conversation-card');
        let visibleCount = 0;
        
        conversations.forEach(conv => {
            const person = conv.querySelector('h3')?.innerText.toLowerCase() || '';
            const item = conv.querySelector('.item-name')?.innerText.toLowerCase() || '';
            const lastMessage = conv.querySelector('.last-message')?.innerText.toLowerCase() || '';
            const status = conv.dataset.status;
            
            let filterMatch = true;
            if (currentFilter === 'unread') {
                filterMatch = conv.classList.contains('unread');
            } else if (currentFilter === 'active') {
                filterMatch = status === 'active';
            } else if (currentFilter === 'resolved') {
                filterMatch = status === 'resolved';
            }
            
            const searchMatch = searchTerm === '' || person.includes(searchTerm) || item.includes(searchTerm) || lastMessage.includes(searchTerm);
            
            if (filterMatch && searchMatch) {
                conv.style.display = 'flex';
                visibleCount++;
            } else {
                conv.style.display = 'none';
            }
        });
        
        updateStats();
        
        // Show/hide empty state
        if (visibleCount === 0 && conversations.length > 0) {
            emptyState.style.display = 'block';
            loadMoreContainer.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            loadMoreContainer.style.display = 'block';
        }
        
        if (searchTerm !== '') {
            showToast(`🔍 Found ${visibleCount} conversations`, false);
        }
    }

    // Filter Tab Handlers
    function initFilterTabs() {
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentFilter = tab.dataset.filter;
                applyFilters();
                showToast(`Showing: ${tab.innerText}`, false);
            });
        });
    }

    // Search Handler
    function initSearch() {
        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }
    }

    // Load More Conversations
    function initLoadMore() {
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                const newCards = createMockConversationCards(2);
                newCards.forEach(card => {
                    if (conversationsList) conversationsList.appendChild(card);
                });
                updateStats();
                showToast(`Loaded ${newCards.length} more conversations`, false);
                
                currentPage++;
                if (currentPage >= 3) {
                    loadMoreBtn.disabled = true;
                    loadMoreBtn.style.opacity = '0.5';
                    loadMoreBtn.innerHTML = '<i class="fa-solid fa-check"></i> No more conversations';
                }
            });
        }
    }

    // Create Mock Conversation Cards
    function createMockConversationCards(count) {
        const newCards = [];
        
        for (let i = 0; i < count && i < mockConversations.length; i++) {
            const conv = mockConversations[i % mockConversations.length];
            const card = document.createElement('article');
            card.className = 'conversation-card';
            if (conv.unread) card.classList.add('unread');
            card.setAttribute('data-status', conv.status);
            card.setAttribute('data-item', conv.item);
            card.setAttribute('data-person', conv.person);
            
            const statusClass = conv.status === 'resolved' ? 'resolved' : (conv.status === 'urgent' ? 'urgent' : 'active');
            const statusText = conv.status === 'resolved' ? '✓ Resolved' : (conv.status === 'urgent' ? 'Urgent' : 'Active');
            
            card.innerHTML = `
                <div class="conversation-avatar">
                    <img src="https://randomuser.me/api/portraits/${conv.avatar}" alt="${conv.person}">
                    ${conv.status === 'active' ? '<span class="online-indicator"></span>' : ''}
                </div>
                <div class="conversation-info">
                    <div class="conversation-header">
                        <div>
                            <h3>${conv.person}</h3>
                            <span class="item-badge ${conv.itemType}">${conv.itemType === 'found' ? 'Found Item' : 'Lost Item'}</span>
                        </div>
                        <span class="time">Just now</span>
                    </div>
                    <p class="item-name"><i class="fa-solid fa-${conv.itemIcon}"></i> ${conv.item}</p>
                    <p class="last-message">${conv.lastMessage}</p>
                    <div class="conversation-meta">
                        ${conv.unread ? '<span class="message-count">1 new message</span>' : ''}
                        <span class="status ${statusClass}">${statusText}</span>
                    </div>
                </div>
                <div class="conversation-actions">
                    <a href="Chat.html" class="btn-chat"><i class="fa-solid fa-comment"></i> Open Chat</a>
                    <button class="btn-more"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                </div>
            `;
            card.style.animation = 'fadeInUp 0.3s ease';
            newCards.push(card);
        }
        return newCards;
    }

    // Action Menu Handler
    function initActionMenu() {
        document.addEventListener('click', (e) => {
            // Close action menu when clicking outside
            if (actionMenu && !actionMenu.contains(e.target) && !e.target.closest('.btn-more')) {
                actionMenu.classList.remove('show');
                activeConversationId = null;
            }
            
            // Open action menu on more button click
            if (e.target.closest('.btn-more')) {
                e.stopPropagation();
                const btn = e.target.closest('.btn-more');
                const card = btn.closest('.conversation-card');
                const rect = btn.getBoundingClientRect();
                
                activeConversationId = card.querySelector('h3')?.innerText || '';
                
                if (actionMenu) {
                    actionMenu.style.top = `${rect.bottom + 5}px`;
                    actionMenu.style.left = `${rect.left - 100}px`;
                    actionMenu.classList.add('show');
                }
            }
        });
        
        // Action menu buttons
        const markReadBtn = document.getElementById('markReadBtn');
        const archiveBtn = document.getElementById('archiveBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        const reportBtn = document.getElementById('reportBtn');
        
        if (markReadBtn) {
            markReadBtn.addEventListener('click', () => {
                if (activeConversationId) {
                    const cards = document.querySelectorAll('.conversation-card');
                    cards.forEach(card => {
                        if (card.querySelector('h3')?.innerText === activeConversationId) {
                            card.classList.remove('unread');
                            const msgCount = card.querySelector('.message-count');
                            if (msgCount) msgCount.remove();
                        }
                    });
                    updateStats();
                    showToast('Marked as read', false);
                }
                actionMenu.classList.remove('show');
            });
        }
        
        if (archiveBtn) {
            archiveBtn.addEventListener('click', () => {
                if (activeConversationId) {
                    showToast('Conversation archived', false);
                }
                actionMenu.classList.remove('show');
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (activeConversationId) {
                    const cards = document.querySelectorAll('.conversation-card');
                    cards.forEach(card => {
                        if (card.querySelector('h3')?.innerText === activeConversationId) {
                            card.remove();
                        }
                    });
                    updateStats();
                    applyFilters();
                    showToast('Conversation deleted', false);
                }
                actionMenu.classList.remove('show');
            });
        }
        
        if (reportBtn) {
            reportBtn.addEventListener('click', () => {
                if (activeConversationId) {
                    showToast('Report submitted. We will review it.', false);
                }
                actionMenu.classList.remove('show');
            });
        }
    }

    // Header Button Handlers
    function initHeaderButtons() {
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                showToast('Filter options coming soon', false);
            });
        }
        
        if (newConversationBtn) {
            newConversationBtn.addEventListener('click', () => {
                showToast('New conversation feature coming soon', false);
            });
        }
        
        if (startNewBtn) {
            startNewBtn.addEventListener('click', () => {
                showToast('Start a new conversation', false);
            });
        }
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
    }

    // Keyboard Shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (searchInput) {
                    searchInput.focus();
                    showToast('🔍 Search conversations', false);
                }
            }
            
            if (e.key === 'Escape' && actionMenu && actionMenu.classList.contains('show')) {
                actionMenu.classList.remove('show');
            }
            
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.value = '';
                applyFilters();
                showToast('Search cleared', false);
            }
        });
    }

    // Mark conversation as read on click
    function initConversationClick() {
        if (conversationsList) {
            conversationsList.addEventListener('click', (e) => {
                const card = e.target.closest('.conversation-card');
                if (card && !e.target.closest('.btn-more') && !e.target.closest('.btn-chat')) {
                    if (card.classList.contains('unread')) {
                        card.classList.remove('unread');
                        const msgCount = card.querySelector('.message-count');
                        if (msgCount) msgCount.remove();
                        updateStats();
                    }
                    showToast('Opening conversation...', false);
                }
            });
        }
    }

    // Animate Stats
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
            showToast('💬 Welcome to Conversations! You have new messages', false);
        }, 800);
    }

    // Initialize Everything
    function init() {
        initFilterTabs();
        initSearch();
        initLoadMore();
        initActionMenu();
        initHeaderButtons();
        initNavLinks();
        initKeyboardShortcuts();
        initConversationClick();
        updateStats();
        animateStats();
        showWelcome();
    }

    init();
})();