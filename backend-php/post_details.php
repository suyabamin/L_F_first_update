<?php
require __DIR__ . '/config.php';

$itemId = (int) ($_GET['id'] ?? 0);

$stmt = $pdo->prepare(
    'SELECT i.*, u.full_name, u.email
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

$images = $pdo->prepare('SELECT image_path FROM item_images WHERE item_id = ? ORDER BY is_primary DESC, id ASC');
$images->execute([$itemId]);
$item['images'] = $images->fetchAll();

header('Content-Type: application/json');
echo json_encode($item);

