var data = {
    Ships: {
        Starter: [
            {
                File: "data/nms/Ships/Radiant Pillar BC1.shp",
                Name: "Radiant Pillar BC1",
                AltName: "",
                StatImage: "img/nms/Radiant Pillar BC1.jpg",
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
    var container = $("div[data-type='Ships'][data-type='" + category + "']");
    for (var ship in data) {
        var shipJson = $.getJSON(ship.File);
        var shipClass = shipJson["Ship"]["@Cs"][";l5"]["B@N"]["1o6"];
        console.log(shipClass);
    }
}