<?php
session_start();

header('Content-Type: application/json');

// Redirect if user is not staff
if (!isset($_SESSION['account']) || !$_SESSION['account']['is_staff']) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
    exit;
}

require_once('../tools/functions.php');
require_once('../classes/product.class.php');
require_once('../classes/stocks.class.php');

$productObj = new Product();
$stocksObj = new Stocks();
$response = ['status' => 'success'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $product_id = clean_input($_GET['id']);
    $quantity = clean_input($_POST['quantity']);
    $status = isset($_POST['status']) ? clean_input($_POST['status']) : '';
    $reason = isset($_POST['reason']) ? clean_input($_POST['reason']) : '';

    // Validation
    if (empty($quantity) || !is_numeric($quantity) || $quantity < 1) {
        $response['status'] = 'error';
        $response['quantityErr'] = 'Please enter a valid quantity greater than 0.';
    }
    if (empty($status) || !in_array($status, ['in', 'out'])) {
        $response['status'] = 'error';
        $response['statusErr'] = 'Please select a valid stock status (in or out).';
    }
    if ($status === 'out' && empty($reason)) {
        $response['status'] = 'error';
        $response['reasonErr'] = 'Reason is required for stock out.';
    }
    if ($status === 'out' && $quantity > $stocksObj->getAvailableStocks($product_id)) {
        $availableStocks = $stocksObj->getAvailableStocks($product_id) ?: 0;
        $response['status'] = 'error';
        $response['quantityErr'] = "Quantity must be less than available stocks: $availableStocks";
    }

    // If there are validation errors, return them
    if ($response['status'] === 'error') {
        echo json_encode($response);
        exit;
    }

    // Save stock data
    $stocksObj->product_id = $product_id;
    $stocksObj->quantity = $quantity;
    $stocksObj->status = $status;
    $stocksObj->reason = $reason;

    if ($stocksObj->add()) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to save stock data.']);
    }
}
