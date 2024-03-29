module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // creep.suicide();

        if (creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49) {
            creep.travelTo(new RoomPosition(25, 25, creep.room.name));
            creep.room.gatherIntel();
        } else if (creep.memory.targetRoom.toLowerCase() != creep.room.name.toLowerCase()) {
            creep.travelTo(new RoomPosition(25, 25, creep.memory.targetRoom));
        } else {
            // creep.memory.role = 'builder';
            if (creep.memory.sui != undefined) {
                if (creep.memory.sui > 0) {
                creep.say('nothing personnel kid!');
                } else if (creep.memory.sui == 0) {
                    creep.suicide();
                }
            } else if (creep.memory.targetId == undefined || creep.memory.targetId == '') {
                let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (target != undefined) {
                    creep.memory.targetId = target.id;
                } else {
                    creep.memory.sui = 50;
                }
            }

            let target = Game.getObjectById(creep.memory.targetId);

            if (target == undefined) {
                creep.memory.targetId = '';
            } else {
                if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(target, {movingTarget: true});
                }
            }
        }
    }
};