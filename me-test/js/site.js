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
    var url = new URL(window.location.href);
    url.searchParams.delete("cluster"); 
    var newUrl = url.href; 
    window.history.pushState("", "Milky Way", newUrl);
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

    if (reloadChart && clusterMap) {
        clusterMap.remove();
    }

    $("#galaxy-map").hide();
    $("#cluster-map").show();
    if (showPopovers) {
        $(".leaflet-marker-icon").popover("hide");
        showPopovers = false;
    }
    if (reloadChart) {
        clusterMap = L.map("cluster-map", { minZoom: 8, maxZoom: 13, crd: L.CRS.Simple, maxBounds: [[0,0],[1,1]] });
        var bounds = [[0,0], [1,1]];
        clusterImg = L.imageOverlay(clusterImg, bounds);
        clusterImg.addTo(clusterMap);
        clusterMap.fitBounds(bounds);
    }
}

function returnToGalaxy() {
    clusterMap.remove();
    $("#galaxy-map").show();
    $("#cluster-map").hide();
}

// Search
function initialiseSearchFunction() {
    
    var clusterGrp = $("<optgroup label='Clusters'></optgroup>");
    for (var ci in clusters) {
        var c = clusters[ci];
        var cItm = $("<option value='" + c.Id + "' data-group='cluster'>" + c.Name + "</option>");
        clusterGrp.append(cItm);
    }
    $("#galaxy-search").append(clusterGrp);
    $("#galaxy-search").selectpicker();
    $("#galaxy-search-btn").click(function () {
        var val = $('#galaxy-search :selected').val();
        if (val == "") {
            initialiseGalaxyMap();
        }
        var group = $('#galaxy-search :selected').attr('data-group');
        if (group == "cluster") {
            initialiseClusterMap(val);
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