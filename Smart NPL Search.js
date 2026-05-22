// Mock Database of Items for NLP Search
const itemsDatabase = [
    { id: 1, title: "Lost Wallet - Brown Leather", description: "Brown leather wallet lost near the campus coffee shop. Contains ID and cards.", category: "lost", location: "Campus Coffee Shop", keywords: ["wallet", "brown", "leather", "lost", "campus", "coffee"] },
    { id: 2, title: "Found iPhone 13", description: "iPhone 13 found on the bus route 45. Contact to claim.", category: "found", location: "Bus Route 45", keywords: ["iphone", "13", "found", "bus", "phone", "apple"] },
    { id: 3, title: "Missing Orange Cat", description: "Orange tabby cat named Mango missing from Block C. Very friendly.", category: "lost", location: "Block C", keywords: ["cat", "orange", "tabby", "mango", "missing", "pet"] },
    { id: 4, title: "Found Black Backpack", description: "Black North Face backpack found in the library, 3rd floor.", category: "found", location: "Library, 3rd Floor", keywords: ["backpack", "black", "north face", "found", "library"] },
    { id: 5, title: "Lost Samsung Galaxy S23", description: "Samsung Galaxy S23 Ultra lost near the parking lot. Reward offered.", category: "lost", location: "Parking Lot", keywords: ["samsung", "galaxy", "s23", "lost", "parking", "phone"] },
    { id: 6, title: "Found AirPods Pro", description: "White AirPods Pro found at the gym. Describe case to claim.", category: "found", location: "University Gym", keywords: ["airpods", "pro", "white", "found", "gym", "apple"] },
    { id: 7, title: "Lost Car Keys", description: "Set of car keys with a silver keychain lost near the cafeteria.", category: "lost", location: "Cafeteria", keywords: ["keys", "car", "keychain", "silver", "lost", "cafeteria"] },
    { id: 8, title: "Found Student ID", description: "Student ID card found near the admin building.", category: "found", location: "Admin Building", keywords: ["student", "id", "card", "found", "admin"] }
];

// DOM Elements
const searchInput = document.getElementById('smartQuery');
const searchForm = document.getElementById('searchForm');
const voiceBtn = document.getElementById('voiceBtn');
const clearInputBtn = document.getElementById('clearInputBtn');
const resultsSection = document.getElementById('resultsSection');
const resultsGrid = document.getElementById('resultsGrid');
const resultsCount = document.getElementById('resultsCount');
const aiStatusText = document.getElementById('aiStatusText');
const voiceStatus = document.getElementById('voiceStatus');
const toastContainer = document.getElementById('toastContainer');

// NLP Processing Variables
let isListening = false;
let recognition = null;

// Initialize Speech Recognition
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
            isListening = true;
            voiceBtn.classList.add('listening');
            voiceStatus.style.display = 'flex';
            aiStatusText.textContent = 'Listening...';
            showToast('🎤 Listening... Speak now', 'info');
        };
        
        recognition.onend = () => {
            isListening = false;
            voiceBtn.classList.remove('listening');
            setTimeout(() => {
                voiceStatus.style.display = 'none';
                aiStatusText.textContent = 'AI search ready';
            }, 1000);
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript;
            showToast(`🎤 You said: "${transcript}"`, 'success');
            performSearch(transcript);
        };
        
        recognition.onerror = (event) => {
            showToast(`Voice error: ${event.error}`, 'error');
            voiceBtn.classList.remove('listening');
            voiceStatus.style.display = 'none';
            aiStatusText.textContent = 'AI search ready';
            isListening = false;
        };
    } else {
        showToast('Voice recognition not supported in this browser', 'error');
        voiceBtn.disabled = true;
        voiceBtn.style.opacity = '0.5';
    }
}

// Show Toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// NLP Text Processing (Keyword Extraction & Matching)
function extractKeywords(text) {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'my', 'your', 'his', 'her', 'our', 'their', 'i', 'you', 'he', 'she', 'it', 'we', 'they'];
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.includes(word));
    return [...new Set(words)];
}

function calculateRelevanceScore(item, keywords, query) {
    let score = 0;
    const textToSearch = `${item.title} ${item.description} ${item.location}`.toLowerCase();
    
    // Exact phrase match (highest)
    if (textToSearch.includes(query.toLowerCase())) {
        score += 50;
    }
    
    // Keyword matches
    for (const keyword of keywords) {
        if (item.keywords.some(k => k.includes(keyword) || keyword.includes(k))) {
            score += 20;
        }
        if (textToSearch.includes(keyword)) {
            score += 15;
        }
    }
    
    // Category match boost
    if (query.toLowerCase().includes('lost') && item.category === 'lost') score += 10;
    if (query.toLowerCase().includes('found') && item.category === 'found') score += 10;
    
    // Location match boost
    const locations = ['campus', 'library', 'bus', 'cafeteria', 'gym', 'parking'];
    for (const loc of locations) {
        if (query.toLowerCase().includes(loc) && item.location.toLowerCase().includes(loc)) {
            score += 25;
        }
    }
    
    return Math.min(score, 100);
}

async function performSearch(queryText = null) {
    const query = queryText || searchInput.value.trim();
    
    if (!query) {
        resultsSection.style.display = 'none';
        aiStatusText.textContent = 'Enter a search query';
        return;
    }
    
    aiStatusText.textContent = 'Analyzing query...';
    
    let sourceItems = itemsDatabase;
    if (window.LF) {
        try {
            const rows = await LF.fetchItems({ q: query });
            sourceItems = rows.map((item) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                category: item.item_type,
                location: item.location_name,
                keywords: `${item.title} ${item.description} ${item.category}`.toLowerCase().split(/\s+/)
            }));
        } catch {
            sourceItems = itemsDatabase;
        }
    }

    setTimeout(() => {
        const keywords = extractKeywords(query);
        const scoredItems = sourceItems.map(item => ({
            ...item,
            score: calculateRelevanceScore(item, keywords, query)
        }));
        
        const results = scoredItems
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score);
        
        displayResults(results, query);
        aiStatusText.textContent = results.length > 0 ? `Found ${results.length} matches` : 'No matches found';
    }, 300);
}

function displayResults(results, query) {
    if (results.length === 0) {
        resultsGrid.innerHTML = `
            <div class="empty-results" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-search-slash" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
                <h4>No matches found</h4>
                <p>Try using different keywords or check your spelling</p>
            </div>
        `;
        resultsCount.textContent = '0 results';
        resultsSection.style.display = 'block';
        return;
    }
    
    resultsCount.textContent = `${results.length} result${results.length !== 1 ? 's' : ''}`;
    
    resultsGrid.innerHTML = results.map((item, index) => `
        <div class="result-card" style="animation-delay: ${index * 0.05}s; cursor:pointer;" onclick="window.location.href='Post Details.html?id=${item.id}'">
            <span class="pill ${item.category}">${item.category === 'lost' ? 'Lost' : 'Found'}</span>
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.description)}</p>
            <motion class="card-footer">
                <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(item.location)}</span>
                <span class="match-score" style="color: var(--primary);">${item.score}% match</span>
            </div>
        </div>
    `).join('').replace(/<motion class="card-footer">/g, '<div class="card-footer">');
    
    resultsSection.style.display = 'block';
    showToast(`Found ${results.length} matching items`, 'success');
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Event Listeners
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    performSearch();
});

voiceBtn.addEventListener('click', () => {
    if (recognition && !isListening) {
        recognition.start();
    } else if (isListening) {
        recognition.stop();
    }
});

clearInputBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearInputBtn.style.display = 'none';
    resultsSection.style.display = 'none';
    aiStatusText.textContent = 'AI search ready';
    searchInput.focus();
});

searchInput.addEventListener('input', () => {
    clearInputBtn.style.display = searchInput.value.length > 0 ? 'block' : 'none';
    if (searchInput.value.length === 0) {
        resultsSection.style.display = 'none';
        aiStatusText.textContent = 'AI search ready';
    }
});

// Quick tag buttons
document.querySelectorAll('.quick-tags button').forEach(btn => {
    btn.addEventListener('click', () => {
        const query = btn.dataset.query;
        if (query) {
            searchInput.value = query;
            performSearch(query);
        }
    });
});

// Initialize
initSpeechRecognition();
searchInput.focus();

// Add typing animation effect
let typingTimeout;
searchInput.addEventListener('keyup', () => {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        if (searchInput.value.length > 2) {
            performSearch();
        }
    }, 500);
});