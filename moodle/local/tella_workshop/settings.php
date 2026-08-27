<?php
defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig) {
    $settings = new admin_settingpage(
        'local_tella_workshop',
        get_string('pluginname', 'local_tella_workshop')
    );
    $ADMIN->add('localplugins', $settings);

    $settings->add(new admin_setting_configtext(
        'local_tella_workshop/apiurl',
        get_string('apiurl', 'local_tella_workshop'),
        get_string('apiurl_desc', 'local_tella_workshop'),
        'http://127.0.0.1:8000',
        PARAM_URL
    ));
    $settings->add(new admin_setting_configpasswordunmask(
        'local_tella_workshop/ssosecret',
        get_string('ssosecret', 'local_tella_workshop'),
        get_string('ssosecret_desc', 'local_tella_workshop'),
        'tella-dev-sso-secret-change-me'
    ));
    $settings->add(new admin_setting_configtext(
        'local_tella_workshop/activityid',
        get_string('activityid', 'local_tella_workshop'),
        get_string('activityid_desc', 'local_tella_workshop'),
        '',
        PARAM_RAW
    ));
}
