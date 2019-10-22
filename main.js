require('prototype.creep');
require('prototype.tower');
require('prototype.spawn');
require('prototype.observer');
require('prototype.room');
require('Traveler');

module.exports.loop = function () {
    if (_.filter(Game.creeps).length == 0 && _.filter(Game.spawns).length == 1) {
        for (let spawnname in Game.spawns) {
            if (Game.spawns[spawnname].room.controller.level == 1 && Game.spawns[spawnname].room.controller.progress == 0) {
                for (let thing in Memory) {
                    delete Memory[thing];
                }
            }
            Game.spawns[spawnname].room.memory.type = 'base';
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
    }

    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    if (t%1500 == 0) {
        // Game.rooms.W5N3.memory.remotebuild = "w5n1"
        // Game.rooms.W7N2.memory.remotebuild = "w6n1"
        // console.log("remote w7n3")
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
            Game.spawns[spawnName].spawnController();
        } catch (error) {
            console.log('Spawn: ' + spawnName + ' spawn controller errored: ' + error);
        }
        
        let roomname = Game.spawns[spawnName].room.name;

        if (Game.rooms[roomname].memory.nearby == undefined) {
            Game.rooms[roomname].memory.nearby = [];
            // Game.rooms[roomname].gatherIntel(roomname);
        }

        let name = spawnName.substring(0,6);
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

    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    for (let tower of towers) {
        try {
            tower.runRole();
        } catch (error) {
            console.log('tower: ' + tower.room.name + '; ' + tower.pos.x + ', ' + tower.pos.y + ' errored: ' + error);
        }
    }

    var observers = _.filter(Game.structures, s => s.structureType == STRUCTURE_OBSERVER);
    for (let observer of observers) {
        try {
            observer.runRole();
        } catch (error) {
            console.log('observer: ' + observer.room.name + '; ' + observer.pos.x + ', ' + observer.pos.y + ' errored: ' + error);
        }
    }

    for(let name in Game.creeps) {
        Game.creeps[name].runRole();
    }

    if (Memory.bases.length < Game.gcl.level && t%10 == 0 && Memory.expanding == '') {

        let bestscore = 0;
        let bestroom = '';
        for (let roomname in Memory.rooms) {
            if (Memory.rooms[roomname].type == 'explored' && Memory.rooms[roomname].anchor != false) {
                let canExpand = _.filter(Memory.bases, function(s) {
                    return Game.rooms[s].controller.level >= 6 && Memory.rooms[s].expand == '';
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
                    if (route.length <= 5 && Memory.rooms[roomname].anchor.score > bestscore) {
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
            return Game.rooms[s].controller.level >= 6 && Memory.rooms[s].expand == '';
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