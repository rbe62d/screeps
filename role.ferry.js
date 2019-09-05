module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = false;
        } else if (!creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = true;
        }

        if(creep.memory.working) {
            let containers = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => {
                    return s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0;//creep.carryCapacity;
                }
            });
            
            if (containers.length > 0) {
                let max = 0;
                let closest;
                for (let thing of containers) {
                    if (thing.store[RESOURCE_ENERGY] > max) {
                        max = thing.store[RESOURCE_ENERGY];
                        closest = thing;
                    }
                }

                if(creep.withdraw(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
        else {
            let targets = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                }
            });
            if(targets.length > 0) {
                const closest = creep.pos.findClosestByPath(targets);

                if(creep.transfer(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                let store = creep.room.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_STORAGE && _.sum(structure.store) < structure.storeCapacity;
                    }
                });
                if(creep.transfer(store[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(store[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }
};