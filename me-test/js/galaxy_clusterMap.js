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
        clusterMap = L.map("cluster-map", { minZoom: 8, maxZoom: 13, crd: L.CRS.Simple, maxBounds: [[-1,-1],[1,1]] });
        var bounds = [[-1,-1], [1,1]];
        clusterImg = L.imageOverlay(imageOrDefault("img/" + clusterImg, "img/cluster/default.jpg"), bounds);
        clusterImg.addTo(clusterMap);
        clusterMap.fitBounds(bounds);
        clusterMap.zoomIn();

        initialiseClusterMarkers(cluster);
        new L.Control.ClusterToggleControls().addTo(clusterMap);
    }
}

function initialiseClusterMarkers(cluster) {
    for (var ix in cluster.Systems) {
        var system = cluster.Systems[ix];
        var cx = calcX(system.X);
        var cy = calcY(system.Y);
        var marker = L.marker([cy, cx], 
            { 
                icon: L.icon({ iconUrl: imageOrDefault("img/" + system.Marker, "img/system_marker/default.png"), iconSize: mapIcons[clusterMap.getZoom()] }), 
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

    clusterMap.on("movestart", function () {
            
    });

    clusterMap.on("moveend", function () {
        $(".leaflet-marker-icon").popover("update");
    });

    clusterMap.on("zoomstart", function () {
        
    });

    clusterMap.on("zoomend", function () {
        resizeClusterMarkers();
    });

    $(".leaflet-marker-icon").popover({
        trigger: "hover"
    });

    //$(".leaflet-marker-icon").on("hidden.bs.popover", function () {
    //    if (showPopovers) {
    //       $(this).popover("show");
    //    }
    //});
}

function resizeClusterMarkers() {
    $(".leaflet-marker-icon").popover("update");
    var zoomLevel = clusterMap.getZoom();
    var iconSize = mapIcons[zoomLevel];
    for (var ix in clusterMarkers) {
        var icon = clusterMarkers[ix].getIcon();
        clusterMarkers[ix].setIcon(L.icon({ iconUrl: icon.options.iconUrl, iconSize: iconSize}));
    }
}

function returnToGalaxy() {
    clusterMap.remove();
    $("#galaxy-map").show();
    $("#cluster-map").hide();
}