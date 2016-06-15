/*
var nodes = [
    {id: 1, name: 'High Court Road', lat: '33.552652346406', lng: '73.099443912506', bus: '21', area: '', city: 'Rawalpindi'},
    {id: 2, name: 'fauji foundation hospital', lat: '33.554360094671', lng: '73.098338842391', bus: '21', area: 'fauji foundation college', city: 'Rawalpindi'},
    {id: 3, name: 'Tk Cng', lat: '33.557686083391', lng: '73.095710277557', bus: '21', area: '', city: 'Rawalpindi'},
    {id: 4, name: 'askari bank', lat: '33.558240402394', lng: '73.091204166412', bus: '21', area: '', city: 'Rawalpindi'},
    {id: 5, name: 'alshifa trust eye hospita', lat: '33.558848361080', lng: '73.089830875396', bus: '21', area: '', city: 'Rawalpindi'},
    {id: 6, name: 'hotel royal palace', lat: '33.561369555844', lng: '73.086247444152', bus: '21', area: '', city: 'Rawalpindi'},
    {id: 7, name: 'morgah road', lat: '33.563443675079', lng: '73.083028793334', bus: '21', area: '', city: 'Rawalpindi'}
];
*/

var new_nodes = [];
var deleted_nodes = [];

/*
var edges = [
    {id: 1, start: 1, end: 2, distance: 1.253, fare: 10, bus: "1c"},
    {id: 2, start: 2, end: 3, distance: 1.253, fare: 10, bus: "1c"},
    {id: 3, start: 3, end: 4, distance: 1.253, fare: 10, bus: "1c"},
    {id: 4, start: 4, end: 5, distance: 1.253, fare: 10, bus: "1c"}
];
*/

var new_edges = [];
var deleted_edges = [];

var serial_start = 9000;

console.log(nodes);
console.log(edges);

////////////////////////////////////////////
function save_node()
{
    var temp = {
        id: $("#node_id").val(),
        name: $("#node_name").val(),
        lat: $("#node_lat").val(),
        lng: $("#node_lng").val(),
        bus: $("#node_bus").val(),
        area: $("#node_area").val(),
        city: $("#node_city").val()
    };

    if (temp.name == "" || temp.lat == "" || temp.lng == "" || temp.bus == "" || temp.city == "")
    {
        alert("Node details are missing.");
        return;
    }

    temp.id = new_nodes.length + 1 + serial_start;
    new_nodes.push(temp);
    alert("New node created successfully with temp Id : " + temp.id);

    placeAll();
}

function update_node()
{
    var temp = {
        id: $("#node_id").val(),
        name: $("#node_name").val(),
        lat: $("#node_lat").val(),
        lng: $("#node_lng").val(),
        bus: $("#node_bus").val(),
        area: $("#node_area").val(),
        city: $("#node_city").val()
    };

    if (temp.id == "" || temp.name == "" || temp.lat == "" || temp.lng == "" || temp.bus == "" || temp.city == "")
    {
        alert("Node details are missing.");
        return;
    }

    var replaced = false;
    $.each(nodes, function (key, value)
    {
        if (temp.id == value.id)
        {
            nodes[key] = temp;
            replaced = true;

            return false;
        }
    });

    if (!replaced)
    {
        $.each(new_nodes, function (key, value)
        {
            if (temp.id == value.id)
            {
                nodes[key] = temp;
                replaced = true;

                return false;
            }
        });
    }

    if(replaced)
        alert("Node with id : " + temp.id + " updated successfully.");
    else
        alert("Node with id : " + temp.id + " not exist.");

    placeAll();
}

function delete_node()
{
    var temp = {
        id: $("#node_id").val(),
        name: $("#node_name").val(),
        lat: $("#node_lat").val(),
        lng: $("#node_lng").val(),
        bus: $("#node_bus").val(),
        area: $("#node_area").val(),
        city: $("#node_city").val()
    };

    if (temp.id == "")
    {
        alert("Node id are missing.");
        return;
    }

    var deleted = false;
    if (temp.id < serial_start)
    {
        $.each(nodes, function (key, value)
        {
            if (temp.id == value.id)
            {
                deleted_nodes.push(value);
                nodes.splice(key, 1);
                deleted = true;
                return false;
            }
        });
    }

    if (temp.id > serial_start && !deleted)
    {
        $.each(new_nodes, function (key, value)
        {
            if (temp.id == value.id)
            {
                deleted_nodes.push(value);
                new_nodes.splice(key, 1);
                deleted = true;
                return false;
            }
        });
    }

    if (deleted)
        alert("Node with id : " + temp.id + " deleted successfully");
    else
        alert("Node with id : " + temp.id + " not exist");

    placeAll();
}

function join_edge()
{
    if($("#useSeq").is(':checked'))
    {
        join_sequence();
        return;
    }

    var temp = {
        id: $("#edge_id").val(),
        start: $("#edge_start").val(),
        end: $("#edge_end").val(),
        distance: $("#edge_distance").val(),
        fare: $("#edge_fare").val(),
        bus: $("#edge_bus").val()
    };

    if (temp.start == "" || temp.end == "" || temp.distance == "" || temp.fare == "" || temp.bus == "")
    {
        alert("Edge details are missing.");
        return;
    }
    
    if(temp.start == temp.end)
    {
        alert("Start and End of edge are same.");
        return;
    }

    if(temp.start > serial_start || temp.end > serial_start)
    {
        alert("Can't create edge between temporary Nodes.\nPlease save the graph 1st.");
        return;
    }
    
    var promise = node_exist(temp.start);
    promise.then(function (ans)
    {
        if (ans)
        {
            var promise2 = node_exist(temp.end);
            promise2.then(function (ans2)
            {
                if (ans2)
                {
                    var already_joined = false;
                    $.each(edges, function (key, value)
                    {
                        if (temp.start == value.start && temp.end == value.end)
                        {
                            alert("Edge already exist on index : " + key + ", ID : " + value.id);
                            already_joined = true;
                            return false;
                        }

                        if (temp.start == value.end && temp.end == value.start)
                        {
                            alert("Edge already exist on index : " + key + ", ID : " + value.id + ", Revered.");
                            already_joined = true;
                            return false;
                        }
                    });

                    if(!already_joined)
                    {
                        $.each(new_edges, function (key, value)
                        {
                            if (temp.start == value.start && temp.end == value.end)
                            {
                                alert("Edge already exist on index : " + key + ", ID : " + value.id);
                                already_joined = true;
                                return false;
                            }

                            if (temp.start == value.end && temp.end == value.start)
                            {
                                alert("Edge already exist on index : " + key + ", ID : " + value.id + ", Revered.");
                                already_joined = true;
                                return false;
                            }
                        });
                    }

                    if (!already_joined)
                    {
                        temp.id = new_edges.length + 1 + serial_start;
                        new_edges.push(temp);

                        placeAll();
                        alert("Edge created successfully.");
                    }
                }
                else
                {
                    alert("End of edge is not exist in edges");
                    return;
                }
            });
        }
        else
        {
            alert("Start of edge is not exist in edges");
            return;
        }
    });

    $("#edge_start").focus();
}

function join_sequence()
{
    var seq = $("#edge_seq").val();
    var bus = $("#edge_bus").val();

    if(seq == "")
    {
        alert("Sequence of edges is empty");
        return;
    }

    if(bus == "")
    {
        alert("Bus no is empty");
        return;
    }

    var spl = seq.split(",");

    if(spl.length < 3)
    {
        alert("Sequence must contain at least 3 nodes");
        return;
    }

    for(var i=0; i<spl.length; i++)
    {
        if(spl[i+1] === undefined || spl[i+1] == "" || spl[i] === "" || isNaN(spl[i]))
            break;

        var s = spl[i];
        var e = spl[i+1];

        if(s == e || s > serial_start || e > serial_start)
            continue;

        var temp = {
            start: parseInt(s),
            end: parseInt(e),
            bus: bus
        };

        console.log(temp);

        if(!node_exist(temp.start) && !node_exist(temp.end))
        {
            continue;
        }

        var already_joined = false;
        $.each(edges, function (key, value)
        {
            if (temp.start == value.start && temp.end == value.end)
            {
                alert("Edge already exist on index : " + key + ", ID : " + value.id);
                already_joined = true;
                return false;
            }

            if (temp.start == value.end && temp.end == value.start)
            {
                alert("Edge already exist on index : " + key + ", ID : " + value.id + ", Revered.");
                already_joined = true;
                return false;
            }
        });

        if(!already_joined)
        {
            $.each(new_edges, function (key, value)
            {
                if (temp.start == value.start && temp.end == value.end)
                {
                    alert("Edge already exist on index : " + key + ", ID : " + value.id);
                    already_joined = true;
                    return false;
                }

                if (temp.start == value.end && temp.end == value.start)
                {
                    alert("Edge already exist on index : " + key + ", ID : " + value.id + ", Revered.");
                    already_joined = true;
                    return false;
                }
            });
        }

        if (!already_joined)
        {
            temp.id = new_edges.length + 1 + serial_start;
            temp.fare = 0;
            temp.distance = 0;
            new_edges.push(temp);
        }
    }

    placeAll();
    alert("Edges created successfully");
}

function update_edge()
{
    var temp = {
        id: $("#edge_id").val(),
        start: $("#edge_start").val(),
        end: $("#edge_end").val(),
        distance: $("#edge_distance").val(),
        fare: $("#edge_fare").val(),
        bus: $("#edge_bus").val()
    };

    if (temp.id == "" || temp.start == "" || temp.end == "" || temp.distance == "" || temp.fare == "" || temp.bus == "")
    {
        alert("Edge details are missing.");
        return;
    }

    var replaced = false;
    $.each(edges, function (key, value)
    {
        if (temp.id == value.id)
        {
            edges[key] = temp;
            replaced = true;

            return false;
        }
    });

    if (!replaced)
    {
        $.each(new_edges, function (key, value)
        {
            if (temp.id == value.id)
            {
                new_edges[key] = temp;
                replaced = true;

                return false;
            }
        });
    }

    if (replaced)
    {
        placeAll();
        alert("Edge with Id : " + temp.id + " updated successfully.");
    }
    else
        alert("Edge with id : " + temp.id + " not exist.");
}

function delete_edge()
{
    var temp = {
        id: $("#edge_id").val(),
        start: $("#edge_start").val(),
        end: $("#edge_end").val(),
        distance: $("#edge_distance").val(),
        fare: $("#edge_fare").val(),
        bus: $("#edge_bus").val()
    };

    if (temp.id == "")
    {
        alert("Node id are missing.");
        return;
    }

    var deleted = false;
    if (temp.id < serial_start)
    {
        $.each(edges, function (key, value)
        {
            if (temp.id == value.id)
            {
                deleted_edges.push(value);
                edges.splice(key, 1);
                deleted = true;
                return false;
            }
        });
    }

    if (temp.id > serial_start && !deleted)
    {
        $.each(new_edges, function (key, value)
        {
            if (temp.id == value.id)
            {
                deleted_edges.push(value);
                new_edges.splice(key, 1);
                deleted = true;
                return false;
            }
        });
    }

    if (deleted)
    {
        placeAll();
        alert("Edge deleted successfully.");
    }
    else
        alert("Edge with id : " + temp.id + " not exist.");

}

function node_exist(id)
{
    var exist = false;
    var deferred = $.Deferred();

    $.each(nodes, function (key, value)
    {
        if (id == value.id)
        {
            exist = true;
            return false;
        }
    });

    if (!exist)
    {
        $.each(new_nodes, function (key, value)
        {
            if (id == value.id)
            {
                exist = true;
                return false;
            }
        });
    }

    deferred.resolve(exist);
    return deferred.promise();
}

function get_latlng_of_edge(edge)
{
    var latlng = [];

    for(var i=0; i<nodes.length; i++)
        if(nodes[i].id == edge.start || nodes[i].id == edge.end)
            latlng.push({lat: parseFloat(nodes[i].lat), lng: parseFloat(nodes[i].lng)});
    
    for(var i=0; i<new_nodes.length; i++)
        if(new_nodes[i].id == edge.start || new_nodes[i].id == edge.end)
            latlng.push({lat: parseFloat(new_nodes[i].lat), lng: parseFloat(new_nodes[i].lng)});
    
    for(var i=0; i<deleted_nodes.length; i++)
        if(deleted_nodes[i].id == edge.start || deleted_nodes[i].id == edge.end)
            latlng.push({lat: parseFloat(deleted_nodes[i].lat), lng: parseFloat(deleted_nodes[i].lng)});

    return latlng;
}

function get_distance()
{
	var start = $("#edge_start").val();
	var end = $("#edge_end").val();
	
	if(start.length == 0 || end.length == 0)
	{
		alert("Start or End ID's area empty.");
		return
	}
	
    var temp = {
        start: parseInt(start),
        end: parseInt(end)
    };
    
    console.log(temp);
    
    var x = get_latlng_of_edge(temp);
    
    console.log(x);
    
    if(x.length > 0)
    {
        var promise = getDistance([x[0].lat, x[0].lng],[x[1].lat, x[1].lng]);
        promise.then(function(distance)
        {
            $("#edge_distance").val(distance);
        });
    }
}

function get_bus_number(id)
{
	var bus_num = $("#busNo").val();

	if(bus_num.length < 1)
    {
        alert("Bus Number is empty.");
        return;
    }

    if (bus_num.indexOf(",") > -1)
    {
        alert("Enter Bus Number manually.");

        $("#" + id).focus();
        return;
    }

    $("#" + id).val(bus_num);
}

setInterval(function () 
{
    $('#nodes_count_t').html(nodes.length + new_nodes.length);
    $('#nodes_count_n').html(new_nodes.length.toString());
    $('#edges_count_t').html(edges.length + new_edges.length);
    $('#edges_count_n').html(new_edges.length.toString());
}, 1000);

/////////////////////////////////////////
function clear_node_fields()
{
    $("#node_id").val("");
    $("#node_name").val("");
    $("#node_lat").val("");
    $("#node_lng").val("");
    $("#node_bus").val("");
    $("#node_area").val("");
    //$("#node_city").val("");
}

function clear_edge_fields()
{
    $("#edge_id").val("");
    $("#edge_start").val("");
    $("#edge_end").val("");
    $("#edge_distance").val("");
    $("#edge_fare").val("");
    $("#edge_bus").val("");
    $("#edge_seq").val("");
}

/////////////////////////////////////////
function hide_nodes()
{
    var text = $("#hide_nodes").html();
    if(text == "Hide Nodes")
    {
        clearMarkerLists();
        $("#hide_nodes").html("Show Nodes");
    }
    else
    {
        placeNodes();
        $("#hide_nodes").html("Hide Nodes");
    }
}

function gen_sql()
{
    var TABLE_NODES = "nodes";
    var TABLE_EDGES = "edges";

    var sql = "";
    
    //  NODES UPDATE ------------------------------
    $.each(nodes, function()
    {
        sql += "UPDATE " + TABLE_NODES + " SET ";
        sql += "name='" + this.name + "', ";
        sql += "lat='" + this.lat + "', ";
        sql += "lng='" + this.lng + "', ";
        sql += "bus_num='" + this.bus + "', ";
        sql += "area='" + this.area + "', ";
        sql += "city='" + this.city + "' ";
        sql += "WHERE id=" + this.id + ";\n";
    });
    
    //sql += "\n\n";
    
    //  NODES CREATE -----------------------------
    $.each(new_nodes, function()
    {
        sql += "INSERT INTO " + TABLE_NODES + " (name, lat, lng, bus_num, area, city) VALUES(";
        sql += "'" + this.name + "', ";
        sql += "'" + this.lat + "', ";
        sql += "'" + this.lng + "', ";
        sql += "'" + this.bus + "', ";
        sql += "'" + this.area + "', ";
        sql += "'" + this.city + "');\n";
    });
    
    //sql += "\n\n";
    
    //  NODES DELETE -----------------------------
    $.each(deleted_nodes, function()
    {
        sql += "DELETE FROM " + TABLE_NODES + " WHERE id=" + this.id + ";\n";
    });
    
    //sql += "\n\n";
    
    //  EDGES UPDATE -----------------------------
    $.each(edges, function()
    {
        sql += "UPDATE " + TABLE_EDGES + " SET ";
        sql += "start=" + this.start + ", ";
        sql += "end=" + this.end + ", ";
        sql += "distance=" + this.distance + ", ";
        sql += "fare=" + this.fare + ", ";
        sql += "bus_num='" + this.bus + "' ";
        sql += "WHERE id=" + this.id + ";\n";
    });
    
    //sql += "\n\n";
    
    //  EDGES CREATE ------------------------------
    $.each(new_edges, function()
    {
        sql += "INSERT INTO " + TABLE_EDGES + " (start, end, distance, fare, bus_num) VALUES(";
        sql += this.start + ", ";
        sql += this.end + ", ";
        sql += this.distance + ", ";
        sql += this.fare + ", ";
        sql += "'" + this.bus + "');\n";
    });
    
    //sql += "\n\n";
    
    //  EDGES DELETE -----------------------------
    $.each(deleted_edges, function()
    {
        sql += "DELETE FROM " + TABLE_EDGES + " WHERE id=" + this.id + ";\n";
    });
    console.log(sql);

    $("#sql").val(sql);
	$("#sql").focus();
}

function upload()
{
    $("#upload_btn").attr('disabled','disabled');

    var data = $('#sql').val();
    if(data.length < 1)
    {
        alert("No sql query available.");
        return;
    }

    var promise = callAjax("includes/upload.php", {sql: data});
    promise.then(function(res)
    {
        if(res == "OK")
        {
            alert("Data upload successfully");
            $("#sql").val("");
            window.location.reload(false);
        }
        else
        {
            alert(res);
        }

        $("#upload_btn").removeAttr('disabled');
    });
}

function export_sql()
{
    var sql_insert = "";
    var sql_update = "";
    $.each(nodes, function()
    {
        if(this.bus.split(",").length > 1)
        {
            sql_update += "UPDATE nodes SET ";
            sql_update += "name='" + this.name + "', ";
            sql_update += "lat='" + this.lat + "', ";
            sql_update += "lng='" + this.lng + "', ";
            sql_update += "bus_num='" + this.bus + "', ";
            sql_update += "area='" + this.area + "', ";
            sql_update += "city='" + this.city + "' ";
            sql_update += "WHERE id=" + this.id + ";\n";
        }
        else
        {
            sql_insert += "INSERT INTO nodes (name, lat, lng, bus_num, area, city) VALUES(";
            sql_insert += "'" + this.name + "', ";
            sql_insert += "'" + this.lat + "', ";
            sql_insert += "'" + this.lng + "', ";
            sql_insert += "'" + this.bus + "', ";
            sql_insert += "'" + this.area + "', ";
            sql_insert += "'" + this.city + "');\n";
        }
    });


    sql_insert += "\n\n";
    sql_update += "\n\n";
    $.each(edges, function()
    {
        if(this.bus[0].split(",").length > 1)
        {
            sql_update += "UPDATE edges SET ";
            sql_update += "start=" + this.start + ", ";
            sql_update += "end=" + this.end + ", ";
            sql_update += "distance=" + this.distance + ", ";
            sql_update += "fare=" + this.fare + ", ";
            sql_update += "bus_num='" + this.bus + "' ";
            sql_update += "WHERE id=" + this.id + ";\n";
        }
        else
        {
            sql_insert += "INSERT INTO edges (start, end, distance, fare, bus_num) VALUES(";
            sql_insert += this.start + ", ";
            sql_insert += this.end + ", ";
            sql_insert += this.distance + ", ";
            sql_insert += this.fare + ", ";
            sql_insert += "'" + this.bus + "');\n";
        }

    });

    $("#exp_sql").val(sql_insert + "\n" + sql_update);
}

function export_sql_2()
{
    var sql_insert = "";
    $.each(nodes, function()
    {
        sql_insert += "INSERT INTO nodes (name, lat, lng, bus_num, area, city) VALUES(";
        sql_insert += "'" + this.name + "', ";
        sql_insert += "'" + this.lat + "', ";
        sql_insert += "'" + this.lng + "', ";
        sql_insert += "'" + this.bus + "', ";
        sql_insert += "'" + this.area + "', ";
        sql_insert += "'" + this.city + "');\n";
    });

    sql_insert += "\n\n";
    $.each(edges, function()
    {
        sql_insert += "INSERT INTO edges (start, end, distance, fare, bus_num) VALUES(";
        sql_insert += this.start + ", ";
        sql_insert += this.end + ", ";
        sql_insert += this.distance + ", ";
        sql_insert += this.fare + ", ";
        sql_insert += "'" + this.bus + "');\n";
    });

    $("#exp_sql").val(sql_insert);
}

function gen_nodes_list()
{
    var nodes_html = "";
    $.each(nodes, function(key, value)
    {
        nodes_html += "<div class='node_list' style='width:50px'>" + (key+1) + "</div>" +
        "<div class='node_list' style='width:50px'>ID: " + value.id + "</div> " +
        "<div class='node_list' style='width:200px'>NAME: " + value.name + "</div>" +
        "<div class='node_list' style='width:150px'>LAT: " + value.lat + "</div>" +
        "<div class='node_list' style='width:150px'>LNG: " + value.lng + "</div>" +
        "<div class='node_list' style='width:100px'>BUS: " + value.bus + "</div>" +
        "<div style='clear: both'></div>";
    });

    var edges_html = "";
    $.each(edges, function(key, value)
    {
        edges_html += "<div class='edge_list'>" + (key+1) + "</div>" +
        "<div class='edge_list'>ID: " + value.id + "</div> " +
        "<div class='edge_list'>START: " + value.start + "</div>" +
        "<div class='edge_list'>END: " + value.end + "</div>" +
        "<div class='edge_list'>FARE: " + value.fare + "</div>" +
        "<div class='edge_list'>DIST: " + value.distance + "</div>" +
        "<div class='edge_list'>BUS: " + value.bus + "</div>" +
        "<div style='clear: both'></div>";
    });

    $("#nodes_list").html(nodes_html + edges_html);
}

function callAjax(url, parm)
{
    console.log("Calling Ajax on : " + url);
    var deferred = $.Deferred();

    $.ajax(
        {
            type: 'POST',
            url: url,
            data: parm,
            success: function (res)
            {
                console.log("Ajax done successfuly");
                deferred.resolve(res);
            },
            error: function (res)
            {
                console.log("Ajax failed");
                deferred.resolve(res);
            }
        });

    return deferred.promise();
}