$(document).ready(function () {
    $.get({
        url: 'https://raw.githubusercontent.com/Kezyma/AI-Voices/main/Progress/Morrowind.csv',
        success: function (data) {
            createProgressTable("vov-mw-progress", data);
        }
    });
    $.get({
        url: 'https://raw.githubusercontent.com/Kezyma/AI-Voices/main/Progress/Patch%20for%20Purists.csv',
        success: function (data) {
            createProgressTable("vov-pfp-progress", data);
        }
    });
});

function createProgressTable(containerId, tableData) {
    var csvData = $.csv.toObjects(tableData);
    var r = ["Dark Elf", "High Elf", "Wood Elf", "Orc", "Khajiit", "Argonian", "Imperial", "Nord", "Breton", "Redguard"];
    var g = ["Male", "Female"]
    var tt = 0;
    var td = 0;
    var displayData = []
    
    for (var rc in r) {
        var race = r[rc];
        for (var gc in g) {
            var gender = g[gc];
            var val = csvData.filter(x => x["Race"] == race && x["Gender"] == gender)
            var total = val.length
            var done = val.filter(x => x["Done"] == "TRUE" || x["Done"] == "True" || x["Done"] == "true").length;
            var row = [`${race} (${gender})`, total, done, Number(done / total) ]
            displayData.push(row)
            tt += total
            td += done
        }
    }

    var cval = csvData.filter(x => x["Race"] == "" && x["Gender"] == "");
    var ctotal = cval.length;
    var cdone = cval.filter(x => x["Done"] == "TRUE" || x["Done"] == "True" || x["Done"] == "true").length;
    var crow = ["Creature", ctotal, cdone, Number(cdone / ctotal) ]
    displayData.push(crow)
    tt += ctotal;
    td += cdone;
    var totals = [ tt, td, Number(td / tt) ]

    displayData.sort(sortProgressRows)
    var thead = $(`<thead><tr><th>Voice</th><th>Total</th><th>Done</th><th>Progress</th></tr></thead>`);
    var tbody = $(`<tbody></tbody>`)
    for (var ix in displayData) {
        var rowData = displayData[ix]
        var rowClass = rowData[2] == 0 ? "text-danger" :
                        (rowData[1] == rowData[2] ? "text-success" : 
                        (rowData[3] < .5 ? "text-warning" :
                        (rowData[3] >= .5 ? "text-info" :
                        "")));
        var trow = $(`<tr><td class='${rowClass}'>${rowData[0]}</td><td class='${rowClass}'>${rowData[1]}</td><td class='${rowClass}'>${rowData[2]}</td><td class='${rowClass}'>${rowData[3].toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })}</td></tr>`)
        tbody.append(trow)
    }
    var tfoot = $(`<tfoot><th>Total</th><th>${totals[0]}</th><th>${totals[1]}</th><th>${totals[2].toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })}</th></tfoot>`)
    $(`#${containerId}`).append(thead)
    $(`#${containerId}`).append(tbody)
    $(`#${containerId}`).append(tfoot)


}

function sortProgressRows(a, b) {
    if (a[3] < b[3]) {
        return 1;
    }
    else if (a[3] > b[3]) {
        return -1
    }
    else {
        if (a[2] < b[2]) {
            return 1;
        }
        else if (a[2] > b[2]) {
            return -1
        }
        else {
            if (a[1] > b[1]) {
                return 1;
            }
            else if (a[1] < b[1]) {
                return -1
            }
        }
    }
}