/* ============================================================================
 * kezyma.github.io — application
 * ----------------------------------------------------------------------------
 * Builds the navbar, sidebar and home grid from SITE (config.js), then routes
 * hash URLs (#/<id>) to the matching page, dispatching on page type. Legacy
 * ?p=<id> URLs are translated on load so old links keep working.
 * ========================================================================== */
(function ($) {
    "use strict";

    // ---- lookups -----------------------------------------------------------
    var PAGES = {};
    (SITE.pages || []).forEach(function (p) { PAGES[p.id] = p; });

    var currentPage = null;   // page object for the active route (null = home)

    function catById(id) {
        return (SITE.categories || []).filter(function (c) { return c.id === id; })[0];
    }
    function pagesInCategory(catId) {
        return (SITE.pages || []).filter(function (p) { return p.category === catId && !p.hidden; });
    }
    function ungroupedPages() {
        return (SITE.pages || []).filter(function (p) { return !p.category && !p.hidden; });
    }

    // ---- helpers -----------------------------------------------------------
    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function debounce(fn, wait) {
        var t;
        return function () {
            var ctx = this, args = arguments;
            clearTimeout(t);
            t = setTimeout(function () { fn.apply(ctx, args); }, wait);
        };
    }

    // Render an icon from a "bi-*" (Bootstrap Icons) or "si-*" (Simple Icons) ref.
    // Nexus Mods isn't in Simple Icons, so it ships as a local monochrome SVG.
    function iconHtml(icon, color) {
        if (!icon) return "";
        // icomoon 2-tone brand glyphs (e.g. "icon-discord", "icon-nexus") — used
        // for the social bar; colours are baked into the font CSS.
        if (icon.indexOf("icon-") === 0) {
            return '<span class="' + esc(icon) + '" aria-hidden="true">' +
                   '<span class="path1"></span><span class="path2"></span></span>';
        }
        // Simple Icons (brand logos) by slug
        if (icon.indexOf("si-") === 0) {
            var slug = icon.slice(3);
            var c = color ? "/" + color : "";
            return '<img class="si-icon" alt="" aria-hidden="true" ' +
                   'src="https://cdn.simpleicons.org/' + encodeURIComponent(slug) + c + '">';
        }
        // Bootstrap Icons
        return '<i class="bi ' + esc(icon) + '" aria-hidden="true"></i>';
    }

    function setContent(html) { $("#content").html(html); }

    function spinner(label) {
        return '<div class="text-center py-5 text-secondary">' +
               '<div class="spinner-border mb-3" role="status"></div>' +
               '<div>' + esc(label || "Loading…") + '</div></div>';
    }

    function errorPanel(title, detail) {
        return '<div class="alert alert-danger my-4"><h4 class="alert-heading">' + esc(title) + '</h4>' +
               (detail ? '<p class="mb-0">' + esc(detail) + '</p>' : '') + '</div>';
    }

    function isAbsoluteUrl(u) {
        return !u || /^[a-z][a-z0-9+.-]*:/i.test(u) || u.indexOf("//") === 0 ||
               u.charAt(0) === "#" || u.charAt(0) === "/";
    }

    // ---- navbar + breadcrumb ----------------------------------------------
    function buildNavbar() {
        $("#brand").text(SITE.brand || "");
        document.title = SITE.brand || "";
        var html = (SITE.social || []).map(function (s) {
            return '<li class="nav-item"><a class="nav-link social-link px-2" target="_blank" ' +
                   'rel="noopener" title="' + esc(s.name) + '" aria-label="' + esc(s.name) + '" ' +
                   'href="' + esc(s.url) + '">' + iconHtml(s.icon, "white") + '</a></li>';
        }).join("");
        $("#social-links").html(html);
    }

    function crumbHtml(page) {
        if (!page) return "";
        var sep = '<span class="sep" aria-hidden="true">\\</span>';
        var out = sep;
        if (page.category) {
            var cat = catById(page.category);
            out += '<span class="crumb-cat">' + esc(cat ? cat.name : page.category) + '</span>' + sep;
        }
        out += '<span class="crumb-title">' + esc(page.name) + '</span>';
        return out;
    }

    function isOverflowing(el) { return el.scrollWidth > el.clientWidth + 1; }

    // Build the breadcrumb at full length, then shrink to fit: first drop the
    // category (and its leading separator), then ellipsize the title.
    function renderCrumb() {
        var el = document.getElementById("crumb");
        if (!el) return;
        el.innerHTML = crumbHtml(currentPage);
        var title = el.querySelector(".crumb-title");
        if (!title) return;

        if (isOverflowing(el)) {
            var cat = el.querySelector(".crumb-cat");
            if (cat) {
                cat.style.display = "none";
                var firstSep = el.querySelector(".sep");
                if (firstSep) firstSep.style.display = "none";
            }
        }
        if (isOverflowing(el)) {
            var full = currentPage ? currentPage.name : "";
            var lo = 0, hi = full.length, best = 0;
            while (lo <= hi) {
                var mid = (lo + hi) >> 1;
                title.textContent = full.slice(0, mid).replace(/\s+$/, "") + "…";
                if (isOverflowing(el)) { hi = mid - 1; } else { best = mid; lo = mid + 1; }
            }
            title.textContent = best > 0 ? full.slice(0, best).replace(/\s+$/, "") + "…" : "…";
        }
    }

    // ---- sidebar -----------------------------------------------------------
    function linkHtml(p) {
        return '<a class="sidebar-link" data-id="' + esc(p.id) + '" href="#/' + esc(p.id) + '" ' +
               'title="' + esc(p.name) + '">' + iconHtml(p.icon) +
               '<span class="sidebar-link-label">' + esc(p.name) + '</span></a>';
    }

    function groupHtml(cat, pages) {
        var target = "cat-" + cat.id;
        var links = pages.map(linkHtml).join("");
        return '<div class="sidebar-group">' +
               '<button class="sidebar-cat collapsed" type="button" data-bs-toggle="collapse" ' +
               'data-bs-target="#' + target + '" aria-expanded="false" title="' + esc(cat.name) + '">' +
               iconHtml(cat.icon) + '<span class="sidebar-cat-label">' + esc(cat.name) + '</span>' +
               '<i class="bi bi-chevron-down chevron ms-auto" aria-hidden="true"></i></button>' +
               '<div class="collapse" id="' + target + '">' + links + '</div></div>';
    }

    function buildSidebar() {
        var html = '<a class="sidebar-link sidebar-home" data-id="" href="#/">' +
                   '<span>Home</span></a>';
        (SITE.categories || []).forEach(function (cat) {
            var pages = pagesInCategory(cat.id);
            if (pages.length) html += groupHtml(cat, pages);
        });
        var loose = ungroupedPages();
        if (loose.length) html += '<div class="sidebar-group">' + loose.map(linkHtml).join("") + "</div>";
        $("#sidebar-nav").html(html);
    }

    // Mark the active link; expand only its category group, collapse the others.
    function setActive(id) {
        $(".sidebar-link").removeClass("active");
        var $link = $('.sidebar-link[data-id="' + (id || "") + '"]').addClass("active");
        var activeGroup = $link.closest(".sidebar-group").children(".collapse")[0] || null;
        $(".sidebar-group > .collapse").each(function () {
            var inst = bootstrap.Collapse.getOrCreateInstance(this, { toggle: false });
            if (this === activeGroup) { inst.show(); } else { inst.hide(); }
        });
    }

    // ---- home grid ---------------------------------------------------------
    function cardHtml(p) {
        var fallback = '<div class="page-card-fallback">' + iconHtml(p.icon || "bi-file-earmark") +
                       '<span class="page-card-name">' + esc(p.name) + '</span></div>';
        var img = p.image
            ? '<img src="' + esc(p.image) + '" class="page-card-img" alt="" loading="lazy" onerror="this.remove()">'
            : "";
        return '<div class="col"><a class="card page-card" href="#/' + esc(p.id) + '" ' +
               'title="' + esc(p.name) + '" aria-label="' + esc(p.name) + '">' + fallback + img + "</a></div>";
    }

    function sectionHtml(title, pages) {
        if (!pages.length) return "";
        var cards = pages.map(cardHtml).join("");
        return '<section class="home-section mb-4">' +
               '<h2 class="h4 mb-3">' + esc(title) + "</h2>" +
               '<div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">' + cards + "</div></section>";
    }

    function showHome() {
        document.title = SITE.brand || "";
        var html = "";
        (SITE.categories || []).forEach(function (cat) {
            html += sectionHtml(cat.name, pagesInCategory(cat.id));
        });
        html += sectionHtml("Other", ungroupedPages());
        setContent('<div class="home">' + (html || '<p class="text-secondary">No pages configured yet.</p>') + "</div>");
        window.scrollTo(0, 0);
    }

    // ---- markdown loader ---------------------------------------------------
    function resolveMarkdown(source) {
        if (typeof source === "string") return { url: source, repo: null };
        var branch = source.branch || "main";
        var path = source.path || "README.md";
        return {
            url: "https://raw.githubusercontent.com/" + source.repo + "/" + branch + "/" + path,
            repo: source.repo, branch: branch, path: path
        };
    }

    // GitHub-style heading slug, so in-page "#section" anchors resolve the same
    // way on GitHub and on the site: lower-case, strip punctuation (keep word
    // chars and hyphens), each space -> hyphen, and DON'T collapse repeated
    // hyphens (GitHub keeps them, e.g. "00 - Cursors" -> "00---cursors").
    function slugify(text) {
        return String(text).toLowerCase().trim()
            .replace(/[^\w\s-]/g, "").replace(/\s/g, "-");
    }
    function addHeadingIds($root) {
        var seen = {};
        $root.find("h1,h2,h3,h4,h5,h6").each(function () {
            var base = $(this).attr("id") || slugify($(this).text());
            if (!base) return;
            var id = base, n = 1;
            while (seen[id]) { id = base + "-" + (n++); }
            seen[id] = true;
            $(this).attr("id", id);
        });
    }

    // Rewrite repo-relative <img>/<a> URLs back to the originating GitHub repo.
    function rewriteRepoLinks($root, info) {
        var dir = (info.path || "").replace(/[^\/]*$/, "");          // "docs/" or ""
        var raw = "https://raw.githubusercontent.com/" + info.repo + "/" + info.branch + "/" + dir;
        var blob = "https://github.com/" + info.repo + "/blob/" + info.branch + "/" + dir;
        $root.find("img").each(function () {
            var s = $(this).attr("src");
            if (s && !isAbsoluteUrl(s)) $(this).attr("src", raw + s.replace(/^\.\//, ""));
        });
        $root.find("a").each(function () {
            var h = $(this).attr("href");
            if (h && !isAbsoluteUrl(h)) {
                $(this).attr("href", blob + h.replace(/^\.\//, ""));
            } else if (h && h.charAt(0) !== "#") {
                $(this).attr("target", "_blank").attr("rel", "noopener");
            }
        });
    }

    function renderMarkdown(md, info) {
        var dirty = marked.parse(md, { gfm: true, breaks: false });
        var clean = DOMPurify.sanitize(dirty, { ADD_ATTR: ["target"] });
        var $article = $('<article class="markdown-body"></article>').html(clean);
        addHeadingIds($article);
        if (info.repo) rewriteRepoLinks($article, info);
        $("#content").empty().append($article);
        if (window.Prism) Prism.highlightAllUnder(document.getElementById("content"));
        bindFancybox();
        window.scrollTo(0, 0);
    }

    function loadMarkdown(page) {
        setContent(spinner("Loading " + page.name + "…"));
        var info = resolveMarkdown(page.source);
        $.ajax({ url: info.url, dataType: "text", cache: true })
            .done(function (md) { renderMarkdown(md, info); })
            .fail(function () {
                // repo default branch may be "master" rather than "main" — retry once
                if (info.repo && info.branch === "main") {
                    info.branch = "master";
                    info.url = "https://raw.githubusercontent.com/" + info.repo + "/master/" + info.path;
                    $.ajax({ url: info.url, dataType: "text", cache: true })
                        .done(function (md) { renderMarkdown(md, info); })
                        .fail(function () { setContent(errorPanel("Couldn't load this page", info.url)); });
                } else {
                    setContent(errorPanel("Couldn't load this page", info.url));
                }
            });
    }

    // ---- html loader -------------------------------------------------------
    function loadHtml(page) {
        setContent(spinner("Loading " + page.name + "…"));
        $.ajax({ url: page.source, dataType: "html", cache: true })
            .done(function (html) {
                // Passing a jQuery object makes jQuery execute embedded <script> tags,
                // so interactive fragments keep working (as on the original site).
                $("#content").empty().append($(html));
                if (window.Prism) Prism.highlightAllUnder(document.getElementById("content"));
                bindFancybox();
                window.scrollTo(0, 0);
            })
            .fail(function () { setContent(errorPanel("Couldn't load this page", page.source)); });
    }

    // ---- redirect ----------------------------------------------------------
    function doRedirect(page) {
        var url = page.source;
        if (page.newTab) {
            setContent('<div class="py-5 text-center"><p class="lead">Opening <strong>' + esc(page.name) +
                       "</strong> in a new tab…</p>" +
                       '<a class="btn btn-primary" target="_blank" rel="noopener" href="' + esc(url) + '">' +
                       iconHtml("bi-box-arrow-up-right") + " Open " + esc(page.name) + "</a></div>");
            window.open(url, "_blank", "noopener");
        } else {
            setContent('<div class="py-5 text-center text-secondary"><div class="spinner-border mb-3"></div>' +
                       "<p>Redirecting to <strong>" + esc(page.name) + "</strong>…</p>" +
                       '<a class="btn btn-primary" href="' + esc(url) + '">Continue</a></div>');
            window.location.href = url;
        }
    }

    function bindFancybox() {
        if (window.Fancybox) Fancybox.bind("#content [data-fancybox]", {});
    }

    // ---- router ------------------------------------------------------------
    function currentId() {
        var h = window.location.hash || "";
        if (h.indexOf("#/") === 0) return decodeURIComponent(h.slice(2));
        return "";
    }

    function route() {
        var id = currentId();
        var page = id ? PAGES[id] : null;
        currentPage = page;
        setActive(id);
        renderCrumb();
        if (!id) return showHome();
        if (!page) {
            document.title = SITE.brand || "";
            setContent(errorPanel("Page not found", 'No page is configured for "' + id + '" yet.'));
            return;
        }
        document.title = page.name + " · " + SITE.brand;
        if (page.type === "redirect") return doRedirect(page);
        if (page.type === "html") return loadHtml(page);
        if (page.type === "markdown") return loadMarkdown(page);
        setContent(errorPanel("Unknown page type", String(page.type)));
    }

    // Translate a legacy ?p=<id> URL into the new scheme. Returns true if it
    // navigated away (caller should not route).
    function handleLegacyQuery() {
        var p = new URLSearchParams(window.location.search).get("p");
        if (p === null) return false;
        var map = SITE.legacyMap || {};
        var mapped = (p in map) ? map[p] : p;
        var clean = window.location.pathname;
        if (mapped === "" || PAGES[mapped]) {
            window.history.replaceState(null, "", clean + "#/" + mapped);
            return false;
        }
        // Not migrated yet — fall back to the archived site, which still
        // understands ?p=<id>.
        window.location.replace(".old/?p=" + encodeURIComponent(p));
        return true;
    }

    // In-page anchor links inside rendered content (e.g. a doc's contents menu)
    // must scroll, not be treated as routes — and must not overwrite the #/page
    // hash. Route links (#/...) are left alone.
    function onContentAnchorClick(e) {
        var href = $(this).attr("href") || "";
        if (href.charAt(0) !== "#" || href.indexOf("#/") === 0) return;
        var id = decodeURIComponent(href.slice(1));
        if (!id) return;
        var target = document.getElementById(id);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    // Close the mobile sidebar after navigating.
    function closeSidebarOnNav() {
        $("#sidebar-nav").on("click", "a.sidebar-link", function () {
            var el = document.getElementById("sidebar");
            var oc = bootstrap.Offcanvas.getInstance(el);
            if (oc) oc.hide();
        });
    }

    // Keep --kz-navbar-h in sync with the real navbar height (offsets depend on it).
    function syncNavbarH() {
        var nav = document.querySelector(".navbar");
        if (nav) document.documentElement.style.setProperty("--kz-navbar-h", nav.offsetHeight + "px");
    }

    // ---- boot --------------------------------------------------------------
    $(function () {
        if (window.Prism && Prism.plugins && Prism.plugins.autoloader) {
            Prism.plugins.autoloader.languages_path =
                "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/";
        }
        buildNavbar();
        buildSidebar();
        closeSidebarOnNav();
        syncNavbarH();
        $("#content").on("click", "a", onContentAnchorClick);
        $(window).on("hashchange", route);
        $(window).on("resize", debounce(function () { syncNavbarH(); renderCrumb(); }, 150));
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () { syncNavbarH(); renderCrumb(); });
        }
        if (!handleLegacyQuery()) route();
    });

})(jQuery);
