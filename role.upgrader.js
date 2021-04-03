module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        let MESSAGE = 'Who put this sign here?!';

        // let control = creep.room.controller;
        let control = Game.rooms[creep.memory.home].controller;

        if (creep.ticksToLive % 100 < 10) {
            creep.say(control.progress);
        }

        if(creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
            creep.say('🔄 harvest');
        } else if(!creep.memory.working && creep.store[RESOURCE_ENERGY] == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('⚡ upgrade');
        }

        if(creep.memory.working) {
            if (creep.pos.findInRange(FIND_SOURCES, 1).length > 0) {
                creep.travelTo(control, {visualizePathStyle: {stroke: '#ffffff'}});
            } else {
                if (control.my && (control.sign == undefined || control.owner.username != control.sign.username || MESSAGE != control.sign.text)) {
                    if (creep.signController(control, MESSAGE) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(control);
                    }
                // } else if(creep.upgradeController(control) == ERR_NOT_IN_RANGE) {
                } else if (!creep.pos.inRangeTo(control, 3)) {
                    creep.travelTo(control, {visualizePathStyle: {stroke: '#ffffff'}});
                } else if (creep.pos.lookFor(LOOK_STRUCTURES).length > 0 || !creep.pos.inRangeTo(control, 3)) {
                    // creep.travelTo(control, {})
                    // move off roads via creep.pos.getDirectionTo(control)
                    // let dir = creep.pos.getDirectionTo(control);
                    let ret = PathFinder.search(
                        creep.pos, {pos: control.pos, range: 2},
                        {
                          // We need to set the defaults costs higher so that we
                          // can set the road cost lower in `roomCallback`
                          plainCost: 1,
                          swampCost: 5,

                          roomCallback: function(roomName) {

                            let room = Game.rooms[roomName];
                            // In this example `room` will always exist, but since 
                            // PathFinder supports searches which span multiple rooms 
                            // you should be careful!
                            if (!room) return;
                            let costs = new PathFinder.CostMatrix;

                            room.find(FIND_STRUCTURES).forEach(function(struct) {
                              if (struct.structureType === STRUCTURE_ROAD) {
                                // Favor no roads 
                                costs.set(struct.pos.x, struct.pos.y, 6);
                              }
                            });

                            // Avoid creeps in the room
                            room.find(FIND_CREEPS).forEach(function(creep) {
                              costs.set(creep.pos.x, creep.pos.y, 0xff);
                            });

                            return costs;
                          },
                        }
                      );

                      creep.move(creep.pos.getDirectionTo(ret.path[0]));
                } else if (creep.pos.inRangeTo(control, 3)) {
                    creep.upgradeController(control)
                } 
            }
        } else {
            creep.getEnergy(true,true)
        }
    }
};