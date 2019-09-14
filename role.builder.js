module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length == 0) {
            creep.runOtherRole('upgrader');
        } else {

            if(creep.memory.working && creep.carry.energy == 0) {
                creep.memory.working = false;
                creep.say('🔄 harvest');
            }
            if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
                creep.memory.working = true;
                creep.say('🚧 build');
            }

            if(creep.memory.working) {
                if(targets.length > 0) {
                    const closest = creep.pos.findClosestByPath(targets);

                    if(creep.build(closest) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
            else {
                creep.getEnergy(true,true);
            }
        }
    }
};