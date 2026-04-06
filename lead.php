<?php
// PHP Proxy for CRM Lead Submission
// This file can be uploaded to any PHP server (like GoDaddy)

// 1. Enable CORS (allowing your website to talk to this script)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Content-Type: application/json");

// Handle pre-flight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 2. Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method Not Allowed"]);
    exit;
}

// 3. Configuration
$API_USER = 't09jznl8';
$API_KEY = 'e242eeb980c36f7362a68386e8fe8a02';
$CRM_URL = 'https://api.crm.digitalseniorbenefits.com/inbound-lead/';

// 4. Get and parse the incoming JSON data
$inputJSON = file_get_contents('php://input');
$leadData = json_decode($inputJSON, true);

if (!$leadData) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid Lead Data"]);
    exit;
}

// 5. Add API Credentials
$leadData['api_user'] = $API_USER;
$leadData['api_key'] = $API_KEY;

// 6. Build the request data for the CRM (x-www-form-urlencoded)
$postString = http_build_query($leadData);

// 7. Make the request using cURL
$ch = curl_init($CRM_URL);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postString);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(["error" => "CRM Connection Failed: " . curl_error($ch)]);
} else {
    // 8. Send the CRM response back to the browser
    http_response_code($httpCode);
    echo $response;
}

curl_close($ch);
?>
