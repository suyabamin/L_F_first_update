// ========== DATASET (mock enriched items with professional Icons and interaction) ==========
const itemsData = [
  {
    id: 1,
    title: "Lost Wallet",
    description: "Brown leather wallet reported near central bus stop. Contains important cards and a family photo.",
    type: "lost",
    category: "Wallet & ID",
    icon: "fa-solid fa-wallet"
  },
  {
    id: 2,
    title: "Found iPhone 13",
    description: "Starlight iPhone 13 with floral case. Found at Dhanmondi Lake side. Owner must confirm lock screen.",
    type: "found",
    category: "Electronics",
    icon: "fa-solid fa-mobile-screen"
  },
  {
    id: 3,
    title: "Lost Cat",
    description: "White & orange tabby cat, very friendly, missing from Green Valley area since morning. Responds to 'Mango'.",
    type: "lost",
    category: "Pets",
    icon: "fa-solid fa-cat"
  },
  {
    id: 4,
    title: "Found Laptop Bag",
    description: "Black HP backpack containing notebooks and charger. Handed over to campus security.",
    type: "found",
    category: "Accessories",
    icon: "fa-solid fa-bag-shopping"
  },
  {
    id: 5,
    title: "Lost AirPods Pro",
    description: "Lost in the central library. White charging case with custom engraving 'A.M.'",
    type: "lost",
    category: "Electronics",
    icon: "fa-solid fa-headphones"
  },
  {
    id: 6,
    title: "Found Gold Ring",
    description: "Simple elegant gold ring found near fountain park. Inscription inside: 'Forever'. Claim with proof.",
    type: "found",
    category: "Jewelry",
    icon: "fa-regular fa-gem"
  }
];

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
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// render cards with dynamic href references
function renderCards() {
  let filtered = [...itemsData];
  
  // filter by type (lost/found)
  if (activeTypeFilter !== "all") {
    filtered = filtered.filter(item => item.type === activeTypeFilter);
  }
  
  // search by title / category / description
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (searchTerm !== "") {
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(searchTerm) || 
      item.category.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm)
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
    const typePillClass = item.type === "lost" ? "lost" : "found";
    const typeLabel = item.type === "lost" ? "Lost" : "Found";
    
    // action buttons with appropriate links
    const detailsLink = "../Post Details/index.html";
    let secondaryAction = "";
    if (item.type === "lost") {
      secondaryAction = `<a class="btn" href="../Claim Item/index.html"><i class="fa-regular fa-message"></i> Claim</a>`;
    } else {
      secondaryAction = `<a class="btn" href="../Chat/index.html"><i class="fa-regular fa-comments"></i> Chat</a>`;
    }
    
    // extra icon based on category
    const categoryIcon = item.icon || "fa-regular fa-note-sticky";
    
    return `
      <article class="card" data-id="${item.id}" style="animation-delay: ${Math.random() * 0.1}s">
        <div class="meta">
          <span class="pill ${typePillClass}"><i class="fa-regular ${item.type === 'lost' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i> ${typeLabel}</span>
          <span class="pill"><i class="${categoryIcon}" style="margin-right: 4px;"></i> ${item.category}</span>
        </div>
        <h2><i class="${categoryIcon}" style="font-size: 1.1rem; margin-right: 6px; color:#2c7da0;"></i> ${escapeHtml(item.title)}</h2>
        <p>${escapeHtml(item.description)}</p>
        <div class="card-actions">
          <a class="btn primary" href="${detailsLink}?id=${item.id}"><i class="fa-regular fa-eye"></i> Item Details</a>
          ${secondaryAction}
          <a class="btn" href="../Map View/index.html?item=${item.id}"><i class="fa-solid fa-location-dot"></i> Map View</a>
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
  renderCards();
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
        window.location.href = "../Search Results/index.html";
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