module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // creep.suicide();

        // if (creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49) {
        //     creep.travelTo(new RoomPosition(25, 25, creep.room.name));
        // } else 
        if (creep.memory.targetRoom.toLowerCase() != creep.room.name.toLowerCase()) {
            creep.travelTo(new RoomPosition(25, 25, creep.memory.targetRoom), {useFindRoute: true});
        } else {
            // creep.memory.role = 'builder';
            let target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
            // console.log(target)
            if (target == undefined) {
                creep.room.gatherIntel()
                creep.suicide();
            } else if (creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                creep.travelTo(target);
            }
        }
    }
};