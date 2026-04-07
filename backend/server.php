<?php

/*
|--------------------------------------------------------------------------
| Laravel Development Server
|--------------------------------------------------------------------------
|
| This script runs a development server for your Laravel application. This
| server is optimized to work with the Laravel file watcher and provides
| a convenient way to serve your application during development.
|
*/

$signature = 'Laravel development server started: <http://127.0.0.1:' . $_SERVER['SERVER_PORT'] . '>';

    if (PHP_SAPI === 'cli-server') {
        if ($_SERVER['REQUEST_URI'] === '/') {
            return false;
        }

        $path = __DIR__ . '/public';

        $pathInfo = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $fileName = $_SERVER['DOCUMENT_ROOT'] . $pathInfo;

        if (file_exists($fileName)) {
            if (is_dir($fileName)) {
                $fileName .= '/index.php';
            }

            if (file_exists($fileName)) {
                return false;
            }
        }

        chdir($path);

    $_SERVER['SCRIPT_FILENAME'] = $path . '/index.php';
    $_SERVER['SCRIPT_NAME'] = $_SERVER['REQUEST_URI'];
    $_SERVER['REAL_SCRIPT_NAME'] = $_SERVER['SCRIPT_NAME'];
    $_SERVER['PATH_TRANSLATED'] = $_SERVER['SCRIPT_FILENAME'];
}

require_once __DIR__.'/public/index.php';
