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
        $.getJSON(ship.File, function (shipJson) {
            var shipClass = shipJson.Ship["@Cs"][";l5"]["B@N"]["1o6"];
            var shipSeed = shipJson.Ship["@Cs"]["NTx"]["@EL"][1];
            var damage = 0, shield = 0, hyperdrive = 0;
            var shipStats = shipJson.Ship["@Cs"][";l5"]["@bB"];
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
            template += "<img src='/img/nms/" + shipClass + ".png' height='48' class='d-inline' />";
            template += "<h4 class='d-inline'>" + ship.Name + "</h4>";
            template += "</div>";
            template += "<div class='card-body'>";
            template += "<table class='table'>"
            template += "<tbody>";
            if (ship.AltNames != null && ship.AltNames != "") {
                template += "<tr><td>Alt Name</td><td>" + ship.AltNames + "</td></tr>";
            }
            template += "<tr><td>Seed</td><td>" + shipSeed + "</td></tr>";
            template += "<tr><td>Damage Bonus</td><td>" + damage + "</td></tr>";
            template += "<tr><td>Shiled Bonus</td><td>" + shield + "</td></tr>";
            template += "<tr><td>Hyperdrive Bonus</td><td>" + hyperdrive + "</td></tr>";
            template += "</tbody>";
            template += "</table>";
            template += "</div>";
            template += "<img src='" + ship.StatImage + "' class='w-100' />";
            template += "</div>";
            template += "</div>";
            container.append($(template));
        });
    }
}