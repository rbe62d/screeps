require('prototype.creep');
require('prototype.tower');
require('prototype.spawn');
require('prototype.observer');
require('prototype.room');
require('prototype.terminal');
require('Traveler');
const profiler = require('screeps-profiler');

profiler.enable();
module.exports.loop = function () {

profiler.wrap(function() {

    // {
    //     let bestscore = 0;
    //     let bestroom = '';
    //     for (let ruum in Memory.rooms) {
    //         // console.log(ruum)
    //         // if (Game.rooms[ruum].controller == undefined) {
    //         //     console.log(ruum)
    //         // }
    //         if (Memory.rooms[ruum].anchor != undefined && Memory.rooms[ruum].anchor != false && Memory.rooms[ruum].anchor.score != undefined) {
    //             if (Memory.rooms[ruum].anchor.score > bestscore) {
    //                 bestscore = Memory.rooms[ruum].anchor.score;
    //                 bestroom = ruum;
    //             }
    //         }

    //     }
    //     console.log('bestroom: ' + bestroom + ' ' + Memory.rooms[bestroom].anchor.x + ', ' + Memory.rooms[bestroom].anchor.y);
    // }

    if (_.filter(Game.creeps).length == 0 && _.filter(Game.spawns).length == 1) {
        for (let spawnname in Game.spawns) {
            if (Game.spawns[spawnname].room.controller.level == 1 && Game.spawns[spawnname].room.controller.progress == 0) {
                for (let thing in Memory) {
                    delete Memory[thing];
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
    if (Memory.expanding == undefined) {
        Memory.expanding = '';
    }

    let t = Game.time
    if (t%100 == 0) {
        for (let ruum in Memory.rooms) {
            if (!Game.map.isRoomAvailable(ruum)) {
                delete Memory.rooms[ruum];
            }
        }
        for (let roomname in Memory.bases) {
            if (Game.rooms[roomname] == undefined || !Game.rooms[roomname].controller.my) {
                let index = Memory.bases.indexOf(roomname);
                Memory.bases.splice(index, 1);
            }
        }
    }

    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    if (t%6000 == 0) {
        Memory.attackrichie = true
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

    if (Memory.bases.length == Game.gcl.level && t%500 == 2) {
        Memory.expanding = '';

        for (let base of Memory.bases) {
            Memory.rooms[base].expand = '';
        }
    }

    if (Memory.bases.length < Game.gcl.level && t%500 == 1 && Memory.expanding == '') {

        let bestscore = 0;
        let bestroom = '';
        for (let roomname in Memory.rooms) {
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
                    if (route.length <= 7 && Memory.rooms[roomname].anchor.score > bestscore) {
                        bestscore = Memory.rooms[roomname].anchor.score;
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

    // if (Memory.temp != undefined && Memory.temp._bits != undefined) {
    //     let matrix = Memory.temp._bits;
    //     let room = Game.rooms['W5N1'];

    //     for (let i in matrix) {
    //         let x = Math.floor(i/50);
    //         let y = i%50;

    //         if (matrix[i] == 0) {
    //            room.visual.circle(x,y, {stroke: 'green'})

    //         } else if (matrix[i] == 255) {
    //            room.visual.circle(x,y, {stroke: 'red'})
    //         } else {
    //            room.visual.circle(x,y, {stroke: 'blue'})
    //         }
    //     }
    // }
});

}

module.exports.checker = function(temproomname) {
    let roomname = temproomname.toUpperCase();

    const terrain = Game.map.getRoomTerrain(roomname);
    
    let dist = 8

    let list = []
    
    for (let rootx = dist; rootx <= 49-dist; rootx++) {
        for (let rooty = dist; rooty <= 49-dist; rooty++) {
            let valid = true;
            for (let x = -dist; x < dist + 1 && valid; x++) {
                for (let y = -dist; y < dist + 1 && valid; y++) {
                    if (Math.abs(x) + Math.abs(y) < dist + 2 && (Math.abs(x) < dist && Math.abs(y) < dist)) {
                        
                        switch(terrain.get(rootx + x, rooty + y)) {
                            case TERRAIN_MASK_WALL:
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

    for (let coord of list) {
        new RoomVisual(roomname).circle(coord.x, coord.y);
    }
}

module.exports.totalRemoveRoom = function(roomname) {
    if (Game.rooms[roomname] == undefined || !Game.rooms[roomname].controller.my) {

    } else {
        let room = Game.rooms[roomname];
        
        delete Memory.rooms[roomname];
        room.gatherIntel();

        let buildings = room.find(FIND_STRUCTURES);

        for (let building of buildings) {
            building.destroy();
        }


        room.controller.unclaim();
    }
}

module.exports.visMatrix = function () {
    if (Memory.temp != undefined && Memory.temp._bits != undefined) {
        let matrix = Memory.temp._bits;
        let room = Game.rooms['W5N1'];

        for (let i in matrix) {
            let x = Math.floor(i/50);
            let y = i%50;

            if (matrix[i] == 0) {

            } else if (matrix[i] == 255) {
               room.visual.circle(x,y, {stroke: 'red'})
            } else {
               room.visual.circle(x,y, {stroke: 'blue'})
            }
        }
    }
}