module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        let storage = creep.room.find(FIND_CONSTRUCTION_SITES, {filter: s => s.structureType == STRUCTURE_STORAGE})[0];
        if (targets.length == 0) {
            // creep.runOtherRole('upgrader');
            creep.suicide();
        } else {
            if (creep.memory.working == undefined) {
                creep.memory.working = true;
            }
            if(creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.working = false;
                creep.say('🔄 harvest');
            }
            if(!creep.memory.working && creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
                creep.memory.working = true;
                creep.say('🚧 build');
            }

            if(creep.memory.working) {
                let sources = creep.pos.findInRange(FIND_SOURCES, 1);
                
                let closest = []
                if (storage != undefined && storage != null) {
                    closest = storage;
                } else {
                    closest = creep.pos.findClosestByRange(targets);
                }

                if (sources.length > 0) {
                    creep.travelTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
                } else {
                    if(creep.build(closest) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
            else {
                creep.getEnergy(true,true);
            }
        }
    }
};