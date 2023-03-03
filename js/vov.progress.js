$(document).ready(function () {
    $.get({
        url: 'https://raw.githubusercontent.com/Kezyma/AI-Voices/main/Progress/Morrowind.csv',
        success: function (data) {
            // Load csv to objects.
            var csvData = $.csv.toObjects(data);

            // Extract list of unique NPCs
            var npcs = csvData.map(function (v) { return v.SpeakerName; });
            var unique = [...new Set(npcs)];

            // Generate data for each NPC.
            var rows = unique.map(function (npc) {
                var lines = csvData.filter(dt => dt.SpeakerName == npc);
                var total = lines.length;
                var done = lines.filter(dt => dt.Done == 1).length;
                var info = lines[0];
                var voice = "Custom";
                if (info.Race.length > 0) voice = info.Race + " (" + info.Gender + ")";
                return {
                    NPC: npc,
                    Voice: voice,
                    Total: total,
                    Done: done,
                    Progress: Number(done / total).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })
                };
            });

            // Generate HTML table rows.
            rows.forEach(function (itm) {
                var css = "table-danger";
                if (itm.Done > 0) css = "table-warning";
                if (itm.Done == itm.Total) css = "table-success";
                var content = "<tr class='" + css + "'><td>" + itm.NPC + "</td><td>" + itm.Voice + "</td><td>" + itm.Total + "</td><td>" + itm.Done + "</td><td>" + itm.Progress + "</td></tr>";
                var html = $(content);
                $("#progress-body").append(html);
            });

            var total = csvData.length;
            var done = csvData.filter(dt => dt.Done == 1).length;
            var progress = Number(done / total).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 });
            $("#total-total").text(total);
            $("#total-done").text(done);
            $("#total-progress").text(progress);

            // Configure jQuery table.
            $('#progress-table').dataTable({
                "iDisplayLength": 25,
                "order": [[4, 'desc'], [3, 'desc'], [2, 'desc'], [1, 'asc'], [0, 'asc']],
                "responsive": true
            });
        }
    });

    $.get({
        url: 'https://raw.githubusercontent.com/Kezyma/AI-Voices/main/Progress/Morrowind%20Generic.csv',
        success: function (data) {
            // Load csv to objects.
            var csvData = $.csv.toObjects(data);
            
            var map = {
                "Dark Elf": "Delf",
                "High Elf": "Helf",
                "Wood Elf": "Welf",
                "Orc": "Orc",
                "Khajiit": "Khj",
                "Argonian": "Arg",
                "Imperial": "Imp",
                "Nord": "Nrd",
                "Breton": "Brt",
                "Redguard": "Rdg"
            };
            var tt = 0;
            var td = 0;
            for (var k in map) {
                var kv = map[k];
                var mk = kv + " M";
                var fk = kv + " F";
                var mv = csvData.filter(x => x[mk] != -1);
                var fv = csvData.filter(x => x[fk] != -1);
                var mt = mv.length;
                var ft = fv.length;
                var md = mv.filter(x => x[mk] == 1).length;
                var fd = fv.filter(x => x[fk] == 1).length;
                var mp = Number(md / mt).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 });
                var fp = Number(fd / ft).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 });
                var mcss = "table-danger";
                if (md > 0) mcss = "table-warning";
                if (md == mt) mcss = "table-success";
                var fcss = "table-danger";
                if (fd > 0) fcss = "table-warning";
                if (fd == ft) fcss = "table-success";
                var mcontent = "<tr class='" + mcss + "'><td>" + k + " (Male)</td><td>" + mt + "</td><td>" + md + "</td><td>" + mp + "</td></tr>";
                var mhtml = $(mcontent);
                $("#generic-body").append(mhtml);
                var fcontent = "<tr class='" + fcss + "'><td>" + k + " (Female)</td><td>" + ft + "</td><td>" + fd + "</td><td>" + fp + "</td></tr>";
                var fhtml = $(fcontent);
                $("#generic-body").append(fhtml);
                tt += mt + ft;
                td += md + fd;
            }

            var pp = Number(td / tt).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 });
            $("#generic-total").text(tt);
            $("#generic-done").text(td);
            $("#generic-progress").text(pp);

            // Configure jQuery table.
            $('#generic-table').dataTable({
                "iDisplayLength": 25,
                "order": [[3, 'desc'], [2, 'desc'], [1, 'desc'], [0, 'asc']],
                "responsive": true
            });
        }
    });
});