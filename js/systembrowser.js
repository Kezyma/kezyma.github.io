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
            "conflict": systemItem.Conflict,
            "wealth": systemItem.Wealth,
            "starType": systemItem.StarType,
            "planets": systemItem.Planets.length,
            "moons": systemItem.Moons,
            "abandoned": systemItem.Abandoned,
        };
        var glyphs = "";
        for (var i = 0; i < Array.from(systemItem.Address).length; i++) {
            var char = systemItem.Address[i];
            glyphs += "<img src='/img/nms/glyphs/" + char + ".png' height='32' style='filter: invert(.2);' />";
        }
        systemRow["glyphs"] = glyphs;
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


$("#systemTable .td").click(function () {
    console.log($(this));
})

//function generateSystemList(systemList) {
//    table = "<table>";
//    table += "<thead>";

//    table += "</thead>";
//    table += "<tbody>";
//    table += "</tbody>";
//    table += "</table>";
//}