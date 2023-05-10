// Page Init
$(document).ready(function () {
    var x = 1;
    for (var i = 8; i < 14; i++) {
        mapIcons[i] = [(i)*x,(i)*x];
        x = x*1.9;
    }
    x = 1;
    for (var i = 8; i < 14; i++) {
        objIcons[i] = [(i)*x,(i)*x];
        x = x*1.9;
    }

    $.getJSON("./js/galaxy.json", function (data) {
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
    });

    $("#object-close-btn").click(function () {
        $("#object-pane").hide();
    });
});

// Shared
var mapIcons = {};
var objIcons = {};
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
    url.searchParams.delete("system"); 
    var newUrl = url.href; 
    window.history.pushState("", "Milky Way", newUrl);

    $(".leaflet-marker-icon").popover("hide");
    showPopovers = false;
    
    $("#galaxy-map").show();
    $("#cluster-map").hide();
    $("#system-map").hide();

    if (!galaxyMap) {
        var mapBounds = [[-1,-1],[1,1]];
        galaxyMap = L.map("galaxy-map", { minZoom: 8, maxZoom: 13, crd: L.CRS.Simple, maxBounds: mapBounds });
        galaxyImg = L.imageOverlay('img/galaxy/galaxy_milky-way.jpg', mapBounds);
        galaxyImg.addTo(galaxyMap);
        galaxyMap.fitBounds(mapBounds);

        galaxyRegionImg = L.imageOverlay('img/galaxy/galaxy_milky-way-regions.png', mapBounds);
        galaxyRegionImg.addTo(galaxyMap);
        showRegions = true;
        
        galaxyColoursImg = L.imageOverlay('img/galaxy/galaxy_milky-way-colours.png', mapBounds);
        galaxyColoursImg.addTo(galaxyMap);
        showColours = true;
        
        galaxyLabelsImg = L.imageOverlay('img/galaxy/galaxy_milky-way-labels.png', mapBounds);
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
                var newLine = L.polyline(coords, { color: "white", noClip: true, weight: 1 });
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
        clusterImg = L.imageOverlay(clusterImg, bounds);
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
                icon: L.icon({ iconUrl: system.Marker, iconSize: mapIcons[clusterMap.getZoom()] }), 
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

    //$(".leaflet-marker-icon").on("hidden.bs.popover", function () {
    //    if (showPopovers) {
    //       $(this).popover("show");
    //    }
    //});
}

function returnToGalaxy() {
    clusterMap.remove();
    $("#galaxy-map").show();
    $("#cluster-map").hide();
}

// System Map
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
    for (var ix in system.Objects) {
        var obj = system.Objects[ix];
        var cx = calcX(obj.X);
        var cy = calcY(obj.Y);
        var scale = (((Object.hasOwn(obj, "Scale") ? obj.Scale: 1) - 1)/2) + 1;
        var size = objIcons[systemMap.getZoom()];
        var marker = L.marker([cy, cx], 
            { 
                icon: L.icon({ iconUrl: obj.Marker, iconSize: [ size[0] * scale, size[1] * scale ] }), 
                title: obj.Name, 
                objectId: obj.Id,
                systemId: system.Id,
                clusterId: cluster.Id,
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

        var center = L.latLng(0,0);
        var planet = marker.getLatLng();
        var distance = center.distanceTo(planet);
        var orbit = L.circle([0,0], distance, {
            color: "#fff",
            weight: 1,
            fill: false
        });
        systemOrbits.push(orbit);
        orbit.addTo(systemMap);
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
        $(".leaflet-marker-icon").popover("update");
        var zoomLevel = systemMap.getZoom();
        var iconSize = objIcons[zoomLevel];
        for (var ix in systemMarkers) {
            var icon = systemMarkers[ix].getIcon();
            var scale = systemMarkers[ix].options.scale;
            systemMarkers[ix].setIcon(L.icon({ iconUrl: icon.options.iconUrl, iconSize: [ iconSize[0] * scale, iconSize[1] * scale ]}));
        }
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

// Object Info
function bindObjectInfo(objectId, systemId, clusterId) {
    var c = clusters.filter(x => x.Id == clusterId)[0];
    var s = c.Systems.filter(x => x.Id == systemId)[0];
    var o = s.Objects.filter(x => x.Id == objectId)[0];
    if (Object.hasOwn(o, "PlanetType")) {
        $("#object-type").html(o.PlanetType);
    }
    else {
        if (o.Type == "mass-relay") {$("#object-type").html("Mass Relay");}
        else if (o.Type == "station") {$("#object-type").html("Station");}
        else if (o.Type == "fuel-depot") {$("#object-type").html("Fuel Depot");}
        else if (o.Type == "star") {$("#object-type").html("Star");}
        else {$("#object-type").html("");}
    }
    if (Object.hasOwn(o, "Image")) {
        $("#object-img").attr("src", o.Image);
    }
    else {
        $("#object-img").attr("src", "");
    }
    
    $("#object-title").html(o.Name);
    if (Object.hasOwn(o, "ME3")) {
        var parts = o.ME3.split("\n").join("<br/>");
        $("#object-content").html(parts);
    }
    else {
        $("#object-content").html("No information.");
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
    var regions = {
        "attican-traverse": "Attican Traverse",
        "earth-alliance-space": "Earth Alliance Space",
        "inner-council-space": "Inner Council Space",
        "outer-council-space": "Outer Council Space",
        "terminus-systems": "Terminus Systems"
    };
    var systemGroups = [];
    var objGroups = [];
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

                    if (Object.hasOwn(s, "Objects")) {
                        var objGroup = $("<optgroup = label='" + s.Name + "'></optgroup>");
                        var ol = s.Objects.sort(sortFunc);
                        for (var oi in ol) {
                            var o = ol[oi];
                            if (o.Type == "planet" || o.Type == "mass-relay" || o.Type == "station") {
                                var oItm = $("<option value='" + o.Id + "' data-content='" + o.Name + "<span class=\"d-none\">" + r + " " + c.Name + " " + s.Name + "</span>' data-cluster='" + c.Id + "' data-system='" + s.Id + "' data-group='object'></option>")
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
        if (group == "object") {
            var clusterId = $('#galaxy-search :selected').attr('data-cluster');
            var systemId = $('#galaxy-search :selected').attr('data-system');
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

    