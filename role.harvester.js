module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // creep.memory.working = 
        let towers = creep.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_TOWER && s.store[RESOURCE_ENERGY] < s.store.getCapacity()})
        if (towers.length == 0 && creep.room.energyAvailable == creep.room.energyCapacityAvailable) {
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
                if (creep.pos.findInRange(FIND_MY_CREEPS, 1, {filter: s => s.memory.role == 'contharvester'}).length > 0) {
                    creep.suicide();
                }
                creep.getEnergy(false, true);
            }
        }
    }
};