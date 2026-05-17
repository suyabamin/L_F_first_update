<?php
require __DIR__ . '/config.php';

header('Content-Type: application/json');

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Please login first.']);
    exit;
}

$stmt = $pdo->prepare('SELECT * FROM users WHERE id = ? AND status = "active" LIMIT 1');
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Please login first.']);
    exit;
}

$statsStmt = $pdo->prepare(
    'SELECT
      (SELECT COUNT(*) FROM items WHERE user_id = ? AND status <> "removed") AS posts,
      (SELECT COUNT(*) FROM favorites WHERE user_id = ?) AS favorites,
      (SELECT COUNT(*) FROM claims WHERE claimant_id = ?) AS claims,
      (SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0) AS unread'
);
$statsStmt->execute([$_SESSION['user_id'], $_SESSION['user_id'], $_SESSION['user_id'], $_SESSION['user_id']]);
$stats = $statsStmt->fetch();

echo json_encode([
    'success' => true,
    'user' => [
        'id' => (int) $user['id'],
        'username' => $user['username'],
        'fullName' => $user['full_name'],
        'email' => $user['email'],
        'phone' => $user['phone'] ?? '',
        'country' => $user['country'] ?? '',
        'location' => $user['location_name'] ?: ($user['country'] ?? ''),
        'avatar' => $user['avatar_url'] ?? '',
        'role' => $user['role'],
        'isVerified' => (bool) $user['is_verified'],
        'createdAt' => $user['created_at'],
        'preferences' => [
            'email' => (bool) $user['email_notifications'],
            'push' => (bool) $user['push_notifications'],
            'sms' => (bool) $user['sms_notifications'],
            'marketing' => (bool) $user['marketing_notifications'],
        ],
    ],
    'stats' => $stats,
]);
