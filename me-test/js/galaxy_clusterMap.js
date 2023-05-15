var currentCluster = null;

var clusterMap = null;
var clusterImg = null;

var showClusterLabels = false;
var clusterLabelsImg = null;

var showClusterMarkers = false;
var clusterMarkers = [];

L.Control.ClusterToggleControls = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        var backBtn = L.DomUtil.create('a', 'leaflet-control-button label-toggle-btn', container);
        backBtn.innerHTML = "<i class='fa-solid fa-angles-left'></i>";
        backBtn.title = "Back";
        L.DomEvent.disableClickPropagation(backBtn);
        L.DomEvent.on(backBtn, 'click', function(){
            initialiseGalaxyMap();
        });

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

        return container;
    },
    onRemove: function(map) {},
});

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
    $("#system-map").hide();
    $("#cluster-map").show();
    
    if (reloadChart) {
        clusterMap = L.map("cluster-map", { minZoom: minZoom, maxZoom: maxZoom, crd: L.CRS.Simple, maxBounds: [[-1,-1],[1,1]] });
        var bounds = [[-1,-1], [1,1]];
        clusterImg = L.imageOverlay(objectImagePath("cluster", cluster, false), bounds);
        clusterImg.addTo(clusterMap);
        clusterMap.fitBounds(bounds);
        clusterMap.zoomIn();

        initialiseClusterMarkers(cluster);
        new L.Control.ClusterToggleControls().addTo(clusterMap);
    }
}

function initialiseClusterMarkers(cluster) {
    clusterMarkers = [];
    for (var ix in cluster.Systems) {
        var system = cluster.Systems[ix];
        var cx = calcX(system.X);
        var cy = calcY(system.Y);
        var marker = L.marker([cy, cx], 
            { 
                icon: L.icon({ iconUrl: objectImagePath("system", system, true), iconSize: mapIcons[clusterMap.getZoom()] }), 
                title: system.Name, 
                systemId: system.Id,
                riseOnHover: true
            });
        marker.on("click", function () {
            var id = this.options.systemId;
            initialiseSystemMap(currentCluster.Id, id);
        });
        clusterMarkers.push(marker);
        marker.addTo(clusterMap);
    }
    showClusterMarkers = true;

    clusterMap.on("moveend", function () {
        $(".leaflet-marker-icon").popover("update");
    });

    clusterMap.on("zoomend", function () {
        if (clusterMap.getZoom() == maxZoom) {
            zoomToSystem();
            clusterMap.zoomOut();
        }
        if (clusterMap.getZoom() == minZoom) {
            zoomToGalaxy();
            clusterMap.zoomIn();
        }
        resizeClusterMarkers();
    });

    $(".leaflet-marker-icon").popover({
        trigger: "hover"
    });
}

function resizeClusterMarkers() {
    $(".leaflet-marker-icon").popover("update");
    var zoomLevel = clusterMap.getZoom();
    var iconSize = mapIcons[zoomLevel];
    for (var ix in clusterMarkers) {
        var icon = clusterMarkers[ix].getIcon();
        icon.options.iconSize = iconSize;
        clusterMarkers[ix].setIcon(icon);
    }
}

function returnToGalaxy() {
    clusterMap.remove();
    $("#galaxy-map").show();
    $("#cluster-map").hide();
}

function zoomToGalaxy() {
    initialiseGalaxyMap();
}

function zoomToSystem() {
    initialiseSystemMap(currentCluster.Id, findClusterCenter());
}

function findClusterCenter() {
    var closest = 1000000;
    var center = clusterMap.getBounds();
    var mid = [ (center.getNorth() + center.getSouth())/2, (center.getEast() + center.getWest())/2 ];
    var bestMarker = null;
    for (var m in clusterMarkers) {
        var dist = clusterMarkers[m].getLatLng().distanceTo(mid);
        if (dist < closest) {
            closest = dist;
            bestMarker = clusterMarkers[m];
        }
    }
    return bestMarker.options.systemId;
}