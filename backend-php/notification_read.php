<?php
require __DIR__ . '/config.php';

header('Content-Type: application/json');

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Please login first.']);
    exit;
}

if (!empty($_POST['all'])) {
    $stmt = $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?');
    $stmt->execute([$_SESSION['user_id']]);
} elseif (!empty($_POST['id'])) {
    $stmt = $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id = ?');
    $stmt->execute([$_SESSION['user_id'], (int) $_POST['id']]);
}

echo json_encode(['success' => true]);
