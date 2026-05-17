<?php
require __DIR__ . '/config.php';

$itemId = (int) ($_GET['id'] ?? 0);

$stmt = $pdo->prepare(
    'SELECT i.*, u.full_name, u.id AS owner_id
     FROM items i
     JOIN users u ON u.id = i.user_id
     WHERE i.id = ? AND i.status <> "removed"
     LIMIT 1'
);
$stmt->execute([$itemId]);
$item = $stmt->fetch();

if (!$item) {
    http_response_code(404);
    exit('Item not found.');
}

$pdo->prepare('UPDATE items SET view_count = view_count + 1 WHERE id = ?')->execute([$itemId]);

$imageStmt = $pdo->prepare('SELECT image_path FROM item_images WHERE item_id = ? ORDER BY is_primary DESC, id ASC');
$imageStmt->execute([$itemId]);
$images = $imageStmt->fetchAll();

$oppositeType = $item['item_type'] === 'lost' ? 'found' : 'lost';
$keyword = '%' . strtok($item['title'], ' ') . '%';
$matchStmt = $pdo->prepare(
    "SELECT id, title, item_type, category, location_name,
     ((category = ?) * 40 + (location_name LIKE ?) * 30 + ((title LIKE ? OR description LIKE ?) * 30)) AS match_score
     FROM items
     WHERE item_type = ? AND status = 'open' AND id <> ?
     ORDER BY match_score DESC, created_at DESC
     LIMIT 5"
);
$matchStmt->execute([$item['category'], '%' . $item['location_name'] . '%', $keyword, $keyword, $oppositeType, $itemId]);
$matches = $matchStmt->fetchAll();

function h(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= h($item['title']) ?> | Lost & Found</title>
  <link rel="stylesheet" href="../Post Details.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <header class="top-nav">
    <div class="nav-container">
      <a href="browse_listing_view.php" class="brand">
        <div class="logo-icon"><i class="fas fa-search-location"></i></div>
        <span>Lost<span class="brand-highlight">Found</span></span>
      </a>
      <div class="header-actions">
        <a class="post-btn-header" href="../Create Post.html"><i class="fas fa-plus"></i> Post Listing</a>
      </div>
    </div>
  </header>

  <main>
    <section class="listing-hero">
      <div class="breadcrumb">
        <a href="browse_listing_view.php">Browse</a> <i class="fas fa-chevron-right"></i>
        <span>Listing Details</span>
      </div>
      <div class="title-container">
        <div class="title-main">
          <div class="status-badge-hero"><?= ucfirst(h($item['item_type'])) ?></div>
          <h1 class="detail-title"><?= h($item['title']) ?></h1>
          <div class="hero-meta">
            <span><i class="fas fa-map-marker-alt"></i> <?= h($item['location_name']) ?></span>
            <span><i class="fas fa-eye"></i> <?= (int) $item['view_count'] + 1 ?> views</span>
          </div>
        </div>
      </div>
    </section>

    <div class="detail-wrapper">
      <div class="detail-left">
        <div class="carousel-container">
          <div class="carousel">
            <div class="carousel-track">
              <?php if ($images): ?>
                <?php foreach ($images as $image): ?>
                  <img src="../<?= h($image['image_path']) ?>" alt="<?= h($item['title']) ?>">
                <?php endforeach; ?>
              <?php else: ?>
                <div class="map-placeholder">
                  <div class="map-content"><i class="fas fa-image"></i><p>No image uploaded</p></div>
                </div>
              <?php endif; ?>
            </div>
          </div>
        </div>

        <div class="card info-card">
          <h2 class="section-title"><i class="fas fa-align-left"></i> Description</h2>
          <p class="detail-desc"><?= nl2br(h($item['description'])) ?></p>
          <div class="meta-chips">
            <div class="chip"><?= ucfirst(h($item['status'])) ?></div>
            <div class="chip chip-neutral"><?= h($item['category']) ?></div>
            <div class="chip chip-location"><i class="fas fa-map-pin"></i> <?= h($item['location_name']) ?></div>
          </div>
        </div>

        <div class="card info-card">
          <h2 class="section-title"><i class="fas fa-link"></i> Suggested Matches</h2>
          <?php if (!$matches): ?>
            <p>No suggested matches yet.</p>
          <?php endif; ?>
          <?php foreach ($matches as $match): ?>
            <p>
              <a href="post_details_view.php?id=<?= (int) $match['id'] ?>"><?= h($match['title']) ?></a>
              - <?= h($match['location_name']) ?> - Score <?= (int) $match['match_score'] ?>
            </p>
          <?php endforeach; ?>
        </div>
      </div>

      <div class="detail-right">
        <div class="card sticky-card action-card">
          <h2 class="section-title"><i class="fas fa-bolt"></i> Quick Actions</h2>
          <a class="action-btn btn-primary" href="../Chat.html?item_id=<?= (int) $item['id'] ?>&receiver_id=<?= (int) $item['owner_id'] ?>">
            <i class="fas fa-comments"></i> Chat with Owner
          </a>
          <a class="action-btn btn-secondary" href="../Claim Item.html?item_id=<?= (int) $item['id'] ?>">
            <i class="fas fa-hand-holding-heart"></i> Claim Item
          </a>
        </div>

        <div class="card summary-card">
          <h2 class="section-title"><i class="fas fa-info-circle"></i> Item Summary</h2>
          <div class="summary-row"><span>Reference ID</span><strong>#LF-<?= (int) $item['id'] ?></strong></div>
          <div class="summary-row"><span>Posted By</span><strong><?= h($item['full_name']) ?></strong></div>
          <div class="summary-row"><span>Posted Date</span><strong><?= h($item['created_at']) ?></strong></div>
          <div class="summary-row"><span>Contact</span><strong><?= h($item['public_contact'] ?: 'Use chat') ?></strong></div>
        </div>
      </div>
    </div>
  </main>
</body>
</html>

