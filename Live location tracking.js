// Live Item Tracker - Full World Map with Live Tracking Simulation
(function() {
    'use strict';

    var map = null;
    var userMarker = null;
    var itemMarker = null;
    var pathLine = null;
    var pathPoints = [];
    var animationInterval = null;
    var currentStep = 0;
    var globalMarkers = [];
    
    // World View Center (Zoomed out to show full globe)
    var WORLD_CENTER = [20, 0];
    var WORLD_ZOOM = 2;
    
    // Bangladesh - UIU Dhanmondi Area (Primary Focus)
    var UIU_CENTER = [23.7465, 90.3763];
    var BANGLADESH_ZOOM = 16;
    
    // User Location (Dhaka, Bangladesh)
    var userLocation = { lat: 23.7470, lng: 90.3770 };
    
    // Tracked Item Locations (UIU Campus route in Dhaka)
    var itemPath = [
        { lat: 23.7505, lng: 90.3780, name: "Dhanmondi 27, Dhaka", time: "10:00 AM" },
        { lat: 23.7485, lng: 90.3775, name: "UIU Cafeteria, Dhaka", time: "10:05 AM" },
        { lat: 23.7470, lng: 90.3770, name: "Main Building, UIU", time: "10:10 AM" },
        { lat: 23.7455, lng: 90.3765, name: "Central Library, Dhaka", time: "10:15 AM" },
        { lat: 23.7440, lng: 90.3760, name: "Satmasjid Road, Dhaka", time: "10:20 AM" },
        { lat: 23.7425, lng: 90.3755, name: "Star Kabab, Dhanmondi", time: "10:25 AM" }
    ];
    
    // Global Hub Locations (Major cities worldwide for reference)
    var globalHubs = [
        { name: "UIU Campus Hub", lat: 23.7465, lng: 90.3763, country: "Bangladesh", type: "main" },
        { name: "Dhaka City Hub", lat: 23.8103, lng: 90.4125, country: "Bangladesh", type: "regional" },
        { name: "New York Hub", lat: 40.7128, lng: -74.0060, country: "USA", type: "international" },
        { name: "London Hub", lat: 51.5074, lng: -0.1278, country: "UK", type: "international" },
        { name: "Dubai Hub", lat: 25.2048, lng: 55.2708, country: "UAE", type: "international" },
        { name: "Singapore Hub", lat: 1.3521, lng: 103.8198, country: "Singapore", type: "international" },
        { name: "Tokyo Hub", lat: 35.6762, lng: 139.6503, country: "Japan", type: "international" },
        { name: "Sydney Hub", lat: -33.8688, lng: 151.2093, country: "Australia", type: "international" }
    ];
    
    var currentItemIndex = 0;
    var currentItemLocation = { lat: itemPath[0].lat, lng: itemPath[0].lng };
    
    // DOM Elements
    var searchInput = document.getElementById('searchInput');
    var distanceValue = document.getElementById('distanceValue');
    var distanceFill = document.getElementById('distanceFill');
    var directionText = document.getElementById('directionText');
    var lastUpdateTime = document.getElementById('lastUpdateTime');
    var lastLocationText = document.getElementById('lastLocationText');
    var speedValue = document.getElementById('speedValue');
    var speedStatus = document.getElementById('speedStatus');
    var finderName = document.getElementById('finderName');
    var messageBtn = document.getElementById('messageBtn');
    var recenterBtn = document.getElementById('recenterBtn');
    var zoomInBtn = document.getElementById('zoomInBtn');
    var zoomOutBtn = document.getElementById('zoomOutBtn');
    var locateBtn = document.getElementById('locateBtn');
    var worldViewBtn = document.getElementById('worldViewBtn');
    var fullscreenBtn = document.getElementById('fullscreenBtn');
    var toast = document.getElementById('toast');
    
    // Filter Buttons
    var filterPills = document.querySelectorAll('.btn-pill');
    var categoryBtns = document.querySelectorAll('.btn-outline');
    var footerItems = document.querySelectorAll('.footer-item');
    
    // Show Toast
    function showToast(message, isError) {
        if (!toast) return;
        var isErrorFlag = isError === true;
        toast.innerHTML = '<i class="fas ' + (isErrorFlag ? 'fa-exclamation-triangle' : 'fa-check-circle') + '"></i> ' + message;
        toast.classList.add('show');
        setTimeout(function() {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Calculate Distance between two points (in meters)
    function calculateDistance(lat1, lng1, lat2, lng2) {
        var R = 6371000;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLng = (lng2 - lng1) * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.round(R * c);
    }
    
    // Update Status Display
    function updateStatus() {
        var distance = calculateDistance(
            userLocation.lat, userLocation.lng,
            currentItemLocation.lat, currentItemLocation.lng
        );
        
        distanceValue.innerText = distance;
        var fillPercent = Math.min(100, Math.max(0, (distance / 500) * 100));
        distanceFill.style.width = fillPercent + '%';
        
        if (distance < 50) {
            directionText.innerText = "Item is very close! Look around UIU Campus";
        } else if (distance < 150) {
            directionText.innerText = "Moving toward Auditorium, UIU Campus";
        } else if (distance < 300) {
            directionText.innerText = "Item is nearby Dhanmondi, keep tracking";
        } else {
            directionText.innerText = "Item is moving within Dhaka, stay updated";
        }
        
        var speed = (Math.random() * 3 + 1).toFixed(1);
        speedValue.innerText = speed;
        if (speed < 1.5) speedStatus.innerText = "Slow pace";
        else if (speed < 3) speedStatus.innerText = "Walking pace";
        else speedStatus.innerText = "Moving quickly";
        
        var currentItem = itemPath[currentItemIndex];
        if (currentItem) {
            lastLocationText.innerText = "Keys were near " + currentItem.name;
            var now = new Date();
            lastUpdateTime.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }
    
    // Add Global Hub Markers
    function addGlobalHubs() {
        for (var i = 0; i < globalHubs.length; i++) {
            var hub = globalHubs[i];
            var color = (hub.type === 'main') ? '#0097a7' : '#9c27b0';
            var iconHtml = '<div style="background: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 2px solid ' + color + ';">' +
                '<i class="fas fa-building" style="color: ' + color + '; font-size: 12px;"></i>' +
                '</div>';
            
            var hubIcon = L.divIcon({
                html: iconHtml,
                className: 'custom-marker',
                iconSize: [28, 28],
                popupAnchor: [0, -14]
            });
            
            var marker = L.marker([hub.lat, hub.lng], { icon: hubIcon }).addTo(map);
            marker.bindPopup('<b>' + hub.name + '</b><br>' + hub.country + '<br>Global Lost & Found Hub');
            globalMarkers.push(marker);
        }
    }
    
    // Update Item Position
    function updateItemPosition(index) {
        if (index >= itemPath.length) {
            clearInterval(animationInterval);
            showToast('📍 Item has been found at UIU Campus! Check your notifications.', false);
            return;
        }
        
        currentItemIndex = index;
        currentItemLocation = { lat: itemPath[index].lat, lng: itemPath[index].lng };
        
        if (itemMarker) {
            map.removeLayer(itemMarker);
        }
        
        var itemIconHtml = '<div style="background: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 2px solid #fbc02d; animation: pulse 1.5s infinite;">' +
            '<i class="fas fa-key" style="color: #fbc02d; font-size: 16px;"></i>' +
            '</div>';
        
        var itemIcon = L.divIcon({
            html: itemIconHtml,
            className: 'custom-marker',
            iconSize: [36, 36],
            popupAnchor: [0, -18]
        });
        
        itemMarker = L.marker([currentItemLocation.lat, currentItemLocation.lng], { icon: itemIcon }).addTo(map);
        itemMarker.bindPopup('<b>' + itemPath[index].name + '</b><br>Status: Moving | ETA: 5 min');
        
        pathPoints.push([currentItemLocation.lat, currentItemLocation.lng]);
        if (pathLine) {
            map.removeLayer(pathLine);
        }
        pathLine = L.polyline(pathPoints, { color: '#ff9800', weight: 3, opacity: 0.7 }).addTo(map);
        
        updateStatus();
        showToast('📍 Item updated: ' + itemPath[index].name, false);
    }
    
    // Start Live Tracking
    function startLiveTracking() {
        var index = 0;
        animationInterval = setInterval(function() {
            index++;
            if (index < itemPath.length) {
                updateItemPosition(index);
            } else {
                clearInterval(animationInterval);
                showToast('✅ Item has arrived! Check the status for next steps.', false);
            }
        }, 8000);
    }
    
    // Initialize Full World Map
    function initMap() {
        if (typeof L === 'undefined') {
            showToast('Loading map...', true);
            setTimeout(initMap, 500);
            return;
        }
        
        map = L.map('liveMap').setView(UIU_CENTER, BANGLADESH_ZOOM);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
            minZoom: 2
        }).addTo(map);
        
        L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(map);
        
        // Add User Marker
        var userIconHtml = '<div style="background: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 2px solid #2196f3; animation: pulse 1.5s infinite;">' +
            '<i class="fas fa-user" style="color: #2196f3; font-size: 16px;"></i>' +
            '</div>';
        
        var userIcon = L.divIcon({
            html: userIconHtml,
            className: 'custom-marker',
            iconSize: [36, 36],
            popupAnchor: [0, -18]
        });
        
        userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
        userMarker.bindPopup('<b>Your Location</b><br>UIU Campus, Dhaka, Bangladesh');
        
        // Add Item Marker
        var itemIconHtml = '<div style="background: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 2px solid #fbc02d; animation: pulse 1.5s infinite;">' +
            '<i class="fas fa-key" style="color: #fbc02d; font-size: 16px;"></i>' +
            '</div>';
        
        var itemIcon = L.divIcon({
            html: itemIconHtml,
            className: 'custom-marker',
            iconSize: [36, 36],
            popupAnchor: [0, -18]
        });
        
        itemMarker = L.marker([currentItemLocation.lat, currentItemLocation.lng], { icon: itemIcon }).addTo(map);
        itemMarker.bindPopup('<b>Tracked Item: UIU Keys</b><br>Status: Moving within UIU Campus');
        
        pathPoints.push([currentItemLocation.lat, currentItemLocation.lng]);
        
        // Add location markers for reference points
        for (var i = 0; i < itemPath.length; i++) {
            var loc = itemPath[i];
            var refIconHtml = '<div style="background: rgba(0,151,167,0.8); width: 8px; height: 8px; border-radius: 50%;"></div>';
            var refIcon = L.divIcon({ html: refIconHtml, className: '', iconSize: [8, 8] });
            var refMarker = L.marker([loc.lat, loc.lng], { icon: refIcon }).addTo(map);
            refMarker.bindTooltip(loc.name, { sticky: true });
        }
        
        // Add Global Hubs
        addGlobalHubs();
        
        updateStatus();
        showToast('🗺️ Full World Map loaded! Tracking UIU Keys in real-time', false);
        
        setTimeout(startLiveTracking, 2000);
    }
    
    // World View
    function worldView() {
        if (map) {
            map.setView(WORLD_CENTER, WORLD_ZOOM);
            showToast('🌍 World View - Showing global Lost & Found hubs', false);
        }
    }
    
    // Bangladesh View
    function bangladeshView() {
        if (map) {
            map.setView(UIU_CENTER, BANGLADESH_ZOOM);
            showToast('📍 Centered on UIU Campus, Dhaka, Bangladesh', false);
        }
    }
    
    // Recenter on Tracked Item
    function recenterOnItem() {
        if (map && itemMarker) {
            map.setView([currentItemLocation.lat, currentItemLocation.lng], 17);
            showToast('📍 Centered on tracked item at UIU Campus', false);
        }
    }
    
    // My Location
    function locateUser() {
        if (navigator.geolocation) {
            showToast('📍 Detecting your location...', false);
            navigator.geolocation.getCurrentPosition(
                function(pos) {
                    var lat = pos.coords.latitude;
                    var lng = pos.coords.longitude;
                    map.setView([lat, lng], 14);
                    if (userMarker) {
                        userMarker.setLatLng([lat, lng]);
                    } else {
                        var userIconHtml = '<div style="background: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 2px solid #2196f3;">' +
                            '<i class="fas fa-user" style="color: #2196f3; font-size: 16px;"></i>' +
                            '</div>';
                        var userIcon = L.divIcon({ html: userIconHtml, className: 'custom-marker', iconSize: [36, 36], popupAnchor: [0, -18] });
                        userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
                        userMarker.bindPopup('<b>Your Location</b>');
                    }
                    userLocation = { lat: lat, lng: lng };
                    showToast('📍 Location updated!', false);
                    updateStatus();
                },
                function() {
                    showToast('Unable to get location', true);
                }
            );
        } else {
            showToast('Geolocation not supported', true);
        }
    }
    
    // Search Function
    function initSearch() {
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                var term = e.target.value.toLowerCase().trim();
                if (term !== '') {
                    showToast('🔍 Searching globally for: ' + term, false);
                }
            });
        }
    }
    
    // Filter Handlers
    function initFilters() {
        filterPills.forEach(function(btn) {
            btn.addEventListener('click', function() {
                filterPills.forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                showToast('Filter: ' + this.innerText, false);
            });
        });
        
        categoryBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                categoryBtns.forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                showToast('Category: ' + this.innerText, false);
            });
        });
        
        footerItems.forEach(function(item) {
            item.addEventListener('click', function() {
                footerItems.forEach(function(i) { i.classList.remove('active'); });
                this.classList.add('active');
                showToast('Navigating to ' + this.innerText, false);
            });
        });
    }
    
    // Map Controls
    function initMapControls() {
        if (zoomInBtn) zoomInBtn.addEventListener('click', function() { if (map) map.zoomIn(); });
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', function() { if (map) map.zoomOut(); });
        if (recenterBtn) recenterBtn.addEventListener('click', recenterOnItem);
        if (locateBtn) locateBtn.addEventListener('click', locateUser);
        if (worldViewBtn) worldViewBtn.addEventListener('click', worldView);
        
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', function() {
                var mapContainer = document.getElementById('liveMap');
                if (mapContainer.requestFullscreen) {
                    mapContainer.requestFullscreen();
                    setTimeout(function() { if (map) map.invalidateSize(); }, 100);
                }
            });
        }
        
        if (messageBtn) {
            messageBtn.addEventListener('click', function() {
                showToast('💬 Message sent to Ahmed! They will respond shortly.', false);
            });
        }
    }
    
    // Keyboard Shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (searchInput) searchInput.focus();
                showToast('🔍 Global search activated', false);
            }
            if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                recenterOnItem();
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
            showToast('🌍 Full World Map Active! Following UIU Keys in Bangladesh, with global hubs marked', false);
        }, 1000);
    }
    
    // Initialize Everything
    function init() {
        initMap();
        setTimeout(function() {
            initSearch();
            initFilters();
            initMapControls();
            initKeyboardShortcuts();
        }, 500);
        showWelcome();
    }
    
    init();
})();