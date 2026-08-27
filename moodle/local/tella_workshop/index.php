<?php
require_once(__DIR__ . '/../../config.php');
require_once(__DIR__ . '/lib.php');

require_login();
$context = context_system::instance();
require_capability('local/tella_workshop:view', $context);

$tab = optional_param('tab', 'a', PARAM_ALPHANUM);
$allowed = ['a', 'b', 'c', 'd', 'careers'];
if (!in_array($tab, $allowed, true)) {
    $tab = 'a';
}

$PAGE->set_context($context);
$PAGE->set_url(new moodle_url('/local/tella_workshop/index.php', ['tab' => $tab]));
$PAGE->set_pagelayout('standard');
$PAGE->set_title(get_string('pageheading', 'local_tella_workshop'));
$PAGE->set_heading(get_string('pageheading', 'local_tella_workshop'));
$PAGE->navbar->add(get_string('navtab', 'local_tella_workshop'));
$PAGE->requires->css('/local/tella_workshop/styles/workshop.css');

$fallbackconfig = [
    'name' => 'Bakery — March actuals',
    'question' => 'A bakery sells puffs and tea. Using this week’s actuals, find a better daily mix.',
    'price1' => 30,
    'priceDrop1' => 0.05,
    'cost1' => 12.50,
    'price2' => 16,
    'priceDrop2' => 0.02,
    'cost2' => 4.50,
    'congestion' => 0.01,
    'fixedCost' => 1000,
    'currentX' => 200,
    'currentY' => 150,
    'labels' => [
        'product1' => 'Puffs',
        'product2' => 'Tea',
        'unit1' => 'puffs per day',
        'unit2' => 'teas per day',
        'currency' => '₹',
    ],
];

$exchange = local_tella_workshop_exchange_token();
$init = [
    'apiUrl' => rtrim((string) get_config('local_tella_workshop', 'apiurl'), '/'),
    'activityId' => (string) get_config('local_tella_workshop', 'activityid'),
    'token' => $exchange['ok'] ? $exchange['data']['access'] : '',
    'refresh' => $exchange['ok'] ? $exchange['data']['refresh'] : '',
    'user' => $exchange['ok'] ? ($exchange['data']['user'] ?? null) : [
        'display_name' => fullname($USER),
        'moodle_user_id' => (string) $USER->id,
    ],
    'offline' => empty($exchange['ok']),
    // Keeps the shell usable before the Django activity endpoint is configured.
    'workshopConfig' => $fallbackconfig,
    'screen' => $tab,
    'sesskey' => sesskey(),
    'strings' => [
        'tabenter' => get_string('tabenter', 'local_tella_workshop'),
        'tabhold' => get_string('tabhold', 'local_tella_workshop'),
        'tabwalk' => get_string('tabwalk', 'local_tella_workshop'),
        'tabreport' => get_string('tabreport', 'local_tella_workshop'),
        'tabcareers' => get_string('tabcareers', 'local_tella_workshop'),
        'careersplaceholder' => get_string('careersplaceholder', 'local_tella_workshop'),
    ],
];

$PAGE->requires->js_call_amd('local_tella_workshop/workshop', 'init', [$init]);

echo $OUTPUT->header();
echo $OUTPUT->render_from_template('local_tella_workshop/workshop_container', [
    'configjson' => json_encode($init, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
    'loading' => get_string('loading', 'local_tella_workshop'),
]);
echo $OUTPUT->footer();
