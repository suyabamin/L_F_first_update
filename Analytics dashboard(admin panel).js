// Performance Analytics Dashboard - Interactive JavaScript with Bangladesh Map
(function() {
    'use strict';

    // DOM Elements
    const searchInput = document.getElementById('globalSearch');
    const toastContainer = document.getElementById('toastMessage');
    const filterPrimaryBtns = document.querySelectorAll('.filter-primary');
    const pills = document.querySelectorAll('.pill');
    const catTabs = document.querySelectorAll('.cat-tab');
    const feedContainer = document.getElementById('liveFeed');
    const loadMoreBtn = document.getElementById('loadMoreFeed');
    const actionItems = document.querySelectorAll('.action-item');
    const advancedFilter = document.getElementById('advancedFilter');
    const notifyBtn = document.getElementById('notifyBtn');
    const gridViewBtn = document.getElementById('gridViewBtn');

    let charts = {};
    let map = null;
    let markers = [];

    // Show Toast
    window.showToast = function(message, isError) {
        if (!toastContainer) return;
        toastContainer.innerHTML = '<i class="fas ' + (isError ? 'fa-exclamation-triangle' : 'fa-check-circle') + '"></i> ' + message;
        toastContainer.classList.add('show');
        setTimeout(function() {
            toastContainer.classList.remove('show');
        }, 3000);
    };
    
    var showToast = window.showToast;

    // Bangladesh Locations Data
    const bangladeshLocations = [
        { name: "Dhaka", lat: 23.8103, lng: 90.4125, division: "Dhaka", reports: 1245, resolved: 892, hotspot: "high" },
        { name: "Dhanmondi", lat: 23.7465, lng: 90.3763, division: "Dhaka", reports: 342, resolved: 245, hotspot: "high" },
        { name: "Gulshan", lat: 23.7925, lng: 90.4078, division: "Dhaka", reports: 289, resolved: 210, hotspot: "high" },
        { name: "Uttara", lat: 23.8750, lng: 90.3798, division: "Dhaka", reports: 198, resolved: 145, hotspot: "medium" },
        { name: "Motijheel", lat: 23.7330, lng: 90.4165, division: "Dhaka", reports: 156, resolved: 112, hotspot: "medium" },
        { name: "Chittagong", lat: 22.3569, lng: 91.7832, division: "Chittagong", reports: 876, resolved: 623, hotspot: "high" },
        { name: "Rajshahi", lat: 24.3745, lng: 88.6042, division: "Rajshahi", reports: 567, resolved: 412, hotspot: "medium" },
        { name: "Khulna", lat: 22.8456, lng: 89.5403, division: "Khulna", reports: 489, resolved: 356, hotspot: "medium" },
        { name: "Sylhet", lat: 24.8949, lng: 91.8687, division: "Sylhet", reports: 523, resolved: 389, hotspot: "medium" },
        { name: "Barishal", lat: 22.7010, lng: 90.3535, division: "Barishal", reports: 298, resolved: 215, hotspot: "low" },
        { name: "Rangpur", lat: 25.7439, lng: 89.2752, division: "Rangpur", reports: 345, resolved: 256, hotspot: "medium" },
        { name: "Mymensingh", lat: 24.7539, lng: 90.4073, division: "Mymensingh", reports: 267, resolved: 198, hotspot: "low" }
    ];

    // Initialize Bangladesh Map
    function initBangladeshMap() {
        if (typeof L === 'undefined') {
            showToast('Loading map...', true);
            setTimeout(initBangladeshMap, 500);
            return;
        }
        
        try {
            // Create map centered on Bangladesh
            map = L.map('bangladeshMap').setView([23.6850, 90.3563], 8);
            
            // Add tile layer
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap &copy; CARTO',
                maxZoom: 13,
                minZoom: 7
            }).addTo(map);
            
            // Add scale bar
            L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(map);
            
            // Add markers for each location
            for (var i = 0; i < bangladeshLocations.length; i++) {
                var location = bangladeshLocations[i];
                
                // Determine marker color
                var markerColor = '#008b8b';
                if (location.hotspot === 'high') markerColor = '#ef4444';
                else if (location.hotspot === 'medium') markerColor = '#f59e0b';
                else markerColor = '#10b981';
                
                // Create custom marker
                var iconHtml = '<div style="background: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 2px solid ' + markerColor + '; cursor: pointer;">' +
                    '<i class="fas fa-map-marker-alt" style="color: ' + markerColor + '; font-size: 16px;"></i>' +
                    '</div>';
                
                var customIcon = L.divIcon({
                    html: iconHtml,
                    className: 'custom-marker',
                    iconSize: [36, 36],
                    popupAnchor: [0, -18]
                });
                
                var marker = L.marker([location.lat, location.lng], { icon: customIcon }).addTo(map);
                
                // Calculate resolve rate
                var resolveRate = Math.round((location.resolved / location.reports) * 100);
                
                // Create popup
                var popupContent = '<div style="min-width: 180px;">' +
                    '<div style="font-weight: 700; color: #008b8b; margin-bottom: 5px;"><i class="fas fa-location-dot"></i> ' + location.name + '</div>' +
                    '<div style="font-size: 12px; color: #64748b;"><strong>Division:</strong> ' + location.division + '</div>' +
                    '<div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between;">' +
                    '<div><strong>Reports:</strong> ' + location.reports + '</div>' +
                    '<div><strong>Resolved:</strong> ' + location.resolved + '</div>' +
                    '<div><strong>Rate:</strong> ' + resolveRate + '%</div>' +
                    '</div>' +
                    '<button onclick="window.showToast(\'Viewing details for ' + location.name + '\', false)" style="width: 100%; margin-top: 8px; padding: 5px; background: #008b8b; color: white; border: none; border-radius: 6px; cursor: pointer;">View Details</button>' +
                    '</div>';
                
                marker.bindPopup(popupContent);
                
                marker.on('click', function(loc) {
                    return function() {
                        showToast('📍 ' + loc.name + ' - ' + loc.reports + ' total reports', false);
                    };
                }(location));
                
                markers.push(marker);
            }
            
            // Add division boundaries
            var divisions = [
                { name: "Dhaka", bounds: [[23.5, 90.0], [24.5, 91.0]], color: "#008b8b" },
                { name: "Chittagong", bounds: [[21.5, 91.5], [23.0, 92.5]], color: "#ef4444" },
                { name: "Rajshahi", bounds: [[24.0, 88.0], [25.5, 89.0]], color: "#f59e0b" }
            ];
            
            for (var i = 0; i < divisions.length; i++) {
                var div = divisions[i];
                var rectangle = L.rectangle(div.bounds, {
                    color: div.color,
                    weight: 1,
                    opacity: 0.4,
                    fillColor: div.color,
                    fillOpacity: 0.05
                }).addTo(map);
                
                rectangle.bindTooltip(div.name, { sticky: true });
            }
            
            showToast('🗺️ Bangladesh map loaded with ' + markers.length + ' locations', false);
            
        } catch (error) {
            console.error('Map error:', error);
            showToast('Error loading map', true);
        }
    }

    // Initialize Charts
    function initCharts() {
        // User Growth Chart
        var userCtx = document.getElementById('userGrowthChart')?.getContext('2d');
        if (userCtx) {
            charts.userGrowth = new Chart(userCtx, {
                type: 'line',
                data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], datasets: [{ data: [18, 22, 25, 27, 29, 30], borderColor: '#008b8b', backgroundColor: 'rgba(0,139,139,0.1)', fill: true, tension: 0.4 }] },
                options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
            });
        }

        // Items Trend Chart
        var itemsCtx = document.getElementById('itemsTrendChart')?.getContext('2d');
        if (itemsCtx) {
            charts.itemsTrend = new Chart(itemsCtx, {
                type: 'line',
                data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], datasets: [{ data: [65, 72, 78, 85, 95, 110], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 }] },
                options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
            });
        }

        // Match Trend Chart
        var matchCtx = document.getElementById('matchTrendChart')?.getContext('2d');
        if (matchCtx) {
            charts.matchTrend = new Chart(matchCtx, {
                type: 'line',
                data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], datasets: [{ data: [58, 62, 65, 68, 70, 71], borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', fill: true, tension: 0.4 }] },
                options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
            });
        }
    }

    // Search Functionality
    function initSearch() {
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                var term = e.target.value.toLowerCase().trim();
                var feedBoxes = document.querySelectorAll('.feed-box');
                var visibleCount = 0;
                
                for (var i = 0; i < feedBoxes.length; i++) {
                    var text = feedBoxes[i].innerText.toLowerCase();
                    if (text.indexOf(term) !== -1 || term === '') {
                        feedBoxes[i].style.display = 'flex';
                        visibleCount++;
                    } else {
                        feedBoxes[i].style.display = 'none';
                    }
                }
                
                if (term !== '') {
                    showToast('🔍 Found ' + visibleCount + ' matching items', false);
                }
            });
        }
    }

    // Filter Handlers
    function initFilters() {
        for (var i = 0; i < filterPrimaryBtns.length; i++) {
            filterPrimaryBtns[i].addEventListener('click', function() {
                for (var j = 0; j < filterPrimaryBtns.length; j++) {
                    filterPrimaryBtns[j].classList.remove('active');
                }
                this.classList.add('active');
                showToast('View: ' + this.innerText, false);
            });
        }
        
        for (var i = 0; i < pills.length; i++) {
            pills[i].addEventListener('click', function() {
                for (var j = 0; j < pills.length; j++) {
                    pills[j].classList.remove('active');
                }
                this.classList.add('active');
                showToast('Filter: ' + this.innerText, false);
            });
        }
        
        for (var i = 0; i < catTabs.length; i++) {
            catTabs[i].addEventListener('click', function() {
                for (var j = 0; j < catTabs.length; j++) {
                    catTabs[j].classList.remove('active');
                }
                this.classList.add('active');
                var category = this.getAttribute('data-cat');
                var feedBoxes = document.querySelectorAll('.feed-box');
                
                for (var k = 0; k < feedBoxes.length; k++) {
                    if (category === 'all' || feedBoxes[k].getAttribute('data-category') === category) {
                        feedBoxes[k].style.display = 'flex';
                    } else {
                        feedBoxes[k].style.display = 'none';
                    }
                }
                showToast('Showing: ' + this.innerText, false);
            });
        }
    }

    // Load More Feed
    function initLoadMoreFeed() {
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function() {
                var newFeed = createMockFeedItem();
                if (feedContainer) {
                    feedContainer.appendChild(newFeed);
                    var totalItems = document.querySelectorAll('.feed-box').length;
                    var feedCounter = document.querySelector('.feed-counter');
                    if (feedCounter) feedCounter.innerText = totalItems + ' items';
                    showToast('New item loaded', false);
                }
            });
        }
    }
    
    function createMockFeedItem() {
        var feedTypes = [
            { icon: 'fas fa-key', category: 'keys', title: 'Car Keys', desc: 'Found at Dhanmondi', time: 'Just now', badge: 'Found', badgeClass: 'found' },
            { icon: 'fas fa-watch', category: 'electronics', title: 'Smart Watch', desc: 'Lost at Gulshan', time: '5 mins ago', badge: 'Urgent', badgeClass: 'urgent' }
        ];
        
        var randomType = feedTypes[Math.floor(Math.random() * feedTypes.length)];
        var feedDiv = document.createElement('div');
        feedDiv.className = 'feed-box';
        feedDiv.setAttribute('data-category', randomType.category);
        feedDiv.innerHTML = '<i class="' + randomType.icon + ' feed-icon"></i>' +
            '<div class="feed-desc">' +
            '<strong>' + randomType.title + '</strong>' +
            '<p>' + randomType.desc + ' • ' + randomType.time + '</p>' +
            '<span class="badge ' + randomType.badgeClass + '">' + randomType.badge + '</span>' +
            '</div>';
        return feedDiv;
    }

    // Quick Actions
    function initQuickActions() {
        for (var i = 0; i < actionItems.length; i++) {
            actionItems[i].addEventListener('click', function() {
                var titleElem = this.querySelector('h4');
                var title = titleElem ? titleElem.innerText : 'Action';
                showToast('🚀 ' + title + ' - Processing...', false);
            });
        }
        
        if (advancedFilter) {
            advancedFilter.addEventListener('click', function() {
                showToast('Opening advanced filters...', false);
            });
        }
        
        if (notifyBtn) {
            notifyBtn.addEventListener('click', function() {
                showToast('🔔 You have 3 new notifications', false);
            });
        }
        
        if (gridViewBtn) {
            gridViewBtn.addEventListener('click', function() {
                showToast('Grid view changed', false);
            });
        }
    }

    // Keyboard Shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (searchInput) {
                    searchInput.focus();
                    showToast('🔍 Search activated', false);
                }
            }
            
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.value = '';
                showToast('Search cleared', false);
            }
        });
    }

    // Real-time Updates
    function initRealTimeUpdates() {
        setInterval(function() {
            var activeTracks = document.getElementById('activeTracks');
            if (activeTracks) {
                var current = parseInt(activeTracks.innerText);
                if (!isNaN(current)) {
                    var newVal = current + Math.floor(Math.random() * 2);
                    activeTracks.innerText = newVal;
                }
            }
        }, 30000);
    }

    // Welcome Message
    function showWelcome() {
        setTimeout(function() {
            showToast('📊 Welcome to Performance Analytics Dashboard!', false);
        }, 800);
    }

    // Handle Resize
    function handleResize() {
        if (map) {
            setTimeout(function() {
                map.invalidateSize();
            }, 200);
        }
    }

    // Initialize Everything
    // Fetch Real Analytics Data
    async function loadAnalyticsData() {
        try {
            const response = await fetch('backend-php/admin/stats.php', {
                headers: { 'Accept': 'application/json' }
            });
            const data = await response.json();
            
            if (data.success) {
                // Update Numeric Stats
                if (document.getElementById('totalUsers')) document.getElementById('totalUsers').innerText = (data.totalUsers || 0).toLocaleString();
                if (document.getElementById('itemListings')) document.getElementById('itemListings').innerText = (data.totalItems || 0).toLocaleString();
                if (document.getElementById('resolvedCases')) document.getElementById('resolvedCases').innerText = (data.resolvedMatches || 0).toLocaleString();
                if (document.getElementById('pendingReviews')) document.getElementById('pendingReviews').innerText = (data.pendingReports || 0).toLocaleString();
                
                // Calculate and update Match Rate
                if (data.totalItems > 0 && document.getElementById('matchRate')) {
                    const rate = Math.round((data.resolvedMatches / data.totalItems) * 100);
                    document.getElementById('matchRate').innerText = rate + '%';
                }
                
                showToast('📊 Live analytics data loaded', false);
            }
        } catch (error) {
            console.error('Analytics load error:', error);
            showToast('Unable to fetch live stats', true);
        }
    }

    // Initialize Everything
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                initBangladeshMap();
                initCharts();
                initSearch();
                initFilters();
                initLoadMoreFeed();
                initQuickActions();
                initKeyboardShortcuts();
                initRealTimeUpdates();
                loadAnalyticsData();
                window.addEventListener('resize', handleResize);
                showWelcome();
            });
        } else {
            initBangladeshMap();
            initCharts();
            initSearch();
            initFilters();
            initLoadMoreFeed();
            initQuickActions();
            initKeyboardShortcuts();
            initRealTimeUpdates();
            loadAnalyticsData();
            window.addEventListener('resize', handleResize);
            showWelcome();
        }
    }


    init();
})();