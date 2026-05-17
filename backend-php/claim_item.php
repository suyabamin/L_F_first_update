<?php
require __DIR__ . '/config.php';

$userId = require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_to('../Claim Item.html');
}

$itemId = (int) ($_POST['item_id'] ?? $_GET['item_id'] ?? 0);
$fullName = clean_text($_POST['fullName'] ?? '');
$email = clean_text($_POST['email'] ?? '');
$phone = clean_text($_POST['phone'] ?? '');
$nid = clean_text($_POST['nid'] ?? '');
$proof = clean_text($_POST['proofDetails'] ?? '');
$additional = clean_text($_POST['additionalInfo'] ?? '');

if ($itemId <= 0 || $fullName === '' || $email === '' || $phone === '' || $proof === '') {
    exit('Please fill required claim information.');
}

$stmt = $pdo->prepare(
    'INSERT INTO claims
     (item_id, claimant_id, full_name, email, phone, nid_or_passport, proof_details, additional_info)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);
$stmt->execute([$itemId, $userId, $fullName, $email, $phone, $nid ?: null, $proof, $additional ?: null]);

redirect_to('post_details_view.php?id=' . $itemId);
