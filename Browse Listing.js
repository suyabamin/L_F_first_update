// ========== DATASET (mock enriched items with professional Icons and interaction) ==========
let itemsData = [];

const listingsGrid = document.getElementById("listingsGrid");
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearSearchBtn");
let activeTypeFilter = "all"; // all, lost, found

// Helper: show toast message
function showMessage(msg, duration = 1800) {
  const toast = document.getElementById("toastMsg");
  toast.textContent = msg || "✨ Filter updated";
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
  str = String(str || "");
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function getCategoryIcon(category) {
  const key = String(category || "").toLowerCase();
  if (key.includes("elect")) return "fa-solid fa-mobile-screen";
  if (key.includes("pet")) return "fa-solid fa-paw";
  if (key.includes("document")) return "fa-solid fa-file-lines";
  if (key.includes("bag")) return "fa-solid fa-bag-shopping";
  if (key.includes("key")) return "fa-solid fa-key";
  if (key.includes("jewel")) return "fa-regular fa-gem";
  return "fa-regular fa-note-sticky";
}

async function loadItemsFromDatabase() {
  try {
    if (window.LF) {
      itemsData = await LF.fetchItems();
    } else {
      const res = await fetch("backend-php/browse_listing.php", {
        headers: { Accept: "application/json" }
      });
      itemsData = await res.json();
    }
    syncUrlFilter();
    renderCards();
  } catch {
    showMessage("Could not load items. Run npm start in project folder.", 2500);
  }
}

function syncUrlFilter() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  if (type === "lost" || type === "found") {
    activeTypeFilter = type;
    document.querySelectorAll(".filter-chip[data-filter]").forEach(c => c.classList.remove("active-filter"));
    const activeChip = document.querySelector(`.filter-chip[data-filter="${type}"]`);
    if (activeChip) activeChip.classList.add("active-filter");
  }
}

// render cards with dynamic href references
function renderCards() {
  let filtered = [...itemsData];
  
  // filter by type (lost/found)
  if (activeTypeFilter !== "all") {
    filtered = filtered.filter(item => (item.type || item.item_type) === activeTypeFilter);
  }
  
  // search by title / category / description
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (searchTerm !== "") {
    filtered = filtered.filter(item => 
      String(item.title || "").toLowerCase().includes(searchTerm) || 
      String(item.category || "").toLowerCase().includes(searchTerm) ||
      String(item.description || "").toLowerCase().includes(searchTerm) ||
      String(item.location_name || item.location || "").toLowerCase().includes(searchTerm)
    );
  }
  
  // if no results -> elegant empty message
  if (filtered.length === 0) {
    listingsGrid.innerHTML = `
      <div style="grid-column:1/-1; background:#ffffffcc; border-radius: 2rem; padding: 3rem; text-align:center; backdrop-filter:blur(4px);">
        <i class="fa-regular fa-face-frown" style="font-size: 3rem; color:#88a9c4;"></i>
        <h3 style="margin-top: 1rem;">No matching items</h3>
        <p style="color:#4a627a;">Try adjusting filters or search keywords</p>
        <button class="btn" id="resetAllFiltersBtn" style="margin-top:1rem;"><i class="fa-regular fa-arrow-rotate-left"></i> Reset filters</button>
      </div>
    `;
    const resetBtn = document.getElementById("resetAllFiltersBtn");
    if (resetBtn) resetBtn.addEventListener("click", resetAllFilters);
    return;
  }
  
  // generate card html
  listingsGrid.innerHTML = filtered.map(item => {
    // dynamic status pill class
    const itemType = item.type || item.item_type;
    const location = item.location || item.location_name || "";
    const typePillClass = itemType === "lost" ? "lost" : "found";
    const typeLabel = itemType === "lost" ? "Lost" : "Found";
    
    // action buttons with appropriate links
    const detailsLink = `Post Details.html?id=${item.id}`;
    let secondaryAction = "";
    if (itemType === "lost") {
      secondaryAction = `<a class="btn" href="Claim Item.html?item_id=${item.id}"><i class="fa-regular fa-message"></i> Claim</a>`;
    } else {
      secondaryAction = `<a class="btn" href="Chat.html?item_id=${item.id}&receiver_id=${item.user_id || 1}"><i class="fa-regular fa-comments"></i> Chat</a>`;
    }
    
    // extra icon based on category
    const categoryIcon = item.icon || getCategoryIcon(item.category);
    
    return `
      <article class="card" data-id="${item.id}" style="animation-delay: ${Math.random() * 0.1}s">
        <div class="meta">
          <span class="pill ${typePillClass}"><i class="fa-regular ${itemType === 'lost' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i> ${typeLabel}</span>
          <span class="pill"><i class="${categoryIcon}" style="margin-right: 4px;"></i> ${item.category}</span>
        </div>
        <h2><i class="${categoryIcon}" style="font-size: 1.1rem; margin-right: 6px; color:#2c7da0;"></i> ${escapeHtml(item.title)}</h2>
        <p>${escapeHtml(item.description)}</p>
        <p><i class="fa-solid fa-location-dot"></i> ${escapeHtml(location)}</p>
        <div class="card-actions">
          <a class="btn primary" href="${detailsLink}"><i class="fa-regular fa-eye"></i> Item Details</a>
          ${secondaryAction}
          <a class="btn" href="Map View.html?item=${item.id}"><i class="fa-solid fa-location-dot"></i> Map View</a>
        </div>
      </article>
    `;
  }).join('');
}

// filter chips event listeners
function initFilters() {
  const chips = document.querySelectorAll(".filter-chip");
  chips.forEach(chip => {
    chip.addEventListener("click", (e) => {
      const filterVal = chip.getAttribute("data-filter");
      if (filterVal === "all") activeTypeFilter = "all";
      else if (filterVal === "lost") activeTypeFilter = "lost";
      else if (filterVal === "found") activeTypeFilter = "found";
      
      // update active class
      chips.forEach(c => c.classList.remove("active-filter"));
      chip.classList.add("active-filter");
      
      renderCards();
      showMessage(`Showing ${activeTypeFilter === "all" ? "all items" : activeTypeFilter + " items"}`);
    });
  });
}

function resetAllFilters() {
  activeTypeFilter = "all";
  searchInput.value = "";
  const allChip = document.querySelector('.filter-chip[data-filter="all"]');
  if (allChip) {
    document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active-filter"));
    allChip.classList.add("active-filter");
  }
  renderCards();
  showMessage("All filters reset", 1500);
}

// search with debounce
let debounceTimer;
function onSearchInput() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    renderCards();
    showMessage("Search results updated", 1200);
  }, 280);
}

// clear search
function clearSearch() {
  searchInput.value = "";
  renderCards();
  showMessage("Search cleared", 1000);
}

// attach event listeners after loading
document.addEventListener("DOMContentLoaded", () => {
  loadItemsFromDatabase();
  initFilters();
  
  searchInput.addEventListener("input", onSearchInput);
  if (clearBtn) clearBtn.addEventListener("click", clearSearch);
  
  // advanced search button demo toast
  const searchTrigger = document.getElementById("searchTriggerBtn");
  if (searchTrigger) {
    searchTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      showMessage("🔍 Navigate to advanced search — redirecting...", 1700);
      setTimeout(() => {
        window.location.href = "Search Result.html";
      }, 300);
    });
  }
  
  // post item button smooth feel
  const postItemBtn = document.querySelector(".top-actions .btn.primary");
  if (postItemBtn) {
    postItemBtn.addEventListener("click", (e) => {
      showMessage("📝 Create new post — redirecting", 1000);
    });
  }
});
