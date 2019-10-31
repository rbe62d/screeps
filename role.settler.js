module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if (creep.memory.targetRoom.toLowerCase() != creep.room.name.toLowerCase()) {
            creep.travelTo(new RoomPosition(25, 25, creep.memory.targetRoom));
        } else {
            if (creep.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_SPAWN}).length > 0) {
                Memory.rooms[creep.memory.home].expand = '';
                Memory.expanding = '';
                creep.memory.home = creep.memory.targetRoom;
                creep.memory.role = 'harvester';
            } else {
                creep.runOtherRole('harvester');
            }
        }
    }
};