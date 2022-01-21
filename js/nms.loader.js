var data = {
    Ships: {
        Starter: [
            {
                File: "/data/nms/Ships/Radiant Pillar BC1.shp",
                Name: "Radiant Pillar BC1",
                AltNames: "",
                StatImage: "/img/nms/Radiant Pillar BC1.jpg",
                Screenshot: "",
                Description: ""
            }
        ],
        Expeditions: [
            {
                File: "/data/nms/Ships/Golden Vector.shp",
                Name: "Golden Vector",
                AltNames: "",
                StatImage: "/img/nms/Golden Vector.jpg",
                Screenshot: "",
                Description: ""
            },
            {
                File: "/data/nms/Ships/Hadach's Discovery KH3 (Expedition).shp",
                Name: "Hadach's Discovery KH3",
                AltNames: "",
                StatImage: "/img/nms/Hadach's Discovery KH3 (Expedition).jpg",
                Screenshot: "",
                Description: ""
            }
        ],
        Twitch: [
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
    bindShips("Expeditions", data.Ships.Expeditions);
    bindShips("Twitch", data.Ships.Twitch);
}

function bindShips(category, data) {
    var container = $("div[data-type='Ships'][data-category='" + category + "']");
    for (var ix in data) {
        var ship = data[ix];
        console.log(ship);
        $.getJSON(ship.File, function (shipJson) {
            var shipName = ship.Name;
            var shipAltName = ship.AltNames;
            var shipStatImg = ship.StatImage;
            var shipClass = shipJson.Ship["@Cs"][";l5"]["B@N"]["1o6"];
            var shipSeed = shipJson.Ship["@Cs"]["NTx"]["@EL"][1];
            var damage = 0, shield = 0, hyperdrive = 0;
            var shipStats = shipJson.Ship["@Cs"][";l5"]["@bB"];
            var shipModel = shipJson.Ship["@Cs"]["NTx"]["93M"];
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
                var statVal = stat[">MX"]
                switch (stat["QL1"]) {
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
            var template = "<div class='col'>";
            template += "<div class='card'>";
            template += "<div class='card-header p-1'>";
            template += "<img src=\"/img/nms/" + shipClass + ".png\" height='48' class='d-inline' />";
            template += "<h4 class='d-inline'>" + shipName + "</h4>";
            template += "</div>";
            template += "<div class='card-body'>";
            template += "</div>";
            template += "<table class='table table-sm m-0'>"
            template += "<tbody>";
            if (shipAltName != null && shipAltName != "") {
                template += "<tr><td>Alt Name</td><td>" + shipAltName + "</td></tr>";
            }
            template += "<tr><td>Type</td><td>" + shipType + "</td></tr>";
            template += "<tr><td>Seed</td><td>" + shipSeed + "</td></tr>";
            template += "<tr><td>Damage Bonus</td><td>" + damage + "</td></tr>";
            template += "<tr><td>Shiled Bonus</td><td>" + shield + "</td></tr>";
            template += "<tr><td>Hyperdrive Bonus</td><td>" + hyperdrive + "</td></tr>";
            template += "</tbody>";
            template += "</table>";
            template += "<img src='" + shipStatImg + "' class='w-100' />";
            template += "</div>";
            template += "</div>";
            container.append($(template));
        });
    }
}


"Ship": {
    "4hl": true,
        "@Cs": {
        "NKm": "",
            "NTx": {
            "93M": "MODELS/COMMON/SPACECRAFT/FIGHTERS/FIGHTER_PROC.SCENE.MBIN",