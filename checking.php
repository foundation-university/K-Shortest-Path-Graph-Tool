<?php
include_once("includes/db_config.php");
include("includes/db_connect.php");
echo "<pre>";

$sql = "SELECT * FROM edges";
$res1 = mysqli_query($connect, $sql);

$sql = "SELECT * FROM nodes";
$res2 = mysqli_query($connect, $sql);

$all_edges = array();
$all_nodes = array();
$unused_nodes = array();
$unused_edges = array();

while ($r = mysqli_fetch_assoc($res1))
{
    $temp = new Edge();

    $temp->id         = $r[ 'id' ];
    $temp->start      = $r[ 'start' ];
    $temp->end        = $r[ 'end' ];
    $temp->distance   = $r[ 'distance' ];
    $temp->bus        = $r[ 'bus_num' ];

    array_push($all_edges, $temp);
}

while ($r = mysqli_fetch_assoc($res2))
{
    $node = new Node();

    $node->id     = $r['id'];
    $node->name   = $r['name'];
    $node->lat    = $r['lat'];
    $node->lng    = $r['lng'];
    $node->city   = $r['city'];
    $node->bus    = $r['bus_num'];

    $used = false;
    foreach($all_edges as $edge)
    {
        if($edge->start == $node->id || $edge->end == $node->id)
            $used = true;
    }

    if(!$used)
    {
        array_push($unused_nodes, $node);
        $q = "DELETE FROM nodes WHERE id=" . $node->id;

        if(mysqli_query($connect, $q))
        {
            echo "Deleted " . $node->id . "<br/>";
        }
    }
    else
    {
        array_push($all_nodes, $node);
    }
}

foreach($all_edges as $edge)
{
    $used = false;
    foreach($all_nodes as $node)
    {
        if($node->id == $edge->start || $node->id == $edge->end)
            $used = true;
    }

    if(!$used)
    {
        array_push($unused_edges, $edge);
    }
}

print_r($unused_edges);
echo "Total Nodes : " . count($all_nodes) . ", Total Edges : " . count($all_edges) . "<br/>";

class Node
{
    public $id;
    public $name;
    public $lat;
    public $lng;
    public $city;
    public $bus;
}

class Edge
{
    public $id;
    public $start;
    public $end;
    public $distance;
    public $bus;
    public $used;
}