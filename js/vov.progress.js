$(document).ready(function () {
    $.get({
        url: 'https://raw.githubusercontent.com/Kezyma/AI-Voices/main/Progress/Morrowind.csv',
        success: function (data) {
            // Load csv to objects.
            var csvData = $.csv.toObjects(data);
            var r = [ "Dark Elf", "High Elf", "Wood Elf", "Orc", "Khajiit", "Argonian", "Imperial", "Nord", "Breton", "Redguard" ];
            var tt = 0;
            var td = 0;
            for (var rc in r) {
                var race = r[rc];
                var mval = csvData.filter(x => x["Race"] == race && x["Gender"] == "Male");
                var fval = csvData.filter(x => x["Race"] == race && x["Gender"] == "Female");
                var mtotal = mval.length;
                var ftotal = fval.length;
                var mdone = mval.filter(x => x["Done"] == true).length;
                var fdone = fval.filter(x => x["Done"] == true).length;
                var mper = Number(mdone / mtotal).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 });
                var fper = Number(fdone / ftotal).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 });
                var mcss = "table-danger";
                if (mdone > 0) mcss = "table-warning";
                if (mdone == mtotal) mcss = "table-success";
                var fcss = "table-danger";
                if (fdone > 0) fcss = "table-warning";
                if (fdone == ftotal) fcss = "table-success";
                var mcontent = "<tr class='" + mcss + "'><td>" + race + " (Male)</td><td>" + mtotal + "</td><td>" + mdone + "</td><td>" + mper + "</td></tr>";
                var mhtml = $(mcontent);
                $("#generic-body").append(mhtml);
                var fcontent = "<tr class='" + fcss + "'><td>" + race + " (Female)</td><td>" + ftotal + "</td><td>" + fdone + "</td><td>" + fper + "</td></tr>";
                var fhtml = $(fcontent);
                $("#generic-body").append(fhtml);
                tt += mt + ft;
                td += mdone + fdone;
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