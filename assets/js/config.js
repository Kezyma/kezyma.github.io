/* ============================================================================
 * kezyma.github.io — site configuration
 * ----------------------------------------------------------------------------
 * This single object drives the whole site: the navbar, the sidebar menu, the
 * home page card grid and every routed page. To add a page, add one entry to
 * `pages` (and a `categories` entry if it needs a new group). Nothing else
 * needs to change.
 *
 * PAGE TYPES
 *   markdown : render a Markdown document into the main content area.
 *             `source` is either a local path ("content/foo.md") OR a repo
 *             object { repo:"owner/name", branch:"main", path:"README.md" }
 *             which is fetched from GitHub and rendered (links/images that are
 *             relative are rewritten back to the repo automatically).
 *   html     : load a local HTML fragment into the main content area. Embedded
 *             <script> tags run, so interactive pages work here.
 *   redirect : send the visitor to `source` (an internal or external URL).
 *             Set `newTab:true` to open in a new tab instead.
 *
 * PAGE FIELDS
 *   id       : unique slug; the hash route is #/<id>. (Kept matching the old
 *             site's ?p=<id> values where a page existed before, so old links
 *             still resolve.)
 *   name     : shown as the title, the sidebar label and the card caption
 *   category : id of a category in `categories` (omit for an ungrouped page)
 *   type     : "markdown" | "html" | "redirect"
 *   source   : path / repo object / URL (see PAGE TYPES)
 *   icon     : "bi-*" (Bootstrap Icons), "icon-*" (icomoon brand glyphs, used
 *             for the social bar) or "si-*" (Simple Icons brand logos)
 *   image    : optional image URL for the home card (falls back to icon + name)
 *   newTab   : redirect pages only — open in a new tab
 *   hidden   : routable but kept out of the sidebar and home grid
 * ========================================================================== */

const SITE = {
    brand: "kezyma.github.io",

    // Rendered as the original colourful icomoon brand glyphs in the top navbar.
    social: [
        { name: "Discord", url: "https://discord.gg/kPA3RrxAYz", icon: "icon-discord" },
        { name: "Nexus Mods", url: "https://www.nexusmods.com/morrowind/users/20136784", icon: "icon-nexus" },
        { name: "GitHub", url: "https://github.com/Kezyma", icon: "icon-github" },
        { name: "Patreon", url: "https://www.patreon.com/KezymaOnline", icon: "icon-patreon" },
        { name: "PayPal", url: "https://www.paypal.me/Kezyma", icon: "icon-paypal" },
        { name: "YouTube", url: "https://www.youtube.com/channel/UCPjvoIpS30gJ3PwDjVcHjuA", icon: "icon-youtube" },
        { name: "Twitch", url: "https://www.twitch.tv/kezymaonline", icon: "icon-twitch" }
    ],

    // Sidebar groups / home sections, in display order. (Empty categories are
    // skipped automatically.)
    categories: [
        { id: "mod-organizer", name: "Mod Organizer" },
        { id: "morrowind", name: "Morrowind" },
        { id: "misc", name: "Miscellaneous" },
        { id: "tools", name: "Tools" },
        { id: "skyrim", name: "Skyrim" },
        { id: "new-vegas", name: "Fallout New Vegas" },
        { id: "starfield", name: "Starfield" }
    ],

    pages: [
        {
            id: "rootbuilder",
            name: "Root Builder",
            category: "mod-organizer",
            type: "markdown",
            source: {
                repo: "Kezyma/ModOrganizer-Plugins",
                branch: "main",
                path: "docs/rootbuilder.md"
            },
            image: "img/thumb/root-builder.png"
        },
        {
            id: "profilesync",
            name: "Profile Sync",
            category: "mod-organizer",
            type: "markdown",
            source: {
                repo: "Kezyma/ModOrganizer-Plugins",
                branch: "main",
                path: "docs/profilesync.md"
            },
            image: "img/thumb/profile-sync.png"
        },
        {
            id: "reinstaller",
            name: "Reinstaller",
            category: "mod-organizer",
            type: "markdown",
            source: {
                repo: "Kezyma/ModOrganizer-Plugins",
                branch: "main",
                path: "docs/reinstaller.md"
            },
            image: "img/thumb/reinstaller.png"
        },
        {
            id: "shortcutter",
            name: "Shortcutter",
            category: "mod-organizer",
            type: "markdown",
            source: {
                repo: "Kezyma/ModOrganizer-Plugins",
                branch: "main",
                path: "docs/shortcutter.md"
            },
            image: "img/thumb/shortcutter.png"
        },
        {
            id: "pluginfinder",
            name: "Plugin Finder",
            category: "mod-organizer",
            type: "markdown",
            source: {
                repo: "Kezyma/ModOrganizer-Plugins",
                branch: "main",
                path: "docs/pluginfinder.md"
            },
            image: "img/thumb/plugin-finder.png"
        },
        {
            id: "openmwplayer",
            name: "OpenMW Player",
            category: "mod-organizer",
            type: "markdown",
            source: {
                repo: "Kezyma/ModOrganizer-Plugins",
                branch: "main",
                path: "docs/openmwplayer.md"
            },
            image: "img/thumb/openmw-player.png"
        },
        {
            id: "curationclub",
            name: "Curation Club",
            category: "mod-organizer",
            type: "markdown",
            source: {
                repo: "Kezyma/ModOrganizer-Plugins",
                branch: "main",
                path: "docs/curationclub.md"
            },
            image: "img/thumb/curation-club.png"
        },
        {
            id: "listexporter",
            name: "List Exporter",
            category: "mod-organizer",
            type: "markdown",
            source: {
                repo: "Kezyma/ModOrganizer-Plugins",
                branch: "main",
                path: "docs/listexporter.md"
            },
            image: "img/thumb/list-exporter.png"
        },
        {
            id: "morrowind-remastered",
            name: "Morrowind Remastered",
            category: "morrowind",
            type: "markdown",
            source: {
                repo: "Kezyma/Morrowind-Remastered",
                branch: "main",
                path: "README.md"
            },
            image: "img/thumb/morrowind-remastered.png"
        },
        {
            id: "voicesofvvardenfell",
            name: "Voices of Vvardenfell",
            category: "morrowind",
            type: "markdown",
            source: {
                repo: "Kezyma/Morrowind-Voices",
                branch: "main",
                path: "README.md"
            },
            image: "img/thumb/voices-of-vvardenfell.png"
        },
        {
            id: "uiremastered",
            name: "UI Remastered",
            category: "morrowind",
            type: "markdown",
            source: {
                repo: "Kezyma/Morrowind-UI",
                branch: "main",
                path: "README.md"
            },
            image: "img/thumb/ui-remastered.png"
        },
        {
            id: "mechanics-remastered",
            name: "Mechanics Remastered",
            category: "morrowind",
            type: "markdown",
            source: {
                repo: "Kezyma/Morrowind-Mechanics",
                branch: "main",
                path: "README.md"
            },
            image: "img/thumb/mechanics-remastered.png"
        },
        {
            id: "map-builder",
            name: "Map Builder",
            category: "morrowind",
            type: "markdown",
            source: {
                repo: "Kezyma/Morrowind-MapBuilder",
                branch: "gh-pages",
                path: "README.md"
            },
            image: "img/thumb/map-builder.png"
        },
        {
            id: "bloodchillmanor",
            name: "Bloodchill Manor Landscape Fix",
            category: "misc",
            type: "markdown",
            source: {
                repo: "Kezyma/Bethesda-Plugins",
                branch: "main",
                path: "Bloodchill Manor Landscape Fix/README.md"
            },
            image: "img/thumb/bloodchill-manor.png"
        },
        {
            id: "tundrahomestead",
            name: "Tundra Homestead Landscape Fix",
            category: "misc",
            type: "markdown",
            source: {
                repo: "Kezyma/Bethesda-Plugins",
                branch: "main",
                path: "Tundra Homestead Landscape Fix/README.md"
            },
            image: "img/thumb/tundra-homestead.png"
        },
        {
            id: "opencities",
            name: "Open Cities Classic Flag Remover",
            category: "misc",
            type: "markdown",
            source: {
                repo: "Kezyma/Bethesda-Plugins",
                branch: "main",
                path: "Open Cities Classic Flag Remover/README.md"
            },
            image: "img/thumb/open-cities.png"
        },
        {
            id: "sierra-madre",
            name: "Sierra Madre Revisited",
            category: "misc",
            type: "markdown",
            source: {
                repo: "Kezyma/Bethesda-Plugins",
                branch: "main",
                path: "Sierra Madre Revisited/README.md"
            },
            image: "img/thumb/sierra-madre.png"
        },
        {
            id: "myararanath",
            name: "Myar Aranath English Translation Race Fix",
            category: "misc",
            type: "markdown",
            source: {
                repo: "Kezyma/Bethesda-Plugins",
                branch: "main",
                path: "Myar Aranath English Translation Race Fix/README.md"
            },
            image: "img/thumb/myar-aranath.png"
        },
        {
            id: "starfield-ng",
            name: "Starfield NG Condenser",
            category: "misc",
            type: "markdown",
            source: {
                repo: "Kezyma/Bethesda-Plugins",
                branch: "main",
                path: "Starfield NG Condenser/README.md"
            },
            image: "img/thumb/starfield-ng.png"
        },
        {
            id: "modbackup",
            name: "Mod Backup Utility",
            category: "misc",
            type: "markdown",
            source: {
                repo: "Kezyma/Mod-Backup-Utility",
                branch: "main",
                path: "README.md"
            },
            image: "img/thumb/mod-backup.png"
        },
        {
            id: "mo-setup-tool",
            name: "Mod Organizer Setup Tool",
            category: "misc",
            type: "markdown",
            source: {
                repo: "Kezyma/ModOrganizer-SetupTool",
                branch: "main",
                path: "README.md"
            },
            image: "img/thumb/mo-setup.png"
        },
        {
            id: "wj-setup-tool",
            name: "Wabbajack Post-Install Tool",
            category: "misc",
            type: "markdown",
            source: {
                repo: "Kezyma/ModSetupTool",
                branch: "main",
                path: "README.md"
            },
            image: "img/thumb/wj-setup.png"
        },
        {
            id: "pluginfinder-generator",
            name: "Plugin Finder Generator",
            category: "tools",
            type: "html",
            source: "pages/pluginfinder-generator.html"
        },
        {
            id: "nomanssky",
            name: "No Mans Sky Vault",
            category: "tools",
            type: "html",
            source: "pages/nms-vault.html"
        },
        {
            id: "systembrowser",
            name: "No Mans Sky System Browser",
            category: "tools",
            type: "html",
            source: "pages/nms-browser.html"
        }
    ],

    // Legacy ?p=<id> values that should map to a *new* page id (identity unless
    // listed). Anything not resolvable to a new page is forwarded to the
    // archived site at /.old/?p=<id> so old links keep working during the rebuild.
    legacyMap: {
        index: ""        // old landing -> new home
    }
};
