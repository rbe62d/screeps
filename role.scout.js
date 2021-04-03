// require('prototype.room');

module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        let homeroom = Game.rooms[creep.memory.home];

        // creep.suicide()

        if (creep.memory.explore == undefined) {
            creep.memory.explore = [];
            if (homeroom.memory.nearby != undefined) {
                for (let ruum of homeroom.memory.nearby) {
                    if (Memory.rooms[ruum] == undefined || Memory.rooms[ruum].type == undefined) {
                        creep.memory.explore.unshift(ruum);
                    } else if (Memory.rooms[ruum].type == 'unexplored') {
                        creep.memory.explore.unshift(ruum);
                    } else if (Memory.rooms[ruum].type != 'mine' && Memory.rooms[ruum].type != 'base' && Memory.rooms[ruum].rescout <= Game.time) {
                        creep.memory.explore.push(ruum);
                    }
                }
                for (let ruum in Memory.rooms) {
                    if (homeroom.memory.nearby.indexOf(ruum) < 0 && Game.map.getRoomLinearDistance(homeroom.name, ruum) <= 10) {
                        creep.memory.explore.unshift(ruum);
                    }
                }

                creep.memory.explore = _.shuffle(creep.memory.explore);
            } else {
                homeroom.memory.nearby = [];
            }
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
                // console.log('scout err: ' + err)
                if (creep.room.name != creep.memory.name) {
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
            if (homeroom.memory.nearby.indexOf(exit) < 0) {
                creep.memory.explore.unshift(exit);
                homeroom.memory.nearby.push(exit);
            } else if (Memory.rooms[exit] == undefined || Memory.rooms[exit].type == undefined) {
                creep.memory.explore.unshift(exit);
            } else if (Memory.rooms[exit].type != 'mine' && (force || Memory.rooms[exit].type == 'unexplored' || Memory.rooms[exit].rescout <= Game.time) && creep.memory.explore.indexOf(exit) < 0) {
                creep.memory.explore.unshift(exit);
            }
        }
    }
}