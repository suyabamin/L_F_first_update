<?php
require __DIR__ . '/config.php';

header('Content-Type: application/json');

function bool_field(string $key, bool $default = false): int
{
    if (!array_key_exists($key, $_POST)) {
        return $default ? 1 : 0;
    }
    return in_array(strtolower((string) $_POST[$key]), ['1', 'true', 'on', 'yes'], true) ? 1 : 0;
}

function verify_profile_password(string $password, string $storedHash): bool
{
    if (strpos($storedHash, 'node_sha256$') === 0) {
        return hash_equals($storedHash, 'node_sha256$' . hash('sha256', $password));
    }

    return password_verify($password, $storedHash);
}

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Please login first.']);
    exit;
}

$fullName = clean_text($_POST['fullName'] ?? '');
$email = clean_text($_POST['email'] ?? '');

if ($fullName === '' || $email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Valid name and email are required.']);
    exit;
}

$currentStmt = $pdo->prepare('SELECT username, password_hash FROM users WHERE id = ? LIMIT 1');
$currentStmt->execute([$_SESSION['user_id']]);
$currentUser = $currentStmt->fetch();

$passwordHash = null;
if (!empty($_POST['newPassword'])) {
    if (empty($_POST['currentPassword']) || !verify_profile_password((string) $_POST['currentPassword'], $currentUser['password_hash'])) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect.']);
        exit;
    }
    if (strlen((string) $_POST['newPassword']) < 6) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'New password must be at least 6 characters.']);
        exit;
    }
    $passwordHash = password_hash((string) $_POST['newPassword'], PASSWORD_DEFAULT);
}

$sql = 'UPDATE users SET username = ?, full_name = ?, email = ?, phone = ?, location_name = ?, avatar_url = ?,
        email_notifications = ?, push_notifications = ?, sms_notifications = ?, marketing_notifications = ?';
$params = [
    ltrim(clean_text($_POST['username'] ?? $currentUser['username']), '@') ?: $currentUser['username'],
    $fullName,
    $email,
    clean_text($_POST['phone'] ?? ''),
    clean_text($_POST['location'] ?? ''),
    clean_text($_POST['avatar'] ?? ''),
    bool_field('emailNotif', true),
    bool_field('pushNotif', true),
    bool_field('smsNotif', false),
    bool_field('marketingNotif', false),
];

if ($passwordHash !== null) {
    $sql .= ', password_hash = ?';
    $params[] = $passwordHash;
}

$sql .= ' WHERE id = ?';
$params[] = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
} catch (PDOException $e) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Email or username already exists.']);
    exit;
}

$pdo->prepare('INSERT INTO notifications (user_id, title, body, link_url) VALUES (?, ?, ?, ?)')
    ->execute([$_SESSION['user_id'], 'Profile Updated', 'Your profile information was saved successfully.', 'Profile Page.html']);

$stmt = $pdo->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

echo json_encode([
    'success' => true,
    'message' => 'Profile updated successfully.',
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
]);
