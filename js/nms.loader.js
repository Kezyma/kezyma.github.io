var data = {
    Ships: {
        Starter: [
            {
                File: "/data/nms/Ships/Radiant Pillar BC1.shp",
                Name: "Radiant Pillar BC1",
                AltNames: "",
                StatImage: "/img/nms/Radiant Pillar BC1.jpg",
                Screenshot: "",
                Description: "NEXT starter ship. Versions 1.5 - current."
            }
        ],
        PreOrder: [
            {
                File: "/data/nms/Ships/Horizon Omega.shp",
                Name: "Horizon Omega",
                AltNames: "",
                StatImage: "/img/nms/Horizon Omega.jpg",
                Screenshot: "",
                Description: "PC preorder reward."
            }
        ],
        Expeditions: [
            {
                File: "/data/nms/Ships/Golden Vector.shp",
                Name: "Golden Vector",
                AltNames: "",
                StatImage: "/img/nms/Golden Vector.jpg",
                Screenshot: "",
                Description: "Final reward from Expedition 1: The Pioneers."
            },
            {
                File: "/data/nms/Ships/Hadach's Discovery KH3 (Expedition).shp",
                Name: "Hadach's Discovery KH3",
                AltNames: "",
                StatImage: "/img/nms/Hadach's Discovery KH3 (Expedition).jpg",
                Screenshot: "",
                Description: "Reward from Expedition 2: Beachhead Phase 2 Completion."
            }
        ],
        Twitch: [
            {
                File: "/data/nms/Ships/Eokai's Prime Inquirer.shp",
                Name: "Eokai's Prime Inquirer",
                AltNames: "",
                StatImage: "/img/nms/Eokai's Prime Inquirer.jpg",
                Screenshot: "",
                Description: "Twitch Season 1, Day 1 drop."
            },
            {
                File: "/data/nms/Ships/Hoshis HP7.shp",
                Name: "Hoshis HP7",
                AltNames: "",
                StatImage: "/img/nms/Hoshis HP7.jpg",
                Screenshot: "",
                Description: "Twitch Season 1, Day 2 drop."
            },
            {
                File: "/data/nms/Ships/Nemesis of the Kudama.shp",
                Name: "Nemesis of the Kudama",
                AltNames: "",
                StatImage: "/img/nms/Nemesis of the Kudama.jpg",
                Screenshot: "",
                Description: "Twitch Season 1, Day 3 drop."
            },
            {
                File: "/data/nms/Ships/Ultimate Pride JB2.shp",
                Name: "Ultimate Pride JB2",
                AltNames: "",
                StatImage: "/img/nms/Ultimate Pride JB2.jpg",
                Screenshot: "",
                Description: "Twitch Season 1, Day 4 drop."
            },
            {
                File: "/data/nms/Ships/Prime Song JZ4.shp",
                Name: "Prime Song JZ4",
                AltNames: "",
                StatImage: "/img/nms/Prime Song JZ4.jpg",
                Screenshot: "",
                Description: "Twitch Season 1, Day 5 drop."
            },
            {
                File: "/data/nms/Ships/VV5 Ariyaz.shp",
                Name: "VV5 Ariyaz",
                AltNames: "",
                StatImage: "/img/nms/VV5 Ariyaz.jpg",
                Screenshot: "",
                Description: "Twitch Season 3, Day 1 drop."
            },
            {
                File: "/data/nms/Ships/Hiwamiha of Destiny.shp",
                Name: "Hiwamiha of Destiny",
                AltNames: "",
                StatImage: "/img/nms/Hiwamiha of Destiny.jpg",
                Screenshot: "",
                Description: "Twitch Season 3, Day 2 drop."
            },
            {
                File: "/data/nms/Ships/Ultimate Sleep LO1.shp",
                Name: "Ultimate Sleep LO1",
                AltNames: "",
                StatImage: "/img/nms/Ultimate Sleep LO1.jpg",
                Screenshot: "",
                Description: "Twitch Season 3, Day 3 drop."
            },
            {
                File: "/data/nms/Ships/Jirishi's Prospect.shp",
                Name: "Jirishi's Prospect",
                AltNames: "",
                StatImage: "/img/nms/Jirishi's Prospect.jpg",
                Screenshot: "",
                Description: "Twitch Season 3, Day 4 drop."
            },
            {
                File: "/data/nms/Ships/Hadach's Discovery KH3 (Twitch).shp",
                Name: "Hadach's Discovery KH3",
                AltNames: "",
                StatImage: "/img/nms/Hadach's Discovery KH3 (Twitch).jpg",
                Screenshot: "",
                Description: "Twitch Season 3, Day 5 drop."
            }
        ]
    },
    Multitools: {
        Starter: [],
        Expeditions: [],
        Twitch: []
    },
    Companions: {
        Expeditions: [],
        Twitch: []
    }
};

$(document).ready(function () {
    bindData();
});

function bindData() {
    bindShips("Starter", data.Ships.Starter);
    bindShips("PreOrder", data.Ships.PreOrder);
    bindShips("Expeditions", data.Ships.Expeditions);
    bindShips("Twitch", data.Ships.Twitch);
}

function bindShip(ship, container) {
    $.getJSON(ship.File, function (shipJson) {
        var shipName = ship.Name;
        var shipAltName = ship.AltNames;
        var shipStatImg = ship.StatImage;
        var shipClass = shipJson.Ship["@Cs"][";l5"]["B@N"]["1o6"];
        var shipSeed = shipJson.Ship["@Cs"]["NTx"]["@EL"][1];
        var damage = 0.0, shield = 0.0, hyperdrive = 0.0;
        var shipStats = shipJson.Ship["@Cs"][";l5"]["@bB"];
        var shipModel = shipJson.Ship["@Cs"]["NTx"]["93M"];
        var inventorySlots = shipJson["@Cs"][";l5"]["hl?"].length;
        var techSlots = shipJson["@Cs"]["PMT"]["hl?"].length;
        var shipType = "Unknown";
        switch (shipModel) {
            case "MODELS/COMMON/SPACECRAFT/FIGHTERS/FIGHTER_PROC.SCENE.MBIN":
                shipType = "Fighter";
                break;
            case "MODELS/COMMON/SPACECRAFT/SCIENTIFIC/SCIENTIFIC_PROC.SCENE.MBIN":
                shipType = "Explorer";
                break;
            case "MODELS/COMMON/SPACECRAFT/SHUTTLE/SHUTTLE_PROC.SCENE.MBIN":
                shipType = "Shuttle";
                break;
            case "MODELS/COMMON/SPACECRAFT/DROPSHIPS/DROPSHIP_PROC.SCENE.MBIN":
                shipType = "Hauler";
                break;
            case "MODELS/COMMON/SPACECRAFT/FIGHTERS/FIGHTERCLASSICGOLD.SCENE.MBIN":
                shipType = "Unique Fighter";
                break;
        }
        for (var stat in shipStats) {
            var statVal = shipStats[stat][">MX"]
            switch (shipStats[stat]["QL1"]) {
                case "^SHIP_DAMAGE":
                    damage = statVal;
                    break;
                case "^SHIP_SHIELD":
                    shield = statVal;
                    break;
                case "^SHIP_HYPERDRIVE":
                    hyperdrive = statVal;
                    break;
            }
        }
        var template = "<div class='col d-flex'>";
        template += "<div class='card mb-4'>";
        template += "<div class='card-header p-1'>";
        template += "<img src=\"/img/nms/" + shipClass + ".png\" height='48' class='d-inline' />";
        template += "<h4 class='d-inline'>" + shipName + "</h4>";
        template += "</div>";
        template += "<img src=\"" + encodeURI(shipStatImg) + "\" class='w-100' />";
        template += "<div class='card-body'><i>" + ship.Description + "</i></div>";
        template += "<table class='table table-sm m-0'>"
        template += "<tbody>";
        if (shipAltName != null && shipAltName != "") {
            template += "<tr><td>Alt Name</td><td>" + shipAltName + "</td></tr>";
        }
        template += "<tr><td>Type</td><td>" + shipType + "</td></tr>";
        template += "<tr><td>Seed</td><td>" + shipSeed + "</td></tr>";
        template += "<tr><td>Slots</td><td>" + inventorySlots + " + " + techSlots + "</td></tr>";
        template += "<tr><td>Damage Bonus</td><td>" + damage + "</td></tr>";
        template += "<tr><td>Shield Bonus</td><td>" + shield + "</td></tr>";
        template += "<tr><td>Hyperdrive Bonus</td><td>" + hyperdrive + "</td></tr>";
        template += "</tbody>";
        template += "</table>";
        template += "<div class='card-footer'><a href=\"" + encodeURI(ship.File) + "\" class='btn btn-sm btn-success'><i class='fa fa-download'></i> Download</a></div>";
        template += "</div>";
        template += "</div>";
        container.append($(template));
    });
}

function bindShips(category, data) {
    var container = $("div[data-type='Ships'][data-category='" + category + "']");
    for (var ix in data) {
        var ship = data[ix];
        bindShip(ship, container);
    }
}