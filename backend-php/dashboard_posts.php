<?php
require __DIR__ . '/config.php';

$rows = $pdo->query(
    'SELECT i.id, i.title, i.item_type, i.category, i.created_at FROM items i WHERE i.status <> "removed" ORDER BY i.created_at DESC LIMIT 24'
)->fetchAll();

header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'posts' => array_map(static fn ($row) => [
        'id' => (int) $row['id'],
        'status' => $row['item_type'],
        'title' => $row['title'],
        'category' => $row['category'],
        'time' => $row['created_at'],
    ], $rows),
]);
