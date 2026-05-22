<?php
require __DIR__ . '/config.php';

$userId = require_login();
$stmt = $pdo->prepare(
    'SELECT c.id, c.item_id, c.owner_id, c.participant_id, c.updated_at, i.title,
      (SELECT message_text FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
      (SELECT u.full_name FROM users u WHERE u.id = IF(c.owner_id = :uid, c.participant_id, c.owner_id)) AS other_name,
      (SELECT u.id FROM users u WHERE u.id = IF(c.owner_id = :uid2, c.participant_id, c.owner_id)) AS other_id
     FROM conversations c JOIN items i ON i.id = c.item_id
     WHERE c.owner_id = :uid3 OR c.participant_id = :uid4 ORDER BY c.updated_at DESC'
);
$stmt->execute(['uid' => $userId, 'uid2' => $userId, 'uid3' => $userId, 'uid4' => $userId]);

header('Content-Type: application/json');
echo json_encode(['success' => true, 'conversations' => $stmt->fetchAll()]);
