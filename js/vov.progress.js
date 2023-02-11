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
    })
});