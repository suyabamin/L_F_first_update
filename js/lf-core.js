/**
 * Lost & Found — shared API client, auth, storage, and helpers.
 */
(function (global) {
  'use strict';

  const API = 'backend-php';

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  async function api(path, options = {}) {
    const url = path.startsWith('http') ? path : `${API}/${path.replace(/^\//, '')}`;
    const headers = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(options.headers || {})
    };
    const res = await fetch(url, { credentials: 'same-origin', ...options, headers });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { success: false, message: text || 'Invalid server response' };
    }
    return { res, data };
  }

  async function checkHealth() {
    const { res, data } = await api('health.php');
    return res.ok && data?.success;
  }

  async function getMe() {
    try {
      const { res, data } = await api('me.php');
      if (res.ok && data?.success && data.user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('current_user', JSON.stringify(data.user));
        return data;
      }
    } catch {
      // Local demo fallback below.
    }

    if (localStorage.getItem('isLoggedIn') === 'true') {
      try {
        const user = JSON.parse(localStorage.getItem('current_user') || 'null');
        if (user?.email) return { success: true, user, offline: true };
      } catch {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('current_user');
      }
    }

    return null;
  }

  async function requireAuth(redirectTo) {
    const session = await getMe();
    if (!session?.user) {
      window.location.href =
        redirectTo || `Login.html?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return null;
    }
    return session;
  }

  async function requireAdmin() {
    const session = await requireAuth();
    if (!session) return null;
    if (session.user.role !== 'admin') {
      window.location.href = 'DashBoard.html';
      return null;
    }
    return session;
  }

  async function logout() {
    try {
      await fetch(`${API}/logout.php`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
    } catch {
      // silent fallback
    }
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('current_user');
    localStorage.removeItem('registered_user');
    window.location.href = 'Login.html';
  }

  function goToProfile() {
    window.location.href = 'Profile Page.html';
  }

  function userDisplayName(user) {
    return user?.fullName || user?.full_name || user?.username || user?.email || 'User';
  }

  function avatarUrl(user, size = 40) {
    const name = userDisplayName(user);
    return user?.avatar || user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=536FFE&color=fff&bold=true&size=${size}`;
  }

  function ensureAuthStyles() {
    if (document.getElementById('lf-auth-ui-style')) return;
    const style = document.createElement('style');
    style.id = 'lf-auth-ui-style';
    style.textContent = `
      .lf-profile-fab {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 9998;
        width: 44px;
        height: 44px;
        border: 0;
        border-radius: 50%;
        padding: 0;
        cursor: pointer;
        background: #fff;
        box-shadow: 0 10px 28px rgba(15, 23, 42, .18);
        overflow: hidden;
      }
      .lf-profile-fab img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }
      .lf-profile-fab:focus-visible {
        outline: 3px solid #536FFE;
        outline-offset: 3px;
      }
      @media (max-width: 640px) {
        .lf-profile-fab {
          top: 12px;
          right: 12px;
          width: 40px;
          height: 40px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function hydrateProfileElements(user) {
    const name = userDisplayName(user);
    const avatar = avatarUrl(user);

    document.querySelectorAll('.user-name, #userNameDisplay, [data-user-name]').forEach((element) => {
      element.textContent = name;
    });

    document.querySelectorAll(
      '.user-avatar img, .user-profile img, .profile-avatar img, .nav-profile img, .admin-profile img, img[data-user-avatar]'
    ).forEach((img) => {
      img.src = avatar;
      img.alt = `${name} profile`;
    });

    document.querySelectorAll(
      '.profile-badge, .user-avatar, .user-profile, .profile-avatar, .nav-profile, .admin-profile, [data-action="profile"]'
    ).forEach((element) => {
      element.setAttribute('role', element.getAttribute('role') || 'button');
      element.setAttribute('tabindex', element.getAttribute('tabindex') || '0');
      element.setAttribute('title', 'Open profile');
      element.dataset.action = element.dataset.action || 'profile';
    });
  }

  function ensureProfileIcon(user) {
    if (!user) return;
    ensureAuthStyles();
    const existing = document.getElementById('lfProfileFab');
    if (existing) {
      const img = existing.querySelector('img');
      if (img) {
        img.src = avatarUrl(user);
        img.alt = `${userDisplayName(user)} profile`;
      }
      return;
    }

    const button = document.createElement('button');
    button.id = 'lfProfileFab';
    button.className = 'lf-profile-fab';
    button.type = 'button';
    button.dataset.action = 'profile';
    button.title = 'Open profile';
    button.setAttribute('aria-label', 'Open profile');
    button.innerHTML = `<img src="${avatarUrl(user)}" alt="${escapeHtml(userDisplayName(user))} profile">`;
    document.body.appendChild(button);
  }

  async function syncAuthUI() {
    const session = await getMe();
    if (!session?.user) return null;
    hydrateProfileElements(session.user);
    ensureProfileIcon(session.user);
    attachGlobalAuthActions();
    return session;
  }

  function attachGlobalAuthActions() {
    document.querySelectorAll('.logout-btn, [data-action="logout"]').forEach((element) => {
      if (element.dataset.lfLogoutBound) return;
      element.dataset.lfLogoutBound = '1';
      element.addEventListener('click', async (event) => {
        event.preventDefault();
        await logout();
      });
    });

    document.querySelectorAll('.profile-badge, .user-avatar, [data-action="profile"]').forEach((element) => {
      if (element.dataset.lfProfileBound) return;
      element.dataset.lfProfileBound = '1';
      element.addEventListener('click', (event) => {
        const target = event.currentTarget;
        if (target.tagName === 'A' && target.getAttribute('href')?.includes('Profile Page.html')) {
          return;
        }
        event.preventDefault();
        goToProfile();
      });
    });
  }

  async function fetchItems(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const { res, data } = await api(`browse_listing.php${qs ? `?${qs}` : ''}`);
    if (!res.ok) {
      throw new Error(data?.message || 'Could not load listings. Run: npm start');
    }
    return Array.isArray(data) ? data : [];
  }

  async function fetchItem(id) {
    const { res, data } = await api(`item.php?id=${encodeURIComponent(id)}`);
    if (!res.ok || !data?.success) throw new Error(data?.message || 'Item not found');
    return data.item;
  }

  async function register(formEl) {
    const response = await fetch(formEl.action, {
      method: 'POST',
      body: new FormData(formEl),
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
    });
    const data = await response.json();
    return { response, data };
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatTimeAgo(dateStr) {
    if (!dateStr) return 'Recently';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${Math.max(1, mins)} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function categoryIcon(category) {
    const key = String(category || '').toLowerCase();
    if (key.includes('elect')) return 'fa-solid fa-mobile-screen';
    if (key.includes('pet')) return 'fa-solid fa-paw';
    if (key.includes('paper') || key.includes('document')) return 'fa-solid fa-file-lines';
    if (key.includes('bag') || key.includes('wallet')) return 'fa-solid fa-bag-shopping';
    if (key.includes('key')) return 'fa-solid fa-key';
    if (key.includes('jewel')) return 'fa-regular fa-gem';
    return 'fa-regular fa-note-sticky';
  }

  function postEmoji(category) {
    const key = String(category || '').toLowerCase();
    if (key.includes('elect') || key.includes('phone')) return '📱';
    if (key.includes('pet')) return '🐾';
    if (key.includes('bag') || key.includes('wallet')) return '🎒';
    if (key.includes('key')) return '🔑';
    if (key.includes('jewel')) return '💍';
    if (key.includes('paper')) return '📄';
    return '📦';
  }

  function detailsUrl(id) {
    return `Post Details.html?id=${id}`;
  }

  function initAuthGuard() {
    const script = document.currentScript;
    if (!script) return;

    const requiresAuth = script.dataset.requireAuth !== undefined;
    const requiresAdmin = script.dataset.requireAdmin !== undefined;

    const runGuard = async () => {
      if (requiresAdmin) {
        await requireAdmin();
      } else if (requiresAuth) {
        await requireAuth();
      }
      await syncAuthUI();
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runGuard);
    } else {
      runGuard();
    }
  }

  function showConnectionBanner() {
    checkHealth().then((ok) => {
      if (ok) return;
      const banner = document.createElement('div');
      banner.setAttribute('role', 'alert');
      banner.style.cssText =
        'position:fixed;top:0;left:0;right:0;z-index:9999;background:#b91c1c;color:#fff;padding:10px 16px;text-align:center;font-size:14px;';
      banner.textContent = 'Cannot reach the app server. In the project folder run: npm install && npm start';
      document.body.prepend(banner);
    });
  }

  initAuthGuard();
  if (document.currentScript) showConnectionBanner();

  global.LF = {
    api,
    checkHealth,
    getMe,
    requireAuth,
    requireAdmin,
    logout,
    goToProfile,
    syncAuthUI,
    fetchItems,
    fetchItem,
    register,
    getParam,
    escapeHtml,
    formatTimeAgo,
    categoryIcon,
    postEmoji,
    detailsUrl
  };
})(window);
