/**
 * Loads category listings from the database when <body data-lf-category="..."> is set.
 * Runs after page scripts so demo/static cards can be replaced with real posts.
 */
(function () {
  'use strict';

  const CATEGORY_LABELS = {
    electronics: 'Electronics',
    pets: 'Pets',
    bag: 'Bag',
    key: 'Keys',
    paper: 'Paper',
    jewelry: 'Jewelry',
    others: 'Others'
  };

  function normalizeCategory(category) {
    const key = String(category || '').trim().toLowerCase();
    const aliases = {
      documents: 'paper',
      document: 'paper',
      keys: 'key',
      bags: 'bag',
      wallets: 'bag',
      wallet: 'bag',
      pet: 'pets'
    };
    return aliases[key] || key;
  }

  function escapeHtml(value) {
    return window.LF ? window.LF.escapeHtml(value) : String(value || '');
  }

  function timeAgo(value) {
    return window.LF ? window.LF.formatTimeAgo(value) : 'Recently';
  }

  function detailsUrl(id) {
    return window.LF ? window.LF.detailsUrl(id) : `Post Details.html?id=${id}`;
  }

  function itemIcon(item) {
    if (item.image_path) {
      return `<img src="${escapeHtml(item.image_path)}" alt="" style="width:100%;height:100%;object-fit:cover;">`;
    }

    const category = normalizeCategory(item.category);
    const icon = {
      electronics: 'fa-laptop',
      pets: 'fa-paw',
      bag: 'fa-bag-shopping',
      key: 'fa-key',
      paper: 'fa-file-alt',
      jewelry: 'fa-gem',
      others: 'fa-box'
    }[category] || 'fa-box';

    return `<i class="fas ${icon}"></i>`;
  }

  function renderProductCard(item) {
    const status = item.item_type || item.status || 'lost';
    const location = item.location_name || item.location || '';
    const category = normalizeCategory(item.category);
    const label = CATEGORY_LABELS[category] || category;

    return `<div class="item-card" data-id="${item.id}" data-status="${status}" data-title="${escapeHtml(item.title)}">
      <div class="item-image">
        ${itemIcon(item)}
        <span class="status-badge-card ${status}">${status === 'lost' ? 'LOST' : 'FOUND'}</span>
        <button class="favorite-btn" data-id="${item.id}"><i class="far fa-heart"></i></button>
      </div>
      <div class="item-info">
        <h3 class="item-title">${escapeHtml(item.title)}</h3>
        <div class="item-category"><i class="fas fa-tag"></i> ${escapeHtml(label)}</div>
        <div class="item-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(location)}</div>
        <div class="item-time"><i class="far fa-clock"></i> ${timeAgo(item.created_at)}</div>
      </div>
    </div>`;
  }

  function renderPostCard(item) {
    const status = item.item_type || item.status || 'lost';
    const location = item.location_name || item.location || '';
    const category = normalizeCategory(item.category);
    const label = CATEGORY_LABELS[category] || category;
    const badgeClass = status === 'lost' ? 'reward-badge' : 'claimed-badge';
    const badgeText = status === 'lost' ? 'Reward Available' : 'Waiting for Owner';

    return `<div class="post-card" data-id="${item.id}" data-status="${status}" data-category="${category}" data-title="${escapeHtml(item.title)}">
      <div class="card-image">
        <div class="img-placeholder">${itemIcon(item)}</div>
        <span class="status-badge ${status === 'lost' ? 'status-lost' : 'status-found'}">${status === 'lost' ? 'Lost' : 'Found'}</span>
        <button class="favorite-btn"><i class="far fa-heart"></i></button>
      </div>
      <div class="post-info">
        <h3>${escapeHtml(item.title)}</h3>
        <p class="location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(location)}</p>
        <div class="post-meta">
          <span class="category-tag"><i class="fas fa-tag"></i> ${escapeHtml(label)}</span>
          <span class="time"><i class="far fa-clock"></i> ${timeAgo(item.created_at)}</span>
        </div>
        <div class="${badgeClass}">${badgeText}</div>
      </div>
    </div>`;
  }

  function renderPaperCard(item) {
    const status = item.item_type || item.status || 'lost';
    const location = item.location_name || item.location || '';
    const category = normalizeCategory(item.category);
    const label = CATEGORY_LABELS[category] || category;

    return `<div class="post-card-item" data-id="${item.id}" data-category="${category}" data-status="${status}">
      <div class="card-header-img" style="background: #f8fbfd;">
        <span style="font-size: 3rem;">${window.LF ? window.LF.postEmoji(category) : ''}</span>
      </div>
      <div class="post-content">
        <span class="status-chip ${status === 'lost' ? 'status-lost-badge' : 'status-found-badge'}">
          ${status === 'lost' ? 'LOST' : 'FOUND'}
        </span>
        <h3 class="post-title">${escapeHtml(item.title)}</h3>
        <div class="category-meta">
          <i class="fas fa-tag"></i> Category: ${escapeHtml(label)}
          <i class="fas fa-map-pin"></i> ${escapeHtml(location)}
        </div>
        <p style="font-size: 0.85rem; color: #5f7f8f; margin: 8px 0;">${escapeHtml(item.description || '')}</p>
        <div class="time-meta"><i class="far fa-clock"></i> ${timeAgo(item.created_at)}</div>
        <i class="far fa-heart heart-like" data-id="${item.id}"></i>
      </div>
    </div>`;
  }

  function updateStats(items) {
    const total = items.length;
    const lost = items.filter((item) => (item.item_type || item.status) === 'lost').length;
    const found = total - lost;

    const totalEl = document.getElementById('totalItems');
    const lostEl = document.getElementById('lostCount');
    const foundEl = document.getElementById('foundCount');
    const resultEl = document.getElementById('resultNumber');
    const paperTotalEl = document.getElementById('totalPaperCount');

    if (totalEl) totalEl.textContent = total;
    if (lostEl) lostEl.textContent = lost;
    if (foundEl) foundEl.textContent = found;
    if (resultEl) resultEl.textContent = total;
    if (paperTotalEl) paperTotalEl.textContent = total;
  }

  function wireCards(grid) {
    grid.querySelectorAll('[data-id]').forEach((card) => {
      card.addEventListener('click', (event) => {
        if (event.target.closest('button, a, .favorite-btn, .heart-like')) return;
        window.location.href = detailsUrl(card.dataset.id);
      });
    });

    grid.querySelectorAll('.favorite-btn, .heart-like').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const icon = button.querySelector('i') || button;
        icon.classList.toggle('far');
        icon.classList.toggle('fas');
        button.classList.toggle('liked');
      });
    });
  }

  async function loadCategory() {
    const category = normalizeCategory(document.body.dataset.lfCategory);
    const grid =
      document.getElementById('productsGrid') ||
      document.getElementById('postsGrid') ||
      document.getElementById('postsDynamicGrid') ||
      document.getElementById('listingsGrid');

    if (!category || !grid || !window.LF) return;

    try {
      const items = await window.LF.fetchItems({ category });
      updateStats(items);

      if (!items.length) {
        grid.innerHTML = '';
        const empty = document.getElementById('emptyState');
        if (empty) empty.style.display = 'block';
        return;
      }

      if (grid.id === 'productsGrid') {
        grid.innerHTML = items.map(renderProductCard).join('');
      } else if (grid.id === 'postsDynamicGrid') {
        grid.innerHTML = items.map(renderPaperCard).join('');
      } else {
        grid.innerHTML = items.map(renderPostCard).join('');
      }

      const empty = document.getElementById('emptyState');
      if (empty) empty.style.display = 'none';
      wireCards(grid);
    } catch (error) {
      console.warn('Category load failed', error);
    }
  }

  window.addEventListener('load', loadCategory);
})();
