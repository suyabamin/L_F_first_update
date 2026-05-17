<?php
require __DIR__ . '/config.php';

$type = clean_text($_GET['type'] ?? '');
$category = clean_text($_GET['category'] ?? '');
$q = clean_text($_GET['q'] ?? '');

$where = ["i.status <> 'removed'"];
$params = [];

if (in_array($type, ['lost', 'found'], true)) {
    $where[] = 'i.item_type = ?';
    $params[] = $type;
}

if ($category !== '') {
    $where[] = 'i.category = ?';
    $params[] = $category;
}

if ($q !== '') {
    $where[] = '(i.title LIKE ? OR i.description LIKE ? OR i.location_name LIKE ?)';
    $params[] = "%{$q}%";
    $params[] = "%{$q}%";
    $params[] = "%{$q}%";
}

$stmt = $pdo->prepare(
    "SELECT i.*, u.full_name,
     (SELECT image_path FROM item_images img WHERE img.item_id = i.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS image_path
     FROM items i
     JOIN users u ON u.id = i.user_id
     WHERE " . implode(' AND ', $where) . '
     ORDER BY i.created_at DESC'
);
$stmt->execute($params);
$items = $stmt->fetchAll();

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
  <title>Browse Listings | Lost & Found</title>
  <link rel="stylesheet" href="../Browse Listing.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
<div class="app-shell">
  <aside class="sidebar">
    <a class="brand" href="../Landing Page.html"><i class="fa-solid fa-map-location-dot"></i> Lost & Found</a>
    <nav class="nav-list">
      <a href="../DashBoard.html"><i class="fa-solid fa-gauge-high"></i> Dashboard</a>
      <a class="active" href="browse_listing_view.php"><i class="fa-solid fa-table-list"></i> Browse Listings</a>
      <a href="../Create Post.html"><i class="fa-solid fa-pen-to-square"></i> Post Item</a>
      <a href="../Map View.html"><i class="fa-solid fa-map"></i> Map View</a>
      <a href="../Profile Page.html"><i class="fa-solid fa-circle-user"></i> Profile</a>
    </nav>
  </aside>

  <main class="content">
    <header class="topline">
      <div>
        <p class="eyebrow">Database Listings</p>
        <h1>Browse Lost & Found Items</h1>
        <p>All posts below are loaded from MySQL.</p>
      </div>
      <a class="btn primary" href="../Create Post.html"><i class="fa-solid fa-plus"></i> Post Item</a>
    </header>

    <form class="filter-bar" method="get" action="browse_listing_view.php">
      <input type="text" name="q" value="<?= h($q) ?>" placeholder="Search title, description, location">
      <select name="type">
        <option value="">All Status</option>
        <option value="lost" <?= $type === 'lost' ? 'selected' : '' ?>>Lost</option>
        <option value="found" <?= $type === 'found' ? 'selected' : '' ?>>Found</option>
      </select>
      <input type="text" name="category" value="<?= h($category) ?>" placeholder="Category">
      <button class="btn primary" type="submit"><i class="fa-solid fa-search"></i> Search</button>
    </form>

    <section class="grid" id="listingsGrid">
      <?php if (!$items): ?>
        <div class="empty-state">
          <i class="fa-regular fa-face-frown"></i>
          <h2>No items found</h2>
          <p>Try another keyword or create the first post.</p>
        </div>
      <?php endif; ?>

      <?php foreach ($items as $item): ?>
        <article class="card">
          <div class="meta">
            <span class="pill <?= h($item['item_type']) ?>">
              <?= ucfirst(h($item['item_type'])) ?>
            </span>
            <span class="pill"><?= h($item['category']) ?></span>
          </div>
          <?php if ($item['image_path']): ?>
            <img class="listing-img" src="../<?= h($item['image_path']) ?>" alt="<?= h($item['title']) ?>">
          <?php endif; ?>
          <h2><?= h($item['title']) ?></h2>
          <p><?= h(strlen($item['description']) > 140 ? substr($item['description'], 0, 140) . '...' : $item['description']) ?></p>
          <p><i class="fa-solid fa-location-dot"></i> <?= h($item['location_name']) ?></p>
          <div class="card-actions">
            <a class="btn primary" href="post_details_view.php?id=<?= (int) $item['id'] ?>">
              <i class="fa-regular fa-eye"></i> Item Details
            </a>
            <a class="btn" href="../Chat.html?item_id=<?= (int) $item['id'] ?>&receiver_id=<?= (int) $item['user_id'] ?>">
              <i class="fa-regular fa-comments"></i> Chat
            </a>
            <a class="btn" href="../Claim Item.html?item_id=<?= (int) $item['id'] ?>">
              <i class="fa-solid fa-hand-holding-heart"></i> Claim
            </a>
          </div>
        </article>
      <?php endforeach; ?>
    </section>
  </main>
</div>
</body>
</html>
