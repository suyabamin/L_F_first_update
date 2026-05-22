<?php
require __DIR__ . '/../config.php';

$userId = require_login();
$stmt = $pdo->prepare('SELECT role FROM users WHERE id = ? LIMIT 1');
$stmt->execute([$userId]);
$user = $stmt->fetch();
if (!$user || $user['role'] !== 'admin') {
    header('Content-Type: application/json');
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Admin access required.']);
    exit;
}

header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'stats' => [
        'users' => (int) $pdo->query('SELECT COUNT(*) FROM users WHERE status = "active"')->fetchColumn(),
        'items' => (int) $pdo->query('SELECT COUNT(*) FROM items WHERE status <> "removed"')->fetchColumn(),
        'open_reports' => (int) $pdo->query('SELECT COUNT(*) FROM reports WHERE status = "open"')->fetchColumn(),
        'returned_items' => (int) $pdo->query('SELECT COUNT(*) FROM items WHERE status = "returned"')->fetchColumn(),
        'pending_claims' => (int) $pdo->query('SELECT COUNT(*) FROM claims WHERE status = "pending"')->fetchColumn(),
    ],
]);
