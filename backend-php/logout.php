<?php
require __DIR__ . '/config.php';

session_destroy();

if (strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false
    || strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'xmlhttprequest') {
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'redirect' => 'Login.html']);
    exit;
}

redirect_to('../Login.html');
