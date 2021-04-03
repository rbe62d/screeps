module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if (creep.memory.targetRoom.toLowerCase() != creep.room.name.toLowerCase()) {
            creep.travelTo(new RoomPosition(25, 25, creep.memory.targetRoom));
        // } else if (creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49) {
        //     creep.travelTo(new RoomPosition(25, 25, creep.memory.targetRoom));
        } else {
            if (creep.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_SPAWN}).length > 0) {
                // Memory.rooms[creep.memory.home].expand = '';
                Memory.rooms[creep.memory.home].assist = 1500;
                Memory.expanding = '';
                creep.memory.home = creep.memory.targetRoom;
                creep.memory.role = 'harvester';
                creep.runOtherRole('harvester');
            } else {
                creep.runOtherRole('harvester');
            }
        }
    }
};