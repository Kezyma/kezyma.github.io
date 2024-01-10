var markerToggleOn = true;
var map = true;
function createMap(divId, tilePath) {
	var mapExtent = [0, -21248, 12800, 0];
	var mapMinZoom = 0;
	var mapMaxZoom = 7;
	var mapMinResolution = Math.pow(2, mapMaxZoom);
	var crs = L.CRS.Simple;
	crs.transformation = new L.Transformation(1, -mapExtent[0], -1, mapExtent[3]);
	crs.scale=function(zoom){return Math.pow(2, zoom)/mapMinResolution;};
	crs.zoom=function(scale){return Math.log(scale*mapMinResolution)/Math.LN2;};
	map = new L.Map(divId,{maxZoom: mapMaxZoom*2,minZoom: mapMinZoom,crs: crs});
	var layer = L.tileLayer(tilePath + '{z}/{x}/{y}.png',{minZoom:mapMinZoom,maxNativeZoom:mapMaxZoom,maxZoom:mapMaxZoom*2,noWrap:true,tms:false}).addTo(map);
	map.fitBounds([crs.unproject(L.point(mapExtent[2], mapExtent[3])),crs.unproject(L.point(mapExtent[0], mapExtent[1]))]);
	var mwIcon = L.icon({iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVQYlWP8//8/Az7AwsDAwLBtfg5WVV6JUxhZkDnIkjBNTHjNp4oCuBtwOZSRkDcBN3gQz2TuJ5cAAAAASUVORK5CYII=' });
	var doorMarkers = new L.FeatureGroup();
	var cellMarkers = new L.FeatureGroup();
	try { 
		if (mapCells != null) { 
			for (var ix in mapCells) { 
				L.marker([((mapCells[ix].Grid[1])*256)-128, ((mapCells[ix].Grid[0])*256)+128], {icon: mwIcon}).addTo(cellMarkers).bindTooltip(mapCells[ix].Name);
			}
		}
	}
	catch {}
	try { 
		if (mapDoors != null) { 
			for (var ix in mapDoors) { 
				L.marker([((mapDoors[ix].Grid[1])*256)-256, ((mapDoors[ix].Grid[0])*256)], {icon: mwIcon}).addTo(doorMarkers).bindTooltip(mapDoors[ix].Name);
			}
		}
	}
	catch {}
	if (map.getZoom() >= mapMaxZoom) { doorMarkers.addTo(map); }
	else { cellMarkers.addTo(map); }
	map.on('zoomend', function () {
		if (markerToggleOn) {
			if (map.getZoom() >= mapMaxZoom) { map.addLayer(doorMarkers); map.removeLayer(cellMarkers); }
			else { map.addLayer(cellMarkers); map.removeLayer(doorMarkers); }
		}
	});
	L.Control.MarkerToggle = L.Control.extend({ 
		options: {position: 'topleft'},
		onAdd: function (map) { 
			var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
			container.style.fontSize = '1rem';
			container.innerHTML = "<i class='fa-solid fa-location-dot'></i>";
			container.style.backgroundColor = 'white';
			container.style.width = '30px';
			container.style.height = '30px';
			container.style.lineHeight = '30px';
			container.style.textAlign = 'center';
			container.onclick = function () { 
				if (markerToggleOn == true) { map.removeLayer(cellMarkers); map.removeLayer(doorMarkers); markerToggleOn = false; }
				else if (map.getZoom() >= mapMaxZoom) { map.addLayer(doorMarkers); markerToggleOn = true; }
				else { map.addLayer(cellMarkers); markerToggleOn = true; }
			}
			return container;
		}
	});
	var markerToggle = new L.Control.MarkerToggle({position:'topleft'}).addTo(map);
}
