// Admin Panel - Interactive JavaScript
(function() {
    'use strict';

    // DOM Elements
    const searchInput = document.getElementById('globalSearch');
    const toastContainer = document.getElementById('toastMessage');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuTabs = document.querySelectorAll('.menu-tabs span');
    const actionBtns = document.querySelectorAll('.action-btn');
    const viewButtons = document.querySelectorAll('.btn-sm');
    
    // Helper: Show Toast
    function showToast(message, isError = false) {
        toastContainer.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${message}`;
        toastContainer.classList.add('show');
        setTimeout(() => {
            toastContainer.classList.remove('show');
        }, 3000);
    }

    // Initialize Bar Chart Heights
    function initBarChart() {
        const bars = document.querySelectorAll('.bar');
        bars.forEach(bar => {
            const value = bar.getAttribute('data-value');
            if (value) {
                bar.style.height = value + '%';
            }
        });
    }

    // Initialize Hotspot Bars
    function initHotspots() {
        const hotspots = document.querySelectorAll('.h-bar');
        hotspots.forEach(hotspot => {
            const barFill = hotspot.querySelector('.bar-fill');
            const value = hotspot.getAttribute('data-value');
            if (barFill && value) {
                barFill.style.height = value + '%';
            }
        });
    }

    // Draw Wave Chart
    function drawWaveChart() {
        const canvas = document.getElementById('waveChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width = 200;
        const height = canvas.height = 80;
        
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#26a69a');
        gradient.addColorStop(1, '#006a71');
        
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        for (let x = 0; x <= width; x += 10) {
            const y = Math.sin(x * 0.05) * 15 + Math.sin(x * 0.15) * 8;
            ctx.lineTo(x, height - 20 - y);
        }
        
        ctx.lineTo(width, height);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.strokeStyle = '#00cfe8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height - 20 - Math.sin(0) * 15);
        for (let x = 0; x <= width; x += 5) {
            const y = Math.sin(x * 0.05) * 15 + Math.sin(x * 0.15) * 8;
            ctx.lineTo(x, height - 20 - y);
        }
        ctx.stroke();
    }

    // Draw Payment Trend Mini Chart
    function drawPaymentTrend() {
        const canvas = document.getElementById('paymentTrend');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.parentElement.clientWidth;
        canvas.width = width;
        canvas.height = 40;
        
        const ctx2 = canvas.getContext('2d');
        ctx2.beginPath();
        ctx2.moveTo(0, 30);
        
        const points = [30, 25, 35, 28, 32, 20, 25, 30, 28, 35];
        for (let i = 0; i < points.length; i++) {
            const x = (i / (points.length - 1)) * width;
            const y = 35 - (points[i] / 40) * 30;
            ctx2.lineTo(x, y);
        }
        
        ctx2.strokeStyle = '#26a69a';
        ctx2.lineWidth = 2;
        ctx2.stroke();
        
        // Fill gradient
        ctx2.lineTo(width, 40);
        ctx2.lineTo(0, 40);
        ctx2.fillStyle = 'rgba(38,166,154,0.1)';
        ctx2.fill();
    }

    // Search Functionality
    function initSearch() {
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                showToast(`Searching: "${searchTerm}" - Found 3 results`, false);
                
                // Highlight matching rows in tables
                const tables = document.querySelectorAll('table tbody tr');
                tables.forEach(row => {
                    const text = row.innerText.toLowerCase();
                    if (text.includes(searchTerm) || searchTerm === '') {
                        row.style.display = '';
                        if (searchTerm && text.includes(searchTerm)) {
                            row.style.backgroundColor = 'rgba(38,166,154,0.1)';
                            setTimeout(() => {
                                row.style.backgroundColor = '';
                            }, 2000);
                        }
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
        }
    }

    // Filter Button Functionality
    function initFilters() {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                showToast(`Filter: ${btn.innerText} applied`, false);
                
                // Simulate filtering
                const filterText = btn.innerText.toLowerCase();
                if (filterText === 'flags') {
                    document.querySelector('.flags').style.transform = 'scale(1.02)';
                    setTimeout(() => {
                        document.querySelector('.flags').style.transform = '';
                    }, 300);
                }
            });
        });
    }

    // Tab Switching
    function initTabs() {
        menuTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                menuTabs.forEach(t => t.classList.remove('active-tab'));
                tab.classList.add('active-tab');
                showToast(`Switched to ${tab.innerText} tab`, false);
            });
        });
    }

    // Quick Actions
    function initQuickActions() {
        actionBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const title = btn.querySelector('h4')?.innerText || 'Action';
                showToast(`🚀 ${title} - Processing...`, false);
                
                // Animate button
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 200);
            });
        });
    }

    // View Action Buttons
    function initViewButtons() {
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const row = btn.closest('tr');
                const userName = row?.querySelector('td:first-child')?.innerText || 'User';
                showToast(`📋 Reviewing ${userName} - Action initiated`, false);
                
                btn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 150);
            });
        });
    }

    // Update Stats with Animation
    function animateStats() {
        const totalUsers = document.getElementById('totalUsers');
        const totalItems = document.getElementById('totalItems');
        
        if (totalUsers) {
            let start = 0;
            const end = 25000;
            const duration = 1000;
            const increment = end / (duration / 16);
            
            const counter = setInterval(() => {
                start += increment;
                if (start >= end) {
                    totalUsers.textContent = end.toLocaleString();
                    clearInterval(counter);
                } else {
                    totalUsers.textContent = Math.floor(start).toLocaleString();
                }
            }, 16);
        }
        
        if (totalItems) {
            let start = 0;
            const end = 75000;
            const duration = 1000;
            const increment = end / (duration / 16);
            
            const counter = setInterval(() => {
                start += increment;
                if (start >= end) {
                    totalItems.textContent = end.toLocaleString();
                    clearInterval(counter);
                } else {
                    totalItems.textContent = Math.floor(start).toLocaleString();
                }
            }, 16);
        }
    }

    async function fetchAdminUsers() {
        const usersTable = document.getElementById('adminUsersTable');
        if (!usersTable) return;

        usersTable.innerHTML = '<tr><td colspan="5">Loading users...</td></tr>';
        try {
            const { res, data } = await LF.api('admin/users.php');
            if (!res.ok || !data.success) {
                usersTable.innerHTML = '<tr><td colspan="5">Unable to load user list.</td></tr>';
                return;
            }

            const users = Array.isArray(data.users) ? data.users : [];
            if (users.length === 0) {
                usersTable.innerHTML = '<tr><td colspan="5">No users found.</td></tr>';
                return;
            }

            usersTable.innerHTML = users.map(user => {
                const roleBadge = user.role === 'admin' ? '<span class="status-badge success">Admin</span>' : '<span class="status-badge info">User</span>';
                const statusBadge = user.status === 'active' ? '<span class="status-badge green">Active</span>' : '<span class="status-badge danger">Blocked</span>';
                const toggleRoleLabel = user.role === 'admin' ? 'Demote' : 'Make Admin';
                const toggleStatusLabel = user.status === 'active' ? 'Ban' : 'Unban';
                const currentUser = JSON.parse(localStorage.getItem('current_user') || 'null');
                const disabledAttr = currentUser && user.id === currentUser.id ? ' disabled' : '';

                return `
                    <tr>
                        <td>${LF.escapeHtml(user.fullName)}</td>
                        <td>${LF.escapeHtml(user.email)}</td>
                        <td>${roleBadge}</td>
                        <td>${statusBadge}</td>
                        <td>
                            <button class="btn-sm user-action-btn" data-user-id="${user.id}" data-action="toggleRole"${disabledAttr}>${toggleRoleLabel}</button>
                            <button class="btn-sm user-action-btn" data-user-id="${user.id}" data-action="toggleStatus"${disabledAttr}>${toggleStatusLabel}</button>
                        </td>
                    </tr>`;
            }).join('');

            document.querySelectorAll('.user-action-btn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    event.stopPropagation();
                    const target = event.currentTarget;
                    const userId = target.dataset.userId;
                    const action = target.dataset.action;
                    await handleAdminUserAction(userId, action, target);
                });
            });
        } catch (error) {
            usersTable.innerHTML = '<tr><td colspan="5">Unable to load user list.</td></tr>';
        }
    }

    async function handleAdminUserAction(userId, action, button) {
        if (!button) return;
        button.disabled = true;
        try {
            const formData = new FormData();
            formData.set('id', userId);
            formData.set('action', action);
            const { res, data } = await LF.api('admin/user-action.php', {
                method: 'POST',
                body: formData
            });

            if (!res.ok || !data.success) {
                showToast(data.message || 'Action failed.', true);
                return;
            }

            showToast(data.message || 'Action completed successfully.', false);
            await fetchAdminUsers();
        } catch (error) {
            showToast('Server request failed. Try again.', true);
        } finally {
            button.disabled = false;
        }
    }

    // Add Hover Animations to Cards
    function initCardAnimations() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // Keyboard Shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // CMD + / for search focus
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault();
                if (searchInput) {
                    searchInput.focus();
                    showToast('🔍 Search activated', false);
                }
            }
            
            // Escape to clear search
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.value = '';
                showToast('Search cleared', false);
            }
            
            // Number shortcuts for quick actions
            if (!e.ctrlKey && !e.metaKey) {
                const num = parseInt(e.key);
                if (num >= 1 && num <= 4 && actionBtns[num - 1]) {
                    actionBtns[num - 1].click();
                }
            }
        });
    }

    // Refresh Data Simulation
    function initAutoRefresh() {
        setInterval(() => {
            // Simulate live updates
            const liveTracks = document.querySelector('#liveTracks');
            if (liveTracks) {
                const newTrack = document.createElement('tr');
                const times = ['01:15', '04:32', '05:20'];
                const users = ['New User', 'Live Tracker', 'Priority Case'];
                newTrack.innerHTML = `
                    <td>${users[Math.floor(Math.random() * users.length)]}</td>
                    <td>${times[Math.floor(Math.random() * times.length)]}</td>
                    <td><span class="status-badge green">Active</span></td>
                    <td><i class="fas fa-eye"></i></td>
                `;
                liveTracks.prepend(newTrack);
                if (liveTracks.children.length > 4) {
                    liveTracks.removeChild(liveTracks.lastElementChild);
                }
            }
        }, 30000);
    }

    // Initialize all charts on window resize
    function handleResize() {
        drawWaveChart();
        drawPaymentTrend();
    }

    // Welcome Toast
    function showWelcome() {
        setTimeout(() => {
            showToast('👋 Welcome to Admin Panel! System is live', false);
        }, 500);
    }

    // Initialize everything
    function init() {
        initBarChart();
        initHotspots();
        drawWaveChart();
        drawPaymentTrend();
        initSearch();
        initFilters();
        initTabs();
        initQuickActions();
        initViewButtons();
        animateStats();
        initCardAnimations();
        initKeyboardShortcuts();
        initAutoRefresh();
        window.addEventListener('resize', handleResize);
        showWelcome();
    }

    // Start the application
    async function loadAdminData() {
        if (!window.LF) return;
        const session = await LF.requireAdmin();
        if (!session) return;
        try {
            const { res, data } = await LF.api('admin/stats.php');
            if (res.ok && data.stats) {
                const usersEl = document.getElementById('totalUsers');
                const itemsEl = document.getElementById('totalItems');
                if (usersEl) usersEl.textContent = data.stats.users;
                if (itemsEl) itemsEl.textContent = data.stats.items;
            }
        } catch {
            // keep demo values
        }

        await fetchAdminUsers();
    }

    init();
    loadAdminData();
})();