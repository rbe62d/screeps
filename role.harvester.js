module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // creep.memory.working = 
        if (creep.room.energyAvailable == creep.room.energyCapacityAvailable) {
            if (creep.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
                creep.runOtherRole('builder');
            } else {
                creep.runOtherRole('upgrader');
            }
        } else {
            if(creep.memory.working && creep.carry.energy == 0) {
                creep.memory.working = false;
            } else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
                creep.memory.working = true;
            }

            if(creep.memory.working) {
                creep.depositEnergy();
            } else {
                creep.getEnergy(false, true);
            }
        }
    }
};