// Heatmap Dashboard - Full World Map with Heatmap Integration
(function() {
    'use strict';

    let map = null;
    let heatLayer = null;
    let markers = [];
    let currentTimeFilter = '7d';
    let currentCategoryFilter = 'all';

    // Bangladesh Center
    var BANGLADESH_CENTER = [23.7465, 90.3763];
    var DEFAULT_ZOOM = 13;

    // Location Data with Heat Intensity
    var hotspotLocations = [
        // Bangladesh - Dhaka Region (High Activity)
        { name: "UIU Cafeteria", lat: 23.7475, lng: 90.3775, intensity: 0.92, reports: 25, category: "general", city: "Dhaka", division: "Dhaka" },
        { name: "Central Library", lat: 23.7450, lng: 90.3780, intensity: 0.85, reports: 18, category: "general", city: "Dhaka", division: "Dhaka" },
        { name: "Dhanmondi 27", lat: 23.7505, lng: 90.3780, intensity: 0.88, reports: 22, category: "general", city: "Dhaka", division: "Dhaka" },
        { name: "Satmasjid Road", lat: 23.7440, lng: 90.3795, intensity: 0.78, reports: 15, category: "general", city: "Dhaka", division: "Dhaka" },
        { name: "Star Kabab", lat: 23.7425, lng: 90.3805, intensity: 0.82, reports: 17, category: "food", city: "Dhaka", division: "Dhaka" },
        { name: "UIU Main Gate", lat: 23.7460, lng: 90.3755, intensity: 0.75, reports: 12, category: "general", city: "Dhaka", division: "Dhaka" },
        { name: "Rabindra Sarobar", lat: 23.7400, lng: 90.3740, intensity: 0.65, reports: 9, category: "park", city: "Dhaka", division: "Dhaka" },
        
        // Bangladesh - Chittagong
        { name: "CUET Campus", lat: 22.4700, lng: 91.7900, intensity: 0.72, reports: 14, category: "campus", city: "Chittagong", division: "Chittagong" },
        { name: "GEC Circle", lat: 22.3569, lng: 91.7832, intensity: 0.68, reports: 11, category: "market", city: "Chittagong", division: "Chittagong" },
        
        // Bangladesh - Rajshahi
        { name: "RU Campus", lat: 24.3745, lng: 88.6042, intensity: 0.70, reports: 13, category: "campus", city: "Rajshahi", division: "Rajshahi" },
        
        // Bangladesh - Sylhet
        { name: "SUST Campus", lat: 24.8949, lng: 91.8687, intensity: 0.68, reports: 10, category: "campus", city: "Sylhet", division: "Sylhet" },
        
        // Bangladesh - Khulna
        { name: "KU Campus", lat: 22.8456, lng: 89.5403, intensity: 0.62, reports: 8, category: "campus", city: "Khulna", division: "Khulna" },
        
        // International Hotspots
        { name: "Times Square", lat: 40.7580, lng: -73.9855, intensity: 0.88, reports: 67, category: "tourist", city: "New York", country: "USA" },
        { name: "London Eye", lat: 51.5033, lng: -0.1195, intensity: 0.82, reports: 52, category: "tourist", city: "London", country: "UK" },
        { name: "Burj Khalifa", lat: 25.1972, lng: 55.2744, intensity: 0.85, reports: 43, category: "tourist", city: "Dubai", country: "UAE" },
        { name: "Shibuya Crossing", lat: 35.6595, lng: 139.7004, intensity: 0.86, reports: 56, category: "tourist", city: "Tokyo", country: "Japan" },
        { name: "Marina Bay Sands", lat: 1.2839, lng: 103.8589, intensity: 0.78, reports: 39, category: "tourist", city: "Singapore", country: "Singapore" },
        { name: "Eiffel Tower", lat: 48.8584, lng: 2.2945, intensity: 0.84, reports: 62, category: "tourist", city: "Paris", country: "France" }
    ];

    // Generate Heatmap Data
    function generateHeatData() {
        var data = [];
        for (var i = 0; i < hotspotLocations.length; i++) {
            var loc = hotspotLocations[i];
            data.push([loc.lat, loc.lng, loc.intensity]);
        }
        return data;
    }

    // Show Toast
    function showToast(message, isError) {
        var toast = document.getElementById('toast');
        if (!toast) return;
        var isErrorFlag = isError === true;
        toast.innerHTML = '<i class="fas ' + (isErrorFlag ? 'fa-exclamation-triangle' : 'fa-check-circle') + '"></i> ' + message;
        toast.classList.add('show');
        setTimeout(function() {
            toast.classList.remove('show');
        }, 3000);
    }

    // Update Stats
    function updateStats() {
        var hotspotCount = document.getElementById('hotspotCount');
        var peakIntensity = document.getElementById('peakIntensity');
        
        if (hotspotCount) hotspotCount.innerText = hotspotLocations.length;
        if (peakIntensity) {
            var maxIntensity = Math.max.apply(null, hotspotLocations.map(function(l) { return l.intensity; }));
            peakIntensity.innerText = Math.round(maxIntensity * 100) + '%';
        }
    }

    // Initialize Map with Heatmap
    function initMap() {
        if (typeof L === 'undefined') {
            showToast('Loading map...', true);
            setTimeout(initMap, 500);
            return;
        }

        try {
            map = L.map('heatmapMap').setView(BANGLADESH_CENTER, DEFAULT_ZOOM);
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 18,
                minZoom: 2
            }).addTo(map);
            
            L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(map);
            
            // Add Heatmap Layer
            var heatData = generateHeatData();
            heatLayer = L.heatLayer(heatData, {
                radius: 30,
                blur: 20,
                maxZoom: 17,
                minOpacity: 0.3,
                gradient: { 0.4: '#4ECDC4', 0.6: '#FFD233', 0.8: '#FF6B6B', 1.0: '#8B0000' }
            }).addTo(map);
            
            // Add Markers
            for (var i = 0; i < hotspotLocations.length; i++) {
                var loc = hotspotLocations[i];
                
                var markerColor = '#00A9B5';
                if (loc.intensity >= 0.8) markerColor = '#FF6B6B';
                else if (loc.intensity >= 0.6) markerColor = '#FFD233';
                else markerColor = '#4ECDC4';
                
                var iconHtml = '<div style="background: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 2px solid ' + markerColor + '; cursor: pointer;">' +
                    '<i class="fas fa-fire" style="color: ' + markerColor + '; font-size: 14px;"></i>' +
                    '</div>';
                
                var customIcon = L.divIcon({
                    html: iconHtml,
                    className: 'custom-marker',
                    iconSize: [32, 32],
                    popupAnchor: [0, -16]
                });
                
                var marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);
                
                var popupContent = '<div style="min-width: 220px;">' +
                    '<div style="font-weight: 800; color: #00A9B5; margin-bottom: 8px;">' +
                    '<i class="fas fa-fire"></i> ' + loc.name +
                    '</div>' +
                    '<div style="font-size: 12px; color: #667085;">' +
                    '<strong>Location:</strong> ' + (loc.city || loc.division || 'Bangladesh') +
                    '</div>' +
                    '<div style="font-size: 12px; color: #667085; margin: 5px 0;">' +
                    '<strong>Reports:</strong> ' + loc.reports + ' | ' +
                    '<strong>Intensity:</strong> ' + Math.round(loc.intensity * 100) + '%' +
                    '</div>' +
                    '<div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #E4E7EC;">' +
                    '<button onclick="window.viewHotspotDetails(\'' + loc.name + '\')" style="width: 100%; padding: 6px; background: #00A9B5; color: white; border: none; border-radius: 8px; cursor: pointer;">' +
                    'View Details' +
                    '</button>' +
                    '</div>' +
                    '</div>';
                
                marker.bindPopup(popupContent);
            }
            
            updateStats();
            showToast('🔥 Heatmap loaded with ' + hotspotLocations.length + ' active hotspots', false);
            
        } catch (error) {
            console.error('Map error:', error);
            showToast('Error loading map', true);
        }
    }

    // Filter Heatmap by Category
    function filterHeatmap(category) {
        if (!heatLayer) return;
        
        var filteredData = [];
        for (var i = 0; i < hotspotLocations.length; i++) {
            var loc = hotspotLocations[i];
            if (category === 'all' || loc.category === category) {
                filteredData.push([loc.lat, loc.lng, loc.intensity]);
            }
        }
        
        map.removeLayer(heatLayer);
        heatLayer = L.heatLayer(filteredData, {
            radius: 30,
            blur: 20,
            maxZoom: 17,
            minOpacity: 0.3,
            gradient: { 0.4: '#4ECDC4', 0.6: '#FFD233', 0.8: '#FF6B6B', 1.0: '#8B0000' }
        }).addTo(map);
        
        showToast('Filtered: Showing ' + filteredData.length + ' hotspots', false);
    }

    // Recenter to Bangladesh
    function recenterToBangladesh() {
        if (map) {
            map.setView(BANGLADESH_CENTER, DEFAULT_ZOOM);
            showToast('📍 Centered on Bangladesh - UIU Dhanmondi Region', false);
        }
    }

    // Global function for popup buttons
    window.viewHotspotDetails = function(name) {
        showToast('📊 Viewing detailed analytics for ' + name, false);
    };

    // Search Function
    function initSearch() {
        var searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                var term = e.target.value.toLowerCase().trim();
                if (term === '') {
                    filterHeatmap(currentCategoryFilter);
                    return;
                }
                
                var filteredData = [];
                for (var i = 0; i < hotspotLocations.length; i++) {
                    var loc = hotspotLocations[i];
                    if (loc.name.toLowerCase().includes(term) || 
                        (loc.city && loc.city.toLowerCase().includes(term)) ||
                        (loc.division && loc.division.toLowerCase().includes(term))) {
                        filteredData.push([loc.lat, loc.lng, loc.intensity]);
                    }
                }
                
                map.removeLayer(heatLayer);
                heatLayer = L.heatLayer(filteredData, {
                    radius: 30,
                    blur: 20,
                    maxZoom: 17,
                    minOpacity: 0.3,
                    gradient: { 0.4: '#4ECDC4', 0.6: '#FFD233', 0.8: '#FF6B6B', 1.0: '#8B0000' }
                }).addTo(map);
                
                showToast('🔍 Found ' + filteredData.length + ' matching hotspots', false);
            });
        }
    }

    // Filter Button Handlers
    function initFilters() {
        var timeBtns = document.querySelectorAll('[data-time]');
        var categoryBtns = document.querySelectorAll('[data-category]');
        
        timeBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                timeBtns.forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                currentTimeFilter = this.dataset.time;
                showToast('Time filter: ' + this.innerText, false);
            });
        });
        
        categoryBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                categoryBtns.forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                currentCategoryFilter = this.dataset.category;
                filterHeatmap(currentCategoryFilter);
                showToast('Category: ' + this.innerText, false);
            });
        });
    }

    // Map Controls
    function initMapControls() {
        var zoomInBtn = document.getElementById('zoomInBtn');
        var zoomOutBtn = document.getElementById('zoomOutBtn');
        var fullscreenBtn = document.getElementById('fullscreenBtn');
        var locateBtn = document.getElementById('locateBtn');
        var recenterBtn = document.getElementById('recenterBtn');
        
        if (zoomInBtn) zoomInBtn.addEventListener('click', function() { if (map) map.zoomIn(); });
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', function() { if (map) map.zoomOut(); });
        if (recenterBtn) recenterBtn.addEventListener('click', recenterToBangladesh);
        
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', function() {
                var mapContainer = document.getElementById('heatmapMap');
                if (mapContainer.requestFullscreen) {
                    mapContainer.requestFullscreen();
                    setTimeout(function() { if (map) map.invalidateSize(); }, 100);
                }
            });
        }
        
        if (locateBtn) {
            locateBtn.addEventListener('click', function() {
                if (navigator.geolocation) {
                    showToast('📍 Detecting your location...', false);
                    navigator.geolocation.getCurrentPosition(
                        function(pos) {
                            map.setView([pos.coords.latitude, pos.coords.longitude], 15);
                            L.marker([pos.coords.latitude, pos.coords.longitude])
                                .bindPopup('<b>You are here</b>')
                                .openPopup();
                        },
                        function() { showToast('Unable to get location', true); }
                    );
                }
            });
        }
    }

    // Insight Card Click Handlers
    function initInsightCards() {
        var cards = document.querySelectorAll('.insight-card');
        cards.forEach(function(card) {
            card.addEventListener('click', function() {
                var title = this.querySelector('h3')?.innerText || 'Insight';
                showToast('📊 Viewing detailed analytics for ' + title, false);
            });
        });
    }

    // Bottom Navigation
    function initBottomNav() {
        var navItems = document.querySelectorAll('.bottom-nav .nav-item');
        navItems.forEach(function(item) {
            item.addEventListener('click', function() {
                showToast('Navigating to ' + this.innerText.trim(), false);
            });
        });
    }

    // Keyboard Shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                var searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.focus();
                showToast('🔍 Search activated', false);
            }
        });
    }

    // Welcome Message
    function showWelcome() {
        setTimeout(function() {
            showToast('🔥 Welcome to Loss Hotspots Dashboard! Real-time heatmap active', false);
        }, 800);
    }

    // Initialize Everything
    function init() {
        initMap();
        setTimeout(function() {
            initSearch();
            initFilters();
            initMapControls();
            initInsightCards();
            initBottomNav();
            initKeyboardShortcuts();
        }, 500);
        showWelcome();
    }

    init();
})();