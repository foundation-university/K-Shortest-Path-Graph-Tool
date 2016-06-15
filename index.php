<?php
include_once("includes/db_config.php");
include_once("includes/functions.php");

//  variables
$nodes = "'';";
$edges = "'';";
$busNo = "";

include("includes/db_connect.php");

//  get data
if (isset($_GET['busNo']) && !empty($_GET['busNo']))
{
    $buses = explode(",", $_GET['busNo']);

    $qn = "SELECT * FROM " . $table_nodes . " WHERE ";
    $qe = "SELECT * FROM " . $table_edges . " WHERE ";

    if(count($buses) > 0)
    {
        foreach($buses as $bus)
        {
            $qn .= "bus_num LIKE '%$bus%' OR ";
            $qe .= "bus_num LIKE '%$bus%' OR ";
        }

        $qn = substr($qn, 0, -4);
        $qe = substr($qe, 0, -4);
    }
    else
    {
        $qn .= "bus_num = '" . $buses[0] . "'";
        $qe .= "bus_num = '" . $buses[0] . "'";
    }

    //echo '<pre>' . $qn . '<br/>' . $qe . '<br/>';

    $nodes = "[";
    $res = mysqli_query($connect, $qn);
    while ($r = mysqli_fetch_assoc($res))
    {
        $id     = $r[ 'id' ];
        $name   = "'" . $r[ 'name' ] . "'";
        $lat    = "'" . $r[ 'lat' ] . "'";
        $lng    = "'" . $r[ 'lng' ] . "'";
        $area   = "'" . $r[ 'area' ] . "'";
        $city   = "'" . $r[ 'city' ] . "'";
        $bus    = "'" . $r[ 'bus_num' ] . "'";

        $nodes .= "{id:$id, name: $name, lat: $lat, lng: $lng, bus: $bus, area: $area, city: $city},\n";
    }
    $nodes .= "];";

    $edges = "[";
    $res = mysqli_query($connect, $qe);
    while ($r = mysqli_fetch_assoc($res))
    {
        $id         = $r[ 'id' ];
        $start      = $r[ 'start' ];
        $end        = $r[ 'end' ];
        $distance   = $r[ 'distance' ];
        $fare       = $r[ 'fare' ];
        $bus        = "'" . $r['bus_num'] . "'";

        $edges .= "{id:$id, start: $start, end: $end, distance: $distance, fare: $fare, bus: [$bus]},\n";
    }
    $edges .= "];";

    //echo $nodes . '<br/>' . $edges . '<br/>';
}

$connect->close();

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Urban Points Data Collector System</title>
    <style>
        .container {
            widows: 100%;
            background-color: white;
            padding: 0px;
        }

        .row {
            padding: 5px;
            clear: both;
            margin: 5px;
            border: 1px solid black;
        }

        .title {
            border: 1px solid black;
            font-weight: bold;
            padding: 5px;
            background-color: lightgray;
        }

        .label {
            float: left;
        }

        .labels {
            color: blue;
            background-color: white;
            font-family: "Lucida Grande", "Arial", sans-serif;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            width: 100px;
            border: 1px solid black;
            white-space: nowrap;
        }

        .element {
            float: left;
        }

        .node_list{
            border: 1px solid black;
            width:200px;
            float: left;
            padding: 5px;
            font-size: 12px;
        }

        .edge_list{
            border: 1px solid black;
            width:100px;
            float: left;
            padding: 5px;
            font-size: 12px;
        }

        #map {
            float: left;
            width: 100%;
            height: 590px;
            background-color: yellow;
            padding: 0px;
        }

        th {
            width: 25%;
            font-weight: normal;
            text-align: right;
        }
    </style>

    <script>
        var nodes = <?php echo $nodes; ?>
        var edges = <?php echo $edges; ?>
    </script>

    <script type="text/javascript" src="js/jquery-1.10.2.min.js"></script>
    <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?"></script>
    <script type="text/javascript" src="js/markerwithlabel.js"></script>
    <script type="text/javascript" src="js/my_script.js"></script>
    <script type="text/javascript" src="js/map_script.js"></script>
    <script type="text/javascript" src="js/jquery-ui.min.js"></script>
    <link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.9/themes/base/jquery-ui.css" rel="stylesheet" type="text/css"/>

    <script>
        //  Search Bar function
        $(document).ready(function()
        {
            $("#searchbox").autocomplete(
            {
                source: function (request, response) {

                    var geocoder = new google.maps.Geocoder();

                    geocoder.geocode({'address': request.term}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var searchLoc = results[0].geometry.location;
                            var lat = results[0].geometry.location.lat();
                            var lng = results[0].geometry.location.lng();
                            var latlng = new google.maps.LatLng(lat, lng);
                            var bounds = results[0].geometry.bounds;

                            geocoder.geocode({'latLng': latlng}, function (results1, status1) {
                                if (status1 == google.maps.GeocoderStatus.OK) {
                                    if (results1[1]) {
                                        response($.map(results1, function (loc) {
                                            return {
                                                label: loc.formatted_address,
                                                value: loc.formatted_address,
                                                bounds: loc.geometry.bounds
                                            }
                                        }));
                                    }
                                }
                            });
                        }
                    });
                },
                select: function (event, ui) {
                    var pos = ui.item.position;
                    var lct = ui.item.locType;
                    var bounds = ui.item.bounds;

                    console.log(pos + "," + lct + "," + bounds);

                    if (bounds) {
                        map.fitBounds(bounds);
                    }
                }
            });

            $("#useSeq").change(function()
            {
                if(this.checked)
                {
                    $("#edge_start").attr('disabled','disabled');
                    $("#edge_end").attr('disabled','disabled');
                    $("#edge_distance").attr('disabled','disabled');
                    $("#edge_fare").attr('disabled','disabled');

                    $("#edge_seq").removeAttr('disabled');
                }
                else
                {
                    $("#edge_start").removeAttr('disabled');
                    $("#edge_end").removeAttr('disabled');
                    $("#edge_distance").removeAttr('disabled');
                    $("#edge_fare").removeAttr('disabled');

                    $("#edge_seq").attr('disabled','disabled');
                }
            });
        });
    </script>
</head>
<body>

<div class="row">
    <div style="float: left">
        <input type="text" value="" id="searchbox" placeholder="Search Location">
        <input type="text" value="" id="latlngbox" placeholder="LatLng Search" onchange="zoom_latlng(this.value)">
    </div>
    <div style="float: right">
        <button onclick="zoom_nodes()">Zoom Nodes</button>
        <button onclick="zoom_edges()">Zoom Edges</button>
        <button onclick="placeAll()">Reset Markers</button>
        <button id="hide_nodes" onclick="hide_nodes()">Hide Nodes</button>
        <button onclick="gen_sql()">Generate SQL Queries</button>
    </div>
    <div style="clear:both"></div>
</div>
<div class="container">
    <div class="row" style="float: left; width: 73%">
        <div id="map"></div>
    </div>
    <div style="float: left; width: 25%">

        <div class="row title">Show Nodes from Database</div>
        <div class="row">
            <form action="" method="get">
                <table>
                    <tr>
                        <td>Bus No</td>
                        <td><input type="text" id="busNo" name="busNo"
                                   value="<?php if(isset($_GET['busNo'])) echo $_GET['busNo']; ?>"
                                   style="width: 150px"/></td>
                        <td><input type="submit" name="submit_busNo"
                                   value="Load Graph"/></td>
                    </tr>
                </table>
            </form>
        </div>

        <div class="row title">
            Nodes___Total:
            <span id="nodes_count_t"></span>
            , New:
            <span id="nodes_count_n"></span>
        </div>
        <div class="row">
            <table>
                <tr>
                    <th>Id</th>
                    <td><input type="text" id="node_id"/></td>
                </tr>
                <tr>
                    <th>Name</th>
                    <td><input type="text" id="node_name"/></td>
                </tr>
                <tr>
                    <th>Lat</th>
                    <td><input type="text" id="node_lat"/></td>
                </tr>
                <tr>
                    <th>Lng</th>
                    <td><input type="text" id="node_lng"/></td>
                </tr>
                <tr>
                    <th>Bus</th>
                    <td><input type="text" id="node_bus"/>
                        <button onclick="get_bus_number('node_bus')">Get
                        </button>
                    </td>
                </tr>
                <tr>
                    <th>Area</th>
                    <td><input type="text" id="node_area"/></td>
                </tr>
                <tr>
                    <th>City</th>
                    <td><input type="text" id="node_city" value="rawalpindi" readonly/>
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td>
                        <button onclick="save_node()">Save</button>
                        <button onclick="update_node()">Update</button>
                        <button onclick="delete_node()">Delete</button>
                        <button onclick="clear_node_fields()">Reset</button>
                    </td>
                </tr>
            </table>
        </div>

        <div class="row title">
            Edge___Total:
            <span id="edges_count_t"></span>
            , New:
            <span id="edges_count_n"></span>
        </div>
        <div class="row">
            <table>
                <tr>
                    <th>Id</th>
                    <td><input type="text" id="edge_id"/></td>
                </tr>
                <tr>
                    <th>Sequence</th>
                    <td><input type="text" id="edge_seq" disabled/><input type="checkbox" id="useSeq"/></td>

                </tr>
                <tr>
                    <th>Start</th>
                    <td><input type="text" id="edge_start"/></td>
                </tr>
                <tr>
                    <th>End</th>
                    <td><input type="text" id="edge_end"/></td>
                </tr>
                <tr>
                    <th>Distance</th>
                    <td><input type="text" id="edge_distance"/>
                        <button onclick="get_distance()">Get</button>
                    </td>
                </tr>
                <tr>
                    <th>Fare</th>
                    <td><input type="text" id="edge_fare" value="0"/></td>
                </tr>
                <tr>
                    <th>Bus</th>
                    <td><input type="text" id="edge_bus"/>
                        <button onclick="get_bus_number('edge_bus')">Get
                        </button>
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td>
                        <button onclick="join_edge()">Join</button>
                        <button onclick="update_edge()">Update</button>
                        <button onclick="delete_edge()">Delete</button>
                        <button onclick="clear_edge_fields()">Reset</button>
                    </td>
                </tr>
            </table>
        </div>

    </div>
    <div style="clear: both"></div>

    <div class="row title">Sql Queries</div>
    <div class="row">
        <textarea id="sql" name="sql" rows="10" style="width: 99%"></textarea>
        <button id="upload_btn" onclick="upload()">Upload to Database</button>
    </div>

    <div class="row title">Export Queries</div>
    <div class="row">
        <textarea id="exp_sql" name="exp_sql" rows="10" style="width: 99%"></textarea>
        <button id="exp_sql_btn" onclick="export_sql_2()">Export Sql Queries</button>
    </div>

    <div class="row title">Node List</div>
    <div class="row">
        <span id="nodes_list"></span>
        <button onclick="gen_nodes_list()">Refresh List</button>
    </div>
</div>
</body>
</html>


