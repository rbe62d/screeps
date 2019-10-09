require('prototype.room');

module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        let homeroom = Game.rooms[creep.memory.home];

        // creep.suicide()

        if (creep.memory.explore == undefined) {
            creep.memory.explore = [];
            if (homeroom.memory.nearby != undefined) {
                for (let ruum of homeroom.memory.nearby) {
                    if (Memory.roomData[ruum].type == 'unexplored') {
                        creep.memory.explore.unshift(ruum);
                    } else if (Memory.roomData[ruum].type != 'mine' && Memory.roomData[ruum].rescout <= Game.time) {
                        creep.memory.explore.push(ruum);
                    }
                }
                for (let ruum in Memory.roomData) {
                    if (homeroom.memory.nearby.indexOf(ruum) < 0 && Game.map.getRoomLinearDistance(homeroom.name, ruum) <= 10) {
                        creep.memory.explore.unshift(ruum);
                    }
                }
            } else {
                homeroom.memory.nearby = [];
            }
        }
        if (creep.memory._move == undefined) {
            creep.memory._move = {};
        }
    
        if (creep.memory.explore.length == 0) {
            addExits(creep);
        }

        if (creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49) {
            creep.moveTo(new RoomPosition(25, 25, creep.room.name), {reusePath: 1, swampCost: 1});
            delete creep.memory._move.path;
            // if (creep.memory._move.route != undefined && creep.memory._move.route.length > 1) {
            //     if (creep.room.name == creep.memory._move.route[0].room) {
            //         creep.memory._move.route.shift();
            //     }
            // } else {
            //     creep.moveTo(new RoomPosition(25, 25, creep.room.name), {reusePath: 1, swampCost: 1});
            //     delete creep.memory._move.path;
            // }
        } else if (creep.memory.explore.length > 0 && creep.room.name != creep.memory.explore[0]) {
            // console.log('fug1')
            if(creep.memory._move == undefined || creep.memory._move.route == undefined || creep.memory._move.path == undefined) {

                const route = Game.map.findRoute(creep.room, creep.memory.explore[0], {
                    routeCallback(roomName, fromRoomName) {
                        if(Memory.roomData[roomName] != undefined && roomName != creep.memory.explore[0] && Memory.roomData[roomName].type == 'enemy') {    // avoid this room
                            return Infinity;
                        }
                        return 1;
                    }});
                if (route.length > 0) {
                    const exit = creep.pos.findClosestByPath(route[0].exit);
                    creep.moveTo(exit, {reusePath: 2, swampCost: 1});
                    creep.memory._move.route = route;
                } else {
                    creep.memory.explore.shift();
                }
            } else {
                creep.moveByPath(creep.memory._move.path);
            }
        } else {
            creep.move(new RoomPosition(25, 25, creep.room.name), {swampCost: 1});
            creep.memory.explore.shift();
            delete creep.memory._move;

            creep.room.gatherIntel(creep.memory.home);

            addExits(creep);
        }
    }
};

function addExits(creep) {
    let homeroom = Game.rooms[creep.memory.home];
    let exits = []; 
    let squares = Game.map.describeExits(creep.room.name);
    for (let tile in squares) {
        exits.push(squares[tile]);
    }

    for (let exit of exits) {
        if (Game.map.getRoomLinearDistance(creep.memory.home, exit) <= 10) {
            if (homeroom.memory.nearby.indexOf(exit) < 0) {
                creep.memory.explore.unshift(exit);
            } else if (Memory.roomData[exit].type != 'mine' && (Memory.roomData[exit].type == 'unexplored' || Memory.roomData[exit].rescout <= Game.time) && creep.memory.explore.indexOf(exit) < 0) {
                creep.memory.explore.unshift(exit);
            }
        }
    }
}