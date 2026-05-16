// Map Dashboard - Full World Map with Global Locations
(function() {
    'use strict';

    var map = null;
    var heatLayer = null;
    var geofenceLayer = null;
    var markers = [];
    var isHeatmapVisible = false;
    var isGeofenceVisible = false;

    // Bangladesh Center (Default View)
    var BANGLADESH_CENTER = [23.7465, 90.3763];
    var WORLD_CENTER = [20, 0];
    var DEFAULT_ZOOM = 14;
    var WORLD_ZOOM = 2;

    // Global Locations Data
    var globalLocations = [
        // Bangladesh
        { name: "UIU Campus", lat: 23.7465, lng: 90.3763, country: "Bangladesh", activity: "high", reports: 45, icon: "university" },
        { name: "Lost & Found Hub BD", lat: 23.7480, lng: 90.3745, country: "Bangladesh", activity: "high", reports: 32, icon: "flag-checkered" },
        { name: "Dhanmondi 27", lat: 23.7505, lng: 90.3780, country: "Bangladesh", activity: "high", reports: 28, icon: "city" },
        
        // USA
        { name: "Times Square", lat: 40.7580, lng: -73.9855, country: "USA", activity: "high", reports: 67, icon: "city" },
        { name: "Central Park", lat: 40.7850, lng: -73.9680, country: "USA", activity: "medium", reports: 34, icon: "tree" },
        
        // UK
        { name: "London Eye", lat: 51.5033, lng: -0.1195, country: "UK", activity: "high", reports: 52, icon: "building" },
        { name: "British Museum", lat: 51.5194, lng: -0.1269, country: "UK", activity: "medium", reports: 28, icon: "landmark" },
        
        // UAE
        { name: "Burj Khalifa", lat: 25.1972, lng: 55.2744, country: "UAE", activity: "high", reports: 43, icon: "city" },
        { name: "Dubai Mall", lat: 25.1985, lng: 55.2790, country: "UAE", activity: "high", reports: 38, icon: "shopping-cart" },
        
        // Japan
        { name: "Shibuya Crossing", lat: 35.6595, lng: 139.7004, country: "Japan", activity: "high", reports: 56, icon: "city" },
        { name: "Tokyo Station", lat: 35.6812, lng: 139.7671, country: "Japan", activity: "medium", reports: 41, icon: "train" },
        
        // Singapore
        { name: "Marina Bay Sands", lat: 1.2839, lng: 103.8589, country: "Singapore", activity: "high", reports: 39, icon: "building" },
        
        // Australia
        { name: "Sydney Opera House", lat: -33.8568, lng: 151.2153, country: "Australia", activity: "medium", reports: 27, icon: "music" },
        
        // Canada
        { name: "CN Tower", lat: 43.6426, lng: -79.3871, country: "Canada", activity: "medium", reports: 23, icon: "tower-broadcast" },
        
        // India
        { name: "Gateway of India", lat: 18.9219, lng: 72.8347, country: "India", activity: "high", reports: 48, icon: "landmark" },
        
        // Germany
        { name: "Brandenburg Gate", lat: 52.5163, lng: 13.3777, country: "Germany", activity: "medium", reports: 31, icon: "archway" },
        
        // France
        { name: "Eiffel Tower", lat: 48.8584, lng: 2.2945, country: "France", activity: "high", reports: 62, icon: "city" }
    ];

    // Global Heatmap Data
    var heatData = [];
    for (var i = 0; i < globalLocations.length; i++) {
        var loc = globalLocations[i];
        var intensity = 0.3;
        if (loc.activity === 'high') intensity = 0.9;
        else if (loc.activity === 'medium') intensity = 0.6;
        else intensity = 0.3;
        heatData.push([loc.lat, loc.lng, intensity]);
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

    // Initialize Full World Map
    function initMap() {
        if (typeof L === 'undefined') {
            console.error('Leaflet not loaded');
            showToast('Loading map...', true);
            setTimeout(initMap, 500);
            return;
        }

        try {
            // Create map with world view
            map = L.map('worldMap').setView(BANGLADESH_CENTER, DEFAULT_ZOOM);
            
            // Add tile layer
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 18,
                minZoom: 2
            }).addTo(map);
            
            // Add scale control
            L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(map);
            
            // Add markers for each global location
            for (var i = 0; i < globalLocations.length; i++) {
                var location = globalLocations[i];
                
                // Determine marker color based on activity
                var markerColor = '#00A9B5';
                if (location.activity === 'high') markerColor = '#FF6B6B';
                else if (location.activity === 'medium') markerColor = '#FFD233';
                else markerColor = '#4ECDC4';
                
                // Create custom icon
                var iconHtml = '<div style="background: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 2px solid ' + markerColor + '; cursor: pointer;">' +
                    '<i class="fas fa-' + location.icon + '" style="color: ' + markerColor + '; font-size: 16px;"></i>' +
                    '</div>';
                
                var customIcon = L.divIcon({
                    html: iconHtml,
                    className: 'custom-marker',
                    iconSize: [36, 36],
                    popupAnchor: [0, -18]
                });
                
                var marker = L.marker([location.lat, location.lng], { icon: customIcon }).addTo(map);
                
                // Create popup content
                var popupContent = '<div style="min-width: 220px;">' +
                    '<div style="font-weight: 800; color: #00A9B5; margin-bottom: 8px;">' +
                    '<i class="fas fa-' + location.icon + '"></i> ' + location.name +
                    '</div>' +
                    '<div style="font-size: 12px; color: #667085; margin-bottom: 5px;">' +
                    '<strong>Country:</strong> ' + location.country +
                    '</div>' +
                    '<div style="font-size: 12px; color: #667085; margin-bottom: 8px;">' +
                    '<strong>Activity:</strong> ' + location.activity.toUpperCase() + ' | ' +
                    '<strong>Reports:</strong> ' + location.reports +
                    '</div>' +
                    '<div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #E4E7EC;">' +
                    '<button onclick="window.viewLocationDetails(\'' + location.name + '\')" style="width: 100%; padding: 6px; background: #00A9B5; color: white; border: none; border-radius: 8px; cursor: pointer;">' +
                    'View Details' +
                    '</button>' +
                    '</div>' +
                    '</div>';
                
                marker.bindPopup(popupContent);
                
                marker.on('click', function(loc) {
                    return function() {
                        showToast('📍 ' + loc.name + ', ' + loc.country + ' - ' + loc.reports + ' reports', false);
                    };
                }(location));
                
                markers.push(marker);
            }
            
            showToast('🗺️ World map loaded with ' + markers.length + ' global locations!', false);
            
        } catch (error) {
            console.error('Map error:', error);
            showToast('Error loading map', true);
        }
    }

    // Toggle Heatmap
    function toggleHeatmap() {
        if (!map) return;
        
        if (isHeatmapVisible && heatLayer) {
            map.removeLayer(heatLayer);
            heatLayer = null;
            isHeatmapVisible = false;
            showToast('Heatmap hidden', false);
        } else {
            if (typeof L.heatLayer !== 'undefined') {
                heatLayer = L.heatLayer(heatData, {
                    radius: 25,
                    blur: 15,
                    maxZoom: 17,
                    minOpacity: 0.3,
                    gradient: { 0.4: '#4ECDC4', 0.6: '#FFD233', 0.8: '#FF6B6B' }
                }).addTo(map);
                isHeatmapVisible = true;
                showToast('🔥 Global heatmap activated - Showing high activity zones worldwide', false);
            } else {
                showToast('Heatmap feature loading...', true);
            }
        }
    }

    // Toggle Geofence (Global Circles)
    function toggleGeofence() {
        if (!map) return;
        
        if (isGeofenceVisible && geofenceLayer) {
            map.removeLayer(geofenceLayer);
            geofenceLayer = null;
            isGeofenceVisible = false;
            showToast('Geofence hidden', false);
        } else {
            geofenceLayer = L.layerGroup();
            // Add circles for major hubs
            var hubs = globalLocations.filter(function(loc) { return loc.activity === 'high'; });
            for (var i = 0; i < hubs.length; i++) {
                var circle = L.circle([hubs[i].lat, hubs[i].lng], {
                    color: '#00A9B5',
                    weight: 1.5,
                    opacity: 0.5,
                    fillColor: '#00A9B5',
                    fillOpacity: 0.05,
                    radius: 500
                }).addTo(geofenceLayer);
                circle.bindTooltip(hubs[i].name + ' Safety Zone', { sticky: true });
            }
            geofenceLayer.addTo(map);
            isGeofenceVisible = true;
            showToast('Global geofence activated - ' + hubs.length + ' active safety zones', false);
        }
    }

    // Reset to Bangladesh View
    function resetToBangladesh() {
        if (map) {
            map.setView(BANGLADESH_CENTER, DEFAULT_ZOOM);
            showToast('Map view reset to Bangladesh - UIU Dhanmondi', false);
        }
    }

    // World View
    function worldView() {
        if (map) {
            map.setView([20, 0], 2);
            showToast('🌍 World view - Showing all global locations', false);
        }
    }

    // Global function for popup buttons
    window.viewLocationDetails = function(name) {
        showToast('📋 Viewing details for ' + name, false);
    };

    // Location Tag Click Handler
    function initLocationTags() {
        var tags = document.querySelectorAll('.location-tags span');
        for (var i = 0; i < tags.length; i++) {
            var tag = tags[i];
            tag.addEventListener('click', function() {
                var tagText = this.innerText.toLowerCase();
                var location = null;
                
                for (var j = 0; j < globalLocations.length; j++) {
                    var loc = globalLocations[j];
                    if (tagText.indexOf(loc.name.toLowerCase()) !== -1 || 
                        (tagText.indexOf('uiu') !== -1 && loc.name === 'UIU Campus')) {
                        location = loc;
                        break;
                    }
                    if (tagText.indexOf('new york') !== -1 && loc.name === 'Times Square') location = loc;
                    if (tagText.indexOf('london') !== -1 && loc.name === 'London Eye') location = loc;
                    if (tagText.indexOf('dubai') !== -1 && loc.name === 'Burj Khalifa') location = loc;
                    if (tagText.indexOf('tokyo') !== -1 && loc.name === 'Shibuya Crossing') location = loc;
                    if (tagText.indexOf('singapore') !== -1 && loc.name === 'Marina Bay Sands') location = loc;
                }
                
                if (location && map) {
                    map.setView([location.lat, location.lng], 13);
                    showToast('📍 Centered on ' + location.name + ', ' + location.country, false);
                } else if (tagText.indexOf('your location') !== -1) {
                    showToast('📍 Using your current location', false);
                }
            });
        }
    }

    // Alert Button Handlers
    function initAlertButtons() {
        var viewBtns = document.querySelectorAll('.btn-view');
        var claimBtns = document.querySelectorAll('.btn-claim');
        var trackBtns = document.querySelectorAll('.btn-track');
        var tableBtns = document.querySelectorAll('.table-btn');
        
        for (var i = 0; i < viewBtns.length; i++) {
            viewBtns[i].addEventListener('click', function(e) {
                e.stopPropagation();
                showToast('📋 Viewing item details...', false);
            });
        }
        
        for (var i = 0; i < claimBtns.length; i++) {
            claimBtns[i].addEventListener('click', function(e) {
                e.stopPropagation();
                showToast('✅ Claim request submitted! You will be contacted soon.', false);
            });
        }
        
        for (var i = 0; i < trackBtns.length; i++) {
            trackBtns[i].addEventListener('click', function(e) {
                e.stopPropagation();
                showToast('📍 Tracking location...', false);
            });
        }
        
        for (var i = 0; i < tableBtns.length; i++) {
            tableBtns[i].addEventListener('click', function(e) {
                e.stopPropagation();
                showToast('🔍 Opening details...', false);
            });
        }
    }

    // Sidebar Navigation
    function initSidebarNav() {
        var navItems = document.querySelectorAll('.sidebar-nav li');
        for (var i = 0; i < navItems.length; i++) {
            var item = navItems[i];
            item.addEventListener('click', function() {
                var allItems = document.querySelectorAll('.sidebar-nav li');
                for (var j = 0; j < allItems.length; j++) {
                    allItems[j].classList.remove('active-nav');
                }
                this.classList.add('active-nav');
                var text = this.innerText.trim();
                showToast('Navigating to ' + text + '...', false);
            });
        }
    }

    // Keyboard Shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'h' || e.key === 'H') {
                e.preventDefault();
                toggleHeatmap();
            }
            if (e.key === 'g' || e.key === 'G') {
                e.preventDefault();
                toggleGeofence();
            }
            if (e.key === 'b' || e.key === 'B') {
                e.preventDefault();
                resetToBangladesh();
            }
            if (e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                worldView();
            }
        });
    }

    // Map Tool Buttons
    function initMapTools() {
        var heatmapBtn = document.getElementById('heatmapToggle');
        var geofenceBtn = document.getElementById('geofenceToggle');
        var resetBtn = document.getElementById('resetMap');
        var worldViewBtn = document.getElementById('worldView');
        
        if (heatmapBtn) heatmapBtn.addEventListener('click', toggleHeatmap);
        if (geofenceBtn) geofenceBtn.addEventListener('click', toggleGeofence);
        if (resetBtn) resetBtn.addEventListener('click', resetToBangladesh);
        if (worldViewBtn) worldViewBtn.addEventListener('click', worldView);
    }

    // Simulate Real-time Updates
    function initRealTimeUpdates() {
        setInterval(function() {
            var alertCards = document.querySelectorAll('.alert-card');
            if (alertCards.length > 0 && Math.random() > 0.7) {
                var randomAlert = alertCards[Math.floor(Math.random() * alertCards.length)];
                randomAlert.style.animation = 'none';
                setTimeout(function() {
                    randomAlert.style.animation = 'fadeUp 0.5s ease';
                }, 10);
            }
        }, 30000);
    }

    // Welcome Message
    function showWelcome() {
        setTimeout(function() {
            showToast('🌍 Welcome to Global Loss Prevention Dashboard! ' + markers.length + ' locations monitored worldwide', false);
        }, 800);
    }

    // Initialize Everything
    function init() {
        initMap();
        setTimeout(function() {
            initLocationTags();
            initAlertButtons();
            initSidebarNav();
            initKeyboardShortcuts();
            initMapTools();
            initRealTimeUpdates();
        }, 500);
        showWelcome();
    }

    // Start the application
    init();
})();