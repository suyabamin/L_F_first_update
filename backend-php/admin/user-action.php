<?php
require __DIR__ . '/../config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

if (empty($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Admin access required.']);
    exit;
}

$userId = (int) ($_POST['id'] ?? 0);
$action = trim((string) ($_POST['action'] ?? ''));

if ($userId <= 0 || $action === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing user id or action.']);
    exit;
}

if ($userId === $_SESSION['user_id']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'You cannot perform this action on your own account.']);
    exit;
}

$stmt = $pdo->prepare('SELECT role, status FROM users WHERE id = ? LIMIT 1');
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'User not found.']);
    exit;
}

switch ($action) {
    case 'toggleStatus':
        $newStatus = $user['status'] === 'active' ? 'blocked' : 'active';
        $update = $pdo->prepare('UPDATE users SET status = ? WHERE id = ?');
        $update->execute([$newStatus, $userId]);
        echo json_encode(['success' => true, 'message' => $newStatus === 'active' ? 'User unblocked.' : 'User banned.']);
        break;

    case 'toggleRole':
        $newRole = $user['role'] === 'admin' ? 'user' : 'admin';
        $update = $pdo->prepare('UPDATE users SET role = ? WHERE id = ?');
        $update->execute([$newRole, $userId]);
        echo json_encode(['success' => true, 'message' => $newRole === 'admin' ? 'User promoted to admin.' : 'User demoted to general user.']);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Unrecognized action.']);
        break;
}
