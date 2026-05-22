<?php
require __DIR__ . '/config.php';

$userId = require_login();
$payload = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$itemId = (int) ($payload['item_id'] ?? 0);
if ($itemId < 1) {
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'item_id required']);
    exit;
}

$exists = $pdo->prepare('SELECT 1 FROM favorites WHERE user_id = ? AND item_id = ?');
$exists->execute([$userId, $itemId]);
if ($exists->fetch()) {
    $pdo->prepare('DELETE FROM favorites WHERE user_id = ? AND item_id = ?')->execute([$userId, $itemId]);
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'favorited' => false]);
    exit;
}

$pdo->prepare('INSERT INTO favorites (user_id, item_id) VALUES (?, ?)')->execute([$userId, $itemId]);
header('Content-Type: application/json');
echo json_encode(['success' => true, 'favorited' => true]);
