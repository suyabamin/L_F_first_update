<?php
require __DIR__ . '/config.php';

$senderId = require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_to('../Chat.html');
}

$itemId = (int) ($_POST['item_id'] ?? 0);
$receiverId = (int) ($_POST['receiver_id'] ?? 0);
$message = clean_text($_POST['message'] ?? $_POST['message_text'] ?? '');

if ($itemId <= 0 || $receiverId <= 0 || $message === '') {
    if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest') {
        send_error('Invalid message data.', 422, 'INVALID_DATA');
    }
    exit('Invalid message data.');
}

$ownerId = min($senderId, $receiverId);
$participantId = max($senderId, $receiverId);

$stmt = $pdo->prepare(
    'INSERT INTO conversations (item_id, owner_id, participant_id)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP'
);
$stmt->execute([$itemId, $ownerId, $participantId]);

$conversationId = (int) $pdo->lastInsertId();
if ($conversationId === 0) {
    $find = $pdo->prepare('SELECT id FROM conversations WHERE item_id = ? AND owner_id = ? AND participant_id = ?');
    $find->execute([$itemId, $ownerId, $participantId]);
    $conversationId = (int) $find->fetchColumn();
}

$msg = $pdo->prepare('INSERT INTO messages (conversation_id, sender_id, message_text) VALUES (?, ?, ?)');
$msg->execute([$conversationId, $senderId, $message]);

if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest') {
    send_json(['conversation_id' => $conversationId], 201, 'Message sent successfully.');
}

redirect_to('../Chat.html?conversation_id=' . $conversationId);

