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

$sql = "SELECT i.*, u.full_name,
        (SELECT image_path FROM item_images img WHERE img.item_id = i.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS image_path
        FROM items i
        JOIN users u ON u.id = i.user_id
        WHERE " . implode(' AND ', $where) . '
        ORDER BY i.created_at DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);

header('Content-Type: application/json');
echo json_encode($stmt->fetchAll());

