<?php
require __DIR__ . '/config.php';

$userId = require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_to('../Create Post.html');
}

$title = clean_text($_POST['title'] ?? '');
$description = clean_text($_POST['description'] ?? $_POST['desc'] ?? '');
$itemType = clean_text($_POST['item_type'] ?? $_POST['status'] ?? 'lost');
$category = clean_text($_POST['category'] ?? 'others');
$location = clean_text($_POST['location'] ?? '');
$dateOccurred = clean_text($_POST['date_occurred'] ?? $_POST['date'] ?? '');
$contact = clean_text($_POST['contact'] ?? '');
$reward = clean_text($_POST['reward_amount'] ?? $_POST['reward'] ?? '0');

if ($title === '' || $description === '' || $location === '' || !in_array($itemType, ['lost', 'found'], true)) {
    exit('Please fill all required post fields.');
}

$stmt = $pdo->prepare(
    'INSERT INTO items
     (user_id, title, description, item_type, category, location_name, date_occurred, public_contact, reward_amount)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
$stmt->execute([
    $userId,
    $title,
    $description,
    $itemType,
    $category,
    $location,
    $dateOccurred ?: null,
    $contact ?: null,
    is_numeric($reward) ? $reward : 0,
]);

$itemId = (int) $pdo->lastInsertId();

if (!empty($_FILES['images']['name'][0])) {
    $uploadDir = __DIR__ . '/uploads/items/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0775, true);
    }

    $imageStmt = $pdo->prepare('INSERT INTO item_images (item_id, image_path, is_primary) VALUES (?, ?, ?)');

    foreach ($_FILES['images']['tmp_name'] as $index => $tmpName) {
        if (!is_uploaded_file($tmpName)) {
            continue;
        }

        $originalName = basename((string) $_FILES['images']['name'][$index]);
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true)) {
            continue;
        }

        $fileName = $itemId . '_' . uniqid('', true) . '.' . $extension;
        $relativePath = 'backend-php/uploads/items/' . $fileName;
        move_uploaded_file($tmpName, $uploadDir . $fileName);
        $imageStmt->execute([$itemId, $relativePath, $index === 0 ? 1 : 0]);
    }
}

redirect_to('post_details_view.php?id=' . $itemId);
