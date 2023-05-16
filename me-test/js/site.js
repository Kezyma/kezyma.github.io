// Settings
var zoomLevel = 1;
var mapItemZoomVal = 1.9;
var minZoom = 8;
var maxZoom = 14;
var minIconSize = 32;
var maxIconSize = 128;
var galaxyJson = "./js/galaxy.json";
var lineColour = "#777";
var missingImages = [];

// Map Data
var clusters = null;

// Page Init
$(document).ready(function () {
    var x = 1;
    for (var i = minZoom; i < maxZoom; i++) {
        var w = i * x;
        if (w < minIconSize) {
            w = minIconSize;
        }
        if (w > maxIconSize) {
            w = maxIconSize;
        }
        mapIcons[i] = [w,w];
        x = x*mapItemZoomVal;
    }

    $.getJSON(galaxyJson, function (data) {
        clusters = data;
        var query = getUrlVars();
        if (query["cluster"]) {
            if (query["system"]) {
                initialiseSystemMap(query["cluster"], query["system"]);
            }
            else {
                initialiseClusterMap(query["cluster"]);
            }
        }
        else {
            initialiseGalaxyMap();
        }
        initialiseSearchFunction();
        initialiseTableSearch();
    });

    $("#object-close-btn").click(function () {
        $("#object-pane").hide();
    });
});

// Shared
var mapIcons = {};
var mapType = null;

function imageOrDefault(image_url, default_url) {
    if (missingImages.includes(image_url)) {
        return default_url;
    }
    var http = new XMLHttpRequest();
    http.open('HEAD', image_url, false);
    http.send();
    if (http.status != 404) {
        return image_url;
    }
    else {
        missingImages.push(image_url);
        return default_url;
    }
}

function objectImagePath(type, item, marker) {
    var path = "img\\";
    var dPath = path + (marker ? item.Marker : item.Image);
    var def = getDefaultImagePath(type, item, marker);
        
    if ((marker && item.Marker != null) || (!marker && item.Image != null)) {
        return imageOrDefault(dPath, def);
    }
    return def;
}

function getDefaultImagePath(type, item, marker) {
    var path = "img\\";
    var mark = marker ? "_marker" : "";
    var def = path + "object" + mark + "\\default.png";
    switch (type) {
        case "cluster":
            def = path + "cluster" + mark + "\\default." + (marker ? "png" : "jpg");
            break;
        case "system":
            def = path + "system" + mark + "\\default." + (marker ? "png" : "jpg");
            break;
        case "planet":
            switch (item.Type) {
                case "Star":
                    def = path + "star" + mark + "\\default.png";
                    break;
                case "Garden Planet":
                    def = path + "planet" + mark + "\\default_garden.png";
                    break;
                case "Giant Ice Planet":
                    def = path + "planet" + mark + "\\default_ice.png";
                    break;
                case "Moon":
                case "Planet":
                case "Rock Planet":
                    def = path + "planet" + mark + "\\default_rocky.png";
                    break;
                case "Giant Jovian Planet":
                    def = path + "planet" + mark + "\\default_jovian.png";
                    break;
                case "Post Garden":
                    def = path + "planet" + mark + "\\default_post.png";
                    break;
                case "Desert Planet":
                    def = path + "planet" + mark + "\\default_desert.png";
                    break;
                case "Tidal Lock":
                    def = path + "planet" + mark + "\\default_tidal.png";
                    break;
                case "Ocean Planet":
                    def = path + "planet" + mark + "\\default_ocean.png";
                    break;
                case "Brown Dwarf":
                case "Giant Pegasid Planet":
                    def = path + "planet" + mark + "\\default_dwarf.png";
                    break;
                default:
                    def = path + "object" + mark + "\\default.png";
                    break;
            }
            break;
    }
    return def;
}

function mapItemZoom(zoomLevel) {
    mapItemZoomVal = mapItemZoomVal + (zoomLevel/10);
    sysItemZoomVal = sysItemZoomVal + (zoomLevel/10);
    if (mapType == "galaxy") {
        resizeGalaxyMarkers();
    }
    if (mapType == "cluster") {
        resizeClusterMarkers();
    }
    if (mapType == "system") {
        resizeSystemMarkers();
    }
}

// Object Info
function bindObjectInfo(objectId, systemId, clusterId) {
    var c = clusters.filter(x => x.Id == clusterId)[0];
    var s = c.Systems.filter(x => x.Id == systemId)[0];
    var o = s.Planets.filter(x => x.Id == objectId)[0];
    if (Object.hasOwn(o, "Type")) {
        $("#object-type").html(o.Type);
    }
    else {
        if (o.Type == "mass-relay") {$("#object-type").html("Mass Relay");}
        else if (o.Type == "station") {$("#object-type").html("Station");}
        else if (o.Type == "fuel-depot") {$("#object-type").html("Fuel Depot");}
        else if (o.Type == "star") {$("#object-type").html("Star");}
        else {$("#object-type").html("");}
    }
    if (Object.hasOwn(o, "Image")) {
        $("#object-img").attr("src", objectImagePath("planet", o, false));
    }
    else {
        $("#object-img").attr("src", "");
    }
    
    $("#object-title").html(o.Name);
    $("#info-table").remove();
    if (Object.hasOwn(o, "Description")) {
        $("#object-content").html(o.Description);
    }
    else {
        $("#object-content").html("No information.");
    }

    if (Object.hasOwn(o, "Stats") && o.Stats) {
        var statTable = $("<table id='info-table' class='table card-body w-100 m-0'></table>");
        var statRows = $("<tbody></tbody>");
        for (var k in o.Stats) {
            var headRow = $("<tr><td>" + k + "</td><td>" + o.Stats[k] + "</td></tr>");
            statRows.append(headRow);
        }
        statTable.append(statRows);
        $("#info-body").append(statTable);
    }
    
    $("#object-pane").show();
}

// Search
function sortFunc(x,y) {
    if (x.Name < y.Name) {
        return -1;
    }
    if (x.Name > y.Name) {
        return 1;
    }
    return 0;
}

function initialiseSearchFunction() {
    var regions = ["Attican Traverse","Earth Alliance Space","Inner Council Space","Outer Council Space","Terminus Systems","Unknown"];
    var systemGroups = [];
    var objGroups = [];
    for (var ri in regions) {
        var r = regions[ri];
        var cl = clusters.filter(x => x.Region == r).sort(sortFunc);
        var clusterGrp = $("<optgroup label=\"" + r + "\"></optgroup>");
        for (var ci in cl) {
            var c = cl[ci];
            var cItm = $("<option value='" + c.Id + "' data-content=\"" + c.Name + "<span class='d-none'>" + r + "</span>\" data-group='cluster'>" + c.Name + "</option>");
            clusterGrp.append(cItm);

            if (c.Systems.length > 0) {
                var systemGrp = $("<optgroup label=\"" + c.Name + "\"></optgroup>");
                var sl = c.Systems.sort(sortFunc);
                for (var si in sl) {
                    var s = sl[si];
                    var sItm = $("<option value='" + s.Id + "' data-content=\"" + s.Name + "<span class='d-none'>" + r + " " + c.Name + "</span>\" data-cluster='" + c.Id + "' data-group='system'></option>");
                    systemGrp.append(sItm);

                    if (Object.hasOwn(s, "Planets")) {
                        var objGroup = $("<optgroup = label='" + s.Name + "'></optgroup>");
                        var ol = s.Planets.sort(sortFunc);
                        for (var oi in ol) {
                            var o = ol[oi];
                            if (o.Type != "Star" && o.Type != "Asteroid Belt" && o.Name != null && o.Name != "null") {
                            var oItm = $("<option value='" + o.Id + "' data-content=\"" + o.Name + "<span class='d-none'>" + r + " " + c.Name + " " + s.Name + "</span>\" data-cluster='" + c.Id + "' data-system='" + s.Id + "' data-group='object'></option>")
                            objGroup.append(oItm);
                            }
                        } 
                        objGroups.push(objGroup);
                    }
                }
                systemGroups.push(systemGrp);
            }
        }
        $("#galaxy-search").append(clusterGrp);
    }
    for (var sgi in systemGroups) {
        var sg = systemGroups[sgi];
        $("#galaxy-search").append(sg);
    }
    for (var ogi in objGroups) {
        var og = objGroups[ogi];
        $("#galaxy-search").append(og);
    }
    
    $("#galaxy-search").selectpicker();
    $("#galaxy-search-btn").click(function () {
        var val = $('#galaxy-search :selected').val();
        var group = $('#galaxy-search :selected').attr('data-group');
        var clusterId = $('#galaxy-search :selected').attr('data-cluster');
        var systemId = $('#galaxy-search :selected').attr('data-system');
        goToItem(val, group, clusterId, systemId);
    });
}

function goToItem(val, group, clusterId, systemId) {
    if (val == "") {
        initialiseGalaxyMap();
    }
    if (group == "cluster") {
        if (mapType != "galaxy") {
            initialiseGalaxyMap();
        }
        var marker = galaxyMarkers.filter(x => x.options.clusterId == val)[0];
        var mCoord = marker.getLatLng();
        var mBounds = [mCoord.lat, mCoord.lng];
        galaxyMap.flyTo(mBounds, 12);

        var icon = $(".leaflet-marker-icon[data-bs-original-title='" + marker.options.title + "']");
        icon.popover("show");
    }
    if (group == "system") {
        if (!currentCluster || currentCluster.Id != clusterId || mapType != "cluster") {
            initialiseClusterMap(clusterId);
        }
        var marker = clusterMarkers.filter(x => x.options.systemId == val)[0];
        var mCoord = marker.getLatLng();
        var mBounds = [mCoord.lat, mCoord.lng];
        clusterMap.flyTo(mBounds, 12);

        var icon = $(".leaflet-marker-icon[data-bs-original-title='" + marker.options.title + "']");
        icon.popover("show");
    }
    if (group == "object") {
        if (!currentSystem || currentSystem.Id != systemId || mapType != "system") {
            initialiseSystemMap(clusterId, systemId);
        }
        var marker = systemMarkers.filter(x => x.options.objectId == val)[0];
        var mCoord = marker.getLatLng();
        var mBounds = [mCoord.lat, mCoord.lng];
        systemMap.flyTo(mBounds, 12);

        var icon = $(".leaflet-marker-icon[data-bs-original-title='" + marker.options.title + "']");
        icon.popover("show");
    }
}

function onVisitClick(btn) {
    toggleTableSearch();
    console.log(btn);
    var val = $(btn).data("val");
    var group = $(btn).data("group");
    var clusterId = $(btn).data("cluster");
    var systemId = $(btn).data("system");
    goToItem(val, group, clusterId, systemId);
}

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

// Table
function initialiseTableSearch() {
    var columns = [
        { title: "Image" },
        { title: "Name" },
        { title: "Type" },
        { title: "System" },
        { title: "Cluster" },
        { title: "Region" },
        { title: "Visit" }
    ];

    var dataSet = [];
    for (var c in clusters) 
    {
        var cluster = clusters[c];
        dataSet.push([
            "<object data='img/" + cluster.Marker + "' type='image/png' class='d-block' style='width:28px;height:28px;'><img src='" + getDefaultImagePath("cluster", cluster, true) + "' style='width:28px;height:28px;'/></object>",
            cluster.Name,
            "Cluster",
            "",
            "",
            cluster.Region,
            "<button class='btn btn-sm btn-outline-info' onclick='onVisitClick(this);' data-val='" + cluster.Id + "' data-group='cluster' data-cluster='' data-system=''>Visit</button>"
        ]);

        for (var s in cluster.Systems) 
        {
            var system = cluster.Systems[s];
            dataSet.push([
                "<object data='img/" + system.Marker + "' type='image/png' class='d-block' style='width:28px;height:28px;'><img src='" + getDefaultImagePath("system", system, true) + "' style='width:28px;height:28px;'/></object>",
                system.Name,
                "System",
                "",
                cluster.Name,
                cluster.Region,
                "<button class='btn btn-sm btn-outline-info' onclick='onVisitClick(this);' data-val='" + system.Id + "' data-group='system' data-cluster='" + cluster.Id + "' data-system=''>Visit</button>"
            ]);

            for (var p in system.Planets) 
            {
                var planet = system.Planets[p];
                if (planet.Type != "Asteroid Belt" && planet.Type != "") {
                    dataSet.push([
                        "<object data='img/" + planet.Marker + "' type='image/png' class='d-block' style='width:28px;height:28px;'><img src='" + getDefaultImagePath("planet", planet, true) + "' style='width:28px;height:28px;'/></object>",
                        planet.Name,
                        planet.Type,
                        system.Name,
                        cluster.Name,
                        cluster.Region,
                        "<button class='btn btn-sm btn-outline-info' onclick='onVisitClick(this);' data-val='" + planet.Id + "' data-group='object' data-cluster='" + cluster.Id + "' data-system='" + system.Id + "'>Visit</button>"
                    ]);
                }
            }
        }
    }

    var table = $("#table-obj").DataTable({
        data: dataSet,
        columns: columns,
        responsive: true
    });
    
    $('#table-obj thead th').each( function (i) {
        var title = $('#table-obj thead th').eq($(this).index()).text();
        if (title != "Image" && title != "Visit") {
            var filter = null;
            if (title == "Type") {
                filter = $("<select id='type-table-filter' class='form-control form-control-sm col m-1 selectpicker' data-index='" + i + "' data-live-search='true' data-style='btn-outline-secondary bg-dark'></select>");
                filter.append($("<option value=''>Type</option>"));
                var typeOpts = dataSet.map(function (d) { return d[2]; }).filter(onlyUnique).filter(x => x != "" && x != null);
                for (var t in typeOpts) {
                    filter.append($("<option value='" + typeOpts[t] + "'>" + typeOpts[t] + "</option>"));
                }
                filter.on('change', function () {
                    table.column($(this).data('index')).search(this.value).draw();
                });
            }
            else if (title == "System") {
                filter = $("<select id='system-table-filter' class='form-control form-control-sm col m-1 selectpicker' data-index='" + i + "' data-live-search='true' data-style='btn-outline-secondary bg-dark'></select>");
                filter.append($("<option value=''>System</option>"));
                var typeOpts = dataSet.map(function (d) { return d[3]; }).filter(onlyUnique).filter(x => x != "" && x != null);
                for (var t in typeOpts) {
                    filter.append($("<option value='" + typeOpts[t] + "'>" + typeOpts[t] + "</option>"));
                }
                filter.on('change', function () {
                    table.column($(this).data('index')).search(this.value).draw();
                });
            }
            else if (title == "Cluster") {
                filter = $("<select id='cluster-table-filter' class='form-control form-control-sm col m-1 selectpicker' data-index='" + i + "' data-live-search='true' data-style='btn-outline-secondary bg-dark'></select>");
                filter.append($("<option value=''>Cluster</option>"));
                var typeOpts = dataSet.map(function (d) { return d[4]; }).filter(onlyUnique).filter(x => x != "" && x != null);
                for (var t in typeOpts) {
                    filter.append($("<option value='" + typeOpts[t] + "'>" + typeOpts[t] + "</option>"));
                }
                filter.on('change', function () {
                    table.column($(this).data('index')).search(this.value).draw();
                });
            }
            else if (title == "Region") {
                filter = $("<select id='region-table-filter' class='form-control form-control-sm col m-1 selectpicker' data-index='" + i + "' data-live-search='true' data-style='btn-outline-secondary bg-dark'></select>");
                filter.append($("<option value=''>Region</option>"));
                var typeOpts = dataSet.map(function (d) { return d[5]; }).filter(onlyUnique).filter(x => x != "" && x != null);
                for (var t in typeOpts) {
                    filter.append($("<option value='" + typeOpts[t] + "'>" + typeOpts[t] + "</option>"));
                }
                filter.on('change', function () {
                    table.column($(this).data('index')).search(this.value).draw();
                });
            }
            else {
                filter = $('<input class="form-control form-control-sm col m-1" type="text" placeholder="'+title+'" data-index="'+i+'" />');
                filter.on('keyup', function () {
                    table.column($(this).data('index')).search(this.value).draw();
                });
            }
            $("#table-filter").append(filter);
            if (title == "Type") {
                $("#type-table-filter").selectpicker();
            } 
            if (title == "System") {
                $("#system-table-filter").selectpicker();
            } 
            if (title == "Cluster") {
                $("#cluster-table-filter").selectpicker();
            } 
            if (title == "Region") {
                $("#region-table-filter").selectpicker();
            } 
        }
    } );
}

function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }

function toggleTableSearch() {
    $("#table-pane").toggle();
}
    
// Table 2
// Table

// Breadcrumbs
function setBreadcrumb(galaxy, galaxyName, cluster, clusterName, system, systemName) {
    var container = $("<div class='d-inline-block m-3 text-white' style='font-size:1.6rem;'></div>");
    if (galaxy != null && galaxyName != null) {
        var galContainer = $("<a class='d-inline btn btn-lg text-white' onclick='onVisitClick(this);' data-val='' data-group='galaxy' data-cluster='' data-system=''>" + galaxyName + "</a>");
        if (cluster != null && clusterName != null) {
            var clusterArrow = $("<i class='fas fa-angle-right'></i>");
            galContainer.append(clusterArrow);
        }
        container.append(galContainer);
    }
    if (cluster != null && clusterName != null) {
        var galContainer = $("<a class='d-inline btn btn-lg text-white' onclick='onVisitClick(this);' data-val='" + cluster + "' data-group='cluster' data-cluster='' data-system=''>" + clusterName + "</a>");
        if (system != null && systemName != null) {
            var clusterArrow = $("<i class='fas fa-angle-right'></i>");
            galContainer.append(clusterArrow);
        }
        container.append(galContainer);
    }
    if (system != null && systemName != null) {
        var galContainer = $("<a class='d-inline btn btn-lg text-white' onclick='onVisitClick(this);' data-val='" + system + "' data-group='system' data-cluster='" + cluster + "' data-system=''>" + systemName + "</a>");
        container.append(galContainer);
    }

    $(".leaflet-top.leaflet-left").append(container);
}