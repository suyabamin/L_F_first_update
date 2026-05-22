<?php
require __DIR__ . '/../config.php';

header('Content-Type: application/json');

if (empty($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Admin access required.']);
    exit;
}

$stmt = $pdo->query('SELECT id, username, full_name, email, phone, role, status, created_at FROM users ORDER BY created_at DESC');
$users = $stmt->fetchAll();

echo json_encode([
    'success' => true,
    'users' => array_map(function ($user) {
        return [
            'id' => (int) $user['id'],
            'username' => $user['username'],
            'fullName' => $user['full_name'],
            'email' => $user['email'],
            'phone' => $user['phone'] ?? '',
            'role' => $user['role'],
            'status' => $user['status'],
            'createdAt' => $user['created_at'],
        ];
    }, $users),
]);
