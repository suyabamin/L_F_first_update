<?php
declare(strict_types=1);

session_start();

$DB_HOST = 'localhost';
$DB_NAME = 'lost_found_app';
$DB_USER = 'root';
$DB_PASS = '';

try {
    $pdo = new PDO(
        "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    exit('Database connection failed.');
}

function redirect_to(string $path): never
{
    header("Location: {$path}");
    exit;
}

function require_login(): int
{
    if (empty($_SESSION['user_id'])) {
        redirect_to('../Login.html');
    }

    return (int) $_SESSION['user_id'];
}

function clean_text(?string $value): string
{
    return trim((string) $value);
}

function send_json($data, int $status = 200, string $message = ''): never
{
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($status);
    echo json_encode([
        'success' => true,
        'data' => $data,
        'message' => $message,
        'error' => null
    ]);
    exit;
}

function send_error(string $message, int $status = 400, ?string $error = null): never
{
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($status);
    echo json_encode([
        'success' => false,
        'data' => null,
        'message' => $message,
        'error' => $error
    ]);
    exit;
}

