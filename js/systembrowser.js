$("#systemExportSelect").change(function (evt) {
    var file = evt.target.files[0];
    bindToFile(file);
});

function bindToFile(file) {
    $("#systemExportSelect").val("");
    var reader = new FileReader();
    reader.onload = function (event) {
        var systemList = JSON.parse(event.target.result);
        bindList(systemList);
    };
    reader.readAsText(file);
}

var systemTable;

function bindList(systemList) {

    var systemRows = systemList.map(function (systemItem) {
        var systemRow = {
            "seed": systemItem.Seed,
            "address": systemItem.Address,
            "aliens": systemItem.AlienRace,
            "trading": systemItem.Class,
            "conflictRaw": systemItem.Conflict,
            "conflict": getStarIcons(systemItem.Conflict),
            "wealthRaw": systemItem.Wealth,
            "wealth": getStarIcons(systemItem.Wealth),
            "starTypeRaw": systemItem.StarType,
            "starType": getStarIcon(systemItem.StarType),
            "planetsRaw": systemItem.Planets.length - systemItem.Moons,
            "planets": systemItem.Planets.filter(p => p.Size != "Moon").map(function (planetItem) {
                return getPlanetIcon(planetItem.Size, planetItem.Rings);
            }).join(''),
            "moonsRaw": systemItem.Moons,
            "moons": systemItem.Planets.filter(p => p.Size == "Moon").map(function (planetItem) {
                return getPlanetIcon(planetItem.Size, planetItem.Rings);
            }).join(''),
            "abandoned": systemItem.Abandoned,
            "glyphs": getGlyphs(systemItem.Address),
        };
        return systemRow;
    });

    systemTable = $('#systemTable').dynatable({
        dataset: {
            records: systemRows,
            defaultColumnIdStyle: 'noStyle'
        }
    }).data('dynatable');
}

$(".system-filter").change(function () {
    var value = $(this).val();
    var filter = $(this).data("filter");
    if (value === "") {
        systemTable.queries.remove(filter);
    } else {
        systemTable.queries.add(filter, value);
    }
    systemTable.process();
});


function getPlanetIcon(size, rings) {
    var i = "<i class='nms-planet ";
    switch (size) {
        case "Large":
            i += "nms-large";
            break;
        case "Medium":
            i += "nms-medium";
            break;
        case "Small":
            i += "nms-small";
            break;
        case "Moon":
            i += "nms-moon";
            break;
        default:
            i += "";
            break;
    }
    if (rings) {
        i += "-rings";
    }
    return i + "'></i>";
}

function getStarIcon(colour) {
    var s = "<i class='nms-star";
    switch (colour) {
        case "Yellow":
            s += " nms-yellow";
            break;
        case "Red":
            s += " nms-red";
            break;
        case "Blue":
            s += " nms-blue";
            break;
        case "Green":
            s += " nms-green";
            break;
    }
    return s + "'></i>";
}

function getStarIcons(input) {
    var output = "<i class='nms-stars'>";
    switch (input) {
        case "Low":
        case "Poor":
            output += "★";
            break;
        case "Average":
        case "Default":
            output += "★★";
            break;
        case "High":
        case "Wealthy":
            output += "★★★";
            break;
        default:
            break;
    }
    return output + "</i>";
}

function getGlyphs(address) {
    var glyphs = "";
    for (var i = 0; i < Array.from(address).length; i++) {
        var char = address[i];
        glyphs += "<img src='/img/nms/glyphs/" + char + ".png' height='34' style='filter: invert(.5);' />";
    }
    return glyphs;
}