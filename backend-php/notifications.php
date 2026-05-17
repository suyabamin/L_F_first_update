<?php
require __DIR__ . '/config.php';

header('Content-Type: application/json');

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Please login first.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, title, body, link_url, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 50');
$stmt->execute([$_SESSION['user_id']]);

echo json_encode([
    'success' => true,
    'notifications' => array_map(static fn ($row) => [
        'id' => (int) $row['id'],
        'title' => $row['title'],
        'description' => $row['body'],
        'type' => 'system',
        'actionLink' => $row['link_url'] ?: '#',
        'actionText' => 'Open',
        'read' => (bool) $row['is_read'],
        'createdAt' => $row['created_at'],
    ], $stmt->fetchAll()),
]);
