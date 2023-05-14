var currentSystem = null;

var systemMap = null;
var systemImg = null;

var showSystemLabels = false;
var systemLabelsImg = null;

var showSystemMarkers = false;
var systemMarkers = [];
var showSystemOrbits = false;
var systemOrbits = [];

L.Control.SystemToggleControls = L.Control.extend({
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
            initialiseClusterMap(getUrlVars()["cluster"]);
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

        var orbitToggleBtn = L.DomUtil.create('a', 'leaflet-control-button label-toggle-btn', container);
        orbitToggleBtn.innerHTML = "<i class='fa-regular fa-circle'></i>";
        orbitToggleBtn.title = "Toggle Orbits";
        L.DomEvent.disableClickPropagation(orbitToggleBtn);
        L.DomEvent.on(orbitToggleBtn, 'click', function(){
            toggleSystemOrbits();
        });
        return container;
    },
    onRemove: function(map) {},
});

function initialiseSystemMap(clusterId, systemId) {
    mapType = "system";
    var reloadChart = false;
    var cluster = clusters.filter(x => x.Id == clusterId)[0];
    if (!currentSystem || currentSystem.Id != systemId) {
        currentSystem = cluster.Systems.filter(x => x.Id == systemId)[0];
        reloadChart = true;
    }
    var system = currentSystem;
    var systemImage = null;
    if (Object.hasOwn(system, "Image")) {
        systemImage = system.Image;
    }
    systemImage = imageOrDefault(systemImage, "img/system/default.jpg");

    var url = new URL(window.location.href);
    url.searchParams.set("system", systemId);
    url.searchParams.set("cluster", clusterId);
    var newUrl = url.href; 
    window.history.pushState("", system.Name, newUrl);

    $(".leaflet-marker-icon").popover("hide");
    showPopovers = false;

    if (reloadChart && systemMap) {
        systemMap.remove();
    }
    $("#galaxy-map").hide();
    $("#cluster-map").hide();
    $("#system-map").show();
    
    if (reloadChart) {
        var imgBounds = [[-2,-2],[2,2]];
        systemMap = L.map("system-map", { minZoom: 8, maxZoom: 13, crd: L.CRS.Simple, maxBounds: imgBounds });
        var bounds = [[-1,-1], [1,1]];
        if (systemImage) {
            systemImg = L.imageOverlay(systemImage, imgBounds);
            systemImg.addTo(systemMap);
        }
        systemMap.fitBounds(bounds);

        initialiseSystemMarkers(system, cluster);
        new L.Control.SystemToggleControls().addTo(systemMap);
    }
}

function initialiseSystemMarkers(system, cluster) {
    systemMarkers = [];
    systemOrbits = [];
    for (var ix in system.Planets) {
        var obj = system.Planets[ix];
        var isStar = obj.Type == "Star";
        var isBelt = obj.AsteroidBelt == true;
        var cx = calcX(obj.X);
        var cy = calcY(obj.Y);
        var scale = ((((Object.hasOwn(obj, "Scale") ? obj.Scale: 1) - 1)/2) + 1) * (isStar ? 2 : 1);
        var size = objIcons[systemMap.getZoom()];
        if (obj.Scale > 0) {
            var marker = "";
            if (isStar) {
                marker = imageOrDefault("img/" + obj.Marker, "img/star_marker/default.png")
            }
            else {
                marker = imageOrDefault("img/" + obj.Marker, "img/planet_marker/default.png");
            }
            var marker = L.marker([cy, cx], 
                { 
                    icon: L.icon({ iconUrl: marker, iconSize: [ size[0] * scale, size[1] * scale ] }), 
                    title: obj.Name, 
                    objectId: obj.Id,
                    systemId: system.Id,
                    clusterId: cluster.Id,
                    star: isStar,
                    scale: scale,
                    riseOnHover: true
                });
            marker.on("click", function () {
                var id = this.options.objectId;
                var sId = this.options.systemId;
                var cId = this.options.clusterId;
                bindObjectInfo(id, sId, cId);
            });
            systemMarkers.push(marker);
            marker.addTo(systemMap);
        }

        var center = L.latLng(0,0);
        var planet = L.latLng(cy, cx);
        var distance = center.distanceTo(planet);
        if (!Object.hasOwn(obj, "ShowOrbit") || obj.ShowOrbit == true) {
            if (Object.hasOwn(obj, "Orbits")) {
                var orb = obj.Orbits;
                var cen = system.Planets.filter(x => x.Id == orb)[0];
                var ox = calcX(cen.X);
                var oy = calcY(cen.Y);
                center = L.latLng(oy,ox);
                distance = center.distanceTo(planet);
            }
            var orbit = L.circle(center, distance, {
                color: "#fff",
                weight: 1,
                fill: false,
                dashArray: isBelt ? "50 25" : null
            });
            systemOrbits.push(orbit);
            orbit.addTo(systemMap);
        }
    }
    showClusterMarkers = true;
    showSystemOrbits = true;

    systemMap.on("movestart", function () {
            
    });

    systemMap.on("moveend", function () {
        $(".leaflet-marker-icon").popover("update");
    });

    systemMap.on("zoomstart", function () {
        
    });

    systemMap.on("zoomend", function () {
        resizeSystemMarkers();
    });

    $(".leaflet-marker-icon").popover({
        trigger: "hover"
    });

    //$(".leaflet-marker-icon").on("hidden.bs.popover", function () {
    //   if (showPopovers) {
    //       $(this).popover("show");
    //    }
    //});
}

function resizeSystemMarkers()
{
    $(".leaflet-marker-icon").popover("update");
    var zoomLevel = systemMap.getZoom();
    var iconSize = objIcons[zoomLevel];
    for (var ix in systemMarkers) {
        var icon = systemMarkers[ix].getIcon();
        var scale = systemMarkers[ix].options.scale;
        systemMarkers[ix].setIcon(L.icon({ iconUrl: imageOrDefault(icon.options.iconUrl, "img/object_marker/default.png"), iconSize: [ iconSize[0] * scale, iconSize[1] * scale ]}));
    }
}

function toggleSystemOrbits() {
    if (showSystemOrbits) {
        for (var ix in systemOrbits) {
            systemOrbits[ix].remove();
        }
        showSystemOrbits = false;
    }
    else {
        for (var ix in systemOrbits) {
            systemOrbits[ix].addTo(systemMap);
        }
        showSystemOrbits = true;
    }
}