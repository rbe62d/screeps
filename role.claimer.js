module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.targetRoom.toLowerCase() != creep.room.name.toLowerCase()) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.targetRoom));
        } else {
            let controller = creep.room.controller;

            if(creep.claimController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
};