<?php
defined('MOODLE_INTERNAL') || die();

function xmldb_local_tella_workshop_install() {
    set_config('apiurl', 'http://127.0.0.1:8000', 'local_tella_workshop');
    set_config('ssosecret', 'tella-dev-sso-secret-change-me', 'local_tella_workshop');
    set_config('activityid', '', 'local_tella_workshop');
    return true;
}
