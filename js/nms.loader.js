var data = {
    Ships: {
        Starter: [
            {
                File: "/data/nms/Ships/Radiant Pillar BC1.shp",
                Name: "Radiant Pillar BC1",
                AltName: "",
                StatImage: "/img/nms/Radiant Pillar BC1.jpg",
                Screenshot: "",
                Description: ""
            }
        ],
        Expeditions: [],
        Twitch: []
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
            template += "<div class='card-header'>";
            template += "<img src='/img/nms/" + shipClass + ".png' />";
            template += "<h5>" + ship.Name + "</h5>";
            template += "</div>";
            template += "<div class='card-body'>";
            template += "</div>";
            template += "<img src='" + ship.StatImage + "' class='w-100' />";
            template += "</div>";
            template += "</div>";
            container.append($(template));
        });
    }
}