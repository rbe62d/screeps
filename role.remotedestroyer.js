module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // creep.suicide();

        if (creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49) {
            creep.travelTo(new RoomPosition(25, 25, creep.room.name));
        } else if (creep.memory.targetRoom.toLowerCase() != creep.room.name.toLowerCase()) {
            creep.travelTo(new RoomPosition(25, 25, creep.memory.targetRoom));
        } else {
            // creep.memory.role = 'builder';
            let target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {filter: s => s.structureType != STRUCTURE_RUIN});
            console.log(target)
            if (target == undefined) {
                // Game.rooms[creep.memory.home].memory.nearby[creep.memory.targetRoom].type = 'unexplored';
                // Memory.room[creep.memory.targetRoom].type = 'unexplored';
                creep.room.gatherIntel(creep.memory.home)
                creep.suicide();
            } else if (creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                creep.travelTo(target);
            }
        }
    }
};