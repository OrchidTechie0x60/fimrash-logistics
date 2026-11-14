<?php
// Fimrash Logistics Services - Whogohost / cPanel Production Config
// Copy or rename this file to config.php on your Whogohost hosting server.

return [
    'driver'   => 'mysql',
    'host'     => 'localhost', // Whogohost cPanel MySQL host is almost always localhost
    'port'     => '3306',
    'database' => 'whogohost_user_fimrash',      // Replace with your cPanel database name
    'username' => 'whogohost_user_fimrash_user', // Replace with your cPanel database user
    'password' => 'YourStrongDbPasswordHere',    // Replace with your database user password
];
