Room.prototype.gatherIntel =
    function() {
        if (Memory.rooms == undefined) {
            Memory.rooms = {}
        }
        if (Memory.rooms[this.name] == undefined) {
            Memory.rooms[this.name] = {};
        }

        let enemies = this.find(FIND_HOSTILE_CREEPS);
        let enemyStructures = this.find(FIND_HOSTILE_STRUCTURES);

        let sklairs = this.find(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_KEEPER_LAIR }
        });

        let foundsources = this.find(FIND_SOURCES);
        let foundmins = this.find(FIND_MINERALS);

        if (foundsources.length) {
            Memory.rooms[this.name].sources = {}
            for (let source of foundsources) {
                Memory.rooms[this.name].sources[source.id] = {}
                Memory.rooms[this.name].sources[source.id].x = source.pos.x
                Memory.rooms[this.name].sources[source.id].y = source.pos.y
            }
        }

        if (foundmins.length) {
            Memory.rooms[this.name].mineral = {};
            Memory.rooms[this.name].mineral.type = foundmins[0].mineralType;
            Memory.rooms[this.name].mineral.x = foundmins[0].pos.x
            Memory.rooms[this.name].mineral.y = foundmins[0].pos.y
        }

        if (this.controller != undefined) {
            Memory.rooms[this.name].controller = {}
            Memory.rooms[this.name].controller.x = this.controller.pos.x
            Memory.rooms[this.name].controller.y = this.controller.pos.y
        }



        // Memory.rooms[this.name].name = this.name;


        // if (enemies.length > 1) {
        //     Memory.rooms[this.name].type = 'enemy';
        //     Memory.rooms[this.name].rescout = Game.time + 1500;
        if (sklairs.length >= 1) {
            Memory.rooms[this.name].type = 'sklair';
            Memory.rooms[this.name].rescout = Infinity;
        } else if (this.controller != undefined && ((this.controller.owner != undefined && !this.controller.my) || (this.controller.reservation != undefined && !this.controller.my))) {
            Memory.rooms[this.name].type = 'enemy';
            Memory.rooms[this.name].rescout = Game.time + 1500;
        } else if (enemyStructures.length > 0 && this.controller != undefined && this.controller.owner == undefined && this.controller.reservation == undefined) {
            Memory.rooms[this.name].type = 'abandoned';
            Memory.rooms[this.name].rescout = Game.time + 300;
        } else if (this.controller != undefined && this.controller.my && this.controller.level > 0) {
            Memory.rooms[this.name].type = 'base';
            Memory.rooms[this.name].rescout = Infinity;
        } else if (this.controller != undefined && this.controller.my) {
            Memory.rooms[this.name].type = 'mine';
            Memory.rooms[this.name].rescout = Infinity;
        } else {
            Memory.rooms[this.name].type = 'explored';
            Memory.rooms[this.name].rescout = Game.time + 1000;
        }

        this.addExits();

        // if (this.memory.anchor == undefined) {
        //     this.checker();
        // } 
        if (this.memory.anchor == undefined && (this.memory.type != 'base' && this.memory.type != 'mine')) {
            this.checker();
        } else if (this.memory.type == 'base' && this.memory.anchor == undefined) {

        }
        
    }

Room.prototype.addExits =
    function() {
        let exits = []; 
        let squares = Game.map.describeExits(this.name);
        for (let tile in squares) {
            exits.push(squares[tile]);
        }

        for (let exit of exits) {
            // if (!Game.map.isRoomAvailable(exit)) {
            if (Game.map.getRoomStatus(exit)["status"] != "normal") {
                continue;
            } else if (Memory.rooms[exit] == undefined) {
                Memory.rooms[exit] = {};
                Memory.rooms[exit].type = 'unexplored';

            }
        }
    }

Room.prototype.addRemote = 
    function(roomname) {
        let ortho = Game.map.describeExits(roomname);

        let orthogonal = [];
        for (let x in ortho) {
            orthogonal.push(ortho[x]);
        }

        let great = _.filter(orthogonal, function(r) {return Memory.rooms[r].sources && Object.keys(Memory.rooms[r].sources).length > 1 && Memory.rooms[r].type == 'explored'});

        if (great.length > 0) {
            Memory.bases[roomname].remotemines.push(great[0]);
            Memory.rooms[great[0]].type = 'mine';

            for (let sourceid in Memory.rooms[great[0]].sources) {
                Memory.bases[roomname].sources[sourceid] = {room: great[0]};
            }
        } else {
            // console.log('set ok')
            let ok = _.filter(orthogonal, function(r) {return Memory.rooms[r].sources && Object.keys(Memory.rooms[r].sources).length > 0 && Memory.rooms[r].type == 'explored'});

            // Memory.tmp = orthogonal;
            if (ok.length > 0) {
                Memory.bases[roomname].remotemines.push(ok[0]);
                Memory.rooms[ok[0]].type = 'mine';

                for (let sourceid in Memory.rooms[ok[0]].sources) {
                    Memory.bases[roomname].sources[sourceid] = {room: ok[0]};
                }
            }
        }
    }

// function checker(temproomname) {
Room.prototype.checker =
    function() {
    let roomname = this.name;
    if (this.controller != undefined && Object.keys(Memory.rooms[roomname].sources).length >= 2) {
         //temproomname.toUpperCase();
        // console.log('heyo ' + Object.keys(Memory.rooms[roomname].sources).length)

        const terrain = Game.map.getRoomTerrain(roomname);

        let plainsCount = 0;
        let swampCount = 0;
        let wallCount = 0;

        for (let x = 1; x < 50; x++) {
            for (let y = 1; y < 50; y++) {
                switch(terrain.get(x, y)) {
                    case TERRAIN_MASK_SWAMP:
                        swampCount++;
                    case TERRAIN_MASK_WALL:
                        wallCount++;
                    case 0:
                        plainsCount++;
                }
            }
        }
        
        let dist = 8

        let list = []
        
        for (let rootx = dist+1; rootx <= 49-dist-1; rootx++) {
            for (let rooty = dist+1; rooty <= 49-dist-1; rooty++) {
                let valid = true;
                for (let x = -dist; x < dist + 1 && valid; x++) {
                    for (let y = -dist; y < dist + 1 && valid; y++) {
                        if (Math.abs(x) + Math.abs(y) < dist + 2 && (Math.abs(x) < dist && Math.abs(y) < dist)) {
                           // new RoomVisual('sim').circle(rootx + x, rooty + y)
                            
                            switch(terrain.get(rootx + x, rooty + y)) {
                                case TERRAIN_MASK_WALL:
                                    // console.log('heyoo wall ' + (rootx+x) + ',' + (rooty+y))
                                    valid = false
                                    break;
                            }
                        }
                    }
                }
                
                if (valid) {
                    list.push({x: rootx, y: rooty})
                }
            }
        }
        
        // Memory.temp = list;
        if ((swampCount < 500 && swampCount < 0.5 * plainsCount) && Object.keys(Memory.rooms[roomname].sources).length > 1 && list.length > 0) {
            let bestanchor = {score: 0, x: -1, y: -1};
            // let bestscore = 0;
            for (let coord of list) {
                // new RoomVisual(roomname).circle(coord['x'], coord['y'])
                let anchor = new RoomPosition(coord.x, coord.y, roomname);
                let score = 0;

                for (let sourceid in Memory.rooms[roomname].sources) {
                    let source = new RoomPosition(Memory.rooms[roomname].sources[sourceid].x, Memory.rooms[roomname].sources[sourceid].y, roomname);
                    let path = anchor.findPathTo(source, {ignoreRoads: true, swampCost: 1.01, ignoreCreeps: true});
                    // let path = PathFinder.search(anchor, source, {range: 1, swampCost: 1.01}); //anchor.findPathTo(source, {ignoreRoads: true, swampCost: 1.01, ignoreCreeps: true});

                    score += (100 - path.length);
                    // score += path.length;
                }

                score += (100 - anchor.findPathTo(this.controller, {ignoreRoads: true, ignoreCreeps: true}).length);

                score -= ~~(swampCount/3);

                console.log('anchor of ' + roomname);
                console.log(coord.x + ', ' + coord.y + ': ' + score);
                if (score > bestanchor['score']) {
                    bestanchor['score'] = score;
                    bestanchor['x'] = coord.x;
                    bestanchor['y'] = coord.y;
                    // break;
                }
            }
            if (Memory.rooms[roomname].anchor == undefined) {
                Memory.rooms[roomname].anchor = bestanchor;
            }
            // console.log('bestanchor of ' + roomname);
            // console.log(bestanchor['x'] + ', ' + bestanchor['y'] + ': ' + bestanchor['score']);
        } else {
            // console.log('setting ' + roomname + ' false ');
            // console.log(this.controller);
            Memory.rooms[roomname].anchor = false;
        }
    } else {
        // console.log('setting ' + roomname + ' false ');
        // console.log(this.controller);
        Memory.rooms[roomname].anchor = false;
    }
}

Room.prototype.buildController =
    function(force=false) {
        // let rootx = this.pos.x - 1;
        // let rooty = this.pos.y + 1;
        
        if (this.memory == undefined || this.memory.anchor == undefined || this.memory.type == undefined) {
            // this.memory.anchor = {'x': rootx, 'y': rooty};
            // this.memory.type = 'base';
            // console.log('set')
            if (_.filter(Game.creeps).length == 0 && _.filter(Game.spawns).length == 1) {
                for (let spawnname in Game.spawns) {
                    this.memory.anchor = {'x': Game.spawns[spawnname].pos.x - layout[1]['buildings']['spawn']['pos'][0].x,
                                            'y': Game.spawns[spawnname].pos.y - layout[1]['buildings']['spawn']['pos'][0].y};
                    this.memory.type = 'base';
                }
            } else {
                this.checker();
            }
        }
        let rootx = this.memory.anchor.x;
        let rooty = this.memory.anchor.y;
        if(Game.time%100 == 17 || force) {
            let level = this.controller.level;

            let roadAnchors = []
            roadAnchors.push(new RoomPosition(rootx+7, rooty, this.name));
            roadAnchors.push(new RoomPosition(rootx-7, rooty, this.name));
            roadAnchors.push(new RoomPosition(rootx, rooty+7, this.name));
            roadAnchors.push(new RoomPosition(rootx, rooty-7, this.name));

            for (let building in layout[level]['buildings']) {
                for (let posmod of layout[level]['buildings'][building]['pos']) {
                    let temppos = new RoomPosition(rootx + posmod.x, rooty + posmod.y, this.name);

                    let found = temppos.lookFor(LOOK_STRUCTURES)
                    if (found.length == 0) {
                        if (building == 'spawn') {
                            if (posmod.x == 1 && posmod.y == -1) {
                                temppos.createConstructionSite(STRUCTURE_SPAWN, 'spawn1-' + this.name.toLowerCase());
                            } else if (posmod.x == 1 && posmod.y == -4) {
                                temppos.createConstructionSite(STRUCTURE_SPAWN, 'spawn2-' + this.name.toLowerCase());
                            } else if (posmod.x == 4 && posmod.y == -1) {
                                temppos.createConstructionSite(STRUCTURE_SPAWN, 'spawn3-' + this.name.toLowerCase());
                            }
                        } else if (building == 'extension') {
                            temppos.createConstructionSite(STRUCTURE_EXTENSION)
                        } else if (building == 'tower') {
                            temppos.createConstructionSite(STRUCTURE_TOWER)
                        } else if (building == 'storage') {
                            temppos.createConstructionSite(STRUCTURE_STORAGE)
                        } else if (building == 'terminal') {
                            temppos.createConstructionSite(STRUCTURE_TERMINAL)
                        } else if (building == 'link') {
                            temppos.createConstructionSite(STRUCTURE_LINK)
                        } else if (building == 'lab') {
                            temppos.createConstructionSite(STRUCTURE_LAB)
                        } else if (building == 'powerSpawn') {
                            // temppos.createConstructionSite(STRUCTURE_POWER_SPAWN)
                        } else if (building == 'nuker') {
                            // temppos.createConstructionSite(STRUCTURE_NUKER)
                        } else if (building == 'road') {
                            temppos.createConstructionSite(STRUCTURE_ROAD)
                        } else if (building == 'observer') {
                            temppos.createConstructionSite(STRUCTURE_OBSERVER)
                        } else if (building == 'factory') {
                            temppos.createConstructionSite(STRUCTURE_FACTORY)
                        }
                    } else {
                        if (found[0].structureType == STRUCTURE_CONTAINER && building == 'road') {

                        } else if (found[0].structureType != building) {
                            found[0].destroy();
                        }
                    }
                }
            }

            let csites = this.find(FIND_MY_CONSTRUCTION_SITES)
            if (level >= 4 && csites.length == 0) {
                let sources = this.find(FIND_SOURCES);

                for (let i in sources) {
                    let source = sources[i];

                    let target = source.pos.findClosestByPath(roadAnchors, {ignoreCreeps: true});

                    let cont = source.pos.findInRange(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER})[0];

                    if (target != undefined && target != null) {
                        let path = [];
                        if (cont != undefined && cont != null) {
                            path = cont.pos.findPathTo(target, {plainCost: 3, swampCost: 6, ignoreCreeps: true});
                        } else {
                            path = source.pos.findPathTo(target, {plainCost: 3, swampCost: 6, ignoreCreeps: true});
                        }

                        for (let square of path) {
                            let temppos = new RoomPosition(square['x'], square['y'], this.name);
                            temppos.createConstructionSite(STRUCTURE_ROAD);
                        }
                    }
                }

                let controller = this.controller;

                let target = controller.pos.findClosestByPath(roadAnchors, {ignoreCreeps: true});

                if (target != null && target != undefined) {
                    let path = controller.pos.findPathTo(target, {plainCost: 3, swampCost: 6, ignoreCreeps: true});

                    for (let square of path) {
                        let temppos = new RoomPosition(square['x'], square['y'], this.name);
                        temppos.createConstructionSite(STRUCTURE_ROAD);
                    }
                }
            }
            if (level >= 6 && csites.length == 0) {
                let mins = this.find(FIND_MINERALS)[0];
                let extractor = this.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_EXTRACTOR})[0];

                if (extractor == undefined) {
                    mins.pos.createConstructionSite(STRUCTURE_EXTRACTOR);
                }

                let target = mins.pos.findClosestByPath(roadAnchors, {ignoreCreeps: true});
                if (target != null && target != undefined) {
                    let path = mins.pos.findPathTo(target, {plainCost: 3, swampCost: 6, ignoreCreeps: true});

                    for (let square of path) {
                        let temppos = new RoomPosition(square['x'], square['y'], this.name);
                        temppos.createConstructionSite(STRUCTURE_ROAD);
                    }


                    let temppos = new RoomPosition(path[0]['x'], path[0]['y'], this.name);
                    temppos.createConstructionSite(STRUCTURE_CONTAINER);
                }
            }
        }
    }

const layout = {
    1: {"name": "textExport", "shard": "shard0", "rcl": "1", "buildings": {"spawn": {"pos": [{"x": 1, "y": -1}]}}}, 
    2: {"name": "textExport", "shard": "shard0", "rcl": "2", "buildings": {"spawn": {"pos": [{"x": 1, "y": -1}]}, "extension": {"pos": [{"x": 4, "y": 1}, {"x": 5, "y": 1}, {"x": 3, "y": 2}, {"x": 4, "y": 2}, {"x": 3, "y": 3}]}}},
    3: {"name": "textExport", "shard": "shard0", "rcl": "3", "buildings": {"spawn": {"pos": [{"x": 1, "y": -1}]}, "tower": {"pos": [{"x": 1, "y": 1}]}, "extension": {"pos": [{"x": 4, "y": 1}, {"x": 5, "y": 1}, {"x": 3, "y": 2}, {"x": 4, "y": 2}, {"x": 2, "y": 3}, {"x": 3, "y": 3}, {"x": 1, "y": 4}, {"x": 2, "y": 4}, {"x": -1, "y": 5}, {"x": 1, "y": 5}]}}},
    4: {"name": "textExport", "shard": "shard0", "rcl": "4", "buildings": {"road": {"pos": [{"x": -2, "y": -7}, {"x": -1, "y": -7}, {"x": 0, "y": -7}, {"x": 1, "y": -7}, {"x": 2, "y": -7}, {"x": -3, "y": -6}, {"x": 0, "y": -6}, {"x": 3, "y": -6}, {"x": -4, "y": -5}, {"x": 0, "y": -5}, {"x": 4, "y": -5}, {"x": -5, "y": -4}, {"x": 0, "y": -4}, {"x": 5, "y": -4}, {"x": -6, "y": -3}, {"x": -1, "y": -3}, {"x": 0, "y": -3}, {"x": 1, "y": -3}, {"x": 6, "y": -3}, {"x": -7, "y": -2}, {"x": -2, "y": -2}, {"x": -1, "y": -2}, {"x": 1, "y": -2}, {"x": 2, "y": -2}, {"x": 7, "y": -2}, {"x": -7, "y": -1}, {"x": -3, "y": -1}, {"x": -2, "y": -1}, {"x": 2, "y": -1}, {"x": 3, "y": -1}, {"x": 7, "y": -1}, {"x": -7, "y": 0}, {"x": -6, "y": 0}, {"x": -5, "y": 0}, {"x": -4, "y": 0}, {"x": -3, "y": 0}, {"x": 3, "y": 0}, {"x": 4, "y": 0}, {"x": 5, "y": 0}, {"x": 6, "y": 0}, {"x": 7, "y": 0}, {"x": -7, "y": 1}, {"x": -3, "y": 1}, {"x": -2, "y": 1}, {"x": 2, "y": 1}, {"x": 3, "y": 1}, {"x": 7, "y": 1}, {"x": -7, "y": 2}, {"x": -2, "y": 2}, {"x": -1, "y": 2}, {"x": 1, "y": 2}, {"x": 2, "y": 2}, {"x": 7, "y": 2}, {"x": -6, "y": 3}, {"x": -1, "y": 3}, {"x": 0, "y": 3}, {"x": 1, "y": 3}, {"x": 6, "y": 3}, {"x": -5, "y": 4}, {"x": 0, "y": 4}, {"x": 5, "y": 4}, {"x": -4, "y": 5}, {"x": 0, "y": 5}, {"x": 4, "y": 5}, {"x": -3, "y": 6}, {"x": 0, "y": 6}, {"x": 3, "y": 6}, {"x": -2, "y": 7}, {"x": -1, "y": 7}, {"x": 0, "y": 7}, {"x": 1, "y": 7}, {"x": 2, "y": 7}]}, "extension": {"pos": [{"x": -5, "y": -1}, {"x": -4, "y": -1}, {"x": -5, "y": 1}, {"x": -4, "y": 1}, {"x": 4, "y": 1}, {"x": 5, "y": 1}, {"x": -4, "y": 2}, {"x": -3, "y": 2}, {"x": 3, "y": 2}, {"x": 4, "y": 2}, {"x": -3, "y": 3}, {"x": -2, "y": 3}, {"x": 2, "y": 3}, {"x": 3, "y": 3}, {"x": -2, "y": 4}, {"x": -1, "y": 4}, {"x": 1, "y": 4}, {"x": 2, "y": 4}, {"x": -1, "y": 5}, {"x": 1, "y": 5}]}, "spawn": {"pos": [{"x": 1, "y": -1}]}, "storage": {"pos": [{"x": -1, "y": 0}]}, "tower": {"pos": [{"x": 1, "y": 1}]}}},
    5: {"name": "textExport", "shard": "shard0", "rcl": "5", "buildings": {"road": {"pos": [{"x": -2, "y": -7}, {"x": -1, "y": -7}, {"x": 0, "y": -7}, {"x": 1, "y": -7}, {"x": 2, "y": -7}, {"x": -3, "y": -6}, {"x": 0, "y": -6}, {"x": 3, "y": -6}, {"x": -4, "y": -5}, {"x": 0, "y": -5}, {"x": 4, "y": -5}, {"x": -5, "y": -4}, {"x": 0, "y": -4}, {"x": 5, "y": -4}, {"x": -6, "y": -3}, {"x": -1, "y": -3}, {"x": 0, "y": -3}, {"x": 1, "y": -3}, {"x": 6, "y": -3}, {"x": -7, "y": -2}, {"x": -2, "y": -2}, {"x": -1, "y": -2}, {"x": 1, "y": -2}, {"x": 2, "y": -2}, {"x": 7, "y": -2}, {"x": -7, "y": -1}, {"x": -3, "y": -1}, {"x": -2, "y": -1}, {"x": 2, "y": -1}, {"x": 3, "y": -1}, {"x": 7, "y": -1}, {"x": -7, "y": 0}, {"x": -6, "y": 0}, {"x": -5, "y": 0}, {"x": -4, "y": 0}, {"x": -3, "y": 0}, {"x": 3, "y": 0}, {"x": 4, "y": 0}, {"x": 5, "y": 0}, {"x": 6, "y": 0}, {"x": 7, "y": 0}, {"x": -7, "y": 1}, {"x": -3, "y": 1}, {"x": -2, "y": 1}, {"x": 2, "y": 1}, {"x": 3, "y": 1}, {"x": 7, "y": 1}, {"x": -7, "y": 2}, {"x": -2, "y": 2}, {"x": -1, "y": 2}, {"x": 1, "y": 2}, {"x": 2, "y": 2}, {"x": 7, "y": 2}, {"x": -6, "y": 3}, {"x": -1, "y": 3}, {"x": 0, "y": 3}, {"x": 1, "y": 3}, {"x": 6, "y": 3}, {"x": -5, "y": 4}, {"x": 0, "y": 4}, {"x": 5, "y": 4}, {"x": -4, "y": 5}, {"x": 0, "y": 5}, {"x": 4, "y": 5}, {"x": -3, "y": 6}, {"x": 0, "y": 6}, {"x": 3, "y": 6}, {"x": -2, "y": 7}, {"x": -1, "y": 7}, {"x": 0, "y": 7}, {"x": 1, "y": 7}, {"x": 2, "y": 7}]}, "extension": {"pos": [{"x": -1, "y": -5}, {"x": -2, "y": -4}, {"x": -1, "y": -4}, {"x": -3, "y": -3}, {"x": -2, "y": -3}, {"x": -4, "y": -2}, {"x": -3, "y": -2}, {"x": -5, "y": -1}, {"x": -4, "y": -1}, {"x": -5, "y": 1}, {"x": -4, "y": 1}, {"x": 4, "y": 1}, {"x": 5, "y": 1}, {"x": 6, "y": 1}, {"x": -4, "y": 2}, {"x": -3, "y": 2}, {"x": 3, "y": 2}, {"x": 4, "y": 2}, {"x": 5, "y": 2}, {"x": 6, "y": 2}, {"x": -3, "y": 3}, {"x": -2, "y": 3}, {"x": 2, "y": 3}, {"x": 3, "y": 3}, {"x": -2, "y": 4}, {"x": -1, "y": 4}, {"x": 1, "y": 4}, {"x": 2, "y": 4}, {"x": -1, "y": 5}, {"x": 1, "y": 5}]}, "tower": {"pos": [{"x": -1, "y": -1}, {"x": 1, "y": 1}]}, "spawn": {"pos": [{"x": 1, "y": -1}]}, "storage": {"pos": [{"x": -1, "y": 0}]}, "link": {"pos": [{"x": 0, "y": 1}]}}},
    6: {"name": "textExport", "shard": "shard0", "rcl": "6", "buildings": {"road": {"pos": [{"x": -2, "y": -7}, {"x": -1, "y": -7}, {"x": 0, "y": -7}, {"x": 1, "y": -7}, {"x": 2, "y": -7}, {"x": -3, "y": -6}, {"x": 0, "y": -6}, {"x": 3, "y": -6}, {"x": -4, "y": -5}, {"x": 0, "y": -5}, {"x": 4, "y": -5}, {"x": -5, "y": -4}, {"x": 0, "y": -4}, {"x": 5, "y": -4}, {"x": -6, "y": -3}, {"x": -1, "y": -3}, {"x": 0, "y": -3}, {"x": 1, "y": -3}, {"x": 3, "y": -3}, {"x": 6, "y": -3}, {"x": -7, "y": -2}, {"x": -2, "y": -2}, {"x": -1, "y": -2}, {"x": 1, "y": -2}, {"x": 2, "y": -2}, {"x": 7, "y": -2}, {"x": -7, "y": -1}, {"x": -3, "y": -1}, {"x": -2, "y": -1}, {"x": 2, "y": -1}, {"x": 3, "y": -1}, {"x": 7, "y": -1}, {"x": -7, "y": 0}, {"x": -6, "y": 0}, {"x": -5, "y": 0}, {"x": -4, "y": 0}, {"x": -3, "y": 0}, {"x": 3, "y": 0}, {"x": 4, "y": 0}, {"x": 5, "y": 0}, {"x": 6, "y": 0}, {"x": 7, "y": 0}, {"x": -7, "y": 1}, {"x": -3, "y": 1}, {"x": -2, "y": 1}, {"x": 2, "y": 1}, {"x": 3, "y": 1}, {"x": 7, "y": 1}, {"x": -7, "y": 2}, {"x": -2, "y": 2}, {"x": -1, "y": 2}, {"x": 1, "y": 2}, {"x": 2, "y": 2}, {"x": 7, "y": 2}, {"x": -6, "y": 3}, {"x": -1, "y": 3}, {"x": 0, "y": 3}, {"x": 1, "y": 3}, {"x": 6, "y": 3}, {"x": -5, "y": 4}, {"x": 0, "y": 4}, {"x": 5, "y": 4}, {"x": -4, "y": 5}, {"x": 0, "y": 5}, {"x": 4, "y": 5}, {"x": -3, "y": 6}, {"x": 0, "y": 6}, {"x": 3, "y": 6}, {"x": -2, "y": 7}, {"x": -1, "y": 7}, {"x": 0, "y": 7}, {"x": 1, "y": 7}, {"x": 2, "y": 7}]}, "extension": {"pos": [{"x": -1, "y": -5}, {"x": -2, "y": -4}, {"x": -1, "y": -4}, {"x": -3, "y": -3}, {"x": -2, "y": -3}, {"x": -4, "y": -2}, {"x": -3, "y": -2}, {"x": -5, "y": -1}, {"x": -4, "y": -1}, {"x": -5, "y": 1}, {"x": -4, "y": 1}, {"x": 4, "y": 1}, {"x": 5, "y": 1}, {"x": 6, "y": 1}, {"x": -4, "y": 2}, {"x": -3, "y": 2}, {"x": 3, "y": 2}, {"x": 4, "y": 2}, {"x": 5, "y": 2}, {"x": 6, "y": 2}, {"x": -3, "y": 3}, {"x": -2, "y": 3}, {"x": 2, "y": 3}, {"x": 3, "y": 3}, {"x": 4, "y": 3}, {"x": 5, "y": 3}, {"x": -2, "y": 4}, {"x": -1, "y": 4}, {"x": 1, "y": 4}, {"x": 2, "y": 4}, {"x": 3, "y": 4}, {"x": 4, "y": 4}, {"x": -1, "y": 5}, {"x": 1, "y": 5}, {"x": 2, "y": 5}, {"x": 3, "y": 5}, {"x": -2, "y": 6}, {"x": -1, "y": 6}, {"x": 1, "y": 6}, {"x": 2, "y": 6}]}, "lab": {"pos": [{"x": 3, "y": -4}, {"x": 4, "y": -3}, {"x": 3, "y": -2}]}, "tower": {"pos": [{"x": -1, "y": -1}, {"x": 1, "y": 1}]}, "terminal": {"pos": [{"x": 0, "y": -1}]}, "spawn": {"pos": [{"x": 1, "y": -1}]}, "storage": {"pos": [{"x": -1, "y": 0}]}, "link": {"pos": [{"x": 0, "y": 1}]}}},
    7: {"name": "textExport", "shard": "shard0", "rcl": "7", "buildings": {"road": {"pos": [{"x": -2, "y": -7}, {"x": -1, "y": -7}, {"x": 0, "y": -7}, {"x": 1, "y": -7}, {"x": 2, "y": -7}, {"x": -3, "y": -6}, {"x": 0, "y": -6}, {"x": 3, "y": -6}, {"x": -4, "y": -5}, {"x": 0, "y": -5}, {"x": 4, "y": -5}, {"x": -5, "y": -4}, {"x": 0, "y": -4}, {"x": 5, "y": -4}, {"x": -6, "y": -3}, {"x": -1, "y": -3}, {"x": 0, "y": -3}, {"x": 1, "y": -3}, {"x": 3, "y": -3}, {"x": 6, "y": -3}, {"x": -7, "y": -2}, {"x": -2, "y": -2}, {"x": -1, "y": -2}, {"x": 1, "y": -2}, {"x": 2, "y": -2}, {"x": 7, "y": -2}, {"x": -7, "y": -1}, {"x": -3, "y": -1}, {"x": -2, "y": -1}, {"x": 2, "y": -1}, {"x": 3, "y": -1}, {"x": 7, "y": -1}, {"x": -7, "y": 0}, {"x": -6, "y": 0}, {"x": -5, "y": 0}, {"x": -4, "y": 0}, {"x": -3, "y": 0}, {"x": 3, "y": 0}, {"x": 4, "y": 0}, {"x": 5, "y": 0}, {"x": 6, "y": 0}, {"x": 7, "y": 0}, {"x": -7, "y": 1}, {"x": -3, "y": 1}, {"x": -2, "y": 1}, {"x": 2, "y": 1}, {"x": 3, "y": 1}, {"x": 7, "y": 1}, {"x": -7, "y": 2}, {"x": -2, "y": 2}, {"x": -1, "y": 2}, {"x": 1, "y": 2}, {"x": 2, "y": 2}, {"x": 7, "y": 2}, {"x": -6, "y": 3}, {"x": -1, "y": 3}, {"x": 0, "y": 3}, {"x": 1, "y": 3}, {"x": 6, "y": 3}, {"x": -5, "y": 4}, {"x": 0, "y": 4}, {"x": 5, "y": 4}, {"x": -4, "y": 5}, {"x": 0, "y": 5}, {"x": 4, "y": 5}, {"x": -3, "y": 6}, {"x": 0, "y": 6}, {"x": 3, "y": 6}, {"x": -2, "y": 7}, {"x": -1, "y": 7}, {"x": 0, "y": 7}, {"x": 1, "y": 7}, {"x": 2, "y": 7}]}, "extension": {"pos": [{"x": -1, "y": -5}, {"x": -2, "y": -4}, {"x": -1, "y": -4}, {"x": -3, "y": -3}, {"x": -2, "y": -3}, {"x": -4, "y": -2}, {"x": -3, "y": -2}, {"x": -6, "y": -1}, {"x": -5, "y": -1}, {"x": -4, "y": -1}, {"x": -6, "y": 1}, {"x": -5, "y": 1}, {"x": -4, "y": 1}, {"x": 4, "y": 1}, {"x": 5, "y": 1}, {"x": 6, "y": 1}, {"x": -6, "y": 2}, {"x": -5, "y": 2}, {"x": -4, "y": 2}, {"x": -3, "y": 2}, {"x": 3, "y": 2}, {"x": 4, "y": 2}, {"x": 5, "y": 2}, {"x": 6, "y": 2}, {"x": -5, "y": 3}, {"x": -4, "y": 3}, {"x": -3, "y": 3}, {"x": -2, "y": 3}, {"x": 2, "y": 3}, {"x": 3, "y": 3}, {"x": 4, "y": 3}, {"x": 5, "y": 3}, {"x": -4, "y": 4}, {"x": -3, "y": 4}, {"x": -2, "y": 4}, {"x": -1, "y": 4}, {"x": 1, "y": 4}, {"x": 2, "y": 4}, {"x": 3, "y": 4}, {"x": 4, "y": 4}, {"x": -3, "y": 5}, {"x": -2, "y": 5}, {"x": -1, "y": 5}, {"x": 1, "y": 5}, {"x": 2, "y": 5}, {"x": 3, "y": 5}, {"x": -2, "y": 6}, {"x": -1, "y": 6}, {"x": 1, "y": 6}, {"x": 2, "y": 6}]}, "spawn": {"pos": [{"x": 1, "y": -4}, {"x": 1, "y": -1}]}, "lab": {"pos": [{"x": 2, "y": -4}, {"x": 3, "y": -4}, {"x": 4, "y": -4}, {"x": 4, "y": -3}, {"x": 3, "y": -2}, {"x": 4, "y": -2}]}, "tower": {"pos": [{"x": -1, "y": -1}, {"x": 2, "y": 0}, {"x": 1, "y": 1}]}, "terminal": {"pos": [{"x": 0, "y": -1}]}, "storage": {"pos": [{"x": -1, "y": 0}]}, "factory": {"pos": [{"x": 1, "y": 0}]}, "link": {"pos": [{"x": 0, "y": 1}]}}},
    8: {"name": "textExport", "shard": "shard0", "rcl": "8", "buildings": {"road": {"pos": [{"x": -2, "y": -7}, {"x": -1, "y": -7}, {"x": 0, "y": -7}, {"x": 1, "y": -7}, {"x": 2, "y": -7}, {"x": -3, "y": -6}, {"x": 0, "y": -6}, {"x": 1, "y": -6}, {"x": 2, "y": -6}, {"x": 3, "y": -6}, {"x": -4, "y": -5}, {"x": 0, "y": -5}, {"x": 4, "y": -5}, {"x": -5, "y": -4}, {"x": 0, "y": -4}, {"x": 5, "y": -4}, {"x": -6, "y": -3}, {"x": -1, "y": -3}, {"x": 0, "y": -3}, {"x": 1, "y": -3}, {"x": 3, "y": -3}, {"x": 6, "y": -3}, {"x": -7, "y": -2}, {"x": -2, "y": -2}, {"x": -1, "y": -2}, {"x": 1, "y": -2}, {"x": 2, "y": -2}, {"x": 6, "y": -2}, {"x": 7, "y": -2}, {"x": -7, "y": -1}, {"x": -3, "y": -1}, {"x": -2, "y": -1}, {"x": 2, "y": -1}, {"x": 3, "y": -1}, {"x": 6, "y": -1}, {"x": 7, "y": -1}, {"x": -7, "y": 0}, {"x": -6, "y": 0}, {"x": -5, "y": 0}, {"x": -4, "y": 0}, {"x": -3, "y": 0}, {"x": 3, "y": 0}, {"x": 4, "y": 0}, {"x": 5, "y": 0}, {"x": 6, "y": 0}, {"x": 7, "y": 0}, {"x": -7, "y": 1}, {"x": -3, "y": 1}, {"x": -2, "y": 1}, {"x": 2, "y": 1}, {"x": 3, "y": 1}, {"x": 7, "y": 1}, {"x": -7, "y": 2}, {"x": -2, "y": 2}, {"x": -1, "y": 2}, {"x": 1, "y": 2}, {"x": 2, "y": 2}, {"x": 7, "y": 2}, {"x": -6, "y": 3}, {"x": -1, "y": 3}, {"x": 0, "y": 3}, {"x": 1, "y": 3}, {"x": 6, "y": 3}, {"x": -5, "y": 4}, {"x": 0, "y": 4}, {"x": 5, "y": 4}, {"x": -4, "y": 5}, {"x": 0, "y": 5}, {"x": 4, "y": 5}, {"x": -3, "y": 6}, {"x": 0, "y": 6}, {"x": 3, "y": 6}, {"x": -2, "y": 7}, {"x": -1, "y": 7}, {"x": 0, "y": 7}, {"x": 1, "y": 7}, {"x": 2, "y": 7}]}, "extension": {"pos": [{"x": -2, "y": -6}, {"x": -1, "y": -6}, {"x": -3, "y": -5}, {"x": -2, "y": -5}, {"x": -1, "y": -5}, {"x": -4, "y": -4}, {"x": -3, "y": -4}, {"x": -2, "y": -4}, {"x": -1, "y": -4}, {"x": -5, "y": -3}, {"x": -4, "y": -3}, {"x": -3, "y": -3}, {"x": -2, "y": -3}, {"x": -6, "y": -2}, {"x": -5, "y": -2}, {"x": -4, "y": -2}, {"x": -3, "y": -2}, {"x": -6, "y": -1}, {"x": -5, "y": -1}, {"x": -4, "y": -1}, {"x": -6, "y": 1}, {"x": -5, "y": 1}, {"x": -4, "y": 1}, {"x": 4, "y": 1}, {"x": 5, "y": 1}, {"x": 6, "y": 1}, {"x": -6, "y": 2}, {"x": -5, "y": 2}, {"x": -4, "y": 2}, {"x": -3, "y": 2}, {"x": 3, "y": 2}, {"x": 4, "y": 2}, {"x": 5, "y": 2}, {"x": 6, "y": 2}, {"x": -5, "y": 3}, {"x": -4, "y": 3}, {"x": -3, "y": 3}, {"x": -2, "y": 3}, {"x": 2, "y": 3}, {"x": 3, "y": 3}, {"x": 4, "y": 3}, {"x": 5, "y": 3}, {"x": -4, "y": 4}, {"x": -3, "y": 4}, {"x": -2, "y": 4}, {"x": -1, "y": 4}, {"x": 1, "y": 4}, {"x": 2, "y": 4}, {"x": 3, "y": 4}, {"x": 4, "y": 4}, {"x": -3, "y": 5}, {"x": -2, "y": 5}, {"x": -1, "y": 5}, {"x": 1, "y": 5}, {"x": 2, "y": 5}, {"x": 3, "y": 5}, {"x": -2, "y": 6}, {"x": -1, "y": 6}, {"x": 1, "y": 6}, {"x": 2, "y": 6}]}, "nuker": {"pos": [{"x": -1, "y": 1}]}, "lab": {"pos": [{"x": 2, "y": -5}, {"x": 3, "y": -5}, {"x": 2, "y": -4}, {"x": 3, "y": -4}, {"x": 4, "y": -4}, {"x": 4, "y": -3}, {"x": 5, "y": -3}, {"x": 3, "y": -2}, {"x": 4, "y": -2}, {"x": 5, "y": -2}]}, "spawn": {"pos": [{"x": 1, "y": -4}, {"x": 1, "y": -1}, {"x": 4, "y": -1}]}, "tower": {"pos": [{"x": 0, "y": -2}, {"x": -1, "y": -1}, {"x": -2, "y": 0}, {"x": 2, "y": 0}, {"x": 1, "y": 1}, {"x": 0, "y": 2}]}, "terminal": {"pos": [{"x": 0, "y": -1}]}, "observer": {"pos": [{"x": 5, "y": -1}]}, "storage": {"pos": [{"x": -1, "y": 0}]}, "factory": {"pos": [{"x": 1, "y": 0}]}, "powerSpawn": {"pos": [{"x": 1, "y": -5}]}, "link": {"pos": [{"x": 0, "y": 1}]}}}
}

Room.prototype.getEnergyStructures =
    function(filling=false) {
        const anchor = this.memory.anchor;
        if (!anchor) {
            return null;
        }
        let structures = [];

        for (const coord of energyStructureOrder) {
            // const pos = new RoomPosition(anchor.x + coord.x, anchor.y + coord.y, this.name);

            // const structure = pos.lookFor(LOOK_STRUCTURES, {filter: s => s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION})[0];

            const structure = this.lookForAt(LOOK_STRUCTURES, anchor.x + coord.x, anchor.y + coord.y, {filter: s => s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION})[0];

            if (structure) {
                // if (filling && structure.energy == structure.energyCapacity) {
                //     break;
                // } else 
                if (filling && structure.energy != structure.energyCapacity) {
                    structures.push(structure);
                } else if (!filling) {
                    structures.push(structure);
                }
            }
            if (filling && structures.length > 2) {
                break;
            }
        }

        // Memory.temp = structures;
        return structures;
    }

const energyStructureOrder = [
    {"x": 1, "y": -1},

    {"x": 5, "y": 1},
    {"x": 4, "y": 1},
    {"x": 4, "y": 2},
    {"x": 3, "y": 2},
    {"x": 3, "y": 3},
    {"x": 2, "y": 3},
    {"x": 2, "y": 4},
    {"x": 1, "y": 4},
    {"x": 1, "y": 5},

    {"x": -1, "y": 5},
    {"x": -1, "y": 4},
    {"x": -2, "y": 4},
    {"x": -2, "y": 3},
    {"x": -3, "y": 3},
    {"x": -3, "y": 2},
    {"x": -4, "y": 2},
    {"x": -4, "y": 1},
    {"x": -5, "y": 1},

    {"x": -5, "y": -1},
    {"x": -4, "y": -1},
    {"x": -4, "y": -2},
    {"x": -3, "y": -2},
    {"x": -3, "y": -3},
    {"x": -2, "y": -3},
    {"x": -2, "y": -4},
    {"x": -1, "y": -4},
    {"x": -1, "y": -5},

    {"x": 6, "y": 1},
    {"x": 6, "y": 2},
    {"x": 5, "y": 2},
    {"x": 5, "y": 3},
    {"x": 4, "y": 3},
    {"x": 4, "y": 4},
    {"x": 3, "y": 4},
    {"x": 3, "y": 5},
    {"x": 2, "y": 5},
    {"x": 2, "y": 6},
    {"x": 1, "y": 6},

    {"x": -1, "y": 6},
    {"x": -2, "y": 6},
    {"x": -2, "y": 5},
    {"x": -3, "y": 5},
    {"x": -3, "y": 4},
    {"x": -4, "y": 4},
    {"x": -4, "y": 3},
    {"x": -5, "y": 3},
    {"x": -5, "y": 2},
    {"x": -6, "y": 2},
    {"x": -6, "y": 1},

    {"x": -6, "y": -1},
    {"x": -6, "y": -2},
    {"x": -5, "y": -2},
    {"x": -5, "y": -3},
    {"x": -4, "y": -3},
    {"x": -4, "y": -4},
    {"x": -3, "y": -4},
    {"x": -3, "y": -5},
    {"x": -2, "y": -5},
    {"x": -2, "y": -6},
    {"x": -1, "y": -6},

    {"x": 1, "y": -4},
    {"x": 4, "y": -1},
]