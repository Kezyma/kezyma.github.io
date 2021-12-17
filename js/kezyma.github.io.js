var pages = [];

function page(id, title, url) {
    return {
        id: id,
        title: title,
        url: url
    };
}

function addPage(page) {
    pages.push(page);
}

function addPages(pageArray) {
    for (var i in pageArray) {
        addPage(pageArray[i]);
    }
}

function pageUrl(id) {
    var query = new URL(location.href);
    query.searchParams.set("p", id)
    return query.href;
}

function initialisePages() {
    window.onpopstate = function (e) {
        if (e.state) {
            window.location.title = e.state.title;
            $("#page-content").html($(e.state.html));
        }
    }

    for (var i in pages) {
        $("a[data-page=" + pages[i].id + "]").click(function () {
            console.log(this);
            loadPage($(this).data("page"), false);
        });
    }

    var id = new URL(location.href).searchParams.get("p");
    if (id != null && id != "") {
        id = "index";
    }
    loadPage(id, true);
}

function loadPage(id, initial) {
    page = pages.filter(x => x.id == id)[0];
    $.get({
        url: page.url,
        success: function (html) {
            $("#page-content").html($(html));
            window.location.title = page.title;
            if (initial) {
                window.history.replaceState({ title: page.title, html: html, id: id }, page.title, pageUrl(id));
            }
            else {
                window.history.pushState({ title: page.title, html: html, id: id }, page.title, pageUrl(id));
            }
        }
    });
}

