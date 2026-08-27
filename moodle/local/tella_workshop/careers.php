<?php
require_once(__DIR__ . '/../../config.php');

require_login();
redirect(new moodle_url('/local/tella_workshop/index.php', ['tab' => 'careers']));
