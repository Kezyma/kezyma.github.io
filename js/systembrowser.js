
// Bind initial json file.
var systemJson;

$("#systemExportSelect").change(function (evt) {
    var file = evt.target.files[0];
    bindToFile(file);
});

function bindToFile(file) {
    $("#systemExportSelect").val("");
    var reader = new FileReader();
    reader.onload = function (event) {
        systemJson = JSON.parse(event.target.result);
        bindSystems(systemJson);
    };
    reader.readAsText(file);
}

// Bind systems table.
var systemTable;

function bindSystems(systemList) {
    systemTable = $("#systemTable").DataTable({
        data: systemList,
        responsive: true,
        initComplete: function () {
            $(".system-filter").change(function () {
                var value = $(this).val();
                var filter = $(this).data("filter");
                systemTable.column(filter).search(value).draw();
            });
        },
        select: "single",
        columns: [
            { data: "Seed", title: "Seed" },
            {
                title: "Aliens",
                data: function (row, type, set, meta) {
                    switch (type) {
                        case "display":
                            return getRaceIcon(row.AlienRace, row.Abandoned);
                        default:
                            return row.AlienRace;
                    }
                }
            },
            { data: "Class", title: "Trading" },
            {
                title: "Conflict",
                data: function (row, type, set, meta) {
                    switch (type) {
                        case "display":
                            return getStarIcons(row.Conflict);
                        case "sort":
                            return getStarNum(row.Conflict);
                        default:
                            return row.Conflict;
                    }
                }
            },
            {
                title: "Wealth",
                data: function (row, type, set, meta) {
                    switch (type) {
                        case "display":
                            return getStarIcons(row.Wealth);
                        case "sort":
                            return getStarNum(row.Wealth);
                        default:
                            return row.Wealth;
                    }
                }
            },
            {
                title: "Star",
                data: function (row, type, set, meta) {
                    switch (type) {
                        case "display":
                            return getStarIcon(row.StarType);
                        default:
                            return row.StarType;
                    }
                }
            },
            {
                title: "Planets",
                data: function (row, type, set, meta) {
                    switch (type) {
                        case "display":
                            return row.Planets.filter(p => p.Size != "Moon").map(function (planetItem) {
                                return getPlanetIcon(planetItem.Size, planetItem.Rings);
                            }).join('');
                        default:
                            return row.Planets.length - row.Moons;
                    }
                }
            },
            {
                title: "Moons",
                data: function (row, type, set, meta) {
                    switch (type) {
                        case "display":
                            return row.Planets.filter(p => p.Size == "Moon").map(function (planetItem) {
                                return getPlanetIcon(planetItem.Size, planetItem.Rings);
                            }).join('');
                        default:
                            return row.Moons;
                    }
                }
            },
            { data: "Abandoned", title: "Abandoned", visible: false },
            {
                title: "Glyphs",
                data: function (row, type, set, meta) {
                    switch (type) {
                        case "display":
                            return getGlyphs(row.Address);
                        default:
                            return row.Address;
                    }
                }
            },
            {
                title: "Biomes",
                visible: false,
                data: function (row, type, set, meta) {
                    return "|" + row.Planets.map(p => p.Biome).filter((v, i, a) => a.indexOf(v) === i).join("|") + "|";
                }
            },
            {
                title: "Sub-Biomes",
                visible: false,
                data: function (row, type, set, meta) {
                    return "|" + row.Planets.map(p => p.SubBiome).filter((v, i, a) => a.indexOf(v) === i).join("|") + "|";
                }
            },
            {
                title: "Terrain",
                visible: false,
                data: function (row, type, set, meta) {
                    return "|" + row.Planets.map(p => p.Terrain).filter((v, i, a) => a.indexOf(v) === i).join("|") + "|";
                }
            },
            {
                title: "Flora",
                visible: false,
                data: function (row, type, set, meta) {
                    return "|" + row.Planets.map(p => p.FloraLevel).filter((v, i, a) => a.indexOf(v) === i).join("|") + "|";
                }
            },
            {
                title: "Fauna",
                visible: false,
                data: function (row, type, set, meta) {
                    return "|" + row.Planets.map(p => p.FaunaLevel).filter((v, i, a) => a.indexOf(v) === i).join("|") + "|";
                }
            },
            {
                title: "Sentinels",
                visible: false,
                data: function (row, type, set, meta) {
                    return "|" + row.Planets.map(p => p.Sentinels).filter((v, i, a) => a.indexOf(v) === i).join("|") + "|";
                }
            }
        ]
    });

    systemTable.on("select", function (e, dt, type, indexes) {
        var planets = systemTable.rows(indexes).data().pluck("Planets")[0];
        bindPlanets(planets);
    });
}

var planetTable;

function bindPlanets(planetList) {
    if (planetTable == null || planetTable == undefined) {
        planetTable = $("#planetTable").DataTable({
            data: planetList,
            responsive: true,
            select: "single",
            columns: [
                { data: "Index", title: "#" },
                { data: "Name", title: "Name" },
                { data: "Biome", title: "Biome" },
                { data: "SubBiome", title: "Sub-Biome" },
                { data: "Terrain", title: "Terrain" },
                { data: "Weather", title: "Weather" },
                {
                    title: "Size",
                    data: function (row, type, set, meta) {
                        switch (type) {
                            case "display":
                                return getPlanetIcon(row.Size, row.Rings) + " " + row.Size;
                            default:
                                return row.Size;
                        }
                    }
                },
                { data: "FloraLevel", title: "Flora" },
                { data: "FaunaLevel", title: "Fauna" },
                { data: "Sentinels", title: "Sentinels" }
            ]
        });

        planetTable.on("select", function (e, dt, type, indexes) {
            var creatures = planetTable.rows(indexes).data().pluck("Creatures")[0];
            bindCreatures(creatures);
        });
    }
    else {
        planetTable.clear().rows.add(planetList).draw();
    }
}

var creatureTable;

function bindCreatures(creatureList) {
    if (creatureTable == null || creatureTable == undefined) {
        creatureTable = $("#creatureTable").DataTable({
            data: creatureList,
            responsive: true,
            select: "single",
            columns: [
                { data: "Index", title: "#" },
                { data: "Seed", title: "Seed" },
                { data: "Value", title: "Creature" },
                { data: "Type", title: "Type" },
                { data: "Rarity", title: "Rarity" }
            ]
        });
    }
    else {
        creatureTable.clear().rows.add(creatureList).draw();
    }
}


// Format table columns.
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

function getStarNum(input) {
    switch (input) {
        case "Low":
        case "Poor":
            return 1;
        case "Average":
        case "Default":
            return 2;
        case "High":
        case "Wealthy":
            return 3;
        default:
            return 0;
    }
}

function getGlyphs(address) {
    var glyphs = "";
    for (var i = 0; i < Array.from(address).length; i++) {
        var char = address[i];
        glyphs += "<img src='/img/nms/glyphs/" + char + ".png' height='32' class='nms-invert' />";
    }
    return glyphs;
}

function getRaceIcon(race, abandoned) {
    switch (race) {
        case "None":
            return "-";
        default:
            var img = "<img src=\"/img/nms/races/" + encodeURI(race) + ".png\" height='32' class='nms-invert' />";
            if (abandoned == 1) {
                img += "<i class='nms-abandoned'>❌</i>";
            }
            return img;
    }
}