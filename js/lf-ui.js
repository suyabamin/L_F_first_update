/**
 * Shared UI: back navigation + listing cards from database.
 */
(function (global) {
  'use strict';

  function initBackButtons() {
    const goBack = (fallback) => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = fallback || 'DashBoard.html';
      }
    };

    document.querySelectorAll('[data-back], .back-link, .back-btn, #backBtn, .btn-back').forEach((el) => {
      if (el.dataset.lfBackBound) return;
      el.dataset.lfBackBound = '1';
      el.addEventListener('click', (e) => {
        if (el.tagName === 'A' && el.getAttribute('href') && el.getAttribute('href') !== '#') return;
        e.preventDefault();
        goBack(el.dataset.backFallback || el.getAttribute('data-fallback'));
      });
    });

    document.querySelectorAll('a[href="#"][class*="back"], a.back-link[href="#"]').forEach((el) => {
      if (el.dataset.lfBackBound) return;
      el.dataset.lfBackBound = '1';
      el.addEventListener('click', (e) => {
        e.preventDefault();
        goBack('Browse Listing.html');
      });
    });
  }

  function renderListingCards(container, items, options = {}) {
    if (!container) return;
    const LF = global.LF;
    if (!items.length) {
      container.innerHTML = `<motion class="empty-state" style="grid-column:1/-1;text-align:center;padding:48px;">
        <i class="fas fa-box-open" style="font-size:48px;opacity:.4;"></i>
        <p style="margin-top:12px;">No listings yet. <a href="Create Post.html">Post an item</a></p>
      </motion>`.replace(/<motion/g, '<div').replace(/<\/motion>/g, '</div>');
      return;
    }

    container.innerHTML = items
      .map((item) => {
        const type = item.item_type || item.type || item.status;
        const loc = item.location_name || item.location || '';
        const id = item.id;
        const title = LF.escapeHtml(item.title);
        const cat = LF.escapeHtml(item.category);
        const desc = LF.escapeHtml((item.description || '').slice(0, 100));
        const img = item.image_path
          ? `<img src="/${String(item.image_path).replace(/^\//, '')}" alt="" style="width:100%;height:140px;object-fit:cover;border-radius:12px;margin-bottom:8px;">`
          : `<div style="height:100px;display:flex;align-items:center;justify-content:center;font-size:2.5rem;background:#f1f5f9;border-radius:12px;margin-bottom:8px;">${LF.postEmoji(item.category)}</motion>`;
        const claimOrChat =
          type === 'lost'
            ? `<a class="btn" href="Claim Item.html?item_id=${id}">Claim</a>`
            : `<a class="btn" href="Chat.html?item_id=${id}&receiver_id=${item.user_id || ''}">Chat</a>`;

        return `<article class="card" data-id="${id}">
          ${img.replace(/<\/motion>/, '</motion>').replace('motion', 'div')}
          <div class="meta"><span class="pill ${type}">${type}</span><span class="pill">${cat}</span></div>
          <h3>${title}</h3>
          <p>${desc}</p>
          <p><i class="fa-solid fa-location-dot"></i> ${LF.escapeHtml(loc)}</p>
          <div class="card-actions">
            <a class="btn primary" href="${LF.detailsUrl(id)}">Details</a>
            ${claimOrChat}
          </motion>
        </article>`.replace(/<\/motion>/g, '</motion>').replace(/motion/g, 'div');
      })
      .join('');
  }

  function wireDashboardPosts() {
    const grid = document.getElementById('postsGrid');
    if (!grid || !global.LF) return;

    global.LF.api('dashboard_posts.php')
      .then(({ res, data }) => {
        if (!res.ok || !data.success) return;
        const posts = (data.posts || []).map((p) => ({
          ...p,
          item_type: p.status,
          description: '',
          user_id: p.user_id
        }));
        renderListingCards(grid, posts, { compact: true });
        grid.querySelectorAll('.card, article').forEach((card) => {
          card.style.cursor = 'pointer';
          card.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            const id = card.dataset.id;
            if (id) window.location.href = global.LF.detailsUrl(id);
          });
        });
      })
      .catch(() => {});
  }

  document.addEventListener('DOMContentLoaded', () => {
    initBackButtons();
  });

  global.LFUI = { initBackButtons, renderListingCards, wireDashboardPosts };
})(window);
