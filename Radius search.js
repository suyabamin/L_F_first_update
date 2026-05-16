// Radius Search - Full World Map with Interactive Radius Circle
(function() {
    'use strict';

    let map = null;
    let radiusCircle = null;
    let centerMarker = null;
    let markers = [];
    let currentRadius = 2.5; // km
    let currentCenter = { lat: 23.7465, lng: 90.3763 }; // Dhanmondi, Dhaka

    // World View Settings
    const WORLD_CENTER = [20, 0];
    const WORLD_ZOOM = 2;
    const BANGLADESH_CENTER = [23.7465, 90.3763];
    const BANGLADESH_ZOOM = 13;

    // Sample locations data
    const locations = [
        { name: "Dhanmondi 27", lat: 23.7505, lng: 90.3780, type: "found", item: "Leather Wallet" },
        { name: "Star Kabab", lat: 23.7425, lng: 90.3805, type: "lost", item: "iPhone 13 Pro" },
        { name: "UIU Campus", lat: 23.7465, lng: 90.3763, type: "hub", item: "Main Hub" },
        { name: "Satmasjid Road", lat: 23.7440, lng: 90.3795, type: "lost", item: "Backpack" },
        { name: "UIU Cafeteria", lat: 23.7475, lng: 90.3775, type: "found", item: "Key Set" },
        { name: "Gulshan", lat: 23.7925, lng: 90.4078, type: "lost", item: "Wallet" },
        { name: "Times Square", lat: 40.7580, lng: -73.9855, type: "lost", item: "MacBook Pro" },
        { name: "London Eye", lat: 51.5033, lng: -0.1195, type: "found", item: "Passport" },
        { name: "Burj Khalifa", lat: 25.1972, lng: 55.2744, type: "lost", item: "Watch" }
    ];

    // DOM Elements
    const toast = document.getElementById('toast');
    const radiusSlider = document.getElementById('radiusSlider');
    const radiusValue = document.getElementById('radiusValue');
    const locationInput = document.getElementById('locationInput');
    const searchAgainBtn = document.getElementById('searchAgainBtn');
    const saveSearchBtn = document.getElementById('saveSearchBtn');
    const filterBtn = document.getElementById('filterBtn');
    const realtimeToggle = document.getElementById('realtimeToggle');
    const globalSearch = document.getElementById('globalSearch');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const worldViewBtn = document.getElementById('worldViewBtn');
    const locateBtn = document.getElementById('locateBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const notifyBtn = document.getElementById('notifyBtn');
    const itemCountSpan = document.getElementById('itemCount');

    // Show Toast
    function showToast(message, isError) {
        if (!toast) return;
        toast.innerHTML = '<i class="fas ' + (isError ? 'fa-exclamation-triangle' : 'fa-check-circle') + '"></i> ' + message;
        toast.classList.add('show');
        setTimeout(function() {
            toast.classList.remove('show');
        }, 3000);
    }

    // Calculate distance between two points (km)
    function calculateDistance(lat1, lng1, lat2, lng2) {
        var R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLng = (lng2 - lng1) * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Update markers based on radius
    function updateMarkersWithinRadius() {
        var count = 0;
        for (var i = 0; i < markers.length; i++) {
            var marker = markers[i];
            var loc = marker.locationData;
            if (loc) {
                var distance = calculateDistance(currentCenter.lat, currentCenter.lng, loc.lat, loc.lng);
                if (distance <= currentRadius) {
                    if (!map.hasLayer(marker)) marker.addTo(map);
                    count++;
                } else {
                    if (map.hasLayer(marker)) map.removeLayer(marker);
                }
            }
        }
        itemCountSpan.innerText = count;
        return count;
    }

    // Initialize Map
    function initMap() {
        if (typeof L === 'undefined') {
            showToast('Loading map...', true);
            setTimeout(initMap, 500);
            return;
        }

        map = L.map('radiusMap').setView(BANGLADESH_CENTER, BANGLADESH_ZOOM);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
            minZoom: 2
        }).addTo(map);
        
        L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(map);
        
        // Add center marker
        var centerIconHtml = '<div style="background: #00A9B5; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">' +
            '<i class="fas fa-location-dot" style="color: white; font-size: 18px;"></i>' +
            '</div>';
        
        var centerIcon = L.divIcon({
            html: centerIconHtml,
            className: 'center-marker',
            iconSize: [40, 40],
            popupAnchor: [0, -20]
        });
        
        centerMarker = L.marker([currentCenter.lat, currentCenter.lng], { icon: centerIcon }).addTo(map);
        centerMarker.bindPopup('<b>Search Center</b><br>Dhanmondi, Dhaka, Bangladesh');
        
        // Add radius circle
        radiusCircle = L.circle([currentCenter.lat, currentCenter.lng], {
            color: '#00A9B5',
            weight: 2,
            opacity: 0.7,
            fillColor: '#00A9B5',
            fillOpacity: 0.1,
            radius: currentRadius * 1000
        }).addTo(map);
        
        // Add location markers
        for (var i = 0; i < locations.length; i++) {
            var loc = locations[i];
            var markerColor = loc.type === 'lost' ? '#ef4444' : (loc.type === 'found' ? '#10b981' : '#8b5cf6');
            
            var iconHtml = '<div style="background: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 2px solid ' + markerColor + ';">' +
                '<i class="fas fa-map-marker-alt" style="color: ' + markerColor + '; font-size: 14px;"></i>' +
                '</div>';
            
            var customIcon = L.divIcon({
                html: iconHtml,
                className: 'custom-marker',
                iconSize: [32, 32],
                popupAnchor: [0, -16]
            });
            
            var marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);
            marker.locationData = loc;
            
            var distance = calculateDistance(currentCenter.lat, currentCenter.lng, loc.lat, loc.lng);
            var popupContent = '<div style="min-width: 200px;">' +
                '<div style="font-weight: 800; color: #00A9B5; margin-bottom: 8px;">' + loc.name + '</div>' +
                '<div style="font-size: 12px;"><strong>' + (loc.type === 'lost' ? 'Lost' : 'Found') + '</strong> ' + loc.item + '</div>' +
                '<div style="font-size: 11px; color: #667085; margin-top: 5px;"><i class="fas fa-location-arrow"></i> ' + distance.toFixed(1) + ' km from center</div>' +
                '<button onclick="window.viewLocation(\'' + loc.name + '\')" style="margin-top: 8px; width: 100%; padding: 5px; background: #00A9B5; color: white; border: none; border-radius: 6px; cursor: pointer;">View Details</button>' +
                '</div>';
            
            marker.bindPopup(popupContent);
            markers.push(marker);
        }
        
        updateMarkersWithinRadius();
        showToast('🗺️ Map loaded! Radius search active', false);
    }

    // Update Radius
    function updateRadius() {
        currentRadius = parseFloat(radiusSlider.value);
        radiusValue.innerText = currentRadius;
        
        if (radiusCircle) {
            radiusCircle.setRadius(currentRadius * 1000);
        }
        
        updateMarkersWithinRadius();
        showToast('Radius updated to ' + currentRadius + ' km', false);
    }

    // Search Location (Geocoding simulation)
    function searchLocation() {
        var query = locationInput.value.toLowerCase();
        if (query.includes('dhanmondi') || query.includes('dhaka')) {
            currentCenter = { lat: 23.7465, lng: 90.3763 };
            map.setView([currentCenter.lat, currentCenter.lng], BANGLADESH_ZOOM);
            centerMarker.setLatLng([currentCenter.lat, currentCenter.lng]);
            radiusCircle.setLatLng([currentCenter.lat, currentCenter.lng]);
            updateMarkersWithinRadius();
            showToast('📍 Location set to Dhanmondi, Dhaka, Bangladesh', false);
        } else if (query.includes('new york')) {
            currentCenter = { lat: 40.7128, lng: -74.0060 };
            map.setView([currentCenter.lat, currentCenter.lng], 12);
            centerMarker.setLatLng([currentCenter.lat, currentCenter.lng]);
            radiusCircle.setLatLng([currentCenter.lat, currentCenter.lng]);
            updateMarkersWithinRadius();
            showToast('📍 Location set to New York City', false);
        } else if (query.includes('london')) {
            currentCenter = { lat: 51.5074, lng: -0.1278 };
            map.setView([currentCenter.lat, currentCenter.lng], 12);
            centerMarker.setLatLng([currentCenter.lat, currentCenter.lng]);
            radiusCircle.setLatLng([currentCenter.lat, currentCenter.lng]);
            updateMarkersWithinRadius();
            showToast('📍 Location set to London', false);
        } else {
            showToast('Location not found. Try "Dhanmondi, Dhaka"', true);
        }
    }

    // World View
    function worldView() {
        if (map) {
            map.setView(WORLD_CENTER, WORLD_ZOOM);
            showToast('🌍 World view', false);
        }
    }

    // Reset to Bangladesh
    function resetToBangladesh() {
        currentCenter = { lat: 23.7465, lng: 90.3763 };
        map.setView([currentCenter.lat, currentCenter.lng], BANGLADESH_ZOOM);
        centerMarker.setLatLng([currentCenter.lat, currentCenter.lng]);
        radiusCircle.setLatLng([currentCenter.lat, currentCenter.lng]);
        locationInput.value = 'Dhanmondi, Dhaka, Bangladesh';
        updateMarkersWithinRadius();
        showToast('📍 View reset to Bangladesh - Dhanmondi, Dhaka', false);
    }

    // My Location
    function locateUser() {
        if (navigator.geolocation) {
            showToast('📍 Detecting your location...', false);
            navigator.geolocation.getCurrentPosition(
                function(pos) {
                    currentCenter = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    map.setView([currentCenter.lat, currentCenter.lng], 14);
                    centerMarker.setLatLng([currentCenter.lat, currentCenter.lng]);
                    radiusCircle.setLatLng([currentCenter.lat, currentCenter.lng]);
                    updateMarkersWithinRadius();
                    showToast('📍 Location updated to your current position', false);
                },
                function() { showToast('Unable to get location', true); }
            );
        }
    }

    // Global function for popup
    window.viewLocation = function(name) {
        showToast('📋 Viewing details for ' + name, false);
    };

    // Search items in feed
    function initSearch() {
        if (globalSearch) {
            globalSearch.addEventListener('input', function(e) {
                var term = e.target.value.toLowerCase();
                var cards = document.querySelectorAll('.feed-card');
                var visibleCount = 0;
                
                cards.forEach(function(card) {
                    var text = card.innerText.toLowerCase();
                    if (term === '' || text.indexOf(term) !== -1) {
                        card.style.display = 'flex';
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                if (term !== '') {
                    showToast('🔍 Found ' + visibleCount + ' matching items', false);
                }
            });
        }
    }

    // Button handlers
    function initButtons() {
        if (radiusSlider) radiusSlider.addEventListener('input', updateRadius);
        if (searchAgainBtn) searchAgainBtn.addEventListener('click', searchLocation);
        if (saveSearchBtn) saveSearchBtn.addEventListener('click', function() { showToast('Search saved!', false); });
        if (filterBtn) filterBtn.addEventListener('click', function() { showToast('Filter options coming soon', false); });
        if (zoomInBtn) zoomInBtn.addEventListener('click', function() { if (map) map.zoomIn(); });
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', function() { if (map) map.zoomOut(); });
        if (worldViewBtn) worldViewBtn.addEventListener('click', worldView);
        if (locateBtn) locateBtn.addEventListener('click', locateUser);
        if (notifyBtn) notifyBtn.addEventListener('click', function() { showToast('🔔 You have 3 new notifications', false); });
        
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', function() {
                var mapContainer = document.getElementById('radiusMap');
                if (mapContainer.requestFullscreen) {
                    mapContainer.requestFullscreen();
                    setTimeout(function() { if (map) map.invalidateSize(); }, 100);
                }
            });
        }
    }

    // Keyboard shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (globalSearch) globalSearch.focus();
                showToast('🔍 Search activated', false);
            }
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

    // Welcome message
    function showWelcome() {
        setTimeout(function() {
            showToast('🔍 Welcome to Radius Search! Adjust the radius to find nearby items', false);
        }, 800);
    }

    // Initialize
    function init() {
        initMap();
        setTimeout(function() {
            initButtons();
            initSearch();
            initKeyboardShortcuts();
        }, 500);
        showWelcome();
    }

    init();
})();