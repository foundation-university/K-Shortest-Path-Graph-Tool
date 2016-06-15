var map = null;
var infoWin = null;

var bounds_marker = null;
var bounds_line = null;

var marker_list = [];
var line_list = [];

var color = {red: '#000000', blue: '#0101DF'};
var icon = {red: "images/redMarker.png", blue: "images/blueMarker.png"};

var clicked_location = null;

function placeAll()
{
    clear_node_fields();
    clear_edge_fields();
    placeNodes();
    placeEdges();
}

function placeNodes()
{
    var deferred = $.Deferred();

    clearMarkerBounds();
    clearMarkerLists();

    $.each(nodes, function ()
    {
        getNewMarker(this, icon.red);
    });

    $.each(new_nodes, function ()
    {
        getNewMarker(this, icon.blue);
    });

    deferred.resolve();
    return deferred.promise();
}

function placeEdges()
{
    var deferred = $.Deferred();

    clearLineBounds();
    clearLineLists();

    $.each(edges, function ()
    {
        getNewLine(this, color.red);
    });

    $.each(new_edges, function ()
    {
        getNewLine(this, color.blue);
    });

    deferred.resolve();
    return deferred.promise();
}

function getNewMarker(node, icon)
{
    var text = "<table>" +
            "<tr><th>Id</th><td>" + node.id + "</td></tr>" +
            "<tr><th>Name</th><td>" + node.name + "</td></tr>" +
            "<tr><th>Lat</th><td>" + node.lat + "</td></tr>" +
            "<tr><th>Lng</th><td>" + node.lng + "</td></tr>" +
            "<tr><th>Bus</th><td>" + node.bus + "</td></tr>" +
            "<tr><th>Area</th><td>" + node.area + "</td></tr>" +
            "<tr><th>City</th><td>" + node.city + "</td></tr>" +
            "</table>";

    var latlng = new google.maps.LatLng(node.lat, node.lng);
    bounds_marker.extend(latlng);

	var marker = new MarkerWithLabel(
	{
		position: latlng,
		draggable: true,
		raiseOnDrag: true,
		map: map,
		labelContent: "ID : " + node.id + "<br/><span style='color:red'>" + node.bus + "</span>",
		labelAnchor: new google.maps.Point(22, 0),
		labelClass: "labels",
		labelStyle: {opacity: 0.75},
		icon: icon
	});
	
    marker.addListener('click', function () {

        $("#node_id").val(node.id);
        $("#node_name").val(node.name);
        $("#node_lat").val(node.lat);
        $("#node_lng").val(node.lng);
        $("#node_bus").val(node.bus);
        $("#node_area").val(node.area);
        $("#node_city").val(node.city);

        infoWin.setContent(text);
        infoWin.open(map, marker);
    });

    marker.addListener('dragend', function (event) {
        console.log("marker draged");
        console.log("New position : " + event.latLng.lat() + " , " + event.latLng.lng());

        $("#node_id").val(node.id);
        $("#node_name").val(node.name);
        $("#node_lat").val(event.latLng.lat());
        $("#node_lng").val(event.latLng.lng());
        $("#node_bus").val(node.bus);
        $("#node_area").val(node.area);
        $("#node_city").val(node.city);

    });

    marker_list.push(marker);
}

function getNewLine(edge, color)
{
    var latlng = get_latlng_of_edge(edge);

    if (latlng.length < 2)
    {
        alert("latlng for edge has error : " + edge.id);
        console.log(edge);
        return;
    }

		
    var line = new google.maps.Polyline({
        path: latlng,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 6,
        draggable: true,
        map: map
    });

    var text = "<table>" +
            "<tr><th>Id</th><td>" + edge.id + "</td></tr>" +
            "<tr><th>Start</th><td>" + edge.start + "</td></tr>" +
            "<tr><th>End</th><td>" + edge.end + "</td></tr>" +
            "<tr><th>Distance</th><td>" + edge.distance + "</td></tr>" +
            "<tr><th>Fare</th><td>" + edge.fare + "</td></tr>" +
            "<tr><th>Bus</th><td>" + edge.bus + "</td></tr>" +
            "</table>";

    google.maps.event.addListener(line, 'click', function (e) {
        $("#edge_id").val(edge.id);
        $("#edge_start").val(edge.start);
        $("#edge_end").val(edge.end);
        $("#edge_distance").val(edge.distance);
        $("#edge_fare").val(edge.fare);
        $("#edge_bus").val(edge.bus);

        infoWin.setContent(text);
        infoWin.setPosition(new google.maps.LatLng(e.latLng.lat(), e.latLng.lng()));
        infoWin.open(map, line);
    });

    line_list.push(line);

    bounds_line.extend(new google.maps.LatLng(latlng[0].lat, latlng[0].lng));
    bounds_line.extend(new google.maps.LatLng(latlng[1].lat, latlng[1].lng));
}

function getDistance(origin, destination)
{
    console.log(origin);
    console.log(destination);
    
    var deferred = $.Deferred();

    var request = {
        origin: new google.maps.LatLng(origin[0], origin[1]),
        destination: new google.maps.LatLng(destination[0], destination[1]),
        travelMode: google.maps.DirectionsTravelMode.DRIVING,
        avoidHighways: true,
        avoidTolls: true
    };

    var directionsService = new google.maps.DirectionsService();
    directionsService.route(request, function (response, status)
    {
        if (status == google.maps.DirectionsStatus.OK)
        {
            var distance = response.routes[0].legs[0].distance.value / 1000;
            console.log(distance);
            deferred.resolve(distance);
        }
        else
        {
            console.log("unable to get distance");
            deferred.resolve();
        }
    });

    return deferred.promise();
}

function clearMarkerLists()
{
    marker_list.forEach(function (marker)
    {
        marker.setMap();
    });
    marker_list = [];
}

function clearLineLists()
{
    line_list.forEach(function (pLine)
    {
        pLine.setMap();
    });
    line_list = [];
}

function clearMarkerBounds()
{
    bounds_marker = new google.maps.LatLngBounds();
}

function clearLineBounds()
{
    bounds_line = new google.maps.LatLngBounds();
}

function update_clicked_location()
{
    clear_node_fields();
    $('#node_lat').val(clicked_location.lat);
    $('#node_lng').val(clicked_location.lng);
    infoWin.close();
}

function zoom_nodes()
{
	if(!bounds_marker.isEmpty())
		map.fitBounds(bounds_marker);
}

function zoom_edges()
{
	if(!bounds_line.isEmpty())
		map.fitBounds(bounds_line);
}

function zoom_latlng(latlng)
{
    if(latlng ==  "" || latlng == null || latlng.length < 1)
        return;

    latlng = latlng.replace(/\s+/g, '').split(',');

    if(latlng.length < 2)
    {
        alert("Please enter the both lat lng. Example: 32.215441552, 73.25125445");
        return;
    }

    var lat = parseFloat(latlng[0]);
    var lng = parseFloat(latlng[1]);

    if(isNaN(lat) || isNaN(lng))
    {
        alert("Please enter Float values. Example: 32.215441552, 73.25125445");
        return;
    }

    var bound = new google.maps.LatLngBounds();
    bound.extend(new google.maps.LatLng(latlng[0], latlng[1]));
    map.fitBounds(bound);
}
//////////////////////////////////

function InitMap()
{
	infoWin = new google.maps.InfoWindow();
	bounds_marker = new google.maps.LatLngBounds();
	bounds_line = new google.maps.LatLngBounds();

    var map_center = new google.maps.LatLng(33.59059931110344, 73.04534912109375);

    var mapOptions = {
        zoom: 5,
        center: map_center,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map_element = document.getElementById("map");

    map = new google.maps.Map(map_element, mapOptions);

    google.maps.event.addListener(map, 'tilesloaded', function() {
        if(nodes.length != 0)
        {
            placeAll();
            zoom_nodes();
        }

        google.maps.event.clearListeners(map, 'tilesloaded');
    });

    google.maps.event.addListener(map, 'click', function (e) {
        clicked_location = new google.maps.LatLng(e.latLng.lat(), e.latLng.lng());
        infoWin.setContent("<button onclick='update_clicked_location()'>Add Node Here</button>");
        infoWin.setPosition(clicked_location);
        infoWin.open(map);
    });
}

google.maps.event.addDomListener(window, 'load', InitMap);

 