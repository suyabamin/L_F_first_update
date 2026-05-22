<?php
require __DIR__ . '/config.php';

$userId = require_login();
$convId = (int) ($_GET['conversation_id'] ?? 0);
if ($convId < 1) {
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'conversation_id required']);
    exit;
}

$access = $pdo->prepare('SELECT id FROM conversations WHERE id = ? AND (owner_id = ? OR participant_id = ?) LIMIT 1');
$access->execute([$convId, $userId, $userId]);
if (!$access->fetch()) {
    header('Content-Type: application/json');
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied.']);
    exit;
}

$stmt = $pdo->prepare(
    'SELECT m.id, m.sender_id, m.message_text, m.is_read, m.created_at, u.full_name
     FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.conversation_id = ? ORDER BY m.created_at ASC'
);
$stmt->execute([$convId]);
$pdo->prepare('UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id <> ?')->execute([$convId, $userId]);

header('Content-Type: application/json');
echo json_encode(['success' => true, 'messages' => $stmt->fetchAll(), 'currentUserId' => $userId]);
