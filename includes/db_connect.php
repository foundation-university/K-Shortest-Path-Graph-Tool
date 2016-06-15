<?php
//  database connection
$connect = new mysqli($servername, $username, $password, $dbname);
if(!$connect)
    die("Database not connected : " . $connect->connect_error);

//  create tables
$sql = array();
$sql[] = "CREATE TABLE IF NOT EXISTS " . $table_nodes . " (id int(9) NOT NULL,name varchar(25) NOT NULL,lat varchar(15) NOT NULL,lng varchar(15) NOT NULL,bus_num varchar(50) NOT NULL,area varchar(50) NOT NULL,city varchar(50) NOT NULL)";
$sql[] = "ALTER TABLE " . $table_nodes . " ADD PRIMARY KEY(id)";
$sql[] = "ALTER TABLE " . $table_nodes . " CHANGE id id INT(4) NOT NULL AUTO_INCREMENT";

$sql[] = "CREATE TABLE IF NOT EXISTS " . $table_edges . " (id int(4) NOT NULL, start int(4) NOT NULL, end int(4) NOT NULL, distance double NOT NULL, fare int(4) NOT NULL, bus_num varchar(15) NOT NULL)";
$sql[] = "ALTER TABLE " . $table_edges . " ADD PRIMARY KEY(id)";
$sql[] = "ALTER TABLE " . $table_edges . " CHANGE id id INT(4) NOT NULL AUTO_INCREMENT";

foreach($sql as $q)
    mysqli_query($connect, $q);
?>