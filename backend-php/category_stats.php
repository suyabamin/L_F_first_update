<?php
require __DIR__ . '/config.php';

header('Content-Type: application/json');

$stmt = $pdo->query("SELECT category, COUNT(*) AS total FROM items WHERE status <> 'removed' GROUP BY category");
$aliases = [
    'electronics' => 'electronics',
    'pet' => 'pets',
    'pets' => 'pets',
    'bag' => 'bag',
    'key' => 'key',
    'paper' => 'paper',
    'documents' => 'paper',
    'jewelry' => 'jewelry',
];
$counts = [
    'electronics' => 0,
    'pets' => 0,
    'bag' => 0,
    'key' => 0,
    'paper' => 0,
    'jewelry' => 0,
];

foreach ($stmt->fetchAll() as $row) {
    $category = strtolower((string) $row['category']);
    $key = $aliases[$category] ?? $category;
    if (array_key_exists($key, $counts)) {
        $counts[$key] += (int) $row['total'];
    }
}

echo json_encode(['success' => true, 'counts' => $counts]);
