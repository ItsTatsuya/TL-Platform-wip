<?php
define('CLI_SCRIPT', true);
require dirname(__DIR__) . '/moodle/config.php';
require_once($CFG->dirroot . '/local/tella_workshop/lib.php');

global $USER;
$USER = get_admin();
$result = local_tella_workshop_exchange_token();
echo json_encode($result, JSON_PRETTY_PRINT), PHP_EOL;
