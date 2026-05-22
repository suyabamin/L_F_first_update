<?php
require __DIR__ . '/config.php';

$id = (int) ($_GET['id'] ?? 0);
if ($id < 1) {
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Item id required.']);
    exit;
}

$stmt = $pdo->prepare(
    'SELECT i.*, u.full_name FROM items i JOIN users u ON u.id = i.user_id WHERE i.id = ? AND i.status <> "removed" LIMIT 1'
);
$stmt->execute([$id]);
$item = $stmt->fetch();
if (!$item) {
    header('Content-Type: application/json');
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Item not found.']);
    exit;
}

$pdo->prepare('UPDATE items SET view_count = view_count + 1 WHERE id = ?')->execute([$id]);
$images = $pdo->prepare('SELECT image_path FROM item_images WHERE item_id = ? ORDER BY is_primary DESC, id ASC');
$images->execute([$id]);

$opposite = $item['item_type'] === 'lost' ? 'found' : 'lost';
$keyword = '%' . explode(' ', $item['title'])[0] . '%';
$matchStmt = $pdo->prepare(
    'SELECT i.id, i.title, i.description, i.item_type, i.category, i.location_name, i.created_at,
      ((i.category = ?) * 40 + (i.location_name LIKE ?) * 30 + ((i.title LIKE ? OR i.description LIKE ?) * 30)) AS match_score
     FROM items i WHERE i.item_type = ? AND i.status = "open" AND i.id <> ? ORDER BY match_score DESC LIMIT 10'
);
$matchStmt->execute([$item['category'], '%' . $item['location_name'] . '%', $keyword, $keyword, $opposite, $id]);

header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'item' => array_merge($item, [
        'images' => array_column($images->fetchAll(), 'image_path'),
        'matches' => $matchStmt->fetchAll(),
        'postedBy' => $item['full_name'],
    ]),
]);
