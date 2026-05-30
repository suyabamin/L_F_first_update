<?php
require __DIR__ . '/config.php';

$userId = require_login();
$convId = (int) ($_GET['conversation_id'] ?? 0);
if ($convId < 1) {
    send_error('conversation_id required', 400, 'CONV_ID_REQUIRED');
}

$access = $pdo->prepare('SELECT id FROM conversations WHERE id = ? AND (owner_id = ? OR participant_id = ?) LIMIT 1');
$access->execute([$convId, $userId, $userId]);
if (!$access->fetch()) {
    send_error('Access denied.', 403, 'ACCESS_DENIED');
}

$stmt = $pdo->prepare(
    'SELECT m.id, m.sender_id, m.message_text, m.is_read, m.created_at, u.full_name
     FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.conversation_id = ? ORDER BY m.created_at ASC'
);
$stmt->execute([$convId]);
$pdo->prepare('UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id <> ?')->execute([$convId, $userId]);

send_json([
    'messages' => $stmt->fetchAll(),
    'currentUserId' => $userId
]);
