<?php
require __DIR__ . '/config.php';

function json_request(): bool
{
    return strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false
        || strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'xmlhttprequest';
}

function json_response(array $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function public_user(array $user): array
{
    return [
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
        'createdAt' => $user['created_at'] ?? '',
        'preferences' => [
            'email' => (bool) $user['email_notifications'],
            'push' => (bool) $user['push_notifications'],
            'sms' => (bool) $user['sms_notifications'],
            'marketing' => (bool) $user['marketing_notifications'],
        ],
    ];
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_to('../Login.html');
}

$email = clean_text($_POST['email'] ?? $_POST['emailInput'] ?? '');
$password = (string) ($_POST['password'] ?? $_POST['passwordInput'] ?? '');

function verify_login_password(string $password, string $storedHash): bool
{
    if (strpos($storedHash, 'node_sha256$') === 0) {
        return hash_equals($storedHash, 'node_sha256$' . hash('sha256', $password));
    }

    return password_verify($password, $storedHash);
}

$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || $user['status'] !== 'active' || !verify_login_password($password, $user['password_hash'])) {
    if (json_request()) {
        json_response(['success' => false, 'message' => 'Invalid email or password.'], 401);
    }
    exit('Invalid email or password.');
}

$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['role'] = $user['role'];

if (json_request()) {
    json_response([
        'success' => true,
        'message' => 'Login successful.',
        'redirect' => 'DashBoard.html',
        'user' => public_user($user),
    ]);
}

redirect_to('../DashBoard.html');
