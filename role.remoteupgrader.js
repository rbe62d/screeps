module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if (creep.memory.targetRoom.toLowerCase() != creep.room.name.toLowerCase()) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.targetRoom));
        } else {
        	creep.moveTo(new RoomPosition(25, 25, creep.memory.targetRoom));
            creep.memory.role = 'upgrader'
        }
    }
};