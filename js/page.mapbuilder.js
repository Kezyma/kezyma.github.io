$("#mb-map-select").change(function () {
    var val = $("#mb-map-select option:selected").val();
    console.log(val);
    $("#mb-map-frame").attr("src", `../map/${val}/map.html`)
});