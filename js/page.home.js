var docCats = {
    "plugin": "Mod Organizer Plugins",
    "morrowind": "Morrowind Mods",
    "tool": "Modding Tools",
    "wabbajack": "Wabbajack Lists",
    "patch": "Other Patches & Fixes"
}

$(document).ready(function () {
    var container = $("#kh-container");
    for (var cat in docCats) {
        var title = docCats[cat]
        var items = $(`.k-nav[data-category=${cat}]`)
        container.append($(`<h2 class='pt-3'>${title}</h2>`));
        var catRow = $(`<div class="row row-cols-2 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4"></div>`);
        container.append(catRow);

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var id = $(item).data("page")
            var name = $(item).text()
            var col = $("<div class='col mb-2'></div>");
            var card = $(`<a class='card k-click' onclick='navigate("${id}")'></a>`);
            var img = $(`<img src='img/nexus/thumb/${id}.jpg' class='card-img' alt='${name}'>`);
            card.append(img)
            col.append(card)
            catRow.append(col)
        }
    }
});