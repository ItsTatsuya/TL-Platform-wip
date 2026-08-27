<?php
defined('MOODLE_INTERNAL') || die();

/**
 * Add the workshop to global navigation for signed-in users.
 *
 * @param global_navigation $navigation
 */
function local_tella_workshop_extend_navigation(global_navigation $navigation) {
    // Primary tab is added via core\hook\navigation\primary_extend.
}

/**
 * Exchange the current Moodle user for a short-lived Django JWT.
 *
 * @return array
 */
function local_tella_workshop_exchange_token(): array {
    global $USER;

    $apiurl = rtrim((string) get_config('local_tella_workshop', 'apiurl'), '/');
    $secret = (string) get_config('local_tella_workshop', 'ssosecret');
    if ($apiurl === '' || $secret === '' || empty($USER->id)) {
        return ['ok' => false, 'error' => 'missing_config'];
    }

    $email = strtolower(trim($USER->email ?? ''));
    if ($email === '') {
        $email = 'moodle-' . $USER->id . '@tella.local';
    }
    $timestamp = time();
    $payload = $USER->id . '|' . $email . '|' . $timestamp;
    $signature = hash_hmac('sha256', $payload, $secret);

    $body = json_encode([
        'moodle_user_id' => (string) $USER->id,
        'email' => $email,
        'first_name' => $USER->firstname ?? '',
        'last_name' => $USER->lastname ?? '',
        'timestamp' => $timestamp,
        'signature' => $signature,
    ]);

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\nAccept: application/json\r\n",
            'content' => $body,
            'timeout' => 5,
            'ignore_errors' => true,
        ],
    ]);
    $response = @file_get_contents($apiurl . '/api/v1/auth/moodle/exchange/', false, $context);
    $code = 0;
    if (!empty($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $match)) {
        $code = (int) $match[1];
    }
    $decoded = json_decode((string) $response, true);
    if ($code >= 200 && $code < 300 && is_array($decoded) && !empty($decoded['access'])) {
        return ['ok' => true, 'data' => $decoded];
    }
    return ['ok' => false, 'error' => 'exchange_failed', 'status' => $code];
}
