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

// Fields for PF Generator
const versionRegex = /^([0-9]+)[.]?([0-9]*)[.]?([0-9]*)[.]?([0-9]*)?[._\-]?([A-Za-z0-9]*)/g;
const exampleJson = {
    "Name": "Plugin Template",
    "Author": "Kezyma",
    "Description": "This is a template for a plugin json file to be used with Plugin Finder.",
    "DocsUrl": "https://kezyma.github.io/?p=pluginfinder",
    "NexusUrl": "https://www.nexusmods.com/skyrimspecialedition/mods/59869",
    "GithubUrl": "https://github.com/Kezyma/ModOrganizer-Plugins",
    "Versions": [
        {
            "Version": "1.1.0a",
            "Released": "2021-12-13",
            "MinSupport": "2.4.2",
            "MaxSupport": "2.4.2",
            "MinWorking": "2.4.0",
            "MaxWorking": "",
            "ReleaseNotes": ["Initial alpha. Demo version."],
            "DownloadUrl": "https://github.com/Kezyma/ModOrganizer-Plugins/releases/download/pluginfinder/pluginfinder.1.1.0.zip",
            "PluginPath": ["pluginfinder"],
            "LocalePath": [],
            "DataPath": ["data/pluginfinder"]
        }
    ]
}

var loadedJson = JSON.parse("{}");