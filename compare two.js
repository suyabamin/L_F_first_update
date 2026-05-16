// Dynamic Particle Background
class ParticleField {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.init();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.initParticles(80);
  }

  initParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.3 + 0.1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.2,
      });
    }
  }

  init() {
    this.resize();
  }

  animate() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(100, 70, 200, ${p.alpha})`;
      this.ctx.fill();
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;
    });
    requestAnimationFrame(() => this.animate());
  }
}

// Toast Notification
function showToast(message, duration = 2300) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas fa-robot"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, duration);
}

// Smart Compare + UI interactions
document.addEventListener('DOMContentLoaded', () => {
  // Particle background
  new ParticleField('particleCanvas');

  // Update dynamic match score animation
  const scoreRing = document.querySelector('.progress-ring__circle');
  const scoreText = document.getElementById('matchScore');
  let currentScore = 94;

  function updateMatchScore(newScore) {
    if (newScore === currentScore) return;
    currentScore = newScore;
    scoreText.innerText = `${currentScore}%`;
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (currentScore / 100) * circumference;
    if (scoreRing) {
      scoreRing.style.strokeDasharray = `${circumference}`;
      scoreRing.style.strokeDashoffset = offset;
    }
    // subtle animation on text
    scoreText.style.transform = 'scale(1.1)';
    setTimeout(() => (scoreText.style.transform = ''), 200);
  }

  // Merge intelligence simulation + location conflict resolution
  const mergeBtn = document.getElementById('mergeBtn');
  const discardBtn = document.getElementById('discardBtn');
  const footerMessageSpan = document.getElementById('footerMessage');
  const backBtn = document.getElementById('backBtn');

  // Helper to update UI after "merge"
  function resolveMerge() {
    // change conflict rows to unified
    const conflictRows = document.querySelectorAll('.attr-row.conflict');
    conflictRows.forEach(row => {
      row.classList.remove('conflict');
      row.classList.add('match');
      const conflictIcon = row.querySelector('.conflict-icon');
      if (conflictIcon) {
        conflictIcon.classList.remove('fa-exclamation-triangle', 'conflict-icon');
        conflictIcon.classList.add('fa-check-circle', 'match-icon');
      }
      // update location text to unified
      if (row.getAttribute('data-attr') === 'location') {
        const leftVal = document.querySelector('.item-alpha .attr-row.conflict .attr-val');
        const rightVal = document.querySelector('.item-beta .attr-row.conflict .attr-val');
        if (leftVal && rightVal) {
          const unifiedLocation = 'Airport Terminal (Verified Zone)';
          leftVal.innerText = unifiedLocation;
          rightVal.innerText = unifiedLocation;
        }
      }
    });
    // update status dots and match percentage
    document.querySelectorAll('.status-dot.success, .status-dot.warning').forEach(dot => {
      dot.classList.remove('warning');
      dot.classList.add('success');
    });
    updateMatchScore(100);
    footerMessageSpan.innerHTML = `<i class="fas fa-check-circle"></i> Merge successful! Records unified — No conflicts remaining.`;
    showToast('🧠 Intelligence merged: records unified successfully', 2500);
    // disable merge button after merge (optional)
    mergeBtn.disabled = true;
    mergeBtn.style.opacity = '0.6';
    mergeBtn.style.cursor = 'default';
  }

  function discardMatch() {
    showToast('❌ Match discarded. Candidate flagged as separate record.', 2000);
    footerMessageSpan.innerHTML = `<i class="fas fa-times-circle"></i> Match discarded. Items kept separate in database.`;
    // visual feedback remove highlight conflict but keep as separate? we reset style to neutral with subtle effect
    const conflictRows = document.querySelectorAll('.attr-row.conflict');
    conflictRows.forEach(row => {
      row.classList.remove('conflict');
      row.style.background = 'rgba(100, 116, 139, 0.05)';
    });
    updateMatchScore(34);
    const statusDots = document.querySelectorAll('.status-dot.warning');
    statusDots.forEach(d => (d.style.background = '#ef4444'));
  }

  mergeBtn.addEventListener('click', resolveMerge);
  discardBtn.addEventListener('click', discardMatch);
  backBtn.addEventListener('click', () => {
    window.history.back();
  });

  // add animated entrance for match ring
  setTimeout(() => {
    updateMatchScore(94);
  }, 100);

  // interactive sync hub tooltip
  const hub = document.querySelector('.hub-icon');
  if (hub) {
    hub.addEventListener('mouseenter', () => {
      showToast('⚡ AI comparing semantic fields & metadata', 1200);
    });
  }
});