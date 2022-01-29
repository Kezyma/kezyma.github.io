function ExportData() {
    var systems = [];
    for (var i = 1; i <= SystemCount; i++) { 
        var colourMaps = {};
        var SystemAttributes = document.getElementById("SystemSeed" + i).offsetParent;
        var SystemTable = SystemAttributes.offsetParent.offsetParent;
        try {
        var system = {
            Seed: SystemAttributes.rows[1].cells[9].innerText,
            Address: SystemAttributes.rows[1].cells[0].innerText,
            Planets: SystemAttributes.rows[1].cells[7].innerText,
            Moons: SystemAttributes.rows[1].cells[8].innerText,
            StarType: SystemAttributes.rows[1].cells[1].innerText,
            AlienRace: SystemAttributes.rows[1].cells[2].innerText,
            Conflict: SystemAttributes.rows[1].cells[3].innerText,
            Wealth: SystemAttributes.rows[1].cells[4].innerText,
            Class: SystemAttributes.rows[1].cells[5].innerText,
            Abandoned: SystemAttributes.rows[1].cells[6].innerText,
            Planets: []
        };

        var PlanetTable = SystemTable.rows[1].cells[0].getElementsByTagName("table")[0];
        var PlanetCount = PlanetTable.rows[1].cells.length;
        for (var j = 1; j < PlanetCount; j++) {
            console.log("Checking " + system.Seed + " Planet " + j);
            var grass = PlanetTable.rows[14].cells[j].getElementsByTagName("table")[0].rows[0].cells;
            var grassNums = []
            for (var g = 0; g < grass.length; g++){ grassNums.push(parseInt(grass[g].innerText));}
            var plant = PlanetTable.rows[15].cells[j].getElementsByTagName("table")[0].rows[0].cells;
            var plantNums = []
            for (var g = 0; g < plant.length; g++){ plantNums.push(parseInt(plant[g].innerText));}
            var leaf = PlanetTable.rows[16].cells[j].getElementsByTagName("table")[0].rows[0].cells;
            var leafNums = []
            for (var g = 0; g < leaf.length; g++){ leafNums.push(parseInt(leaf[g].innerText));}
            var tile = PlanetTable.rows[18].cells[j].getElementsByTagName("table")[0].rows[0].cells;
            var tileNums = []
            for (var g = 0; g < tile.length; g++){ tileNums.push(parseInt(tile[g].innerText));}

            var water = false;
            if (parseInt(PlanetTable.rows[20].cells[j].innerText) == 1) { water = true; }
            var prime = false;
            if (parseInt(PlanetTable.rows[27].cells[j].innerText) == 1) { prime = true; }
            var continents = false;
            if (parseInt(PlanetTable.rows[28].cells[j].innerText) == 1) { continents = true; }
            var rings = false;
            if (parseInt(PlanetTable.rows[29].cells[j].innerText) == 1) { rings = true; }
            var sandworms = false;
            if (parseInt(PlanetTable.rows[30].cells[j].innerText) == 1) { sandworms = true; }
            var planet = {
                Name: PlanetTable.rows[0].cells[j].innerText.split(" - ")[1],
                Biome: PlanetTable.rows[1].cells[j].innerText,
                SubBiome: PlanetTable.rows[2].cells[j].innerText,
                Terrain: PlanetTable.rows[3].cells[j].innerText,
                Size: PlanetTable.rows[4].cells[j].innerText,
                FloraLevel: PlanetTable.rows[5].cells[j].innerText,
                FaunaLevel: PlanetTable.rows[6].cells[j].innerText,
                Sentinels: PlanetTable.rows[7].cells[j].innerText,
                Weather: PlanetTable.rows[8].cells[j].innerText,
                WeatherIntensity: PlanetTable.rows[9].cells[j].innerText,
                StormFrequency: PlanetTable.rows[10].cells[j].innerText,
                ScreenFilter: PlanetTable.rows[11].cells[j].innerText.split("/")[0],
                StormScreenFilter: PlanetTable.rows[11].cells[j].innerText.split("/")[1],
                Atmosphere: PlanetTable.rows[12].cells[j].innerText,
                Rainbow: PlanetTable.rows[13].cells[j].innerText,
                Water: water,
                WaterColour: PlanetTable.rows[19].cells[j].innerText,
                Resources: PlanetTable.rows[21].cells[j].innerText,
                CommonSubstance: PlanetTable.rows[22].cells[j].innerText,
                UncommonSubstance: PlanetTable.rows[23].cells[j].innerText,
                RareSubstance: PlanetTable.rows[24].cells[j].innerText,
                BuildingLevel: PlanetTable.rows[25].cells[j].innerText,
                Type: PlanetTable.rows[26].cells[j].innerText,
                Prime: prime,
                ForceContinents: continents,
                Rings: rings,
                Sandworms: sandworms,
                CreatureNumber: parseInt(PlanetTable.rows[31].cells[j].innerText),
                SkyColour: parseInt(PlanetTable.rows[17].cells[j].innerText),
                GrassColours: grassNums,
                PlantColours: plantNums,
                LeafColours: leafNums,
                TileColours: tileNums,
                Creatures: []
            };

            var PlanetCreatureTable = PlanetTable.rows[32].cells[j].getElementsByTagName("table")
            var cIx = 1;
            for (var k = 0; k < PlanetCreatureTable.length; k++) {
                var PlanetCreatureSubTable = PlanetCreatureTable[k];
                for (var l = 0; l < PlanetCreatureSubTable.rows[1].cells.length; l++) {
                    var creature = {
                        Index: cIx,
                        Value: PlanetCreatureSubTable.rows[1].cells[l].innerText,
                        Type:PlanetCreatureSubTable.rows[2].cells[l].innerText,
                        Size:PlanetCreatureSubTable.rows[3].cells[l].innerText.split("/")[0],
                        Weight: parseFloat(PlanetCreatureSubTable.rows[3].cells[l].innerText.split("/")[1].replace('kg','')),
                        Height: parseFloat(PlanetCreatureSubTable.rows[3].cells[l].innerText.split("/")[2].replace('m','')),
                        Density: PlanetCreatureSubTable.rows[4].cells[l].innerText.split("/")[0],
                        MinGroup: parseInt(PlanetCreatureSubTable.rows[4].cells[l].innerText.split("/")[1].split("-")[0]),
                        MaxGroup: parseInt(PlanetCreatureSubTable.rows[4].cells[l].innerText.split("/")[1].split("-")[1]),
                        GroupsKm2: parseInt(PlanetCreatureSubTable.rows[4].cells[l].innerText.split("/")[2]),
                        Rarity: PlanetCreatureSubTable.rows[6].cells[l].innerText.split("/")[0],
                        Probability: parseFloat(PlanetCreatureSubTable.rows[6].cells[l].innerText.split("/")[1].replace('%',''))/100,
                        Active: PlanetCreatureSubTable.rows[5].cells[l].innerText.split("/")[0],
                        Terrain: PlanetCreatureSubTable.rows[5].cells[l].innerText.split("/")[1],
                        Hemisphere: PlanetCreatureSubTable.rows[5].cells[l].innerText.split("/")[2],
                        Seed: PlanetCreatureSubTable.rows[7].cells[l].innerText
                    };
                    cIx++;
                    planet.Creatures.push(creature);
                }
            }

            system.Planets.push(planet);
        }

        systems.push(system);
        }
        catch (exc) {
            console.log(exc);
        }
    }
    console.log(systems);

    const filename = 'NMS_system_export.json';
    const jsonStr = JSON.stringify(systems);
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}