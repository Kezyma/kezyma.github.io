// Page template system.
// Declare pages using pages.add("pageId","Page Title","pagepath.html");
// Default pageId is 'index'.
// Then initialise with pages.init("containerId");
// Add data-page="pageId" to a tags for them to load that page.

var pages = {
    items: [],
    container: {},
    add: function (id, title, url) {
        pages.items.push({ id: id, title: title, url: url});
    },
    url: function (id) {
        var query = new URL(location.href);
        query.searchParams.set("p", id)
        return query.href;
    },
    init: function (containerId) {
        pages.container = $("#" + containerId);

        window.onpopstate = function (e) {
            if (e.state) {
                pages.update(e.state.title, e.state.html);
            }
        }

        pages.bind();

        var id = new URL(location.href).searchParams.get("p");
        if (id == null || id == "") {
            id = "index";
        }
        pages.load(id, true);
    },
    load: function (id, initial) {
        var p = pages.items.filter(x => x.id == id)[0];
        $.get({
            url: p.url,
            success: function (html) {
                pages.update(p.title, html);
                if (initial) {
                    window.history.replaceState({ title: p.title, html: html, id: id }, p.title, pages.url(id));
                }
                else {
                    window.history.pushState({ title: p.title, html: html, id: id }, p.title, pages.url(id));
                }
            }
        });
    },
    update: function (title, html) {
        window.location.title = title;
        pages.container.html($(html));
        $("title").text(title);
        pages.rebind();
    },
    bind: function () {
        for (var i in pages.items) {
            $("a[data-page=" + pages.items[i].id + "]").click(function (e) {
                e.preventDefault();
                pages.load($(this).data("page"), false);
            });
        }
        Prism.highlightAll();
    },
    rebind: function () {
        for (var i in pages.items) {
            pages.container.find("a[data-page=" + pages.items[i].id + "]").click(function (e) {
                e.preventDefault();
                pages.load($(this).data("page"), false);
            });
        }
        Prism.highlightAll();
    }
}

