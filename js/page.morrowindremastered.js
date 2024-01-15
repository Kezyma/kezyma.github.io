$(document).ready(function () {
    $.getJSON({
        url: "https://raw.githubusercontent.com/Kezyma/Morrowind-Remastered/main/modlist_export.json",
        success: function (data) {
            console.log(data)
            for (var cat in data) {
                if (data[cat].length > 0) {
                    var catHeader = $(`<h4>${cat}</h4>`);
                    var catTable = $(`<table class='table table-sm table-dark table-striped'></table>`)
                    var catHead = $(`<thead><tr><th>Mod</th><th>Notes</th></tr></thead>`)
                    catTable.append(catHead)
                    var catBody = $(`<tbody></tbody>`)
                    catTable.append(catBody)
                    var catMods = 0
                    for (var ix in data[cat]) {
                        var mod = data[cat][ix]
                        var modUrl = ""
                        if (mod["NexusId"] > 0) {
                            modUrl = `https://www.nexusmods.com/${mod["NexusGame"].toLowerCase()}/mods/${mod["NexusId"]}/`
                        }
                        else if (mod["Comments"].length > 0) {
                            modUrl = mod["Comments"]
                        }

                        if (modUrl.length > 0) {
                            var modRow = $(`<tr><td><a href='${modUrl}' target='_blank'>${mod["Name"]}</a></td><td>${mod["Notes"]}</td></tr>`)
                            catBody.append(modRow)
                            catMods++
                        }
                    }
                    if (catMods > 0) {
                        $("#mwr-mod-list").append(catHeader)
                        $("#mwr-mod-list").append(catTable)
                    }
                }
            }
        }
    })
})