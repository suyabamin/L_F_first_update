// Map View - Full World Map with Bangladesh Focus
(function() {
    'use strict';

    let map = null;
    let markers = [];
    let currentFilter = 'all';
    let currentCountry = 'all';

    // Bangladesh Center
    const BANGLADESH_CENTER = [23.7465, 90.3763];
    const WORLD_CENTER = [20, 0];
    const BANGLADESH_ZOOM = 13;
    const WORLD_ZOOM = 2;

    // Global Locations Data
    const locations = [
        // Bangladesh - Dhaka Division
        { name: "UIU Campus", lat: 23.7465, lng: 90.3763, type: "lost", status: "lost", country: "Bangladesh", city: "Dhaka", item: "Lost Laptop", reports: 12 },
        { name: "Dhanmondi Lake", lat: 23.7520, lng: 90.3720, type: "found", status: "found", country: "Bangladesh", city: "Dhaka", item: "Found Wallet", reports: 8 },
        { name: "Gulshan Circle", lat: 23.7925, lng: 90.4078, type: "lost", status: "lost", country: "Bangladesh", city: "Dhaka", item: "Lost iPhone", reports: 15 },
        { name: "Uttara Sector 3", lat: 23.8750, lng: 90.3798, type: "found", status: "found", country: "Bangladesh", city: "Dhaka", item: "Found Keys", reports: 6 },
        { name: "Banani DOHS", lat: 23.7980, lng: 90.4030, type: "lost", status: "lost", country: "Bangladesh", city: "Dhaka", item: "Lost Backpack", reports: 9 },
        { name: "Motijheel", lat: 23.7330, lng: 90.4165, type: "found", status: "found", country: "Bangladesh", city: "Dhaka", item: "Found ID Card", reports: 5 },
        { name: "Mirpur 10", lat: 23.8060, lng: 90.3720, type: "lost", status: "lost", country: "Bangladesh", city: "Dhaka", item: "Lost Camera", reports: 7 },
        
        // Bangladesh - Chittagong
        { name: "GEC Circle", lat: 22.3569, lng: 91.7832, type: "found", status: "found", country: "Bangladesh", city: "Chittagong", item: "Found Phone", reports: 4 },
        { name: "CUET Campus", lat: 22.4700, lng: 91.7900, type: "lost", status: "lost", country: "Bangladesh", city: "Chittagong", item: "Lost Wallet", reports: 6 },
        
        // Bangladesh - Rajshahi
        { name: "RU Campus", lat: 24.3745, lng: 88.6042, type: "lost", status: "lost", country: "Bangladesh", city: "Rajshahi", item: "Lost Laptop", reports: 5 },
        
        // Bangladesh - Sylhet
        { name: "SUST Campus", lat: 24.8949, lng: 91.8687, type: "found", status: "found", country: "Bangladesh", city: "Sylhet", item: "Found Bag", reports: 3 },
        
        // Bangladesh - Khulna
        { name: "KU Campus", lat: 22.8456, lng: 89.5403, type: "lost", status: "lost", country: "Bangladesh", city: "Khulna", item: "Lost Keys", reports: 4 },
        
        // International Locations
        { name: "Times Square", lat: 40.7580, lng: -73.9855, type: "lost", status: "lost", country: "USA", city: "New York", item: "Lost iPhone", reports: 23 },
        { name: "Central Park", lat: 40.7850, lng: -73.9680, type: "found", status: "found", country: "USA", city: "New York", item: "Found Wallet", reports: 15 },
        { name: "London Eye", lat: 51.5033, lng: -0.1195, type: "lost", status: "lost", country: "UK", city: "London", item: "Lost Camera", reports: 18 },
        { name: "British Museum", lat: 51.5194, lng: -0.1269, type: "found", status: "found", country: "UK", city: "London", item: "Found Keys", reports: 12 },
        { name: "Burj Khalifa", lat: 25.1972, lng: 55.2744, type: "lost", status: "lost", country: "UAE", city: "Dubai", item: "Lost Passport", reports: 20 },
        { name: "Shibuya Crossing", lat: 35.6595, lng: 139.7004, type: "found", status: "found", country: "Japan", city: "Tokyo", item: "Found Phone", reports: 16 },
        { name: "Marina Bay Sands", lat: 1.2839, lng: 103.8589, type: "lost", status: "lost", country: "Singapore", city: "Singapore", item: "Lost Laptop", reports: 14 },
        { name: "Sydney Opera House", lat: -33.8568, lng: 151.2153, type: "found", status: "found", country: "Australia", city: "Sydney", item: "Found Backpack", reports: 11 },
        { name: "CN Tower", lat: 43.6426, lng: -79.3871, type: "lost", status: "lost", country: "Canada", city: "Toronto", item: "Lost Wallet", reports: 9 },
        { name: "Gateway of India", lat: 18.9219, lng: 72.8347, type: "found", status: "found", country: "India", city: "Mumbai", item: "Found ID", reports: 13 },
        { name: "Brandenburg Gate", lat: 52.5163, lng: 13.3777, type: "lost", status: "lost", country: "Germany", city: "Berlin", item: "Lost Keys", reports: 10 },
        { name: "Eiffel Tower", lat: 48.8584, lng: 2.2945, type: "found", status: "found", country: "France", city: "Paris", item: "Found Camera", reports: 17 }
    ];

    // DOM Elements
    const toast = document.getElementById('toast');
    const refreshBtn = document.getElementById('refreshBtn');
    const filterSelect = document.getElementById('filterSelect');
    const countryFilter = document.getElementById('countryFilter');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetViewBtn = document.getElementById('resetViewBtn');
    const worldViewBtn = document.getElementById('worldViewBtn');

    // Show Toast
    function showToast(message, isError) {
        if (!toast) return;
        toast.innerHTML = '<i class="fas ' + (isError ? 'fa-exclamation-triangle' : 'fa-check-circle') + '"></i> ' + message;
        toast.classList.add('show');
        setTimeout(function() {
            toast.classList.remove('show');
        }, 3000);
    }

    // Update Statistics
    function updateStats() {
        const total = locations.length;
        const lost = locations.filter(l => l.type === 'lost').length;
        const found = total - lost;
        const countries = new Set(locations.map(l => l.country)).size;
        
        document.getElementById('totalMarkers').innerText = total;
        document.getElementById('lostCount').innerText = lost;
        document.getElementById('foundCount').innerText = found;
        document.getElementById('countryCount').innerText = countries;
    }

    // Initialize Map
    function initMap() {
        if (typeof L === 'undefined') {
            showToast('Loading map...', true);
            setTimeout(initMap, 500);
            return;
        }

        map = L.map('interactiveMap').setView(BANGLADESH_CENTER, BANGLADESH_ZOOM);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
            minZoom: 2
        }).addTo(map);
        
        L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(map);
        
        addMarkers();
        updateStats();
        showToast('🗺️ World map loaded with ' + locations.length + ' locations', false);
    }

    // Add Markers
    function addMarkers() {
        // Clear existing markers
        markers.forEach(function(marker) {
            if (map && marker) map.removeLayer(marker);
        });
        markers = [];
        
        var filteredLocations = locations;
        
        // Apply status filter
        if (currentFilter !== 'all') {
            filteredLocations = filteredLocations.filter(function(l) {
                return l.type === currentFilter;
            });
        }
        
        // Apply country filter
        if (currentCountry !== 'all') {
            filteredLocations = filteredLocations.filter(function(l) {
                return l.country === currentCountry;
            });
        }
        
        for (var i = 0; i < filteredLocations.length; i++) {
            var loc = filteredLocations[i];
            var markerColor = loc.type === 'lost' ? '#ef4444' : '#10b981';
            
            var iconHtml = '<div style="background: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 2px solid ' + markerColor + '; cursor: pointer;">' +
                '<i class="fas fa-map-marker-alt" style="color: ' + markerColor + '; font-size: 16px;"></i>' +
                '</div>';
            
            var customIcon = L.divIcon({
                html: iconHtml,
                className: 'custom-marker',
                iconSize: [36, 36],
                popupAnchor: [0, -18]
            });
            
            var marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);
            
            var popupContent = '<div style="min-width: 220px;">' +
                '<div style="font-weight: 800; color: #00A9B5; margin-bottom: 8px;">' +
                '<i class="fas fa-map-marker-alt"></i> ' + loc.name +
                '</div>' +
                '<div style="font-size: 12px; color: #667085; margin-bottom: 5px;">' +
                '<strong>' + (loc.type === 'lost' ? 'Lost Item' : 'Found Item') + '</strong>' +
                '</div>' +
                '<div style="font-size: 12px; color: #667085; margin-bottom: 5px;">' +
                '<strong>Item:</strong> ' + loc.item +
                '</div>' +
                '<div style="font-size: 12px; color: #667085; margin-bottom: 8px;">' +
                '<strong>Location:</strong> ' + loc.city + ', ' + loc.country +
                '</div>' +
                '<div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #E4E7EC;">' +
                '<button onclick="window.viewItemDetails(\'' + loc.name + '\', \'' + loc.item + '\')" style="width: 100%; padding: 6px; background: #00A9B5; color: white; border: none; border-radius: 8px; cursor: pointer;">' +
                'View Details' +
                '</button>' +
                '</div>' +
                '</div>';
            
            marker.bindPopup(popupContent);
            markers.push(marker);
        }
        
        showToast('📍 Showing ' + filteredLocations.length + ' locations', false);
    }

    // Filter Markers
    function applyFilters() {
        currentFilter = filterSelect.value;
        currentCountry = countryFilter.value;
        addMarkers();
    }

    // Reset to Bangladesh View
    function resetToBangladesh() {
        if (map) {
            map.setView(BANGLADESH_CENTER, BANGLADESH_ZOOM);
            showToast('📍 View reset to Bangladesh - UIU Dhanmondi', false);
        }
    }

    // World View
    function worldView() {
        if (map) {
            map.setView(WORLD_CENTER, WORLD_ZOOM);
            showToast('🌍 World view - Showing all global locations', false);
        }
    }

    // Zoom Controls
    function initZoomControls() {
        if (zoomInBtn) zoomInBtn.addEventListener('click', function() { if (map) map.zoomIn(); });
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', function() { if (map) map.zoomOut(); });
        if (resetViewBtn) resetViewBtn.addEventListener('click', resetToBangladesh);
        if (worldViewBtn) worldViewBtn.addEventListener('click', worldView);
        if (refreshBtn) refreshBtn.addEventListener('click', function() { applyFilters(); showToast('Map refreshed', false); });
        if (filterSelect) filterSelect.addEventListener('change', applyFilters);
        if (countryFilter) countryFilter.addEventListener('change', applyFilters);
    }

    // Global function for popup buttons
    window.viewItemDetails = function(name, item) {
        showToast('📋 Viewing details for ' + item + ' at ' + name, false);
    };

    // Keyboard Shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                resetToBangladesh();
            }
            if (e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                worldView();
            }
        });
    }

    // Add Activity Feed Items
    function addActivityItem(location) {
        var feedContainer = document.getElementById('activityFeed');
        if (!feedContainer) return;
        
        var feedItem = document.createElement('div');
        feedItem.className = 'feed-item';
        feedItem.style.animation = 'fadeInUp 0.3s ease';
        feedItem.innerHTML = 
            '<div class="feed-icon ' + location.type + '"><i class="fas fa-' + (location.type === 'lost' ? 'times-circle' : 'check-circle') + '"></i></div>' +
            '<div class="feed-content">' +
            '<p><strong>' + location.item + '</strong> reported as ' + location.type + ' at <strong>' + location.name + ', ' + location.city + '</strong></p>' +
            '<span class="feed-time">Just now</span>' +
            '</div>';
        
        feedContainer.insertBefore(feedItem, feedContainer.firstChild);
        
        // Keep only last 8 items
        while (feedContainer.children.length > 8) {
            feedContainer.removeChild(feedContainer.lastChild);
        }
    }

    // Simulate Real-time Updates
    function initRealTimeUpdates() {
        setInterval(function() {
            if (Math.random() > 0.7) {
                var randomLoc = locations[Math.floor(Math.random() * locations.length)];
                addActivityItem(randomLoc);
                showToast('📢 New activity reported at ' + randomLoc.name, false);
            }
        }, 30000);
    }

    // Welcome Message
    function showWelcome() {
        setTimeout(function() {
            showToast('🗺️ Interactive World Map Ready! Explore lost and found items globally', false);
        }, 800);
    }

    // Fetch Real Map Data
    async function loadMapData() {
        try {
            const response = await fetch('backend-php/browse_listing.php', {
                headers: { 'Accept': 'application/json' }
            });
            const data = await response.json();
            
            if (data.success && Array.isArray(data.items)) {
                // Clear and repopulate locations
                // Only keep hardcoded ones if no real ones exist, otherwise merge
                const realLocations = data.items.map(item => ({
                    name: item.location || 'Unknown Location',
                    lat: parseFloat(item.latitude) || BANGLADESH_CENTER[0],
                    lng: parseFloat(item.longitude) || BANGLADESH_CENTER[1],
                    type: item.type === 'found' ? 'found' : 'lost',
                    status: item.status,
                    country: "Bangladesh",
                    city: item.location || "Dhaka",
                    item: item.title,
                    reports: 1
                }));

                if (realLocations.length > 0) {
                    locations.length = 0; // Clear hardcoded
                    locations.push(...realLocations);
                    addMarkers();
                    updateStats();
                    showToast('🗺️ Live data markers loaded', false);
                }
            }
        } catch (error) {
            console.error('Map data load error:', error);
            showToast('Unable to fetch live item locations', true);
        }
    }

    // Initialize Everything
    function init() {
        initMap();
        setTimeout(function() {
            initZoomControls();
            initKeyboardShortcuts();
            initRealTimeUpdates();
            loadMapData();
        }, 500);
        showWelcome();
    }


    init();
})();