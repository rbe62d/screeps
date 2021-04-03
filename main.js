require('prototype.creep');
require('prototype.tower');
require('prototype.spawn');
require('prototype.observer');
require('prototype.room');
require('prototype.terminal');
require('Traveler');
const profiler = require('screeps-profiler');

// ------------------------------------------------------------------------
// Game.profiler.profile(50);
// Game.profiler.profile(ticks, [functionFilter]);
// Game.profiler.email(ticks, [functionFilter]);
// Game.profiler.background([functionFilter]);
// // Reset the profiler, disabling any profiling in the process.
// Game.profiler.reset();
// Game.profiler.restart();
// ------------------------------------------------------------------------

profiler.enable();
module.exports.loop = function () {

profiler.wrap(function() {
    let haltexpand = true;

    

    // for (let roomname of Memory.bases) {
    //     let foundmins = Game.rooms[roomname].find(FIND_MINERALS);
    //     if (foundmins.length) {
    //         Memory.rooms[roomname].mineral = {};
    //         Memory.rooms[roomname].mineral.type = foundmins[0].mineralType;
    //         Memory.rooms[roomname].mineral.x = foundmins[0].pos.x
    //         Memory.rooms[roomname].mineral.y = foundmins[0].pos.y
    //     }
    // }


    if (Memory.test && Memory.test != '') {
        const terrain = Game.map.getRoomTerrain(Memory.test);

        let plainsCount = 0;
        let swampCount = 0;
        let wallCount = 0;

        for (let x = 1; x < 50; x++) {
            for (let y = 1; y < 50; y++) {
                switch(terrain.get(x, y)) {
                    case TERRAIN_MASK_SWAMP:
                        swampCount++;
                        break;
                    case TERRAIN_MASK_WALL:
                        wallCount++;
                        break;
                    case 0:
                        plainsCount++;
                        break;
                }
            }
        }

        console.log('plains: ' + plainsCount)
        console.log('walls: ' + wallCount)
        console.log('swamps: ' + swampCount)
        Memory.test = null;
    }



    if (_.filter(Game.creeps).length == 0 && _.filter(Game.spawns).length == 1) {
        for (let spawnname in Game.spawns) {
            if (Game.spawns[spawnname].room.controller.level == 1 && Game.spawns[spawnname].room.controller.progress == 0) {
                for (let thing in Memory) {
                    if (thing != 'rooms') {
                        delete Memory[thing];
                    }
                }
            }
            let spawn = Game.spawns[spawnname];
            spawn.room.memory.type = 'base';
            spawn.room.memory.anchor = {x: spawn.pos.x - 1, y: spawn.pos.y + 1}
        }
    }

    if (Memory.bases == undefined) {
        Memory.bases = [];
    }
    if (Memory.basesCopy == undefined) {
        Memory.basesCopy = {};
    }
    if (Memory.expanding == undefined) {
        Memory.expanding = '';
    }

    let t = Game.time
    if (t%100 == 0) {
        for (let ruum in Memory.rooms) {
            // if (!Game.map.isRoomAvailable(ruum)) {
            if (Game.map.getRoomStatus(ruum)["status"] != "normal") {
                delete Memory.rooms[ruum];
            }
        }
        for (let roomname of Memory.bases) {
            if (Game.rooms[roomname] == undefined || !Game.rooms[roomname].controller.my) {
                let index = Memory.bases.indexOf(roomname);
                Memory.bases.splice(index, 1);
            }
        }
        for (let roomname of Memory.bases) {
            Memory.basesCopy[roomname] = Memory.rooms[roomname];
        }
    }

    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    if (t%5000 == 0) {
        // Game.rooms.W5N3.memory.remotebuild = "w5n1"
        // Game.rooms.W7N2.memory.remotebuild = "w6n1"
        // console.log("remote w7n3")

        // Memory.attackRichie = true;
    } else if ((t+500)%1500  == 0) {
        // Game.rooms.W5N3.memory.remotebuild = "w5n1"
        // Game.rooms.W7N2.memory.remotebuild = "w6n1"
        // Game.rooms.W8N3.memory.remotebuild = "w8n2"
        // console.log("remote w7n4")
    } else if ((t+1000)%1500  == 0) {
        // Game.rooms.W5N3.memory.remotebuild = "w5n1"
        // Game.rooms.W7N2.memory.remotebuild = "w6n1"
        // Game.rooms.W8N3.memory.remotebuild = "w7n4"
        // console.log("remote w7n4")
    }

    for (let roomname in Game.rooms) {
        if (Game.rooms[roomname].memory.type == 'base') {
            try {
                Game.rooms[roomname].buildController();
            } catch (error) {
                console.log('Room: ' + roomname + ' build controller errored: ' + error);
            }

            if (Memory.bases.indexOf(roomname) < 0) {
                Memory.bases.push(roomname);
            }
        }
    }

    for (let spawnName in Game.spawns) {
        try {
            let spawn = Game.spawns[spawnName];
            if (!spawn.spawning) {
                spawn.spawnController();
            }
        } catch (error) {
            console.log('Spawn: ' + spawnName + ' spawn controller errored: ' + error);
        }
        
        let roomname = Game.spawns[spawnName].room.name;

        if (Game.rooms[roomname].memory.nearby == undefined) {
            Game.rooms[roomname].memory.nearby = [];
            // Game.rooms[roomname].gatherIntel(roomname);
        }

        let name = spawnName.substring(0,6).toLowerCase();
        if (name == 'spawn1') {
            if (Game.rooms[roomname].memory.nearby.indexOf(roomname) < 0 || Memory.rooms[roomname] == undefined) {
                try {
                    Game.rooms[roomname].gatherIntel(roomname);
                } catch (error) {
                    console.log('Spawn: ' + spawnName + ' gather intel errored: ' + error);
                }
            }

            if (Game.time % 10 == 0) {
                // delete Game.rooms[roomname].memory.nearby
                // delete Memory.rooms
            }
        }

    }

    let towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    for (let tower of towers) {
        try {
            tower.runRole();
        } catch (error) {
            console.log('tower: ' + tower.room.name + '; ' + tower.pos.x + ', ' + tower.pos.y + ' errored: ' + error);
        }
    }

    let observers = _.filter(Game.structures, s => s.structureType == STRUCTURE_OBSERVER);
    for (let observer of observers) {
        try {
            observer.runRole();
        } catch (error) {
            console.log('observer: ' + observer.room.name + '; ' + observer.pos.x + ', ' + observer.pos.y + ' errored: ' + error);
        }
    }

    let terminals = _.filter(Game.structures, s => s.structureType == STRUCTURE_TERMINAL);
    for (let terminal of terminals) {
        if (t%20 != 3) {
            break;
        }

        try {
            terminal.runRole()
        } catch (error) {
            console.log('terminal: ' + terminal.room.name + ' done broke like ' + error);
        }
    }


    // Memory.temp = Memory.bases;
    // for (let roomname of Memory.temp) {
    //     if (t%10 == 0) {
    //         let ruum = Game.rooms[roomname];
    //         if (ruum == undefined || !ruum.controller.my) {
    //             let index = Memory.temp.indexOf(roomname);
    //             Memory.temp.splice(index, 1);
    //         } else {

    //             // console.log(roomname)
    //         }
    //     }
    // }

    for(let name in Game.creeps) {
        Game.creeps[name].runRole();
    }

    if (!haltexpand && Memory.bases.length < Game.gcl.level && t%500 == 1 && Memory.expanding == '') {

        let bestscore = 0;
        let bestroom = '';
        for (let roomname in Memory.rooms) {
            let bonus = 200;
            if (Memory.rooms[roomname].mineral.type == 'O' || Memory.rooms[roomname].mineral.type == 'H') {
                bonus = 400;
            }
            for (let rum of Memory.bases) {
                if (Memory.rooms[roomname].mineral == undefined) {
                    bonus = 0;
                    break;
                } else if (Memory.rooms[rum].mineral.type == Memory.rooms[roomname].mineral.type) {
                    bonus = 0;
                    break;
                }
            }

            if (Memory.rooms[roomname].type == 'explored' && Memory.rooms[roomname].anchor != false) {
                let canExpand = _.filter(Memory.bases, function(s) {
                    return Game.rooms[s].controller.level >= 5 && Memory.rooms[s].expand == '';
                })
                for (let th of canExpand) {
                    const route = Game.map.findRoute(th, roomname, {
                        routeCallback(roomName, fromRoomName) {
                            if (Memory.rooms[roomName] == undefined) {
                                return Infinity;
                            } else if(Memory.rooms[roomName].avoid == 1 || Memory.rooms[roomName].type == 'enemy') {    // avoid this room
                                return Infinity;
                            }
                            return 1;
                        }});
                    if (route.length <= 7 && Memory.rooms[roomname].anchor.score + bonus > bestscore) {
                        bestscore = Memory.rooms[roomname].anchor.score + bonus;
                        bestroom = roomname;
                    }
                }

            }
        }

        Memory.expanding = bestroom;
    }

    if (Memory.expanding != '' && Memory.expanding != 'taken') {
        let canExpand = _.filter(Memory.bases, function(s) {
            return Game.rooms[s].controller.level >= 5 && Memory.rooms[s].expand == '';
        })
        let bestscore = 100;
        let bestroom = '';
        for (let th of canExpand) {
            const route = Game.map.findRoute(th, Memory.expanding, {
                routeCallback(roomName, fromRoomName) {
                    if (Memory.rooms[roomName] == undefined) {
                        return Infinity;
                    } else if(Memory.rooms[roomName].avoid == 1 || Memory.rooms[roomName].type == 'enemy') {    // avoid this room
                        return Infinity;
                    }
                    return 1;
                }});
            if (route.length < bestscore) {
                bestscore = route.length;
                bestroom = th;
            }
        }

        if (bestroom != '') {
            Memory.rooms[bestroom].expand = Memory.expanding;
            Memory.expanding = 'taken';
        }
    }

});

}

module.exports.checker = function(temproomname, swampvalid = true) {
    let roomname = temproomname.toUpperCase();

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

    if (swampvalid && !(swampCount < 500 && swampCount < 0.5 * plainsCount)) {
        console.log("too many swamps, too many swamps")
    } else {
        for (let coord of list) {
            new RoomVisual(roomname).circle(coord.x, coord.y);
        }
    }
}