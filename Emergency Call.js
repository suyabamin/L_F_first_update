// Emergency Call Page - Fully Interactive JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Police Stations Data
    const policeStations = [
        { id: 1, name: "Gulshan Police Station", distance: "2.3 km", phone: "02-9884088", address: "Gulshan-2, Dhaka", lat: 23.7925, lng: 90.4178 },
        { id: 2, name: "Banani Police Station", distance: "3.1 km", phone: "02-9882722", address: "Banani, Dhaka", lat: 23.7955, lng: 90.4055 },
        { id: 3, name: "Cantonment Police Station", distance: "4.5 km", phone: "02-9882722", address: "Dhaka Cantonment", lat: 23.8125, lng: 90.4085 },
        { id: 4, name: "Dhanmondi Police Station", distance: "5.2 km", phone: "02-9670215", address: "Dhanmondi, Dhaka", lat: 23.7475, lng: 90.3815 },
        { id: 5, name: "Uttara Police Station", distance: "6.8 km", phone: "02-8952245", address: "Uttara, Dhaka", lat: 23.8755, lng: 90.3855 },
        { id: 6, name: "Motijheel Police Station", distance: "7.5 km", phone: "02-9551115", address: "Motijheel, Dhaka", lat: 23.7325, lng: 90.4175 }
    ];
    
    // DOM Elements
    const stationList = document.getElementById('stationList');
    const searchInput = document.getElementById('searchStation');
    const stationsCountSpan = document.getElementById('stationsCount');
    const loadMoreBtn = document.getElementById('loadMoreStations');
    const sosDialBtn = document.getElementById('sosDialBtn');
    const refreshMapBtn = document.getElementById('refreshMapBtn');
    const emergencyModal = document.getElementById('emergencyModal');
    const confirmEmergencyBtn = document.getElementById('confirmEmergencyBtn');
    const cancelEmergencyBtn = document.getElementById('cancelEmergencyBtn');
    const toast = document.getElementById('toast');
    const responseTimeSpan = document.getElementById('responseTime');
    
    // State
    let displayedCount = 4;
    let currentStations = [...policeStations];
    let userLocation = { lat: 23.7800, lng: 90.4050 };
    let mapCanvas = null;
    let mapCtx = null;
    
    // Update response time dynamically
    function updateResponseTime() {
        const times = ['~5 mins', '~4 mins', '~6 mins', '~3 mins', '~7 mins'];
        let index = 0;
        setInterval(() => {
            if (responseTimeSpan) {
                responseTimeSpan.textContent = times[index % times.length];
                index++;
            }
        }, 3000);
    }
    
    // Render station cards
    function renderStations() {
        const filtered = filterStations();
        const displayStations = filtered.slice(0, displayedCount);
        const hasMore = filtered.length > displayedCount;
        
        if (stationsCountSpan) {
            stationsCountSpan.textContent = `${filtered.length} Locations`;
        }
        
        if (loadMoreBtn) {
            loadMoreBtn.style.display = hasMore ? 'flex' : 'none';
        }
        
        if (!stationList) return;
        
        if (filtered.length === 0) {
            stationList.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 40px;">
                    <i class="fas fa-search" style="font-size: 48px; color: var(--text-muted); opacity: 0.5;"></i>
                    <p style="margin-top: 12px;">No stations found</p>
                </div>
            `;
            return;
        }
        
        stationList.innerHTML = '';
        displayStations.forEach(station => {
            const card = createStationCard(station);
            stationList.appendChild(card);
        });
    }
    
    // Create station card DOM element
    function createStationCard(station) {
        const card = document.createElement('div');
        card.className = 'station-card';
        card.setAttribute('data-id', station.id);
        card.innerHTML = `
            <div class="station-icon">
                <i class="fas fa-location-dot"></i>
            </div>
            <div class="station-details">
                <h3>${escapeHtml(station.name)}</h3>
                <p class="distance"><i class="fas fa-route"></i> ${station.distance} from your location</p>
                <button class="call-btn" data-phone="${station.phone}" data-name="${station.name}">
                    <i class="fas fa-phone"></i> ${station.phone}
                </button>
            </div>
        `;
        
        const callBtn = card.querySelector('.call-btn');
        callBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            showEmergencyModal(station.phone, station.name);
        });
        
        card.addEventListener('click', () => {
            showStationInfo(station);
        });
        
        return card;
    }
    
    // Filter stations based on search
    function filterStations() {
        const searchTerm = searchInput?.value.toLowerCase() || '';
        if (!searchTerm) return [...currentStations];
        
        return currentStations.filter(station => 
            station.name.toLowerCase().includes(searchTerm) ||
            station.address.toLowerCase().includes(searchTerm)
        );
    }
    
    // Load more stations
    function loadMoreStations() {
        displayedCount += 3;
        renderStations();
        showToast(`Loaded ${displayedCount} stations`, 'info');
    }
    
    // Show emergency modal
    function showEmergencyModal(phone, name) {
        if (!emergencyModal) return;
        
        const modalContent = emergencyModal.querySelector('.modal-content');
        if (modalContent) {
            const title = modalContent.querySelector('h2');
            if (title) title.textContent = 'Emergency Call Confirmation';
            const desc = modalContent.querySelector('p');
            if (desc) desc.innerHTML = `You are about to call <strong>${name || 'emergency services'}</strong> at ${phone}. This call will be connected to the nearest response center.`;
        }
        
        window.pendingCall = phone;
        emergencyModal.classList.add('show');
    }
    
    // Make emergency call
    function makeEmergencyCall() {
        const phone = window.pendingCall || '999';
        showToast(`Connecting to ${phone}...`, 'success');
        setTimeout(() => {
            window.location.href = `tel:${phone}`;
        }, 500);
        emergencyModal?.classList.remove('show');
    }
    
    // Show station info (mock)
    function showStationInfo(station) {
        showToast(`${station.name} - ${station.address} | Hours: 24/7`, 'info');
    }
    
    // Draw map
    function drawMap() {
        const mapContainer = document.getElementById('mapContainer');
        const canvas = document.getElementById('liveMapCanvas');
        const loadingDiv = document.getElementById('mapLoading');
        
        if (!mapContainer || !canvas) return;
        
        // Show canvas, hide loading
        if (loadingDiv) loadingDiv.style.display = 'none';
        canvas.style.display = 'block';
        
        const rect = mapContainer.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Draw background map style
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid lines
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < canvas.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
        
        // Draw user location
        const userX = canvas.width / 2;
        const userY = canvas.height / 2;
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(userX, userY, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(userX, userY, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw stations
        const stations = currentStations;
        const radius = Math.min(canvas.width, canvas.height) * 0.35;
        
        stations.forEach((station, index) => {
            const angle = (index / stations.length) * 2 * Math.PI;
            const x = userX + radius * Math.cos(angle);
            const y = userY + radius * Math.sin(angle);
            
            // Draw station marker
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px "Plus Jakarta Sans"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('P', x, y);
            
            // Draw label
            ctx.fillStyle = '#1e293b';
            ctx.font = '10px "Plus Jakarta Sans"';
            ctx.fillText(station.name.substring(0, 10), x, y - 15);
            
            // Draw connection line
            ctx.beginPath();
            ctx.moveTo(userX, userY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        });
        
        // Draw radar effect
        let angle = 0;
        function animateRadar() {
            if (!ctx || !canvas) return;
            ctx.globalCompositeOperation = 'destination-over';
            ctx.beginPath();
            ctx.moveTo(userX, userY);
            const endX = userX + 60 * Math.cos(angle);
            const endY = userY + 60 * Math.sin(angle);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = '#00cfe8';
            ctx.lineWidth = 2;
            ctx.stroke();
            angle += 0.05;
            requestAnimationFrame(animateRadar);
        }
        // animateRadar();
    }
    
    // Find user location
    function findMyLocation() {
        showToast('Getting your location...', 'info');
        
        if (!navigator.geolocation) {
            showToast('Geolocation not supported', 'error');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                showToast('Location updated!', 'success');
                drawMap();
                updateStationsDistance();
            },
            (error) => {
                showToast('Unable to get location', 'error');
                console.error(error);
            }
        );
    }
    
    // Update stations distance based on user location
    function updateStationsDistance() {
        currentStations = currentStations.map(station => {
            // Simulate distance calculation
            const randomDist = (Math.random() * 8 + 1).toFixed(1);
            return { ...station, distance: `${randomDist} km` };
        });
        renderStations();
    }
    
    // Show toast notification
    function showToast(message, type = 'info') {
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = 'toast';
        if (type === 'success') toast.classList.add('success');
        if (type === 'error') toast.classList.add('error');
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }
    
    // Escape HTML
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    
    // Initialize map
    function initMap() {
        const canvas = document.getElementById('liveMapCanvas');
        const container = document.getElementById('mapContainer');
        
        if (canvas && container) {
            const resizeObserver = new ResizeObserver(() => {
                drawMap();
            });
            resizeObserver.observe(container);
            drawMap();
        }
    }
    
    // Event Listeners
    searchInput?.addEventListener('input', () => {
        displayedCount = 4;
        renderStations();
    });
    
    if (loadMoreBtn) {
        const btn = loadMoreBtn.querySelector('.btn-load-more');
        btn?.addEventListener('click', loadMoreStations);
    }
    
    sosDialBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        showEmergencyModal('999', 'Emergency Services');
    });
    
    refreshMapBtn?.addEventListener('click', findMyLocation);
    
    // Modal listeners
    confirmEmergencyBtn?.addEventListener('click', makeEmergencyCall);
    cancelEmergencyBtn?.addEventListener('click', () => {
        emergencyModal?.classList.remove('show');
    });
    
    emergencyModal?.addEventListener('click', (e) => {
        if (e.target === emergencyModal) {
            emergencyModal.classList.remove('show');
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && emergencyModal?.classList.contains('show')) {
            emergencyModal.classList.remove('show');
        }
    });
    
    // Update response time animation
    updateResponseTime();
    
    // Initialize everything
    renderStations();
    initMap();
    
    // Auto-refresh map every 30 seconds
    setInterval(() => {
        drawMap();
        const lastUpdatedSpan = document.getElementById('lastUpdated');
        if (lastUpdatedSpan) {
            const now = new Date();
            lastUpdatedSpan.textContent = `Updated ${now.toLocaleTimeString()}`;
        }
    }, 30000);
    
    console.log('Emergency Call page loaded successfully!');
});