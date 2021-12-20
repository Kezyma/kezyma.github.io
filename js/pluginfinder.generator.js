Prism.highlightAll();

// const urlSearchParams = new URLSearchParams(window.location.search);
// const params = Object.fromEntries(urlSearchParams.entries());
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
            "MinWorking": "",
            "MaxWorking": "2.4.2",
            "ReleaseNotes": ["Initial alpha. Demo version."],
            "DownloadUrl": "https://github.com/Kezyma/ModOrganizer-Plugins/releases/download/pluginfinder/pluginfinder.1.1.0.zip",
            "PluginPath": ["pluginfinder"],
            "LocalePath": [],
            "DataPath": ["data/pluginfinder"]
        }
    ]
}

loadedJson = JSON.parse("{}");

function loadExample() {
    loadedJson = exampleJson;
    updateForm();
    updatePreview();
    validate();
}

function getVersion(card) {
    var major = $(card).find(".majorVerNumText").val();
    var minor = $(card).find(".minorVerNumText").val();
    var sub = $(card).find(".subVerNumText").val();
    var subSub = $(card).find(".subSubVerNumText").val();
    var typ = $(card).find(".typeVerSelect").val();
    var res = "";
    if (major != "") {
        res += major;
    }
    if (minor != "") {
        res += "." + minor;
    }
    if (sub != "") {
        res += "." + sub;
    }
    if (subSub != "") {
        res += "." + subSub;
    }
    res += typ;
    return res;
}

function setVersion(card, versionText) {
    var versionMatch = versionRegex.exec(versionText);
    console.log(versionMatch);

    $(card).find(".majorVerNumText").val(versionMatch[1]);
    $(card).find(".minorVerNumText").val(versionMatch[2]);
    $(card).find(".subVerNumText").val(versionMatch[3]);
    $(card).find(".subSubVerNumText").val(versionMatch[4]);
    $(card).find(".typeVerSelect").val(versionMatch[5]);
}

function updateJson() {
    loadedJson["Name"] = $("#pluginNameText").val();
    loadedJson["Author"] = $("#pluginAuthorText").val();
    loadedJson["Description"] = $("#pluginDescriptionText").val();
    loadedJson["DocsUrl"] = $("#pluginDocsText").val();
    loadedJson["GithubUrl"] = $("#pluginGithubUrl").val();
    loadedJson["NexusUrl"] = $("#pluginNexusUrl").val();

    loadedJson["Versions"] = []
    $("#versionColumn").find(".versionCard").each(function (ix) {
        card = $("#versionColumn").find(".versionCard")[ix];
        var versionDef = {};
        versionDef["Version"] = getVersion(card);
        versionDef["Released"] = $(card).find(".releaseDateText").val();
        versionDef["MinSupport"] = $(card).find(".minSupportText").val();
        versionDef["MaxSupport"] = $(card).find(".maxSupportText").val();
        versionDef["MinWorking"] = $(card).find(".minWorkingText").val();
        versionDef["MaxWorking"] = $(card).find(".maxWorkingText").val();
        versionDef["DownloadUrl"] = $(card).find(".downloadUrlText").val();

        versionDef["PluginPath"] = []
        console.log(card);
        var pathCard = $(card).find(".pluginPathsContainer");
        console.log(pathCard);
        var pathinputs = $(pathCard).find(".textArrayInput");
        console.log(pathinputs);

        $(card).find(".pluginPathsContainer").find(".textArrayInput").each(function (ix) {
            versionDef["PluginPath"].push($($(card).find(".pluginPathsContainer").find(".textArrayInput")[ix]).val());
        });

        versionDef["LocalePath"] = []
        $(card).find(".localePathsContainer").find(".textArrayInput").each(function (ix) {
            versionDef["LocalePath"].push($($(card).find(".localePathsContainer").find(".textArrayInput")[ix]).val());
        });

        versionDef["DataPath"] = []
        $(card).find(".dataPathsContainer").find(".textArrayInput").each(function (ix) {
            versionDef["DataPath"].push($($(card).find(".dataPathsContainer").find(".textArrayInput")[ix]).val());
        });

        versionDef["ReleaseNotes"] = []
        $(card).find(".releaseNotesContainer").find(".textArrayInput").each(function (ix) {
            versionDef["ReleaseNotes"].push($($(card).find(".releaseNotesContainer").find(".textArrayInput")[ix]).val());
        });

        loadedJson["Versions"].push(versionDef);
    });

    updatePreview();
}

function updateForm() {
    $("#versionColumn").html("");

    $("#pluginNameText").val(loadedJson["Name"]);
    $("#pluginAuthorText").val(loadedJson["Author"]);
    $("#pluginDescriptionText").val(loadedJson["Description"]);
    $("#pluginDocsText").val(loadedJson["DocsUrl"]);
    $("#pluginGithubUrl").val(loadedJson["GithubUrl"]);
    $("#pluginNexusUrl").val(loadedJson["NexusUrl"]);
    for (version in loadedJson["Versions"]) {
        versionData = loadedJson["Versions"][version];
        versionCard = createVersion();
        setVersion(versionCard, versionData["Version"]);
        $(versionCard).find(".releaseDateText").val(versionData["Released"]);
        $(versionCard).find(".minSupportText").val(versionData["MinSupport"]);
        $(versionCard).find(".maxSupportText").val(versionData["MaxSupport"]);
        $(versionCard).find(".minWorkingText").val(versionData["MinWorking"]);
        $(versionCard).find(".maxWorkingText").val(versionData["MaxWorking"]);
        $(versionCard).find(".downloadUrlText").val(versionData["DownloadUrl"]);

        for (path in versionData["PluginPath"]) {
            pathData = versionData["PluginPath"][path];
            createArrayPath($(versionCard).find(".pluginPathBtn")).find(".textArrayInput").val(pathData);
        }
        for (path in versionData["LocalePath"]) {
            pathData = versionData["LocalePath"][path];
            createArrayPath($(versionCard).find(".localePathBtn")).find(".textArrayInput").val(pathData);
        }
        for (path in versionData["DataPath"]) {
            pathData = versionData["DataPath"][path];
            createArrayPath($(versionCard).find(".dataPathBtn")).find(".textArrayInput").val(pathData);
        }
        for (path in versionData["ReleaseNotes"]) {
            pathData = versionData["ReleaseNotes"][path];
            createArrayPath($(versionCard).find(".releaseNotesBtn")).find(".textArrayInput").val(pathData);
        }
    }
}

function fieldChanged() {
    validate();
    updateJson();
}

$(document).ready(function () {
    updatePreview();
    bindTooltips();
});

function bindTooltips() {
    //$(".help").each(function (ix, help) {
    //    tt = new bootstrap.Tooltip(help);
    //});
}

function updatePreview() {
    $("#previewJson").html(JSON.stringify(loadedJson, null, 4));
}

function downloadJson(content, fileName) {
    download(JSON.stringify(content, null, 4), fileName, 'text/json');
}

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function createVersion() {
    var newVersion = $("#versionTemplate").last().clone();
    newVersion.removeClass("d-none");
    newVersion.removeAttr('id');
    $("#versionColumn").prepend(newVersion);
    $("#saveJsonBtn").addClass("disabled");
    updatePreview();
    bindTooltips();
    return newVersion;
}

function removeVersion(button) {
    $(button).parent().parent().parent().parent().remove();
    validate();
    updatePreview();
    bindTooltips();
}

$("#selectJsonFileSelect").change(function (evt) {
    var file = evt.target.files[0];
    bindToFile(file);
});

function bindToFile(file) {
    $("#selectJsonFileUrl").val("");
    var reader = new FileReader();
    reader.onload = function (event) {
        loadedJson = JSON.parse(event.target.result);
        updateForm();
        updatePreview();
        validate();
    };
    reader.readAsText(file);
}

$("#selectJsonFileUrl").change(function (evt) {
    var url = $("#selectJsonFileUrl").val();
    bindToUrl(url);
});

function bindToUrl(url) {
    $("#selectJsonFileSelect").val("");
    $.getJSON(url, function (data) {
        loadedJson = data;
        updateForm();
        updatePreview();
        validate();
    });
}

$("#saveJsonBtn").click(function () {
    fileName = "plugindefinition.json";
    if ($("#selectJsonFileSelect").prop("files") != null && $("#selectJsonFileSelect").prop("files").length > 0) {
        fileName = $("#selectJsonFileSelect").prop("files")[0].name;
    }
    downloadJson(loadedJson, fileName);
});

$("#createVersionBtn").click(function () {
    createVersion();
});

function createArrayPath(button) {
    var container = $(button).parent().find(".textArrayContainer");
    var newField = $("#textArrayTemplate").last().clone();
    newField.removeClass("d-none");
    newField.removeAttr('id');
    container.append(newField);
    return newField;
}

function removeArrayPath(button) {
    $(button).parent().parent().parent().remove();
    validate();
}

function validate() {
    $(".warning-txt").addClass("d-none");
    var error = false;

    if ($("#pluginNameText").val() == "") {
        $("#nameWarning").removeClass("d-none");
        error = true;
    }
    if ($("#pluginAuthorText").val() == "") {
        $("#authorWarning").removeClass("d-none");
        error = true;
    }
    if ($("#pluginDocsText").val() != "" && !isValidHttpUrl($("#pluginDocsText").val())) {
        $("#docsWarning").removeClass("d-none");
        error = true;
    }
    if ($("#pluginGithubUrl").val() != "" && !isValidHttpUrl($("#pluginGithubUrl").val())) {
        $("#githubWarning").removeClass("d-none");
        error = true;
    }
    if ($("#pluginNexusUrl").val() != "" && !isValidHttpUrl($("#pluginNexusUrl").val())) {
        $("#nexusWarning").removeClass("d-none");
        error = true;
    }

    if ($(".versionCard").length > 1) {
        $("#versionColumn").find(".versionCard").each(function (ix, card) {
            if (getVersion(card) == "") {
                console.log("versionWarning error")
                $(card).find(".versionWarning").removeClass("d-none");
                error = true;
            }
            else if (!isVersionValid(getVersion(card))) {
                console.log("versionInvalidWarning error")
                $(card).find(".versionInvalidWarning").removeClass("d-none");
                error = true;
            }
            if ($(card).find(".releaseDateText").val() == "") {
                console.log("releaseWarning error")
                $(card).find(".releaseWarning").removeClass("d-none");
                error = true;
            }
            if ($(card).find(".downloadUrlText").val() == "") {
                console.log("downloadWarning error")
                $(card).find(".downloadWarning").removeClass("d-none");
                error = true;
            }
            else if (!isValidHttpUrl($(card).find(".downloadUrlText").val())) {
                console.log("downloadInvalidWarning error")
                $(card).find(".downloadInvalidWarning").removeClass("d-none");
                error = true;
            }
            else if (!isZippedFile($(card).find(".downloadUrlText").val())) {
                console.log("downloadZipWarning error")
                $(card).find(".downloadZipWarning").removeClass("d-none");
                error = true;
            }

            if ($(card).find(".minSupportText").val() != "" && !isVersionValid($(card).find(".minSupportText").val())) {
                console.log("minSupInvalidWarning error")
                $(card).find(".minSupInvalidWarning").removeClass("d-none");
                error = true;
            }
            if ($(card).find(".maxSupportText").val() != "" && !isVersionValid($(card).find(".maxSupportText").val())) {
                console.log("maxSupInvalidWarning error")
                $(card).find(".maxSupInvalidWarning").removeClass("d-none");
                error = true;
            }
            if ($(card).find(".minWorkingText").val() != "" && !isVersionValid($(card).find(".minWorkingText").val())) {
                console.log("minWorkInvalidWarning error")
                $(card).find(".minWorkInvalidWarning").removeClass("d-none");
                error = true;
            }
            if ($(card).find(".maxWorkingText").val() != "" && !isVersionValid($(card).find(".maxWorkingText").val())) {
                console.log("maxWorkInvalidWarning error")
                $(card).find(".maxWorkInvalidWarning").removeClass("d-none");
                error = true;
            }

            var hasPath = false;
            $(card).find(".pluginPathsContainer").find(".textArrayInput").each(function (ix, input) {
                if ($(input).val() != "") {
                    hasPath = true;
                }
            });
            if (!hasPath) {
                $(card).find(".pathsWarning").removeClass("d-none");
                console.log("pathsWarning error")
                error = true;
            }
        });
    }

    if (!error) {
        $("#saveJsonBtn").removeClass("disabled");
    }
    else {
        $("#saveJsonBtn").addClass("disabled");
    }
    return error;
}


function isVersionValid(string) {
    if (string.match(versionRegex)) {
        return true;
    }
    return false;
}

function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    }
    catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

function isZippedFile(string) {
    if (string.endsWith(".zip") || string.endsWith(".7z")) {
        return true;
    }
    return false;
}