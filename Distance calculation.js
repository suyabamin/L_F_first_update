// Distance Calculation with Real Leaflet Map

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const mapContainer = document.getElementById('realMap');
    const distanceValueSpan = document.getElementById('distanceValue');
    const timeValueSpan = document.getElementById('timeValue');
    const liveDistanceSpan = document.getElementById('liveDistance');
    const routeDescription = document.getElementById('routeDescription');
    const etaTimeSpan = document.getElementById('etaTime');
    const startInput = document.getElementById('startInput');
    const endInput = document.getElementById('endInput');
    const updateRouteBtn = document.getElementById('updateRouteBtn');
    const startNavBtn = document.getElementById('startNavBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetViewBtn = document.getElementById('resetViewBtn');
    const locateBtn = document.getElementById('locateBtn');
    const swapPointsBtn = document.getElementById('swapPointsBtn');
    const transportTabs = document.getElementById('transportTabs');
    const altOptions = document.querySelectorAll('.alt-option');
    const toast = document.getElementById('toast');

    // State Variables
    let currentMode = 'car';
    let currentSpeed = 50;
    let map;
    let startMarker, endMarker;
    let routeLine;
    let startLatLng = { lat: 23.8103, lng: 90.4125 }; // Dhanmondi area
    let endLatLng = { lat: 23.8150, lng: 90.4250 };   // UIU Hub area
    
    // Mode speeds (km/h)
    const modeSpeeds = {
        car: 50,
        transit: 25,
        walk: 5,
        bike: 15
    };
    
    const modeNames = { car: 'Car', transit: 'Public Transit', walk: 'Walking', bike: 'Bicycle' };
    
    // Address to coordinates mapping (for demo)
    const addressCoordinates = {
        'Dhanmondi, Dhaka': { lat: 23.7450, lng: 90.3815 },
        'UIU Hub, Dhaka': { lat: 23.8160, lng: 90.4260 },
        'Gulshan, Dhaka': { lat: 23.7800, lng: 90.4200 },
        'Banani, Dhaka': { lat: 23.7940, lng: 90.4060 },
        'Motijheel, Dhaka': { lat: 23.7325, lng: 90.4170 },
        'Uttara, Dhaka': { lat: 23.8750, lng: 90.3790 }
    };
    
    // Initialize Real Map
    function initMap() {
        map = L.map('realMap').setView([23.7800, 90.4050], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> & CartoDB',
            subdomains: 'abcd',
            maxZoom: 19,
            minZoom: 10
        }).addTo(map);
        
        // Add a nicer tile layer with labels
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Custom icons
        const startIcon = L.divIcon({
            html: '<div style="background: linear-gradient(135deg, #3B82F6, #2563EB); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); border: 2px solid white;">A</div>',
            iconSize: [36, 36],
            className: 'custom-marker'
        });
        
        const endIcon = L.divIcon({
            html: '<div style="background: linear-gradient(135deg, #F59E0B, #D97706); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); border: 2px solid white;">B</div>',
            iconSize: [36, 36],
            className: 'custom-marker'
        });
        
        // Create markers
        startMarker = L.marker([startLatLng.lat, startLatLng.lng], { icon: startIcon, draggable: true }).addTo(map);
        endMarker = L.marker([endLatLng.lat, endLatLng.lng], { icon: endIcon, draggable: true }).addTo(map);
        
        // Add drag events
        startMarker.on('dragend', () => {
            const pos = startMarker.getLatLng();
            startLatLng = { lat: pos.lat, lng: pos.lng };
            updateRoute();
            updateAddressFromCoords(startLatLng, startInput);
            showToast('Start location updated');
        });
        
        endMarker.on('dragend', () => {
            const pos = endMarker.getLatLng();
            endLatLng = { lat: pos.lat, lng: pos.lng };
            updateRoute();
            updateAddressFromCoords(endLatLng, endInput);
            showToast('Destination updated');
        });
        
        // Initial route
        updateRoute();
    }
    
    // Calculate distance using Haversine formula
    function calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        return parseFloat(distance.toFixed(2));
    }
    
    // Calculate travel time
    function calculateTime(distance) {
        const timeHours = distance / currentSpeed;
        return Math.round(timeHours * 60);
    }
    
    // Get ETA
    function getETA(minutes) {
        const now = new Date();
        now.setMinutes(now.getMinutes() + minutes);
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Draw route line on map
    function drawRouteLine() {
        if (routeLine) {
            map.removeLayer(routeLine);
        }
        
        // Create a curved path for better visualization
        const points = [
            [startLatLng.lat, startLatLng.lng],
            [startLatLng.lat + (endLatLng.lat - startLatLng.lat) * 0.3, startLatLng.lng + (endLatLng.lng - startLatLng.lng) * 0.3 + 0.005],
            [startLatLng.lat + (endLatLng.lat - startLatLng.lat) * 0.7, startLatLng.lng + (endLatLng.lng - startLatLng.lng) * 0.7 - 0.003],
            [endLatLng.lat, endLatLng.lng]
        ];
        
        routeLine = L.polyline(points, {
            color: '#0D9488',
            weight: 4,
            opacity: 0.8,
            lineJoin: 'round',
            dashArray: '10, 10'
        }).addTo(map);
        
        // Add a glow effect
        L.polyline(points, {
            color: '#99F6E4',
            weight: 8,
            opacity: 0.3,
            lineJoin: 'round'
        }).addTo(map);
    }
    
    // Update all UI and route
    function updateRoute() {
        const distance = calculateDistance(startLatLng.lat, startLatLng.lng, endLatLng.lat, endLatLng.lng);
        const travelTime = calculateTime(distance);
        const eta = getETA(travelTime);
        
        distanceValueSpan.textContent = distance;
        timeValueSpan.textContent = travelTime;
        liveDistanceSpan.textContent = distance;
        etaTimeSpan.textContent = eta;
        
        routeDescription.innerHTML = `${modeNames[currentMode]} route • ${distance} km • ${travelTime} min estimated`;
        
        drawRouteLine();
        
        // Fit bounds to show both markers
        const bounds = L.latLngBounds(
            [startLatLng.lat, startLatLng.lng],
            [endLatLng.lat, endLatLng.lng]
        );
        map.fitBounds(bounds, { padding: [50, 50] });
        
        updateAlternatives(distance);
    }
    
    // Update alternative routes based on current distance
    function updateAlternatives(currentDist) {
        altOptions.forEach(opt => {
            const altDist = parseFloat(opt.dataset.dist);
            const diff = Math.abs(altDist - currentDist);
            if (diff < 1.5) {
                opt.style.opacity = '1';
                opt.style.borderLeft = '3px solid #0D9488';
            } else {
                opt.style.opacity = '0.6';
                opt.style.borderLeft = '3px solid transparent';
            }
        });
    }
    
    // Geocode address (simulated)
    function geocodeAddress(address) {
        for (const [key, coords] of Object.entries(addressCoordinates)) {
            if (address.toLowerCase().includes(key.toLowerCase())) {
                return coords;
            }
        }
        // Return random nearby coordinates
        return {
            lat: startLatLng.lat + (Math.random() - 0.5) * 0.02,
            lng: startLatLng.lng + (Math.random() - 0.5) * 0.02
        };
    }
    
    // Reverse geocode (simulated)
    function updateAddressFromCoords(coords, inputElement) {
        // In a real app, you'd call a reverse geocoding API
        // For demo, we'll just show coordinates
        inputElement.value = `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°`;
    }
    
    // Update route from address inputs
    function updateRouteFromAddresses() {
        const startAddr = startInput.value;
        const endAddr = endInput.value;
        
        let startCoords = geocodeAddress(startAddr);
        let endCoords = geocodeAddress(endAddr);
        
        if (startCoords) {
            startLatLng = startCoords;
            startMarker.setLatLng([startLatLng.lat, startLatLng.lng]);
        }
        
        if (endCoords) {
            endLatLng = endCoords;
            endMarker.setLatLng([endLatLng.lat, endLatLng.lng]);
        }
        
        updateRoute();
        showToast('Route recalculated with new addresses!');
    }
    
    // Transport mode change
    function setTransportMode(mode, speed, tabElement) {
        currentMode = mode;
        currentSpeed = speed;
        updateRoute();
        showToast(`Switched to ${modeNames[mode]} mode`);
    }
    
    // Show toast notification
    function showToast(message, isError = false) {
        const toastMsg = document.getElementById('toastMsg');
        toastMsg.textContent = message;
        toast.classList.add('show');
        if (isError) {
            toast.style.background = '#EF4444';
        } else {
            toast.style.background = '#1E293B';
        }
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }
    
    // Start navigation
    function startNavigation() {
        const distance = calculateDistance(startLatLng.lat, startLatLng.lng, endLatLng.lat, endLatLng.lng);
        const travelTime = calculateTime(distance);
        showToast(`🚗 Navigation started! Distance: ${distance} km | ETA: ${getETA(travelTime)}`);
        
        // Simulate turn-by-turn alert
        setTimeout(() => {
            showToast("➡️ In 500m, turn right onto Main Road");
        }, 2000);
        setTimeout(() => {
            showToast("⬆️ Continue straight for 1.2 km");
        }, 5000);
    }
    
    // Map controls
    function zoomIn() { map.zoomIn(); }
    function zoomOut() { map.zoomOut(); }
    function resetView() {
        const bounds = L.latLngBounds(
            [startLatLng.lat, startLatLng.lng],
            [endLatLng.lat, endLatLng.lng]
        );
        map.fitBounds(bounds, { padding: [50, 50] });
    }
    function locateUser() {
        showToast("📍 Getting your current location...");
        map.locate({ setView: true, maxZoom: 16 });
        map.on('locationfound', (e) => {
            startLatLng = { lat: e.latlng.lat, lng: e.latlng.lng };
            startMarker.setLatLng([startLatLng.lat, startLatLng.lng]);
            updateRoute();
            showToast("📍 Location detected! Route updated.");
        });
        map.on('locationerror', () => {
            showToast("❌ Could not detect location. Please enable GPS.", true);
        });
    }
    function swapPoints() {
        const temp = { ...startLatLng };
        startLatLng = { ...endLatLng };
        endLatLng = temp;
        startMarker.setLatLng([startLatLng.lat, startLatLng.lng]);
        endMarker.setLatLng([endLatLng.lat, endLatLng.lng]);
        updateRoute();
        showToast("Start and destination swapped!");
    }
    
    // Alternative route selection
    function selectAlternative(option) {
        const altLat = parseFloat(option.dataset.lat);
        const altLng = parseFloat(option.dataset.lng);
        if (!isNaN(altLat) && !isNaN(altLng)) {
            endLatLng = { lat: altLat, lng: altLng };
            endMarker.setLatLng([endLatLng.lat, endLatLng.lng]);
            updateRoute();
            showToast(`Alternative route selected: ${option.querySelector('.alt-route-name').textContent}`);
        }
    }
    
    // Event Listeners
    transportTabs.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            transportTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            setTransportMode(tab.dataset.mode, parseFloat(tab.dataset.speed), tab);
        });
    });
    
    altOptions.forEach(option => {
        option.addEventListener('click', () => selectAlternative(option));
    });
    
    updateRouteBtn.addEventListener('click', updateRouteFromAddresses);
    startNavBtn.addEventListener('click', startNavigation);
    zoomInBtn.addEventListener('click', zoomIn);
    zoomOutBtn.addEventListener('click', zoomOut);
    resetViewBtn.addEventListener('click', resetView);
    locateBtn.addEventListener('click', locateUser);
    swapPointsBtn.addEventListener('click', swapPoints);
    
    document.getElementById('logoutBtn')?.addEventListener('click', () => showToast("👋 Logging out..."));
    document.querySelector('.profile-badge')?.addEventListener('click', () => showToast("👤 Profile settings"));
    document.getElementById('infoIcon')?.addEventListener('click', () => showToast("Distance calculated using Haversine formula"));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === '+' || e.key === '=') zoomIn();
        if (e.key === '-' || e.key === '_') zoomOut();
        if (e.key === 'r' || e.key === 'R') resetView();
        if (e.key === 'l' || e.key === 'L') locateUser();
        if (e.key === 's' || e.key === 'S') swapPoints();
        if (e.key === 'Enter' && document.activeElement?.classList?.contains('location-input')) {
            updateRouteFromAddresses();
        }
    });
    
    // Initialize map when DOM is ready
    setTimeout(() => {
        initMap();
    }, 100);
});