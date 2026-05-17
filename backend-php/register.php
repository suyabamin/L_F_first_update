<?php
require __DIR__ . '/config.php';

function register_response(bool $success, string $message, int $status = 200, array $extra = []): never
{
    $acceptHeader = $_SERVER['HTTP_ACCEPT'] ?? '';
    $wantsJson = strpos($acceptHeader, 'application/json') !== false
        || strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'xmlhttprequest';

    if ($wantsJson) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode(array_merge([
            'success' => $success,
            'message' => $message,
        ], $extra));
        exit;
    }

    if (!$success) {
        http_response_code($status);
        exit($message);
    }

    redirect_to($extra['redirect'] ?? '../DashBoard.html');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    register_response(false, 'Invalid request method.', 405);
}

$username = clean_text($_POST['username'] ?? '');
$fullName = clean_text($_POST['fullname'] ?? $_POST['full_name'] ?? '');
$email = clean_text($_POST['email'] ?? '');
$phone = clean_text($_POST['phone'] ?? '');
$country = clean_text($_POST['country'] ?? '');
$gender = clean_text($_POST['gender'] ?? 'other');
$password = (string) ($_POST['password'] ?? '');
$dob = clean_text($_POST['dob'] ?? '');

if ($username === '' || $fullName === '' || $email === '' || strlen($password) < 6) {
    register_response(false, 'Invalid registration data. Please fill all required fields.', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    register_response(false, 'Please enter a valid email address.', 422);
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare(
    'INSERT INTO users (username, full_name, email, password_hash, phone, country, gender, date_of_birth)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);

try {
    $stmt->execute([
        $username,
        $fullName,
        $email,
        $passwordHash,
        $phone ?: null,
        $country ?: null,
        in_array($gender, ['male', 'female', 'other'], true) ? $gender : 'other',
        $dob ?: null,
    ]);
} catch (PDOException $e) {
    register_response(false, 'Email or username already exists.', 409);
}

$_SESSION['user_id'] = (int) $pdo->lastInsertId();
$_SESSION['role'] = 'user';

$pdo->prepare('INSERT INTO notifications (user_id, title, body, link_url) VALUES (?, ?, ?, ?)')
    ->execute([$_SESSION['user_id'], 'Welcome to Lost & Found', 'Your account is ready. You can now post lost or found items.', 'Profile Page.html']);

register_response(true, 'Account created successfully.', 201, [
    'redirect' => 'DashBoard.html',
    'user' => [
        'id' => $_SESSION['user_id'],
        'username' => $username,
        'fullName' => $fullName,
        'email' => $email,
        'role' => 'user',
    ],
]);
