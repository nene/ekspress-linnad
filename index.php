<?php
ini_set('display_errors',true);
setup_include_paths();

require_once 'Smarty.class.php';
require_once 'MDB2.php';
require_once 'conf.php';
require_once 'Map.php';

setup_database($CONF);

// if XML was posted, save it
if (isset($_POST['xml']) && isset($_POST['save'])) {
    Map::saveXML($_POST['xml']);
}

// determine weather help is enabled. The default is yes.
if ( isset($_POST['save']) || isset($_POST['load']) ) {
    $enableHelp = ( isset($_POST['enable-help']) && $_POST['enable-help']=='on' );
}
else {
    $enableHelp = true;
}

// on any case load all towns and distances from database
// and display using template
$smarty = create_smarty();
$smarty->assign('enableHelp', $enableHelp);
$smarty->assign('towns', Map::loadTowns());
$smarty->assign('distances', Map::loadDistances());
$smarty->display('index.tpl');

exit();




/**
 * Adds our application specific paths to PHP include path
 */
function setup_include_paths() {
    add_to_include_path(getcwd().'/smarty/lib');
    add_to_include_path(getcwd().'/pear');
    add_to_include_path(getcwd().'/lib');
}

/**
 * Adds path to list of include paths.
 *
 * The path will be added at the beginning,
 * so our libraries will have priority over system libs.
 */
function add_to_include_path($path) {
    ini_set( 'include_path', $path . PATH_SEPARATOR . ini_get('include_path') );
}

/**
 * Initializes Smarty template-engine and returns it as an object
 */
function create_smarty() {
    $smarty = new Smarty();

    $smarty->template_dir = getcwd().'/smarty/templates';
    $smarty->compile_dir = getcwd().'/smarty/templates_c';
    $smarty->cache_dir = getcwd().'/smarty/cache';
    $smarty->config_dir = getcwd().'/smarty/configs';

    return $smarty;
}

/**
 * Initalizes database connection
 */
function setup_database($conf) {
    $dsn = array(
        'phptype'  => 'mysql',
        'username' => $conf['db_username'],
        'password' => $conf['db_password'],
        'hostspec' => $conf['db_host'],
        'database' => $conf['db_name'],
    );

    // from this point on, we can use method MDB2::singleton()
    // to access the database connection object
    $mdb2 = MDB2::singleton($dsn);

    if (PEAR::isError($mdb2)) {
        die($mdb2->getMessage());
    }

    // set fetch mode to associative
    $mdb2->setFetchMode(MDB2_FETCHMODE_ASSOC);
}

?>
