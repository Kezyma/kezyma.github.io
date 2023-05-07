// Page Init
$(document).ready(function () {
    var x = 1;
    for (var i = 8; i < 14; i++) {
        mapIcons[i] = [(i)*x,(i)*x];
        x = x*1.8;
    }

    $.getJSON("./js/galaxy.json", function (data) {
        console.log(data);
        clusters = data;
        initialiseGalaxyMap();
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
            $(".leaflet-marker-icon").popover("toggle");
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
    showLabels = true;

    initialiseGalaxyMarkers();

    new L.Control.GalaxyToggleControls().addTo(galaxyMap);

    galaxyMap.on("zoomend", function () {
        $(".leaflet-marker-icon").popover("hide");
        var zoomLevel = galaxyMap.getZoom();
        var iconSize = mapIcons[zoomLevel];
        for (var ix in galaxyMarkers) {
            var icon = galaxyMarkers[ix].getIcon();
            galaxyMarkers[ix].setIcon(L.icon({ iconUrl: icon.options.iconUrl, iconSize: iconSize}));
        }
    });
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
        var marker = L.marker([cy, cx], { icon: L.icon({ iconUrl: cluster.Marker, iconSize: mapIcons[galaxyMap.getZoom()] }), title: cluster.Name, clusterId: cluster.Id });
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
var clusterMap = null;
var clusterImg = null;

var showClusterLabels = false;
var clusterLabelsImg = null;

var showClusterMarkers = false;
var clusterMarkers = [];

function initialiseClusterMap(clusterId) {
    var cluster = clusters.filter(x => x.Id == clusterId)[0];
    var clusterImg = cluster.Image;// "img/cluster_" + clusterId + ".png";

    $("#galaxy-map").hide();
    $("#cluster-map").show();

    clusterMap = L.map("cluster-map", { minZoom: 8, maxZoom: 13, crd: L.CRS.Simple, maxBounds: [[0,0],[1,1]] });
    var bounds = [[0,0], [1,1]];
    clusterImg = L.imageOverlay(clusterImg, bounds);
    clusterImg.addTo(clusterMap);
    clusterMap.fitBounds(bounds);
}

function returnToGalaxy() {
    clusterMap.remove();
    $("#galaxy-map").show();
    $("#cluster-map").hide();
}
