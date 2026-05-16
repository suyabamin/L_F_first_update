// Favorites Workspace - Interactive JavaScript
(function() {
  'use strict';

  // DOM Elements
  const grid = document.getElementById('favoritesGrid');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const totalCountSpan = document.getElementById('total-count');
  const resolvedCountSpan = document.getElementById('resolved-count');
  const emptyState = document.getElementById('emptyState');
  const noResultsState = document.getElementById('noResultsState');
  const toast = document.getElementById('toast');
  const newAlertBtn = document.getElementById('newAlertBtn');
  const browseBtn = document.getElementById('browseBtn');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');

  // Helper: Show Toast Notification
  function showToast(message, isError = false) {
    toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> ${message}`;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 3000);
  }

  // Helper: Update Statistics
  function updateStatistics() {
    const cards = document.querySelectorAll('.modern-card:not(.removing)');
    const total = cards.length;
    const resolved = Array.from(cards).filter(card => 
      card.getAttribute('data-status') === 'resolved'
    ).length;
    
    totalCountSpan.textContent = total.toString().padStart(2, '0');
    resolvedCountSpan.textContent = resolved.toString().padStart(2, '0');
    
    return { total, resolved };
  }

  // Helper: Apply Filters (Search + Category)
  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;
    const cards = document.querySelectorAll('.modern-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const location = (card.getAttribute('data-location') || '').toLowerCase();
      const cardCategory = card.getAttribute('data-category');
      
      const matchesSearch = searchTerm === '' || title.includes(searchTerm) || location.includes(searchTerm);
      const matchesCategory = category === 'all' || cardCategory === category;
      
      if (matchesSearch && matchesCategory) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    // Show/Hide Empty/No Results States
    const totalCards = cards.length;
    if (totalCards === 0) {
      grid.style.display = 'none';
      emptyState.style.display = 'block';
      noResultsState.style.display = 'none';
    } else if (visibleCount === 0) {
      grid.style.display = 'none';
      emptyState.style.display = 'none';
      noResultsState.style.display = 'block';
    } else {
      grid.style.display = 'grid';
      emptyState.style.display = 'none';
      noResultsState.style.display = 'none';
    }
    
    updateStatistics();
  }

  // Remove Card from Favorites with Animation
  function removeCard(button) {
    const card = button.closest('.modern-card');
    if (!card) return;
    
    const itemName = card.querySelector('h3')?.innerText || 'Item';
    
    // Add removing class and animate out
    card.style.transform = 'scale(0.9)';
    card.style.opacity = '0';
    card.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      card.remove();
      showToast(`🗑️ "${itemName}" removed from favorites`);
      applyFilters();
      updateStatistics();
      
      // Check if grid is empty after removal
      if (document.querySelectorAll('.modern-card').length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        noResultsState.style.display = 'none';
      }
    }, 300);
  }

  // View Case Handler
  function viewCase(button) {
    const card = button.closest('.modern-card');
    const itemName = card.querySelector('h3')?.innerText || 'case';
    showToast(`🔍 Opening case for "${itemName}"...`);
    // Simulate navigation
    setTimeout(() => {
      console.log(`Navigating to case: ${itemName}`);
    }, 500);
  }

  // Clear All Filters
  function clearFilters() {
    searchInput.value = '';
    categoryFilter.value = 'all';
    applyFilters();
    showToast('✨ All filters cleared', false);
  }

  // Keyboard Shortcuts
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
        showToast('🔍 Type to search your favorites', false);
      }
      
      if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        applyFilters();
        showToast('Search cleared', false);
      }
    });
  }

  // Add Card Interactions
  function addCardInteractions() {
    const cards = document.querySelectorAll('.modern-card');
    cards.forEach(card => {
      const viewBtn = card.querySelector('.btn-action');
      if (viewBtn) {
        viewBtn.removeEventListener('click', viewCaseHandler);
        viewBtn.addEventListener('click', viewCaseHandler);
      }
      
      const heartBtn = card.querySelector('.heart-btn');
      if (heartBtn) {
        heartBtn.removeEventListener('click', removeCardHandler);
        heartBtn.addEventListener('click', removeCardHandler);
      }
    });
  }
  
  function viewCaseHandler(e) {
    e.stopPropagation();
    viewCase(this);
  }
  
  function removeCardHandler(e) {
    e.stopPropagation();
    removeCard(this);
  }

  // Initialize Event Listeners
  function initEventListeners() {
    searchInput.addEventListener('input', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    
    if (newAlertBtn) {
      newAlertBtn.addEventListener('click', () => {
        showToast('🔔 Creating new alert...');
      });
    }
    
    if (browseBtn) {
      browseBtn.addEventListener('click', () => {
        showToast('📦 Redirecting to listings...');
      });
    }
    
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    // Card click for quick view
    document.querySelectorAll('.modern-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.heart-btn') && !e.target.closest('.btn-action')) {
          const itemName = card.querySelector('h3')?.innerText;
          showToast(`📋 ${itemName} - Quick view`);
        }
      });
    });
  }

  // Handle window resize for full-screen adaptation
  function handleResize() {
    const width = window.innerWidth;
    const sidebar = document.querySelector('.sidebar');
    
    if (width <= 768 && sidebar) {
      // Optional: Add hamburger menu logic here
    }
  }

  // Sync data attributes from DOM content
  function syncDataAttributes() {
    const cards = document.querySelectorAll('.modern-card');
    cards.forEach(card => {
      const title = card.querySelector('h3')?.innerText;
      const location = card.querySelector('.loc-tag')?.innerText.replace(/[📍]/g, '').trim();
      const statusBadge = card.querySelector('.glass-badge')?.innerText.toLowerCase();
      
      if (title && !card.getAttribute('data-title')) {
        card.setAttribute('data-title', title);
      }
      if (location && !card.getAttribute('data-location')) {
        card.setAttribute('data-location', location);
      }
      if (statusBadge && !card.getAttribute('data-status')) {
        let status = 'found';
        if (statusBadge.includes('lost')) status = 'lost';
        if (statusBadge.includes('resolved')) status = 'resolved';
        card.setAttribute('data-status', status);
      }
    });
  }

  // Observe dynamic changes
  function observeDynamicChanges() {
    const observer = new MutationObserver(() => {
      addCardInteractions();
      updateStatistics();
    });
    
    observer.observe(grid, { childList: true, subtree: true });
  }

  // Initial Load
  function initialLoad() {
    syncDataAttributes();
    addCardInteractions();
    updateStatistics();
    applyFilters();
    initEventListeners();
    setupKeyboardShortcuts();
    observeDynamicChanges();
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Welcome toast
    setTimeout(() => {
      const cardCount = document.querySelectorAll('.modern-card').length;
      if (cardCount > 0) {
        showToast(`✨ Welcome! ${cardCount} saved favorite${cardCount > 1 ? 's' : ''}`);
      }
    }, 500);
  }

  // Start the application
  initialLoad();
})();