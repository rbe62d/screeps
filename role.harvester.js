module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = false;
        } else if (!creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = true;
        }

        if(creep.memory.working) {
            creep.getEnergy(false, true);
        }
        else {
            creep.depositEnergy();
        }
    }
};