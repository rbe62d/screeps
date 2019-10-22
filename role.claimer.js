module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.targetRoom.toLowerCase() != creep.room.name.toLowerCase()) {
            creep.travelTo(new RoomPosition(25, 25, creep.memory.targetRoom));
        } else {
            let controller = creep.room.controller;

            if(creep.claimController(controller) == ERR_NOT_IN_RANGE) {
                creep.travelTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }

            if (creep.room.controller.my) {
                creep.room.buildController(true);
                creep.room.memory.type == 'base';
            }
        }
    }
};