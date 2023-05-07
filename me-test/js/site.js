// Page Init
$(document).ready(function () {
    var x = 1;
    for (var i = 8; i < 14; i++) {
        mapIcons[i] = [(i)*x,(i)*x];
        x = x*1.8;
    }

    $.getJSON("./js/galaxy.json", function (data) {
        clusters = data;
        var query = getUrlVars();
        if (query["cluster"]) {
            initialiseClusterMap(query["cluster"]);
        }
        else {
            initialiseGalaxyMap();
        }
        initialiseSearchFunction();
    });
});

// Shared
var mapIcons = {};
var mapType = null;

// Map Data
var clusters = null;

// Galaxy Map
var galaxyMap = null;
var galaxyImg = null;

var showRegions = false;
var galaxyRegionImg = null;

var showColours = false;
var galaxyColoursImg = null;

var showLabels = false;
var galaxyLabelsImg = null;

var showPopovers = false;
var showMarkers = false;
var galaxyMarkers = [];

var showConnections = false;
var galaxyConnections = [];

L.Control.GalaxyToggleControls = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        var labelToggleBtn = L.DomUtil.create('a', 'leaflet-control-button label-toggle-btn', container);
        labelToggleBtn.innerHTML = "<i class='fa-solid fa-tag'></i>";
        labelToggleBtn.title = "Toggle Labels";
        L.DomEvent.disableClickPropagation(labelToggleBtn);
        L.DomEvent.on(labelToggleBtn, 'click', function(){
            if (showPopovers) {
                $(".leaflet-marker-icon").popover("hide");
                showPopovers = false;
            }
            else {
                $(".leaflet-marker-icon").popover("show");
                showPopovers = true;
            }
        });

        var markerToggleBtn = L.DomUtil.create('a', 'leaflet-control-button label-toggle-btn', container);
        markerToggleBtn.innerHTML = "<i class='fa-solid fa-location-dot'></i>";
        markerToggleBtn.title = "Toggle Markers";
        L.DomEvent.disableClickPropagation(markerToggleBtn);
        L.DomEvent.on(markerToggleBtn, 'click', function(){
            toggleGalaxyMarkers();
        });

        var connectionToggleBtn = L.DomUtil.create('a', 'leaflet-control-button label-toggle-btn', container);
        connectionToggleBtn.innerHTML = "<i class='fa-solid fa-arrows-up-down'></i>";
        connectionToggleBtn.title = "Toggle Connections";
        L.DomEvent.disableClickPropagation(connectionToggleBtn);
        L.DomEvent.on(connectionToggleBtn, 'click', function(){
            toggleGalaxyConnections();
        });

        var regionToggleBtn = L.DomUtil.create('a', 'leaflet-control-button label-toggle-btn', container);
        regionToggleBtn.innerHTML = "<i class='fa-regular fa-circle'></i>";
        regionToggleBtn.title = "Toggle Region Outline";
        L.DomEvent.disableClickPropagation(regionToggleBtn);
        L.DomEvent.on(regionToggleBtn, 'click', function(){
            toggleGalaxyRegions();
        });

        var coloursToggleBtn = L.DomUtil.create('a', 'leaflet-control-button label-toggle-btn', container);
        coloursToggleBtn.innerHTML = "<i class='fa-solid fa-circle'></i>";
        coloursToggleBtn.title = "Toggle Region Colours";
        L.DomEvent.disableClickPropagation(coloursToggleBtn);
        L.DomEvent.on(coloursToggleBtn, 'click', function(){
            toggleGalaxyColours();
        });

        var labelsToggleBtn = L.DomUtil.create('a', 'leaflet-control-button label-toggle-btn', container);
        labelsToggleBtn.innerHTML = "<i class='fa-solid fa-font'></i>";
        labelsToggleBtn.title = "Toggle Region Labels";
        L.DomEvent.disableClickPropagation(labelsToggleBtn);
        L.DomEvent.on(labelsToggleBtn, 'click', function(){
            toggleGalaxyLabels();
        });


        return container;
    },
    onRemove: function(map) {},
});

function initialiseGalaxyMap() {
    mapType = "galaxy";
    var url = new URL(window.location.href);
    url.searchParams.delete("cluster"); 
    var newUrl = url.href; 
    window.history.pushState("", "Milky Way", newUrl);

    $(".leaflet-marker-icon").popover("hide");
    showPopovers = false;
    
    $("#galaxy-map").show();
    $("#cluster-map").hide();

    if (!galaxyMap) {
        var mapBounds = [[-1,-1],[1,1]];
        galaxyMap = L.map("galaxy-map", { minZoom: 8, maxZoom: 13, crd: L.CRS.Simple, maxBounds: mapBounds });
        galaxyImg = L.imageOverlay('img/galaxy_milky-way.jpg', mapBounds);
        galaxyImg.addTo(galaxyMap);
        galaxyMap.fitBounds(mapBounds);

        galaxyRegionImg = L.imageOverlay('img/galaxy_milky-way-regions.png', mapBounds);
        galaxyRegionImg.addTo(galaxyMap);
        showRegions = true;
        
        galaxyColoursImg = L.imageOverlay('img/galaxy_milky-way-colours.png', mapBounds);
        galaxyColoursImg.addTo(galaxyMap);
        showColours = true;
        
        galaxyLabelsImg = L.imageOverlay('img/galaxy_milky-way-labels.png', mapBounds);
        galaxyLabelsImg.addTo(galaxyMap);
        showLabels = false;

        initialiseGalaxyMarkers();

        new L.Control.GalaxyToggleControls().addTo(galaxyMap);

        galaxyMap.on("movestart", function () {
            
        });

        galaxyMap.on("moveend", function () {
            $(".leaflet-marker-icon").popover("update");
        });

        galaxyMap.on("zoomstart", function () {
            
        });

        galaxyMap.on("zoomend", function () {
            $(".leaflet-marker-icon").popover("update");
            var zoomLevel = galaxyMap.getZoom();
            var iconSize = mapIcons[zoomLevel];
            for (var ix in galaxyMarkers) {
                var icon = galaxyMarkers[ix].getIcon();
                galaxyMarkers[ix].setIcon(L.icon({ iconUrl: icon.options.iconUrl, iconSize: iconSize}));
            }
        });
    }
}

function calcX(x) {
    return ((x / 1000) * 2) - 1;
}
function calcY(x) {
    return (1 - ((x / 1000) * 2));
}

function initialiseGalaxyMarkers() {
    for (var ix in clusters) {
        var cluster = clusters[ix];
        var cx = calcX(cluster.X);
        var cy = calcY(cluster.Y);
        var marker = L.marker([cy, cx], 
            { 
                icon: L.icon({ iconUrl: cluster.Marker, iconSize: mapIcons[galaxyMap.getZoom()] }), 
                title: cluster.Name, 
                clusterId: cluster.Id,
                riseOnHover: true
            });
        marker.on("click", function () {
            var id = this.options.clusterId;
            initialiseClusterMap(id);
        });
        galaxyMarkers.push(marker);
        marker.addTo(galaxyMap);
    }
    showMarkers = true;

    for (var ix in clusters) {
        var cluster = clusters[ix];
        if (cluster.Connections.length > 0) {
            for (var cix in cluster.Connections) {
                var connectionId = cluster.Connections[cix];
                var connection = clusters.filter(x => x.Id == connectionId)[0];
                if (connection) {
                var cx1 = calcX(cluster.X);
                var cy1 = calcY(cluster.Y);
                var cx2 = calcX(connection.X);
                var cy2 = calcY(connection.Y);
                var coords = [
                    [cy1, cx1],
                    [cy2, cx2]
                ];
                var newLine = L.polyline(coords, { color: "white", noClip: true });
                galaxyConnections.push(newLine);
                newLine.addTo(galaxyMap);
                }
            }
        }
    }
    showConnections = true;

    $(".leaflet-marker-icon").popover({
        trigger: "hover"
    });

    $(".leaflet-marker-icon").on("hidden.bs.popover", function () {
        if (showPopovers) {
           $(this).popover("show");
        }
    });
}

function toggleGalaxyMarkers() {
    if (showMarkers) {
        for (var ix in galaxyMarkers) {
            $(".leaflet-marker-icon").popover("hide");
            galaxyMarkers[ix].remove();
        }
        showMarkers = false;
    }
    else {
        for (var ix in galaxyMarkers) {
            galaxyMarkers[ix].addTo(galaxyMap);
        }
        showMarkers = true;
    }
}

function toggleGalaxyRegions() {
    if (showRegions) {
        galaxyRegionImg.remove();
        showRegions = false;
        galaxyColoursImg.remove();
        showColours = false;
        galaxyLabelsImg.remove();
        showLabels = false;
    }
    else {
        galaxyRegionImg.addTo(galaxyMap);
        showRegions = true;
    }
}

function toggleGalaxyColours() {
    if (showColours) {
        galaxyColoursImg.remove();
        showColours = false;
    }
    else {
        galaxyColoursImg.addTo(galaxyMap);
        showColours = true;
        if (!showRegions) {
            galaxyRegionImg.addTo(galaxyMap);
            showRegions = true;
        }
    }
}

function toggleGalaxyLabels() {
    if (showLabels) {
        galaxyLabelsImg.remove();
        showLabels = false;
    }
    else {
        galaxyLabelsImg.addTo(galaxyMap);
        showLabels = true;
        if (!showRegions) {
            galaxyRegionImg.addTo(galaxyMap);
            showRegions = true;
        }
    }
}

function toggleGalaxyConnections() {
    if (showConnections) {
        for (var ix in galaxyConnections) {
            galaxyConnections[ix].remove();
        }
        showConnections = false;
    }
    else {
        for (var ix in galaxyConnections) {
            galaxyConnections[ix].addTo(galaxyMap);
        }
        showConnections = true;
    }
}

// Cluster Map
var currentCluster = null;

var clusterMap = null;
var clusterImg = null;

var showClusterLabels = false;
var clusterLabelsImg = null;

var showClusterMarkers = false;
var clusterMarkers = [];

function initialiseClusterMap(clusterId) {
    mapType = "cluster";
    var reloadChart = false;
    if (!currentCluster || currentCluster.Id != clusterId) {
        currentCluster = clusters.filter(x => x.Id == clusterId)[0];
        reloadChart = true;
    }
    var cluster = currentCluster;
    var clusterImg = cluster.Image;

    var url = new URL(window.location.href);
    url.searchParams.set("cluster", clusterId); 
    url.searchParams.delete("system"); 
    var newUrl = url.href; 
    window.history.pushState("", cluster.Name, newUrl);

    $(".leaflet-marker-icon").popover("hide");
    showPopovers = false;

    if (reloadChart && clusterMap) {
        clusterMap.remove();
    }
    $("#galaxy-map").hide();
    $("#cluster-map").show();
    
    if (reloadChart) {
        clusterMap = L.map("cluster-map", { minZoom: 8, maxZoom: 13, crd: L.CRS.Simple, maxBounds: [[-1,-1],[1,1]] });
        var bounds = [[-1,-1], [1,1]];
        clusterImg = L.imageOverlay(clusterImg, bounds);
        clusterImg.addTo(clusterMap);
        clusterMap.fitBounds(bounds);

        initialiseClusterMarkers(cluster);
    }
}

function initialiseClusterMarkers(cluster) {
    for (var ix in cluster.Systems) {
        var system = cluster.Systems[ix];
        var cx = calcX(system.X);
        var cy = calcY(system.Y);
        var marker = L.marker([cy, cx], 
            { 
                icon: L.icon({ iconUrl: system.Marker, iconSize: mapIcons[clusterMap.getZoom()] }), 
                title: system.Name, 
                systemId: system.Id,
                riseOnHover: true
            });
        clusterMarkers.push(marker);
        marker.addTo(clusterMap);
    }
    showClusterMarkers = true;

    clusterMap.on("movestart", function () {
            
    });

    clusterMap.on("moveend", function () {
        $(".leaflet-marker-icon").popover("update");
    });

    clusterMap.on("zoomstart", function () {
        
    });

    clusterMap.on("zoomend", function () {
        $(".leaflet-marker-icon").popover("update");
        var zoomLevel = clusterMap.getZoom();
        var iconSize = mapIcons[zoomLevel];
        for (var ix in clusterMarkers) {
            var icon = clusterMarkers[ix].getIcon();
            clusterMarkers[ix].setIcon(L.icon({ iconUrl: icon.options.iconUrl, iconSize: iconSize}));
        }
    });

    $(".leaflet-marker-icon").popover({
        trigger: "hover"
    });

    $(".leaflet-marker-icon").on("hidden.bs.popover", function () {
        if (showPopovers) {
           $(this).popover("show");
        }
    });
}

function returnToGalaxy() {
    clusterMap.remove();
    $("#galaxy-map").show();
    $("#cluster-map").hide();
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
    var regions = {
        "attican-traverse": "Attican Traverse",
        "earth-alliance-space": "Earth Alliance Space",
        "inner-council-space": "Inner Council Space",
        "outer-council-space": "Outer Council Space",
        "terminus-systems": "Terminus Systems"
    };
    var systemGroups = [];
    for (var ri in regions) {
        var r = regions[ri];
        var cl = clusters.filter(x => x.Region == ri).sort(sortFunc);
        var clusterGrp = $("<optgroup label='" + r + "'></optgroup>");
        for (var ci in cl) {
            var c = cl[ci];
            var cItm = $("<option value='" + c.Id + "' data-content='" + c.Name + "<span class=\"d-none\">" + r + "</span>' data-group='cluster'>" + c.Name + "</option>");
            clusterGrp.append(cItm);

            if (c.Systems.length > 0) {
                var systemGrp = $("<optgroup label='" + c.Name + "'></optgroup>");
                var sl = c.Systems.sort(sortFunc);
                for (var si in sl) {
                    var s = sl[si];
                    var sItm = $("<option value='" + s.Id + "' data-content='" + s.Name + "<span class=\"d-none\">" + r + " " + c.Name + "</span>' data-cluster='" + c.Id + "' data-group='system'></option>");
                    systemGrp.append(sItm);
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
    
    $("#galaxy-search").selectpicker();
    $("#galaxy-search-btn").click(function () {
        var val = $('#galaxy-search :selected').val();
        if (val == "") {
            initialiseGalaxyMap();
        }
        var group = $('#galaxy-search :selected').attr('data-group');
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
            var clusterId = $('#galaxy-search :selected').attr('data-cluster');
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
    });
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