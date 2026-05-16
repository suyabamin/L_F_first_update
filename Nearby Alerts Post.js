// Nearby Alerts - Full Worldwide Map with Global Alerts
(function() {
    'use strict';

    let map = null;
    let markers = [];
    let currentFilter = 'all';

    // World View Settings
    const WORLD_CENTER = [20, 0];
    const WORLD_ZOOM = 2;
    const BANGLADESH_CENTER = [23.7465, 90.3763];
    const BANGLADESH_ZOOM = 13;

    // Global Locations Data (Worldwide)
    const globalLocations = [
        // Bangladesh Locations
        { name: "Dhanmondi 27", lat: 23.7505, lng: 90.3780, type: "found", item: "Maroon Leather Wallet", country: "Bangladesh", city: "Dhaka" },
        { name: "Star Kabab", lat: 23.7425, lng: 90.3805, type: "lost", item: "iPhone 13 Pro", country: "Bangladesh", city: "Dhaka" },
        { name: "UIU Campus Hub", lat: 23.7465, lng: 90.3763, type: "hub", item: "Main Hub", country: "Bangladesh", city: "Dhaka" },
        { name: "Satmasjid Road", lat: 23.7440, lng: 90.3795, type: "lost", item: "Black Backpack", country: "Bangladesh", city: "Dhaka" },
        { name: "UIU Cafeteria", lat: 23.7475, lng: 90.3775, type: "found", item: "Key Set", country: "Bangladesh", city: "Dhaka" },
        { name: "Gulshan", lat: 23.7925, lng: 90.4078, type: "lost", item: "Lost Wallet", country: "Bangladesh", city: "Dhaka" },
        
        // USA Locations
        { name: "Times Square", lat: 40.7580, lng: -73.9855, type: "lost", item: "MacBook Pro", country: "USA", city: "New York" },
        { name: "Central Park", lat: 40.7850, lng: -73.9680, type: "found", item: "iPhone 14", country: "USA", city: "New York" },
        { name: "Los Angeles Hub", lat: 34.0522, lng: -118.2437, type: "hub", item: "LA Hub", country: "USA", city: "Los Angeles" },
        
        // UK Locations
        { name: "London Eye", lat: 51.5033, lng: -0.1195, type: "found", item: "UK Passport", country: "UK", city: "London" },
        { name: "British Museum", lat: 51.5194, lng: -0.1269, type: "lost", item: "Camera", country: "UK", city: "London" },
        
        // UAE Locations
        { name: "Burj Khalifa", lat: 25.1972, lng: 55.2744, type: "lost", item: "Rolex Watch", country: "UAE", city: "Dubai" },
        { name: "Dubai Mall", lat: 25.1985, lng: 55.2790, type: "found", item: "Wallet", country: "UAE", city: "Dubai" },
        
        // Japan
        { name: "Shibuya Crossing", lat: 35.6595, lng: 139.7004, type: "found", item: "Sony Camera", country: "Japan", city: "Tokyo" },
        { name: "Tokyo Station", lat: 35.6812, lng: 139.7671, type: "lost", item: "Laptop Bag", country: "Japan", city: "Tokyo" },
        
        // Singapore
        { name: "Marina Bay Sands", lat: 1.2839, lng: 103.8589, type: "hub", item: "Singapore Hub", country: "Singapore", city: "Singapore" },
        { name: "Changi Airport", lat: 1.3644, lng: 103.9915, type: "lost", item: "Suitcase", country: "Singapore", city: "Singapore" },
        
        // Australia
        { name: "Sydney Opera House", lat: -33.8568, lng: 151.2153, type: "found", item: "Backpack", country: "Australia", city: "Sydney" },
        
        // Canada
        { name: "CN Tower", lat: 43.6426, lng: -79.3871, type: "lost", item: "Winter Jacket", country: "Canada", city: "Toronto" },
        
        // India
        { name: "Gateway of India", lat: 18.9219, lng: 72.8347, type: "found", item: "ID Card", country: "India", city: "Mumbai" },
        
        // Germany
        { name: "Brandenburg Gate", lat: 52.5163, lng: 13.3777, type: "lost", item: "Keys", country: "Germany", city: "Berlin" },
        
        // France
        { name: "Eiffel Tower", lat: 48.8584, lng: 2.2945, type: "found", item: "Camera", country: "France", city: "Paris" }
    ];

    // DOM Elements
    const toast = document.getElementById('toast');
    const searchInput = document.getElementById('searchInput');
    const sortBtn = document.getElementById('sortBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const worldViewBtn = document.getElementById('worldViewBtn');
    const locateBtn = document.getElementById('locateBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const filterPills = document.querySelectorAll('.pill');
    const menuItems = document.querySelectorAll('.menu-item');
    const navLinks = document.querySelectorAll('.nav-link');

    // Show Toast
    function showToast(message, isError) {
        if (!toast) return;
        toast.innerHTML = '<i class="fas ' + (isError ? 'fa-exclamation-triangle' : 'fa-check-circle') + '"></i> ' + message;
        toast.classList.add('show');
        setTimeout(function() {
            toast.classList.remove('show');
        }, 3000);
    }

    // Update Summary Stats
    function updateSummaryStats() {
        const lostCount = globalLocations.filter(l => l.type === 'lost').length;
        const foundCount = globalLocations.filter(l => l.type === 'found').length;
        const hubCount = globalLocations.filter(l => l.type === 'hub').length;
        const countries = new Set(globalLocations.map(l => l.country)).size;
        
        document.getElementById('lostSummary').innerText = lostCount;
        document.getElementById('foundSummary').innerText = foundCount;
        document.getElementById('hubSummary').innerText = hubCount;
        document.getElementById('countryCount').innerText = countries;
    }

    // Initialize Worldwide Map
    function initMap() {
        if (typeof L === 'undefined') {
            showToast('Loading map...', true);
            setTimeout(initMap, 500);
            return;
        }

        map = L.map('worldwideMap').setView(BANGLADESH_CENTER, BANGLADESH_ZOOM);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
            minZoom: 2
        }).addTo(map);
        
        L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(map);
        
        addGlobalMarkers();
        updateSummaryStats();
        showToast('🌍 Worldwide map loaded with ' + globalLocations.length + ' global alerts', false);
    }

    // Add Markers to Map
    function addGlobalMarkers() {
        markers.forEach(function(marker) {
            if (map && marker) map.removeLayer(marker);
        });
        markers = [];
        
        var filteredLocations = globalLocations;
        if (currentFilter !== 'all') {
            filteredLocations = filteredLocations.filter(function(l) {
                return l.type === currentFilter;
            });
        }
        
        for (var i = 0; i < filteredLocations.length; i++) {
            var loc = filteredLocations[i];
            var markerColor = '#00A9B5';
            if (loc.type === 'lost') markerColor = '#ef4444';
            else if (loc.type === 'found') markerColor = '#10b981';
            else if (loc.type === 'hub') markerColor = '#8b5cf6';
            
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
                '<strong>' + (loc.type === 'lost' ? 'Lost Item' : loc.type === 'found' ? 'Found Item' : 'Hub Location') + '</strong>' +
                '</div>' +
                '<div style="font-size: 12px; color: #667085; margin-bottom: 5px;">' +
                '<strong>Item:</strong> ' + loc.item +
                '</div>' +
                '<div style="font-size: 12px; color: #667085; margin-bottom: 8px;">' +
                '<strong>Location:</strong> ' + loc.city + ', ' + loc.country +
                '</div>' +
                '<div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #E4E7EC;">' +
                '<button onclick="window.viewGlobalAlert(\'' + loc.name + '\', \'' + loc.item + '\')" style="width: 100%; padding: 6px; background: #00A9B5; color: white; border: none; border-radius: 8px; cursor: pointer;">' +
                'View Details' +
                '</button>' +
                '</div>' +
                '</div>';
            
            marker.bindPopup(popupContent);
            markers.push(marker);
        }
    }

    // World View
    function worldView() {
        if (map) {
            map.setView(WORLD_CENTER, WORLD_ZOOM);
            showToast('🌍 World View - Showing all global locations across 15+ countries', false);
        }
    }

    // Bangladesh View
    function bangladeshView() {
        if (map) {
            map.setView(BANGLADESH_CENTER, BANGLADESH_ZOOM);
            showToast('📍 View reset to Bangladesh - UIU Dhanmondi area', false);
        }
    }

    // Apply Filters
    function applyFilters() {
        var filter = currentFilter;
        addGlobalMarkers();
        
        var cards = document.querySelectorAll('.card');
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var cardType = card.getAttribute('data-type');
            if (filter === 'all' || cardType === filter) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        }
        
        showToast('🌍 Showing: ' + filter.toUpperCase() + ' alerts worldwide', false);
    }

    // Search Function
    function initSearch() {
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                var term = e.target.value.toLowerCase().trim();
                var cards = document.querySelectorAll('.card');
                var visibleCount = 0;
                
                for (var i = 0; i < cards.length; i++) {
                    var card = cards[i];
                    var title = card.getAttribute('data-title') || '';
                    var country = card.getAttribute('data-country') || '';
                    var text = card.innerText.toLowerCase();
                    
                    if (term === '' || text.indexOf(term) !== -1 || title.toLowerCase().indexOf(term) !== -1 || country.toLowerCase().indexOf(term) !== -1) {
                        card.style.display = 'flex';
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                }
                
                if (term !== '') {
                    showToast('🔍 Found ' + visibleCount + ' matching alerts worldwide', false);
                }
            });
        }
    }

    // Sort Cards
    function initSort() {
        if (sortBtn) {
            sortBtn.addEventListener('click', function() {
                var container = document.getElementById('alertsContainer');
                var cards = Array.from(container.querySelectorAll('.card'));
                
                cards.sort(function(a, b) {
                    return -1;
                });
                
                cards.forEach(function(card) {
                    container.appendChild(card);
                });
                
                showToast('Alerts sorted by newest first', false);
            });
        }
    }

    // Filter Pills
    function initFilterPills() {
        filterPills.forEach(function(pill) {
            pill.addEventListener('click', function() {
                filterPills.forEach(function(p) { p.classList.remove('active'); });
                this.classList.add('active');
                currentFilter = this.getAttribute('data-filter');
                applyFilters();
            });
        });
    }

    // Menu Items
    function initMenuItems() {
        menuItems.forEach(function(item) {
            item.addEventListener('click', function() {
                if (this.classList.contains('logout')) {
                    showToast('Logging out...', false);
                    return;
                }
                menuItems.forEach(function(m) { m.classList.remove('active'); });
                this.classList.add('active');
                var tab = this.getAttribute('data-tab');
                if (tab === 'all') currentFilter = 'all';
                else if (tab === 'lost') currentFilter = 'lost';
                else if (tab === 'found') currentFilter = 'found';
                else if (tab === 'hub') currentFilter = 'hub';
                else return;
                
                filterPills.forEach(function(pill) {
                    if (pill.getAttribute('data-filter') === currentFilter) {
                        pill.click();
                    }
                });
            });
        });
    }

    // Nav Links
    function initNavLinks() {
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                navLinks.forEach(function(l) { l.classList.remove('active'); });
                this.classList.add('active');
                showToast('Navigating to ' + this.innerText, false);
            });
        });
    }

    // Map Controls
    function initMapControls() {
        if (zoomInBtn) zoomInBtn.addEventListener('click', function() { if (map) map.zoomIn(); });
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', function() { if (map) map.zoomOut(); });
        if (worldViewBtn) worldViewBtn.addEventListener('click', worldView);
        
        if (locateBtn) {
            locateBtn.addEventListener('click', function() {
                if (navigator.geolocation) {
                    showToast('📍 Detecting your location...', false);
                    navigator.geolocation.getCurrentPosition(
                        function(pos) {
                            map.setView([pos.coords.latitude, pos.coords.longitude], 13);
                            L.marker([pos.coords.latitude, pos.coords.longitude])
                                .bindPopup('<b>You are here</b>')
                                .openPopup();
                        },
                        function() { showToast('Unable to get location', true); }
                    );
                }
            });
        }
        
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', function() {
                var mapContainer = document.getElementById('worldwideMap');
                if (mapContainer.requestFullscreen) {
                    mapContainer.requestFullscreen();
                    setTimeout(function() { if (map) map.invalidateSize(); }, 100);
                }
            });
        }
    }

    // Card Action Buttons
    function initCardActions() {
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('details-btn')) {
                showToast('📋 Viewing alert details...', false);
            } else if (e.target.classList.contains('claim-btn')) {
                showToast('✅ Claim request submitted! You will be contacted soon.', false);
            } else if (e.target.classList.contains('track-btn')) {
                showToast('📍 Tracking location...', false);
            } else if (e.target.classList.contains('inventory-btn')) {
                showToast('📦 Viewing hub inventory...', false);
            }
        });
    }

    // Global function for popup
    window.viewGlobalAlert = function(name, item) {
        showToast('📋 Viewing details for ' + item + ' at ' + name, false);
    };

    // Keyboard Shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (searchInput) searchInput.focus();
                showToast('🔍 Search alerts worldwide', false);
            }
            if (e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                worldView();
            }
            if (e.key === 'b' || e.key === 'B') {
                e.preventDefault();
                bangladeshView();
            }
        });
    }

    // Welcome Message
    function showWelcome() {
        setTimeout(function() {
            showToast('🌍 Welcome to Global Lost & Found Hub! ' + globalLocations.length + ' active alerts across 15+ countries', false);
        }, 800);
    }

    // Initialize
    function init() {
        initMap();
        setTimeout(function() {
            initSearch();
            initSort();
            initFilterPills();
            initMenuItems();
            initNavLinks();
            initMapControls();
            initCardActions();
            initKeyboardShortcuts();
        }, 500);
        showWelcome();
    }

    init();
})();