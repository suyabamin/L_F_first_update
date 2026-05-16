const listing = {
  title: localStorage.getItem("lf_latest_title") || "Found iPhone 13",
  category: "Electronics",
  status: "Found",
  location: "Dhanmondi, Dhaka",
  time: "3 hours ago",
  description: "A phone was found near the campus gate. The owner can confirm the lock screen and device details before claiming it.",
  slides: [
    '<i class="fas fa-mobile-screen-button"></i>',
    '<i class="fas fa-receipt"></i>',
    '<i class="fas fa-location-dot"></i>'
  ]
};

let slideIndex = 0;

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function renderListing() {
  setText("detailTitle", listing.title);
  setText("breadCategory", listing.category);
  setText("headLoc", listing.location);
  setText("headTime", listing.time);
  setText("detailDesc", listing.description);
  setText("statusChip", listing.status);
  setText("categoryChip", listing.category);
  setText("mapLocationText", listing.location);
  setText("sumStatus", listing.status);
  setText("sumCat", listing.category);
  setText("sumLoc", listing.location);

  const statusChip = document.getElementById("statusChip");
  statusChip?.classList.add(listing.status.toLowerCase() === "lost" ? "chip-lost" : "chip-found");

  const track = document.getElementById("carouselTrack");
  if (!track) return;
  track.innerHTML = listing.slides.map((slide) => `<div class="carousel-slide">${slide}</div>`).join("");
}

function slideCarousel(direction) {
  const track = document.getElementById("carouselTrack");
  if (!track) return;
  slideIndex = (slideIndex + direction + listing.slides.length) % listing.slides.length;
  track.style.transform = `translateX(-${slideIndex * 100}%)`;
}

function toggleFav() {
  document.querySelectorAll("#favBtnTop i, #favBtnSide i").forEach((icon) => {
    icon.classList.toggle("far");
    icon.classList.toggle("fas");
  });
}

function closeModal() {
  document.getElementById("modalOverlay")?.classList.remove("active");
}

function openModal(type) {
  const content = document.getElementById("modalContent");
  if (!content) return;
  content.innerHTML = `<h2>${type === "gd" ? "Claim support" : "Contact"}</h2><p>Please continue through Chat or Claim Item.</p>`;
  document.getElementById("modalOverlay")?.classList.add("active");
}

renderListing();
