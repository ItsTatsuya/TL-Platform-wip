<?php
namespace local_tella_workshop\privacy;

defined('MOODLE_INTERNAL') || die();

class provider implements \core_privacy\local\metadata\null_provider {
    /**
     * Reason why this plugin stores no personal data locally.
     */
    public static function get_reason(): string {
        return 'privacy:metadata';
    }
}
