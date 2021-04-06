// require('prototype.room');

module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        let homeroom = Game.rooms[creep.memory.home];

        if (creep == undefined) {
            return;
        }

        // creep.suicide()

        if (creep.ticksToLive == 1500) {
            addExits(creep);
        }

        if (creep.memory.explore == undefined) {
            creep.memory.explore = [];
            for (let roomname of Object.keys(Memory.rooms)) {
                if (Memory.rooms[roomname] == undefined || Memory.rooms[roomname].type == undefined) {
                    creep.memory.explore.unshift(roomname);
                } else if (Memory.rooms[roomname].type == 'unexplored') {
                    creep.memory.explore.unshift(roomname);
                } else if (Memory.rooms[roomname].type != 'mine' && Memory.rooms[roomname].type != 'base' && Memory.rooms[roomname].rescout <= Game.time) {
                    creep.memory.explore.push(roomname);
                }
            }

            creep.memory.explore = _.shuffle(creep.memory.explore);
        }
        // if (creep.memory._move == undefined) {
        //     creep.memory._move = {};
        // }
    
        if (creep.memory.explore.length == 0) {
            // delete creep.memory.explore;
            addExits(creep);
        } else {
            // if (!Game.map.isRoomAvailable(creep.memory.explore[0])) { // || (Memory.rooms[creep.memory.explore[0]] != undefined && Memory.rooms[creep.memory.explore[0]]['rescout'] != undefined && Memory.rooms[creep.memory.explore[0]]['rescout'] > Game.time)) {
            if (Game.map.getRoomStatus(creep.memory.explore[0])["status"] != "normal") {
                creep.memory.explore.shift();
            }

            if (creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49) {
                let err = creep.travelTo(new RoomPosition(25, 25, creep.memory.explore[0]), {offroad: true, swampCost: 1});
                if (err == ERR_INVALID_ARGS) {
                    // creep.say('fuck')
                    creep.memory.explore.shift();
                }
                
                if (creep.room.name != creep.memory.home && creep.room.memory.rescout < Game.time) {
                    creep.room.gatherIntel(creep.memory.home);
                }

                let index = creep.memory.explore.indexOf(creep.room.name);

                if (index >= 0) {
                    creep.memory.explore.splice(index, 1);
                }

            } else if (creep.memory.explore.length > 0 && creep.room.name != creep.memory.explore[0]) {
                let err = creep.travelTo(new RoomPosition(25, 25, creep.memory.explore[0]), {offroad: true, swampCost: 1});

                if (err == ERR_INVALID_ARGS) {
                    // creep.say('fuck1')
                    creep.memory.explore.shift();
                }
                // console.log('scout err: ' + err)
                // if (err == ERR_NO_PATH) {
                //     creep.say('fuck')
                // }
                // if (err == ERR_INVALID_ARGS) {
                //     creep.say('fuck1')
                // }
            } else {
                creep.move(new RoomPosition(25, 25, creep.memory.explore[0]), {offroad: true, swampCost: 1});
                creep.memory.explore.shift();

                addExits(creep);
            }
        }

    }
};

function addExits(creep, force=false) {
    let homeroom = Game.rooms[creep.memory.home];
    let exits = []; 
    let squares = Game.map.describeExits(creep.room.name);
    for (let tile in squares) {
        exits.push(squares[tile]);
    }

    for (let exit of exits) {
        // if (!Game.map.isRoomAvailable(exit)) {
        if (Game.map.getRoomStatus(exit)["status"] != "normal") {
            continue;
        }
        if (Game.map.getRoomLinearDistance(creep.memory.home, exit) <= 10) {
            if (force && creep.memory.explore.indexOf(exit) < 0) {
                creep.memory.explore.unshift(exit);
            } else if (Memory.rooms[exit] == undefined || Memory.rooms[exit].type == undefined) {
                creep.memory.explore.unshift(exit);
            } else if (Memory.rooms[exit].type != 'mine' && Memory.rooms[exit].type != 'base' && (Memory.rooms[exit].type == 'unexplored' || Memory.rooms[exit].rescout <= Game.time) && creep.memory.explore.indexOf(exit) < 0) {
                creep.memory.explore.unshift(exit);
            }
        }
    }
}