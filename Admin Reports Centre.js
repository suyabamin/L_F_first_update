// Admin Reports Centre - Full World Map with Bangladesh Focus
(function() {
    'use strict';

    // DOM Elements
    const searchInput = document.getElementById('globalSearch');
    const toastContainer = document.getElementById('toastMessage');
    const filterPrimaryBtns = document.querySelectorAll('.filter-primary');
    const filterSecondaryBtns = document.querySelectorAll('.filter-secondary');
    const timeRangeSelect = document.getElementById('timeRange');
    const loadMoreBtn = document.getElementById('loadMoreFeed');
    const feedContainer = document.getElementById('feedContainer');
    const feedCountSpan = document.getElementById('feedCount');
    
    let map = null;
    let markers = [];
    let currentFeedPage = 1;

    // Bangladesh Coordinates
    const BANGLADESH_CENTER = [23.8103, 90.4125];

    // Show Toast - Fixed function declaration
    window.showToast = function(message, isError) {
        if (isError === undefined) isError = false;
        if (!toastContainer) return;
        toastContainer.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${message}`;
        toastContainer.classList.add('show');
        setTimeout(function() {
            toastContainer.classList.remove('show');
        }, 3000);
    };
    
    var showToast = window.showToast;

    // Initialize Full World Map with Bangladesh Focus
    function initMap() {
        if (typeof L === 'undefined') {
            console.error('Leaflet not loaded');
            showToast('Map library loading... Please wait', true);
            setTimeout(initMap, 500);
            return;
        }
        
        try {
            // Create map instance with Bangladesh center and zoom level 7
            map = L.map('worldMap').setView(BANGLADESH_CENTER, 7);
            
            // Add beautiful tile layers
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19,
                minZoom: 6
            }).addTo(map);
            
            // Add scale bar
            L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(map);
            
            // Add search/geocoder control if available
            if (L.Control.geocoder) {
                var geocoder = L.Control.geocoder({
                    defaultMarkGeocode: true,
                    position: 'topright',
                    placeholder: 'Search anywhere in the world...',
                    errorMessage: 'Location not found',
                    showResultIcons: true
                }).addTo(map);
                
                geocoder.on('markgeocode', function(e) {
                    var center = e.geocode.center;
                    showToast('📍 Searching: ' + e.geocode.name, false);
                    map.setView(center, 13);
                });
            }
            
            // Define incident locations across Bangladesh (8 divisions)
            var incidents = [
                // Dhaka Division
                { id: 1, title: "Laptop Loss #GD789", division: "Dhaka", lat: 23.8103, lng: 90.4125, status: "Pending", description: "Dell XPS Laptop lost at UIU Cafeteria", icon: "laptop", color: "#5d4037", severity: "high" },
                { id: 2, title: "iPhone 14 #PH893", division: "Dhaka", lat: 23.7925, lng: 90.4078, status: "Active Search", description: "iPhone 14 Pro Max lost at Gulshan", icon: "mobile-alt", color: "#00796b", severity: "high" },
                { id: 3, title: "Wallet #WL234", division: "Dhaka", lat: 23.7465, lng: 90.3763, status: "Found", description: "Brown leather wallet with ID cards", icon: "wallet", color: "#10b981", severity: "low" },
                { id: 4, title: "NID Card #NID892", division: "Dhaka", lat: 23.8250, lng: 90.4350, status: "Pending", description: "National ID card lost near Dhanmondi", icon: "id-card", color: "#3b82f6", severity: "medium" },
                
                // Chattogram Division
                { id: 5, title: "Backpack #BP567", division: "Chattogram", lat: 22.3569, lng: 91.7832, status: "Investigating", description: "North Face backpack with books", icon: "bag-shopping", color: "#ef4444", severity: "medium" },
                { id: 6, title: "Smart Watch #SW001", division: "Chattogram", lat: 22.3384, lng: 91.8316, status: "Active", description: "Apple Watch lost at Cox's Bazar", icon: "clock", color: "#8b5cf6", severity: "high" },
                { id: 7, title: "Camera #CM456", division: "Chattogram", lat: 22.2667, lng: 91.8000, status: "Pending", description: "Canon DSLR at Saint Martin", icon: "camera", color: "#f59e0b", severity: "high" },
                
                // Rajshahi Division
                { id: 8, title: "Key Set #MK452", division: "Rajshahi", lat: 24.3745, lng: 88.6042, status: "Resolved", description: "Office key set found and returned", icon: "key", color: "#fbc02d", severity: "low" },
                { id: 9, title: "Mobile #MB789", division: "Rajshahi", lat: 24.3636, lng: 88.6241, status: "Active", description: "Samsung phone at RU Campus", icon: "mobile-alt", color: "#00796b", severity: "medium" },
                
                // Khulna Division
                { id: 10, title: "Bag #BG234", division: "Khulna", lat: 22.8456, lng: 89.5403, status: "Pending", description: "Handbag at Khulna City Center", icon: "bag-shopping", color: "#ef4444", severity: "medium" },
                { id: 11, title: "Documents #DC678", division: "Khulna", lat: 22.8200, lng: 89.5500, status: "Found", description: "Important documents at Railway Station", icon: "file-alt", color: "#10b981", severity: "low" },
                
                // Sylhet Division
                { id: 12, title: "Wallet #WL345", division: "Sylhet", lat: 24.8949, lng: 91.8687, status: "Active", description: "Leather wallet at Hazrat Shahjalal Mazar", icon: "wallet", color: "#10b981", severity: "medium" },
                { id: 13, title: "Phone #PH567", division: "Sylhet", lat: 25.0450, lng: 91.9510, status: "Pending", description: "OnePlus phone at Jaflong", icon: "mobile-alt", color: "#00796b", severity: "high" },
                
                // Barishal Division
                { id: 14, title: "Watch #WT890", division: "Barishal", lat: 22.7010, lng: 90.3535, status: "Active", description: "Fossil watch at Kuakata Beach", icon: "clock", color: "#8b5cf6", severity: "low" },
                
                // Rangpur Division
                { id: 15, title: "Laptop #LP432", division: "Rangpur", lat: 25.7439, lng: 89.2752, status: "Investigating", description: "HP laptop lost at Rangpur City", icon: "laptop", color: "#5d4037", severity: "high" },
                
                // Mymensingh Division
                { id: 16, title: "ID Card #ID999", division: "Mymensingh", lat: 24.7539, lng: 90.4073, status: "Pending", description: "Student ID at Mymensingh Medical", icon: "id-card", color: "#3b82f6", severity: "medium" },
                
                // International markers
                { id: 17, title: "Tourist Lost Item", division: "International", lat: 27.7172, lng: 85.3240, status: "Active", description: "Tourist lost passport in Kathmandu", icon: "passport", color: "#f59e0b", severity: "medium" },
                { id: 18, title: "Lost Luggage", division: "International", lat: 22.5726, lng: 88.3639, status: "Pending", description: "Suitcase lost at Kolkata Airport", icon: "suitcase", color: "#ef4444", severity: "high" }
            ];
            
            // Add markers to map
            for (var i = 0; i < incidents.length; i++) {
                var incident = incidents[i];
                
                // Create custom HTML icon
                var iconHtml = '<div style="background: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 2px solid ' + incident.color + '; cursor: pointer; transition: all 0.2s ease;"><i class="fas fa-' + incident.icon + '" style="color: ' + incident.color + '; font-size: 16px;"></i></div>';
                
                var customIcon = L.divIcon({
                    html: iconHtml,
                    className: 'custom-marker',
                    iconSize: [38, 38],
                    popupAnchor: [0, -19]
                });
                
                var marker = L.marker([incident.lat, incident.lng], { icon: customIcon }).addTo(map);
                
                // Status color mapping
                var statusColor = '#3b82f6';
                if (incident.status === 'Resolved' || incident.status === 'Found') statusColor = '#10b981';
                else if (incident.status === 'Pending') statusColor = '#f59e0b';
                else if (incident.status === 'Active Search') statusColor = '#ef4444';
                
                // Create popup content
                var popupContent = '<div class="custom-popup" style="min-width: 220px;">' +
                    '<div style="font-weight: 800; color: #008b8b; margin-bottom: 8px; font-size: 1rem;">' +
                    '<i class="fas fa-' + incident.icon + '" style="margin-right: 6px;"></i> ' + incident.title +
                    '</div>' +
                    '<div style="font-size: 0.75rem; color: #64748b; margin-bottom: 8px;">' +
                    '<i class="fas fa-location-dot"></i> ' + incident.division + ' Division<br>' +
                    incident.description +
                    '</div>' +
                    '<div style="margin-bottom: 8px; padding: 6px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">' +
                    '<span style="font-size: 0.7rem; font-weight: 600;">Status: </span>' +
                    '<span style="font-size: 0.7rem; padding: 2px 8px; border-radius: 20px; background: ' + statusColor + '20; color: ' + statusColor + '; font-weight: 600;">' +
                    incident.status +
                    '</span>' +
                    '<span style="margin-left: 8px; font-size: 0.7rem; font-weight: 600;">Severity: </span>' +
                    '<span style="font-size: 0.7rem;">' + incident.severity.toUpperCase() + '</span>' +
                    '</div>' +
                    '<button class="popup-view-btn" data-id="' + incident.id + '" data-title="' + incident.title + '" style="width: 100%; padding: 6px; background: #008b8b; color: white; border: none; border-radius: 8px; font-size: 0.75rem; cursor: pointer; transition: all 0.2s;">' +
                    '<i class="fas fa-eye"></i> View Full Report' +
                    '</button>' +
                    '</div>';
                
                marker.bindPopup(popupContent);
                
                // Add popup open event
                marker.on('popupopen', function(e) {
                    var btn = document.querySelector('.popup-view-btn');
                    if (btn) {
                        btn.addEventListener('click', function(event) {
                            event.stopPropagation();
                            var title = this.getAttribute('data-title') || 'Item';
                            showToast('📋 Opening report for ' + title + '...', false);
                        });
                    }
                });
                
                marker.on('click', function(e) {
                    showToast('📍 ' + incident.title + ' - ' + incident.status + ' in ' + incident.division, false);
                });
                
                markers.push(marker);
            }
            
            // Add Bangladesh boundary highlight
            var bangladeshPolygon = L.polygon([
                [26.634, 88.028],
                [26.634, 92.673],
                [20.758, 92.673],
                [20.758, 88.028]
            ], {
                color: '#008b8b',
                weight: 2,
                opacity: 0.5,
                fillColor: '#008b8b',
                fillOpacity: 0.05
            }).addTo(map);
            
            console.log('World map initialized with', markers.length, 'markers');
            showToast('🗺️ World map loaded - ' + markers.length + ' active cases across Bangladesh', false);
            
        } catch (error) {
            console.error('Error initializing map:', error);
            showToast('Error loading map. Please refresh the page.', true);
        }
    }
    
    // Map Controls
    function initMapControls() {
        var zoomInBtn = document.getElementById('zoomIn');
        var zoomOutBtn = document.getElementById('zoomOut');
        var resetViewBtn = document.getElementById('resetView');
        var locateMeBtn = document.getElementById('locateMe');
        var fullscreenBtn = document.getElementById('fullscreenMap');
        
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', function() {
                if (map) map.zoomIn();
                showToast('Map zoomed in', false);
            });
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', function() {
                if (map) map.zoomOut();
                showToast('Map zoomed out', false);
            });
        }
        
        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', function() {
                if (map) {
                    map.setView(BANGLADESH_CENTER, 7);
                    showToast('🗺️ View reset to Bangladesh', false);
                }
            });
        }
        
        if (locateMeBtn) {
            locateMeBtn.addEventListener('click', function() {
                if (navigator.geolocation) {
                    showToast('📍 Detecting your location...', false);
                    navigator.geolocation.getCurrentPosition(
                        function(position) {
                            var lat = position.coords.latitude;
                            var lng = position.coords.longitude;
                            if (map) {
                                map.setView([lat, lng], 13);
                                L.marker([lat, lng])
                                    .bindPopup('<b>📍 You are here</b>')
                                    .openPopup();
                                showToast('📍 Location found!', false);
                            }
                        },
                        function() {
                            showToast('Unable to get your location', true);
                        }
                    );
                } else {
                    showToast('Geolocation not supported', true);
                }
            });
        }
        
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', function() {
                var mapWrapper = document.querySelector('.map-wrapper');
                if (mapWrapper) {
                    if (mapWrapper.requestFullscreen) {
                        mapWrapper.requestFullscreen();
                        showToast('Fullscreen mode - Use ESC to exit', false);
                        setTimeout(function() {
                            if (map) map.invalidateSize();
                        }, 100);
                    }
                }
            });
        }
    }

    // Initialize Sparkline Charts
    function initSparklines() {
        var sparkData = {
            hubSpark: [65, 70, 68, 72, 75, 73, 78, 80, 79, 82, 85, 88],
            reportSpark: [45, 50, 48, 55, 60, 58, 65, 70, 68, 75, 80, 85],
            flagSpark: [30, 28, 32, 35, 33, 38, 36, 40, 42, 38, 35, 32],
            rateSpark: [55, 58, 60, 62, 65, 68, 70, 72, 71, 73, 74, 71.5]
        };
        
        for (var chartId in sparkData) {
            if (sparkData.hasOwnProperty(chartId)) {
                var canvas = document.getElementById(chartId);
                if (!canvas) continue;
                var data = sparkData[chartId];
                
                try {
                    var ctx = canvas.getContext('2d');
                    var width = canvas.width = 100;
                    var height = canvas.height = 40;
                    
                    ctx.clearRect(0, 0, width, height);
                    ctx.beginPath();
                    
                    var step = width / (data.length - 1);
                    var maxVal = Math.max.apply(null, data);
                    var minVal = Math.min.apply(null, data);
                    var range = maxVal - minVal || 1;
                    
                    for (var i = 0; i < data.length; i++) {
                        var x = i * step;
                        var y = height - ((data[i] - minVal) / range) * (height - 5) - 5;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    
                    ctx.strokeStyle = '#008b8b';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    
                    ctx.lineTo(width, height);
                    ctx.lineTo(0, height);
                    ctx.fillStyle = 'rgba(0,139,139,0.1)';
                    ctx.fill();
                } catch(error) {
                    console.error('Error drawing sparkline:', error);
                }
            }
        }
    }

    // Initialize Bar Chart
    function initBarChart() {
        var bars = document.querySelectorAll('.bar');
        for (var i = 0; i < bars.length; i++) {
            var bar = bars[i];
            var value = bar.getAttribute('data-value');
            var barFill = bar.querySelector('.bar-fill');
            if (barFill && value) {
                setTimeout(function(bf, val) {
                    return function() { bf.style.height = val + '%'; };
                }(barFill, value), 100);
            }
        }
    }

    // Animate Stats
    function animateStats() {
        var statValues = document.querySelectorAll('.stat-value');
        for (var i = 0; i < statValues.length; i++) {
            var stat = statValues[i];
            var targetText = stat.innerText;
            var targetNum = parseFloat(targetText.replace(/[^0-9.]/g, ''));
            if (isNaN(targetNum)) continue;
            
            var current = 0;
            var increment = targetNum / 50;
            var timer = setInterval(function(s, t, num) {
                return function() {
                    current += increment;
                    if (current >= num) {
                        s.innerText = t;
                        clearInterval(timer);
                    } else {
                        s.innerText = Math.floor(current).toLocaleString();
                    }
                };
            }(stat, targetText, targetNum), 20);
        }
    }

    // Search Functionality with Map Filtering
    function initSearch() {
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                var term = e.target.value.toLowerCase().trim();
                
                if (map && markers.length > 0) {
                    var visibleCount = 0;
                    for (var i = 0; i < markers.length; i++) {
                        var marker = markers[i];
                        var popupContent = marker.getPopup();
                        var contentStr = '';
                        if (popupContent) {
                            contentStr = popupContent.getContent() || '';
                        }
                        if (contentStr.toLowerCase().indexOf(term) !== -1 || term === '') {
                            if (!map.hasLayer(marker)) marker.addTo(map);
                            visibleCount++;
                        } else {
                            if (map.hasLayer(marker)) map.removeLayer(marker);
                        }
                    }
                    
                    if (term !== '') {
                        showToast('🔍 Found ' + visibleCount + ' matching cases', false);
                    } else {
                        showToast('Search cleared - All markers visible', false);
                    }
                }
                
                var feedItems = document.querySelectorAll('.feed-item');
                var feedVisibleCount = 0;
                for (var j = 0; j < feedItems.length; j++) {
                    var item = feedItems[j];
                    var text = item.innerText.toLowerCase();
                    if (text.indexOf(term) !== -1 || term === '') {
                        item.style.display = 'flex';
                        feedVisibleCount++;
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
        }
    }

    // Filter Handlers
    function initFilters() {
        for (var i = 0; i < filterPrimaryBtns.length; i++) {
            var btn = filterPrimaryBtns[i];
            btn.addEventListener('click', function() {
                for (var j = 0; j < filterPrimaryBtns.length; j++) {
                    filterPrimaryBtns[j].classList.remove('active');
                }
                this.classList.add('active');
                showToast('View: ' + this.innerText, false);
                
                var cards = document.querySelectorAll('.card');
                for (var k = 0; k < cards.length; k++) {
                    var card = cards[k];
                    card.style.transform = 'scale(0.98)';
                    setTimeout(function(c) {
                        return function() { c.style.transform = ''; };
                    }(card), 200);
                }
            });
        }
        
        for (var i = 0; i < filterSecondaryBtns.length; i++) {
            var btn = filterSecondaryBtns[i];
            btn.addEventListener('click', function() {
                for (var j = 0; j < filterSecondaryBtns.length; j++) {
                    filterSecondaryBtns[j].classList.remove('active');
                }
                this.classList.add('active');
                showToast('Filter: ' + this.innerText, false);
            });
        }
        
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', function(e) {
                var selectedText = e.target.options[e.target.selectedIndex].text;
                showToast('Time range changed to ' + selectedText, false);
            });
        }
        
        var pills = document.querySelectorAll('.pill');
        for (var i = 0; i < pills.length; i++) {
            var pill = pills[i];
            pill.addEventListener('click', function() {
                showToast('Filter: ' + this.innerText, false);
            });
        }
    }

    // Load More Feed Items
    function initLoadMoreFeed() {
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function() {
                currentFeedPage++;
                var newFeed = createMockFeedItem();
                if (feedContainer && newFeed) {
                    feedContainer.appendChild(newFeed);
                    var newCount = feedContainer.children.length;
                    if (feedCountSpan) feedCountSpan.innerText = newCount;
                    showToast('New activity loaded (' + newCount + ' total)', false);
                    newFeed.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                
                if (currentFeedPage >= 5) {
                    loadMoreBtn.disabled = true;
                    loadMoreBtn.style.opacity = '0.5';
                    loadMoreBtn.innerHTML = '<i class="fas fa-check"></i> No more updates';
                }
            });
        }
    }
    
    function createMockFeedItem() {
        var feedTypes = [
            { icon: 'fas fa-flag', bg: 'red-bg', title: 'New Flag Reported', text: 'Suspicious activity detected at UIU Campus', time: 'Just now' },
            { icon: 'fas fa-check-circle', bg: 'teal-bg', title: 'Case Resolved', text: 'Lost item #GD789 has been successfully returned', time: '2 mins ago' },
            { icon: 'fas fa-exclamation-triangle', bg: 'gold-bg', title: 'Priority Alert', text: 'High-value item reported missing in Library', time: '5 mins ago' },
            { icon: 'fas fa-chart-line', bg: 'blue-bg', title: 'Analytics Update', text: 'Monthly match rate increased by 5%', time: '10 mins ago' }
        ];
        
        var randomIndex = Math.floor(Math.random() * feedTypes.length);
        var randomType = feedTypes[randomIndex];
        var feedDiv = document.createElement('div');
        feedDiv.className = 'feed-item';
        feedDiv.style.animation = 'slideIn 0.3s ease';
        feedDiv.innerHTML = '<div class="icon-box ' + randomType.bg + '"><i class="' + randomType.icon + '"></i></div>' +
            '<div class="feed-text">' +
            '<strong>' + randomType.title + '</strong>' +
            '<p>' + randomType.text + '</p>' +
            '<span class="feed-time">' + randomType.time + '</span>' +
            '</div>';
        return feedDiv;
    }

    // Quick Action Buttons
    function initQuickActions() {
        var actionCards = document.querySelectorAll('.action-card');
        for (var i = 0; i < actionCards.length; i++) {
            var card = actionCards[i];
            card.addEventListener('click', function() {
                var titleElem = this.querySelector('h4');
                var title = titleElem ? titleElem.innerText : 'Action';
                showToast('🚀 ' + title + ' - Processing...', false);
                
                this.style.transform = 'scale(0.95)';
                var self = this;
                setTimeout(function() {
                    self.style.transform = '';
                }, 200);
            });
        }
    }

    // Nav Links
    function initNavLinks() {
        var navLinks = document.querySelectorAll('.nav-link');
        for (var i = 0; i < navLinks.length; i++) {
            var link = navLinks[i];
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var text = this.innerText.trim();
                showToast('Navigating to ' + text + '...', false);
            });
        }
        
        var adminLabel = document.querySelector('.admin-label');
        if (adminLabel) {
            adminLabel.addEventListener('click', function(e) {
                e.preventDefault();
                showToast('Opening admin profile settings...', false);
            });
        }
    }

    // Keyboard Shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                e.preventDefault();
                if (searchInput) {
                    searchInput.focus();
                    showToast('🔍 Search activated - Type to filter markers and feed', false);
                }
            }
            
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.value = '';
                var inputEvent = new Event('input');
                searchInput.dispatchEvent(inputEvent);
                showToast('Search cleared', false);
            }
            
            if (!e.ctrlKey && !e.metaKey && !e.altKey) {
                var num = parseInt(e.key);
                if (num >= 1 && num <= 5 && filterPrimaryBtns[num - 1]) {
                    filterPrimaryBtns[num - 1].click();
                }
            }
        });
    }

    // Auto Refresh Simulation
    function initAutoRefresh() {
        setInterval(function() {
            var activeHubs = document.getElementById('activeHubs');
            var totalReports = document.getElementById('totalReports');
            
            if (activeHubs) {
                var current = parseInt(activeHubs.innerText);
                if (!isNaN(current)) {
                    var newVal = current + Math.floor(Math.random() * 2);
                    activeHubs.innerText = newVal;
                }
            }
            
            if (totalReports) {
                var current = parseInt(totalReports.innerText.replace(/,/g, ''));
                if (!isNaN(current)) {
                    var newVal = current + Math.floor(Math.random() * 50);
                    totalReports.innerText = newVal.toLocaleString();
                }
            }
            
            if (Math.random() > 0.7 && feedContainer && loadMoreBtn && !loadMoreBtn.disabled) {
                var newFeed = createMockFeedItem();
                if (feedContainer.children.length < 10) {
                    feedContainer.prepend(newFeed);
                    if (feedCountSpan) feedCountSpan.innerText = feedContainer.children.length;
                    showToast('📢 New activity detected!', false);
                }
            }
            
            var mapInfo = document.getElementById('mapInfo');
            if (mapInfo && Math.random() > 0.8) {
                var activeCount = markers.length;
                mapInfo.innerHTML = '<span><i class="fas fa-map-marker-alt"></i> Bangladesh | ' + activeCount + ' active cases nationwide</span>';
            }
        }, 30000);
    }

    // Handle window resize
    function handleResize() {
        if (map) {
            setTimeout(function() {
                map.invalidateSize();
            }, 200);
        }
        initSparklines();
    }

    // Welcome Toast
    function showWelcome() {
        setTimeout(function() {
            showToast('🌍 Welcome to Admin Reports Centre! Full world map loaded - Bangladesh focused', false);
        }, 800);
    }

    // Initialize Everything
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                initMap();
                initMapControls();
                initSparklines();
                initBarChart();
                animateStats();
                initSearch();
                initFilters();
                initLoadMoreFeed();
                initQuickActions();
                initNavLinks();
                initKeyboardShortcuts();
                initAutoRefresh();
                window.addEventListener('resize', handleResize);
                showWelcome();
            });
        } else {
            initMap();
            initMapControls();
            initSparklines();
            initBarChart();
            animateStats();
            initSearch();
            initFilters();
            initLoadMoreFeed();
            initQuickActions();
            initNavLinks();
            initKeyboardShortcuts();
            initAutoRefresh();
            window.addEventListener('resize', handleResize);
            showWelcome();
        }
    }

    // Start the application
    init();
})();