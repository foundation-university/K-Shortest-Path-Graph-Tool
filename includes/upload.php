<?php
include_once("db_config.php");
include("db_connect.php");

//  upload data
if(isset($_POST['sql']) && !empty($_POST['sql']))
{
    $sql = explode(";", $_POST['sql']);

    $error = "";
    $done = true;
    foreach($sql as $q)
    {
        if(strpos($q, $table_nodes) !== false || strpos($q, $table_edges) !== false)
        {
            $res = mysqli_query($connect, strtolower($q));

            if(!$res)
            {
                $done = false;
                $error = mysqli_error($connect);
                break;
            }
        }
    }

    if($done)
        echo "OK";
    else
        echo $error;
}

$connect->close();

/*
 * "TRUNCATE " . $table_nodes . ";" . "TRUNCATE " . $table_edges . ";" .
 *
 *
 *
 */

?>