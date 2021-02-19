<?php
header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Max-Age: 1000');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
error_reporting(0);

$servername = "127.0.0.1";
$username = "root";
$password = "";
$database = "nawab"; // Change this later
$db_license = "mysql";
$port = "80";
$con = new mysqli($servername, $username, $password, $database);

// License
$license = new mysqli($servername, $username, $password, $db_license);
